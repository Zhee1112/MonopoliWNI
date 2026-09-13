import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { mapPlayerFromDB, mapRoomFromDB, GameMode } from '@/lib/types';
import { getNormalRoleById } from '@/lib/game/role-data';
import { getPropertyCells, getCellByIndex } from '@/lib/game/board-data';

// ============================================================
// END TURN API - With Game Mode Win Conditions
// ============================================================

async function calculatePlayerAssets(supabaseAdmin: ReturnType<typeof getSupabaseAdmin>, player: { cleanMoney: number; dirtyMoney: number; properties: string[] }): Promise<number> {
  let totalAssets = player.cleanMoney + player.dirtyMoney;
  for (const propName of player.properties) {
    const cell = getPropertyCells().find((c) => c.name === propName);
    if (cell?.price) totalAssets += cell.price;
  }
  return totalAssets;
}

async function checkGameOver(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  roomId: string,
  room: ReturnType<typeof mapRoomFromDB>,
): Promise<{ gameOver: boolean; winnerId?: string; winnerName?: string }> {
  const gameMode = room.gameMode as GameMode;

  if (gameMode === 'bundir') {
    // Bundir: last player standing wins
    const { data: activePlayers } = await supabaseAdmin
      .from('players')
      .select('*')
      .eq('room_id', roomId)
      .eq('is_bankrupt', false);

    if (activePlayers && activePlayers.length === 1) {
      return { gameOver: true, winnerId: activePlayers[0].id, winnerName: activePlayers[0].name };
    }
    // If all players bankrupt somehow, no winner
    if (activePlayers && activePlayers.length === 0) {
      return { gameOver: true };
    }
  }

  if (gameMode === 'sultan' || gameMode === 'kilat') {
    // Sultan/Kilat: check if all rounds completed
    if (room.currentTurn >= room.turnOrder.length - 1) {
      // Last player just finished their turn - check if we've completed totalRounds
      // We count completed rounds as floor(currentTurn / totalPlayers)
      const completedTurns = room.currentTurn + 1;
      const totalPlayers = room.turnOrder.length;
      const completedRounds = Math.floor(completedTurns / totalPlayers);

      if (completedRounds >= room.totalRounds) {
        // Find richest player
        const { data: allPlayers } = await supabaseAdmin
          .from('players')
          .select('*')
          .eq('room_id', roomId);

        if (allPlayers && allPlayers.length > 0) {
          let richestPlayer = allPlayers[0];
          let richestAssets = 0;

          for (const p of allPlayers) {
            const assets = await calculatePlayerAssets(supabaseAdmin, {
              cleanMoney: p.clean_money,
              dirtyMoney: p.dirty_money,
              properties: p.properties || [],
            });
            if (assets > richestAssets) {
              richestAssets = assets;
              richestPlayer = p;
            }
          }

          return { gameOver: true, winnerId: richestPlayer.id, winnerName: richestPlayer.name };
        }
      }
    }
  }

  return { gameOver: false };
}

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

    // Check if player has skip_turn status
    const statusEffects = (player.statusEffects as Array<{ type: string; duration: number; effect: string }>) || [];
    const skipEffect = statusEffects.find(e => e.type === 'skip_turn' && e.duration > 0);

    if (skipEffect) {
      // Decrement skip duration and skip this turn
      const updatedEffects = statusEffects.map(e =>
        e.type === 'skip_turn' ? { ...e, duration: e.duration - 1 } : e
      ).filter(e => e.duration > 0);

      await supabaseAdmin
        .from('players')
        .update({ status_effects: updatedEffects })
        .eq('id', playerId);

      // Still advance turn
      const nextTurn = (room.currentTurn + 1) % room.turnOrder.length;
      await supabaseAdmin
        .from('rooms')
        .update({ current_turn: nextTurn })
        .eq('id', roomId);

      return NextResponse.json({
        success: true,
        income: 0,
        skipped: true,
        skipReason: skipEffect.effect,
        nextPlayerId: room.turnOrder[nextTurn],
        nextTurn,
        newBalance: player.cleanMoney,
        gameOver: false,
        gameMode: room.gameMode,
      });
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

    // Check game over conditions
    const updatedRoom = { ...room, currentTurn: nextTurn };
    const gameOverResult = await checkGameOver(supabaseAdmin, roomId, updatedRoom);

    if (gameOverResult.gameOver) {
      // Mark game as finished
      await supabaseAdmin
        .from('rooms')
        .update({
          status: 'finished',
          winner_id: gameOverResult.winnerId || null,
        })
        .eq('id', roomId);

      return NextResponse.json({
        success: true,
        income,
        nextPlayerId: room.turnOrder[nextTurn],
        nextTurn,
        newBalance: player.cleanMoney + income,
        gameOver: true,
        winnerId: gameOverResult.winnerId,
        winnerName: gameOverResult.winnerName,
        gameMode: room.gameMode,
      });
    }

    return NextResponse.json({
      success: true,
      income,
      nextPlayerId: room.turnOrder[nextTurn],
      nextTurn,
      newBalance: player.cleanMoney + income,
      gameOver: false,
      gameMode: room.gameMode,
      currentRound: Math.floor(nextTurn / room.turnOrder.length) + 1,
      totalRounds: room.totalRounds,
    });
  } catch (error) {
    console.error('End turn error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
