import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

// ============================================================
// UPDATE PLAYER API - Generic player state update after card effects
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { roomId, playerId, cleanMoneyDelta, dirtyMoneyDelta, properties, statusEffects, luck, isBankrupt, potCollect, evidence } = await request.json();

    if (!roomId || !playerId) {
      return NextResponse.json({ error: 'Room ID and Player ID are required' }, { status: 400 });
    }

    // Free Parking Pot: collect pot money and reset to 0
    if (potCollect) {
      const { data: room } = await supabaseAdmin
        .from('rooms')
        .select('pot_money')
        .eq('id', roomId)
        .maybeSingle();
      const potAmount = room?.pot_money || 0;
      if (potAmount > 0) {
        await supabaseAdmin
          .from('rooms')
          .update({ pot_money: 0 })
          .eq('id', roomId);
      }
      return NextResponse.json({ success: true, potAmount });
    }

    // Get current player
    const { data: dbPlayer, error: playerError } = await supabaseAdmin
      .from('players')
      .select('*')
      .eq('id', playerId)
      .eq('room_id', roomId)
      .single();

    if (playerError || !dbPlayer) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Build update object
    const update: Record<string, unknown> = {};

    if (cleanMoneyDelta !== undefined) {
      update.clean_money = Math.max(0, (dbPlayer.clean_money || 0) + cleanMoneyDelta);
      // Free Parking Pot: add 10% of negative money changes to pot
      if (cleanMoneyDelta < 0) {
        const potAmount = Math.abs(Math.floor(cleanMoneyDelta * 0.10));
        if (potAmount > 0) {
          const { data: room } = await supabaseAdmin
            .from('rooms')
            .select('pot_money')
            .eq('id', roomId)
            .maybeSingle();
          if (room) {
            await supabaseAdmin
              .from('rooms')
              .update({ pot_money: (room.pot_money || 0) + potAmount })
              .eq('id', roomId);
          }
        }
      }
    }
    if (dirtyMoneyDelta !== undefined) {
      update.dirty_money = Math.max(0, (dbPlayer.dirty_money || 0) + dirtyMoneyDelta);
    }
    if (properties !== undefined) {
      update.properties = properties;
    }
    if (statusEffects !== undefined) {
      update.status_effects = statusEffects;
    }
    if (luck !== undefined) {
      update.luck = Math.max(0, Math.min(100, luck));
    }
    if (isBankrupt !== undefined) {
      update.is_bankrupt = isBankrupt;
    }
    if (evidence !== undefined) {
      update.evidence = evidence;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('players')
      .update(update)
      .eq('id', playerId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, update });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
