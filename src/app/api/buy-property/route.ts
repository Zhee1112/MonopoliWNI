import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { mapPlayerFromDB, mapRoomFromDB, GameMode } from '@/lib/types';
import { performAction } from '@/lib/game/game-logic';
import { getPropertyCells, calculateRent, getGroupCells, hasMonopoly } from '@/lib/game/board-data';

// ============================================================
// BUY PROPERTY API
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { roomId, playerId, boardIndex } = await request.json();

    if (!roomId || !playerId || boardIndex === undefined) {
      return NextResponse.json(
        { error: 'Room ID, Player ID, and Board Index are required' },
        { status: 400 }
      );
    }

    // Get player
    const { data: dbPlayer, error: playerError } = await supabaseAdmin
      .from('players')
      .select('*')
      .eq('id', playerId)
      .eq('room_id', roomId)
      .single();

    if (playerError || !dbPlayer) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const player = mapPlayerFromDB(dbPlayer as Record<string, unknown>);

    if (player.position !== boardIndex) {
      return NextResponse.json({ error: 'You are not at this position' }, { status: 400 });
    }

    // Get cell data
    const cell = getPropertyCells().find((c) => c.index === boardIndex);
    if (!cell) {
      return NextResponse.json({ error: 'Invalid property' }, { status: 400 });
    }

    // Check if property is already owned
    const { data: dbProperty, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('room_id', roomId)
      .eq('board_index', boardIndex)
      .single();

    if (propertyError || !dbProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (dbProperty.owner_id) {
      return NextResponse.json({ error: 'Property already owned' }, { status: 400 });
    }

    // Calculate price with role bonus
    let price = cell.price || 0;
    if (player.memeRoleBuff === 'anak_sultan' && player.memeRoleActive) {
      price = Math.floor(price * 0.7);
    }

    if (player.cleanMoney < price) {
      return NextResponse.json({ error: 'Not enough money' }, { status: 400 });
    }

    // Perform roll for buy action
    const evidenceBonus = Array.isArray(player.evidence)
      ? player.evidence.reduce((sum: number, ev: { bonusModifier?: number }) => sum + (ev.bonusModifier || 0), 0)
      : 0;

    const rollResult = performAction(player.stats.negotiation, evidenceBonus, 10, 20);

    // Update player money
    const { error: updateMoneyError } = await supabaseAdmin
      .from('players')
      .update({
        clean_money: player.cleanMoney - price,
        properties: [...(player.properties || []), cell.name],
      })
      .eq('id', playerId);

    if (updateMoneyError) {
      return NextResponse.json({ error: 'Failed to update player money' }, { status: 500 });
    }

    // Update property owner
    const { error: updatePropertyError } = await supabaseAdmin
      .from('properties')
      .update({ owner_id: playerId })
      .eq('id', dbProperty.id);

    if (updatePropertyError) {
      return NextResponse.json({ error: 'Failed to update property owner' }, { status: 500 });
    }

    // Check achievement triggers after buy
    const newPropCount = (player.properties || []).length + 1;

    // Treasure Hunter: 5+ properties
    if (newPropCount >= 5) {
      await supabaseAdmin
        .from('player_achievements')
        .upsert({
          game_room_id: roomId,
          player_id: playerId,
          user_id: dbPlayer.user_id || null,
          achievement_id: 'treasure_hunter',
          xp_granted: 40,
        }, { onConflict: 'game_room_id,player_id,achievement_id', ignoreDuplicates: true });
    }

    // Property Mogul: 8+ properties
    if (newPropCount >= 8) {
      await supabaseAdmin
        .from('player_achievements')
        .upsert({
          game_room_id: roomId,
          player_id: playerId,
          user_id: dbPlayer.user_id || null,
          achievement_id: 'property_mogul',
          xp_granted: 45,
        }, { onConflict: 'game_room_id,player_id,achievement_id', ignoreDuplicates: true });
    }

    // Log the action
    await supabaseAdmin.from('game_log').insert({
      room_id: roomId,
      player_id: playerId,
      action: 'buy',
      detail: { boardIndex, propertyName: cell.name, price, rollResult },
    });

    return NextResponse.json({
      success: true,
      property: { ...dbProperty, owner_id: playerId },
      price,
      rollResult,
      newBalance: player.cleanMoney - price,
    });
  } catch (error) {
    console.error('Buy property error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================
// PAY RENT API
// ============================================================

export async function PUT(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { roomId, payerId, propertyId } = await request.json();

    // Get payer
    const { data: dbPayer, error: payerError } = await supabaseAdmin
      .from('players')
      .select('*')
      .eq('id', payerId)
      .eq('room_id', roomId)
      .single();

    if (payerError || !dbPayer) {
      return NextResponse.json({ error: 'Payer not found' }, { status: 404 });
    }

    const payer = mapPlayerFromDB(dbPayer as Record<string, unknown>);

    // Get property
    const { data: dbProperty, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (propertyError || !dbProperty || !dbProperty.owner_id) {
      return NextResponse.json({ error: 'Property not found or not owned' }, { status: 404 });
    }

    // Get owner
    const { data: dbOwner, error: ownerError } = await supabaseAdmin
      .from('players')
      .select('*')
      .eq('id', dbProperty.owner_id)
      .single();

    if (ownerError || !dbOwner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
    }

    const owner = mapPlayerFromDB(dbOwner as Record<string, unknown>);

    // Get room for game mode
    const { data: dbRoom, error: roomError } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !dbRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Get cell data
    const cell = getPropertyCells().find((c) => c.index === dbProperty.board_index);
    if (!cell) {
      return NextResponse.json({ error: 'Invalid property' }, { status: 400 });
    }

    // Calculate rent (kilat mode: 50% higher)
    const room = mapRoomFromDB(dbRoom as Record<string, unknown>);
    const isKilat = room.gameMode === 'kilat';
    const rentMultiplier = isKilat ? 1.5 : 1;

    // Check if owner has rent_frozen status effect
    const ownerEffects = (dbOwner.status_effects as Array<{ type: string; duration: number }>) || [];
    const isRentFrozen = ownerEffects.some(e => e.type === 'rent_frozen');

    if (isRentFrozen) {
      return NextResponse.json({
        success: true,
        rent: 0,
        ownerName: owner.name,
        message: 'Properti dibekukan - sewa gratis!',
        newPayerBalance: payer.cleanMoney,
      });
    }

    const isMonopoly = hasMonopoly(owner.properties || [], cell.group || '');
    const baseRent = calculateRent(cell.rent || 0, dbProperty.house_level, isMonopoly);
    const rent = Math.round(baseRent * rentMultiplier);

    const canPayRent = payer.cleanMoney >= rent;
    const actualPayment = Math.min(payer.cleanMoney, rent);

    // Transfer money: payer pays what they can
    const potAmount = Math.floor(actualPayment * 0.10);
    const ownerShare = actualPayment - potAmount;
    const newPayerBalance = payer.cleanMoney - actualPayment;
    const shortfall = rent - actualPayment;
    const canSellProperties = !canPayRent && (payer.properties || []).length > 0;

    if (!canPayRent && !canSellProperties) {
      // Truly bankrupt — no money and no properties to sell
      await supabaseAdmin.from('players').update({
        clean_money: 0,
        dirty_money: 0,
        is_bankrupt: true,
        properties: [],
        status_effects: [],
      }).eq('id', payerId);
    } else {
      // Deduct what they can pay
      await supabaseAdmin.from('players').update({ clean_money: Math.max(0, newPayerBalance) }).eq('id', payerId);
    }

    if (actualPayment > 0) {
      await supabaseAdmin.from('players').update({ clean_money: owner.cleanMoney + ownerShare }).eq('id', owner.id);
    }

    // Free Parking Pot: 10% of rent goes to pot
    if (potAmount > 0) {
      const { data: roomPot } = await supabaseAdmin
        .from('rooms')
        .select('pot_money')
        .eq('id', roomId)
        .maybeSingle();
      if (roomPot) {
        await supabaseAdmin
          .from('rooms')
          .update({ pot_money: (roomPot.pot_money || 0) + potAmount })
          .eq('id', roomId);
      }
    }

    const isPayerBankrupt = !canPayRent && !canSellProperties;
    const needsSelling = !canPayRent && canSellProperties;

    // If payer goes bankrupt (truly), award bankrupt_maker to owner
    if (isPayerBankrupt) {
      await supabaseAdmin
        .from('player_achievements')
        .upsert({
          game_room_id: roomId,
          player_id: owner.id,
          user_id: dbOwner.user_id || null,
          achievement_id: 'bankrupt_maker',
          xp_granted: 75,
        }, { onConflict: 'game_room_id,player_id,achievement_id', ignoreDuplicates: true });
    }

    // Log the action
    await supabaseAdmin.from('game_log').insert({
      room_id: roomId,
      player_id: payerId,
      action: 'rent',
      detail: { propertyId, propertyName: cell.name, rent, ownerId: owner.id, ownerName: owner.name, payerBankrupt: isPayerBankrupt, needsSelling },
    });

    return NextResponse.json({
      success: true,
      rent,
      ownerName: owner.name,
      ownerShare,
      newPayerBalance: Math.max(0, newPayerBalance),
      newOwnerBalance: owner.cleanMoney + ownerShare,
      isBankrupt: isPayerBankrupt,
      needsSelling,
      shortfall,
    });
  } catch (error) {
    console.error('Pay rent error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
