import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { mapPlayerFromDB, mapRoomFromDB } from '@/lib/types';
import { drawRandomCard } from '@/lib/game/takdir-cards';
import { drawRandomKegiatan } from '@/lib/game/kegiatan-cards';
import { processCardEffect } from '@/lib/game/game-logic';

// ============================================================
// BOT PLAY API - Full bot turn including cards, tax, events
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { roomId, playerId } = await request.json();

    if (!roomId || !playerId) {
      return NextResponse.json({ error: 'roomId and playerId required' }, { status: 400 });
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

    // Get room
    const { data: dbRoom, error: roomError } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !dbRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const room = mapRoomFromDB(dbRoom as Record<string, unknown>);

    // Get all players for card effects
    const { data: allDbPlayers } = await supabaseAdmin
      .from('players')
      .select('*')
      .eq('room_id', roomId);

    const allPlayers = (allDbPlayers || []).map(p => mapPlayerFromDB(p as Record<string, unknown>));

    // Step 1: Roll dice
    const dice1 = Math.ceil(Math.random() * 6);
    const dice2 = Math.ceil(Math.random() * 6);
    const rollRes = await fetch(`${request.nextUrl.origin}/api/roll-dice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, playerId, dice1, dice2 }),
    });
    const rollData = await rollRes.json();

    if (!rollRes.ok) {
      return NextResponse.json({ error: rollData.error || 'Roll failed' }, { status: 500 });
    }

    if (rollData.skipTurn || rollData.skippedBankrupt) {
      return NextResponse.json({
        success: true,
        dice1, dice2,
        total: rollData.total,
        newPosition: rollData.newPosition || player.position,
        actions: [rollData.skipReason || 'Skip putaran'],
      });
    }

    const newPosition = rollData.newPosition;

    // Get cell from board data
    const { getPropertyCells, getCellByIndex } = await import('@/lib/game/board-data');
    const cell = getCellByIndex(newPosition);
    const actions: string[] = [];

    // Step 2: Handle cell type
    if (cell.type === 'property') {
      // Check if owned
      const { data: dbProp } = await supabaseAdmin
        .from('properties')
        .select('*')
        .eq('room_id', roomId)
        .eq('board_index', newPosition)
        .maybeSingle();

      if (dbProp && dbProp.owner_id && dbProp.owner_id !== playerId) {
        // Pay rent
        const rentRes = await fetch(`${request.nextUrl.origin}/api/buy-property`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, payerId: playerId, propertyId: dbProp.id }),
        });
        const rentData = await rentRes.json();
        if (rentRes.ok) {
          actions.push(`Bayar sewa ${cell.name}: Rp ${(rentData.rent || 0).toLocaleString('id-ID')}`);
        } else {
          actions.push(`Gagal bayar sewa: ${rentData.error}`);
        }
      } else if (!dbProp || !dbProp.owner_id) {
        // Unowned — buy if affordable (bot buys if price < 40% of money)
        const botMoney = (player.cleanMoney || 0) + (rollData.moneyChange || 0);
        if (cell.price && botMoney >= cell.price && cell.price < botMoney * 0.4) {
          const buyRes = await fetch(`${request.nextUrl.origin}/api/buy-property`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, playerId, boardIndex: newPosition }),
          });
          const buyData = await buyRes.json();
          if (buyRes.ok) {
            actions.push(`Beli ${cell.name}: Rp ${(cell.price || 0).toLocaleString('id-ID')}`);
          }
        }
      }
    } else if (cell.type === 'draw_takdir') {
      // Draw and process takdir card
      const card = drawRandomCard();
      const freshPlayerRes = await supabaseAdmin.from('players').select('*').eq('id', playerId).single();
      const freshPlayer = mapPlayerFromDB(freshPlayerRes.data as Record<string, unknown>);
      const result = processCardEffect(card, freshPlayer, dice1 + dice2, allPlayers);

      // Apply money changes
      if (result.updatedPlayer.cleanMoney !== freshPlayer.cleanMoney) {
        await supabaseAdmin.from('players').update({
          clean_money: Math.max(0, result.updatedPlayer.cleanMoney),
          dirty_money: result.updatedPlayer.dirtyMoney || freshPlayer.dirtyMoney,
          status_effects: result.updatedPlayer.statusEffects || freshPlayer.statusEffects,
        }).eq('id', playerId);
      }

      // Apply property changes
      if (result.updatedPlayer.properties?.length !== freshPlayer.properties?.length) {
        await supabaseAdmin.from('players').update({
          properties: result.updatedPlayer.properties || freshPlayer.properties,
        }).eq('id', playerId);
      }

      actions.push(`Kartu Takdir: ${card.name} — ${result.statusMessages.join(', ')}`);
    } else if (cell.type === 'draw_kegiatan') {
      const card = drawRandomKegiatan();
      const freshPlayerRes = await supabaseAdmin.from('players').select('*').eq('id', playerId).single();
      const freshPlayer = mapPlayerFromDB(freshPlayerRes.data as Record<string, unknown>);
      const result = processCardEffect(card as any, freshPlayer, dice1 + dice2, allPlayers);

      if (result.updatedPlayer.cleanMoney !== freshPlayer.cleanMoney) {
        await supabaseAdmin.from('players').update({
          clean_money: Math.max(0, result.updatedPlayer.cleanMoney),
          dirty_money: result.updatedPlayer.dirtyMoney || freshPlayer.dirtyMoney,
          status_effects: result.updatedPlayer.statusEffects || freshPlayer.statusEffects,
        }).eq('id', playerId);
      }

      actions.push(`Kartu Kegiatan: ${card.name} — ${result.statusMessages.join(', ')}`);
    } else if (cell.type === 'tax') {
      // Pay tax
      let taxAmount = cell.taxAmount || 0;
      if (!taxAmount) {
        // PPN 12%: percentage of total assets
        const propPrices = getPropertyCells();
        const ownedPropTotal = (player.properties || []).reduce((sum: number, propName: string) => {
          const prop = propPrices.find(p => p.name === propName);
          return sum + (prop?.price || 0);
        }, 0);
        const totalHarta = (player.cleanMoney || 0) + ownedPropTotal;
        taxAmount = Math.floor(totalHarta * 0.12);
      }

      await supabaseAdmin.from('players').update({
        clean_money: Math.max(0, player.cleanMoney + (rollData.moneyChange || 0) - taxAmount),
      }).eq('id', playerId);

      // Free Parking Pot: tax goes to pot
      await supabaseAdmin.from('rooms').update({
        pot_money: (dbRoom.pot_money || 0) + taxAmount,
      }).eq('id', roomId);

      actions.push(`Bayar pajak: Rp ${taxAmount.toLocaleString('id-ID')}`);
    } else if (cell.type === 'event') {
      // Process event cell (DnD check)
      const freshPlayerRes = await supabaseAdmin.from('players').select('*').eq('id', playerId).single();
      const freshPlayer = mapPlayerFromDB(freshPlayerRes.data as Record<string, unknown>);

      // Simplified: bot always passes event (gets positive outcome)
      const eventMoney = Math.floor(Math.random() * 300000) + 100000;
      await supabaseAdmin.from('players').update({
        clean_money: Math.max(0, (freshPlayer.cleanMoney || 0) + eventMoney + (rollData.moneyChange || 0)),
      }).eq('id', playerId);

      actions.push(`Event: ${cell.name} — berhasil! +Rp ${eventMoney.toLocaleString('id-ID')}`);
    } else if (cell.type === 'corner') {
      // Handle corner cells
      if (newPosition === 10) {
        // Jail — skip 2 turns
        const statusEffects = player.statusEffects || [];
        const newEffects = [...statusEffects, { type: 'skip_turn', duration: 2, effect: 'Tahanan KPK' }];
        await supabaseAdmin.from('players').update({ status_effects: newEffects }).eq('id', playerId);
        actions.push('Masuk tahanan KPK! Skip 2 putaran.');
      } else if (newPosition === 20) {
        // Free Parking — collect pot
        const potAmount = dbRoom.pot_money || 0;
        await supabaseAdmin.from('rooms').update({ pot_money: 0 }).eq('id', roomId);
        await supabaseAdmin.from('players').update({
          clean_money: (player.cleanMoney || 0) + potAmount + (rollData.moneyChange || 0),
        }).eq('id', playerId);
        actions.push(`Bebas Parkir! Dapat Rp ${potAmount.toLocaleString('id-ID')}`);
      }
    }

    // Step 3: End turn
    const endRes = await fetch(`${request.nextUrl.origin}/api/end-turn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, playerId }),
    });

    return NextResponse.json({
      success: true,
      dice1,
      dice2,
      total: dice1 + dice2,
      newPosition,
      cellName: cell.name,
      cellType: cell.type,
      actions,
    });
  } catch (error) {
    console.error('Bot play error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
