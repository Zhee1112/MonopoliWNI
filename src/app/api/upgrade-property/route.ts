import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getPropertyCells, calculateRent, hasMonopoly } from '@/lib/game/board-data';

// ============================================================
// UPGRADE PROPERTY API
// POST: Upgrade house_level (0→4) or convert to landmark (4→5)
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { roomId, playerId, boardIndex } = await request.json();

    if (!roomId || !playerId || boardIndex === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    // Get property
    const { data: dbProperty, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('room_id', roomId)
      .eq('board_index', boardIndex)
      .single();

    if (propertyError || !dbProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Must own the property
    if (dbProperty.owner_id !== playerId) {
      return NextResponse.json({ error: 'You do not own this property' }, { status: 403 });
    }

    // Already a landmark
    if (dbProperty.is_landmark) {
      return NextResponse.json({ error: 'Property is already a landmark' }, { status: 400 });
    }

    // Current level must be < 5
    const currentLevel = dbProperty.house_level || 0;
    if (currentLevel >= 5) {
      return NextResponse.json({ error: 'Maximum level reached' }, { status: 400 });
    }

    // Get cell data for building cost
    const cell = getPropertyCells().find((c) => c.index === boardIndex);
    if (!cell || !cell.buildingCost) {
      return NextResponse.json({ error: 'Property cannot be upgraded' }, { status: 400 });
    }

    // Calculate upgrade cost (increases per level)
    let upgradeCost = cell.buildingCost;
    if (currentLevel === 1) upgradeCost = Math.floor(cell.buildingCost * 1.5);
    else if (currentLevel === 2) upgradeCost = cell.buildingCost * 2;
    else if (currentLevel === 3) upgradeCost = Math.floor(cell.buildingCost * 2.5);
    else if (currentLevel === 4) upgradeCost = cell.buildingCost * 5; // Landmark

    // Check money
    if (dbPlayer.clean_money < upgradeCost) {
      return NextResponse.json({ error: `Not enough money. Need Rp ${upgradeCost.toLocaleString('id-ID')}` }, { status: 400 });
    }

    const newLevel = currentLevel + 1;
    const isLandmark = newLevel >= 5;

    // Deduct money
    await supabaseAdmin
      .from('players')
      .update({ clean_money: dbPlayer.clean_money - upgradeCost })
      .eq('id', playerId);

    // Update property
    await supabaseAdmin
      .from('properties')
      .update({ house_level: newLevel, is_landmark: isLandmark })
      .eq('id', dbProperty.id);

    // Log
    await supabaseAdmin.from('game_log').insert({
      room_id: roomId,
      player_id: playerId,
      action: 'buy',
      detail: { boardIndex, propertyName: cell.name, upgrade: true, fromLevel: currentLevel, toLevel: newLevel, isLandmark, cost: upgradeCost },
    });

    // Calculate new rent for display
    const isMonopoly = hasMonopoly(dbPlayer.properties as string[] || [], cell.group || '');
    const newRent = calculateRent(cell.rent || 0, newLevel, isMonopoly);

    return NextResponse.json({
      success: true,
      newBalance: dbPlayer.clean_money - upgradeCost,
      newLevel,
      isLandmark,
      upgradeCost,
      newRent,
      propertyName: cell.name,
    });
  } catch (error) {
    console.error('Upgrade property error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
