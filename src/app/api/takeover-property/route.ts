import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { mapPlayerFromDB, mapRoomFromDB } from '@/lib/types';
import { getPropertyCells, calculateRent } from '@/lib/game/board-data';

// ============================================================
// TAKEOVER PROPERTY API
// POST: Take over another player's property by paying 200% of cell price
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { roomId, buyerId, boardIndex } = await request.json();

    if (!roomId || !buyerId || boardIndex === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get buyer
    const { data: dbBuyer, error: buyerError } = await supabaseAdmin
      .from('players')
      .select('*')
      .eq('id', buyerId)
      .eq('room_id', roomId)
      .single();

    if (buyerError || !dbBuyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    const buyer = mapPlayerFromDB(dbBuyer as Record<string, unknown>);

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

    // Must be owned by someone else
    if (!dbProperty.owner_id) {
      return NextResponse.json({ error: 'Property is not owned' }, { status: 400 });
    }
    if (dbProperty.owner_id === buyerId) {
      return NextResponse.json({ error: 'You already own this property' }, { status: 400 });
    }

    // Cannot take over landmarks
    if (dbProperty.is_landmark) {
      return NextResponse.json({ error: 'Cannot take over a landmark property!' }, { status: 400 });
    }

    // Get cell data
    const cell = getPropertyCells().find((c) => c.index === boardIndex);
    if (!cell || !cell.price) {
      return NextResponse.json({ error: 'Invalid property' }, { status: 400 });
    }

    // Takeover cost = 200% of cell price
    const takeoverCost = cell.price * 2;

    // Check buyer has enough money
    if (buyer.cleanMoney < takeoverCost) {
      return NextResponse.json({ error: `Not enough money. Need Rp ${takeoverCost.toLocaleString('id-ID')}` }, { status: 400 });
    }

    // Get current owner
    const { data: dbOwner, error: ownerError } = await supabaseAdmin
      .from('players')
      .select('*')
      .eq('id', dbProperty.owner_id)
      .single();

    if (ownerError || !dbOwner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
    }

    const owner = mapPlayerFromDB(dbOwner as Record<string, unknown>);

    // Transfer money: buyer pays owner
    await supabaseAdmin
      .from('players')
      .update({ clean_money: buyer.cleanMoney - takeoverCost })
      .eq('id', buyerId);

    await supabaseAdmin
      .from('players')
      .update({ clean_money: owner.cleanMoney + takeoverCost })
      .eq('id', owner.id);

    // Remove property from old owner's properties list
    const oldOwnerProps = (dbOwner.properties as string[] || []).filter(p => p !== cell.name);
    await supabaseAdmin
      .from('players')
      .update({ properties: oldOwnerProps })
      .eq('id', owner.id);

    // Transfer property: new owner, reset house_level
    await supabaseAdmin
      .from('properties')
      .update({ owner_id: buyerId, house_level: 0, is_landmark: false })
      .eq('id', dbProperty.id);

    // Add property to buyer's properties list
    const buyerProps = [...(dbBuyer.properties as string[] || []), cell.name];
    await supabaseAdmin
      .from('players')
      .update({ properties: buyerProps })
      .eq('id', buyerId);

    // Log
    await supabaseAdmin.from('game_log').insert({
      room_id: roomId,
      player_id: buyerId,
      action: 'buy',
      detail: { boardIndex, propertyName: cell.name, takeover: true, cost: takeoverCost, fromOwner: owner.name },
    });

    return NextResponse.json({
      success: true,
      newBalance: buyer.cleanMoney - takeoverCost,
      ownerReceived: takeoverCost,
      ownerName: owner.name,
      propertyName: cell.name,
      takeoverCost,
    });
  } catch (error) {
    console.error('Takeover property error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
