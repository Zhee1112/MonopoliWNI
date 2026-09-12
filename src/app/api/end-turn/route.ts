import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { mapPlayerFromDB, mapRoomFromDB } from '@/lib/types';
import { getNormalRoleById } from '@/lib/game/role-data';

// ============================================================
// END TURN API
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { roomId, playerId } = await request.json();

    if (!roomId || !playerId) {
      return NextResponse.json(
        { error: 'Room ID and Player ID are required' },
        { status: 400 }
      );
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

    if (room.turnOrder[room.currentTurn] !== playerId) {
      return NextResponse.json({ error: 'Not your turn' }, { status: 400 });
    }

    // Calculate income based on role
    const role = getNormalRoleById(player.role);
    let income = 0;

    if (role) {
      income = role.baseIncome;

      // Apply meme role bonus if active
      if (player.memeRoleBuff && player.memeRoleActive) {
        switch (player.memeRoleBuff) {
          case 'tukang_gosek':
            income += 50000;
            break;
          default:
            break;
        }
      }
    }

    // Update player income
    await supabaseAdmin
      .from('players')
      .update({ clean_money: player.cleanMoney + income })
      .eq('id', playerId);

    // Move to next turn
    const nextTurn = (room.currentTurn + 1) % room.turnOrder.length;

    // Update room turn
    await supabaseAdmin
      .from('rooms')
      .update({ current_turn: nextTurn })
      .eq('id', roomId);

    // Log the action
    await supabaseAdmin.from('game_log').insert({
      room_id: roomId,
      player_id: playerId,
      action: 'end_turn',
      detail: { income, nextPlayerId: room.turnOrder[nextTurn], nextTurn },
    });

    return NextResponse.json({
      success: true,
      income,
      nextPlayerId: room.turnOrder[nextTurn],
      nextTurn,
      newBalance: player.cleanMoney + income,
    });
  } catch (error) {
    console.error('End turn error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
