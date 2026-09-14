import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { roomId, playerId, userId } = await request.json();

    if (!roomId || !playerId) {
      return NextResponse.json({ error: 'roomId and playerId required' }, { status: 400 });
    }

    // Verify the player belongs to this user (or no user_id binding)
    if (userId) {
      const { data: player } = await supabaseAdmin
        .from('players')
        .select('user_id')
        .eq('id', playerId)
        .maybeSingle();

      if (player && player.user_id !== userId) {
        return NextResponse.json({ error: 'Not your player' }, { status: 403 });
      }
    }

    // Get current room state
    const { data: room } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .maybeSingle();

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Mark player as bankrupt
    await supabaseAdmin
      .from('players')
      .update({
        is_bankrupt: true,
        clean_money: 0,
        dirty_money: 0,
        properties: [],
      })
      .eq('id', playerId);

    // Remove player from turn_order
    const turnOrder = (room.turn_order as string[]) || [];
    const newTurnOrder = turnOrder.filter((id: string) => id !== playerId);
    const currentTurn = Math.min(room.current_turn || 0, Math.max(0, newTurnOrder.length - 1));

    await supabaseAdmin
      .from('rooms')
      .update({
        turn_order: newTurnOrder,
        current_turn: currentTurn,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', roomId);

    // Check if only 1 player remains → game over
    if (newTurnOrder.length === 1) {
      const { data: lastPlayer } = await supabaseAdmin
        .from('players')
        .select('*')
        .eq('room_id', roomId)
        .eq('is_bankrupt', false)
        .maybeSingle();

      if (lastPlayer) {
        await supabaseAdmin
          .from('rooms')
          .update({ status: 'finished' })
          .eq('id', roomId);

        return NextResponse.json({
          success: true,
          gameOver: true,
          winnerId: lastPlayer.id,
          winnerName: lastPlayer.name,
        });
      }
    }

    // If no players left, finish room
    if (newTurnOrder.length === 0) {
      await supabaseAdmin
        .from('rooms')
        .update({ status: 'finished' })
        .eq('id', roomId);
    }

    return NextResponse.json({ success: true, gameOver: false });
  } catch (error) {
    console.error('Surrender error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
