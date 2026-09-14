import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { mapPlayerFromDB, mapRoomFromDB, GameMode } from '@/lib/types';
import { getPropertyCells } from '@/lib/game/board-data';
import { getPlacementXp } from '@/lib/game/achievements';

// ============================================================
// SURRENDER ROOM API - With post-game rankings, achievements, XP
// ============================================================

async function calculatePlayerAssets(supabaseAdmin: ReturnType<typeof getSupabaseAdmin>, player: { cleanMoney: number; dirtyMoney: number; properties: string[] }): Promise<number> {
  let totalAssets = player.cleanMoney + player.dirtyMoney;
  for (const propName of player.properties) {
    const cell = getPropertyCells().find((c) => c.name === propName);
    if (cell?.price) totalAssets += cell.price;
  }
  return totalAssets;
}

async function calculateRankings(supabaseAdmin: ReturnType<typeof getSupabaseAdmin>, roomId: string) {
  const { data: allPlayers } = await supabaseAdmin
    .from('players')
    .select('*')
    .eq('room_id', roomId);

  if (!allPlayers || allPlayers.length === 0) return [];

  const ranked = [];
  for (const p of allPlayers) {
    const assets = await calculatePlayerAssets(supabaseAdmin, {
      cleanMoney: p.clean_money,
      dirtyMoney: p.dirty_money,
      properties: p.properties || [],
    });
    ranked.push({ ...p, totalAssets: assets });
  }

  ranked.sort((a, b) => b.totalAssets - a.totalAssets);

  return ranked.map((p, i) => ({
    id: p.id,
    user_id: p.user_id || null,
    name: p.name,
    totalAssets: p.totalAssets,
    placement: i + 1,
    is_bot: p.is_bot || false,
    is_bankrupt: p.is_bankrupt || false,
    clean_money: p.clean_money,
    dirty_money: p.dirty_money,
    properties: p.properties || [],
  }));
}

async function awardPostGameRewards(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  roomId: string,
  ranked: Array<{ id: string; user_id: string | null; name: string; totalAssets: number; placement: number; is_bot: boolean; is_bankrupt: boolean; clean_money: number; dirty_money: number; properties: string[] }>,
  gameMode: GameMode,
) {
  const realPlayers = ranked.filter(p => !p.is_bot);
  const realCount = realPlayers.length;
  const awardedAchievements: Array<{ playerId: string; achievementId: string; xp: number }> = [];

  for (const p of ranked) {
    if (p.is_bot) continue;

    // Winner achievement
    if (p.placement === 1) {
      const result = getPlacementXp(1, realCount);
      if (result) {
        const { error } = await supabaseAdmin
          .from('player_achievements')
          .upsert({
            game_room_id: roomId,
            player_id: p.id,
            user_id: p.user_id,
            achievement_id: result.achievementId,
            xp_granted: result.xp,
          }, { onConflict: 'game_room_id,player_id,achievement_id', ignoreDuplicates: true });
        if (!error) awardedAchievements.push({ playerId: p.id, achievementId: result.achievementId, xp: result.xp });
      }
    }

    // Runner-up (5+ real players)
    if (p.placement === 2 && realCount >= 5) {
      const result = getPlacementXp(2, realCount);
      if (result) {
        const { error } = await supabaseAdmin
          .from('player_achievements')
          .upsert({
            game_room_id: roomId, player_id: p.id, user_id: p.user_id,
            achievement_id: result.achievementId, xp_granted: result.xp,
          }, { onConflict: 'game_room_id,player_id,achievement_id', ignoreDuplicates: true });
        if (!error) awardedAchievements.push({ playerId: p.id, achievementId: result.achievementId, xp: result.xp });
      }
    }

    // Third place (5+ real players)
    if (p.placement === 3 && realCount >= 5) {
      const result = getPlacementXp(3, realCount);
      if (result) {
        const { error } = await supabaseAdmin
          .from('player_achievements')
          .upsert({
            game_room_id: roomId, player_id: p.id, user_id: p.user_id,
            achievement_id: result.achievementId, xp_granted: result.xp,
          }, { onConflict: 'game_room_id,player_id,achievement_id', ignoreDuplicates: true });
        if (!error) awardedAchievements.push({ playerId: p.id, achievementId: result.achievementId, xp: result.xp });
      }
    }

    // Participation
    if (!p.is_bankrupt) {
      const { error } = await supabaseAdmin
        .from('player_achievements')
        .upsert({
          game_room_id: roomId, player_id: p.id, user_id: p.user_id,
          achievement_id: 'participation', xp_granted: 30,
        }, { onConflict: 'game_room_id,player_id,achievement_id', ignoreDuplicates: true });
      if (!error) awardedAchievements.push({ playerId: p.id, achievementId: 'participation', xp: 30 });
    }

    // Speed demon (kilat mode winner)
    if (p.placement === 1 && gameMode === 'kilat') {
      const { error } = await supabaseAdmin
        .from('player_achievements')
        .upsert({
          game_room_id: roomId, player_id: p.id, user_id: p.user_id,
          achievement_id: 'speed_demon', xp_granted: 40,
        }, { onConflict: 'game_room_id,player_id,achievement_id', ignoreDuplicates: true });
      if (!error) awardedAchievements.push({ playerId: p.id, achievementId: 'speed_demon', xp: 40 });
    }

    // Survivor bundir
    if (gameMode === 'bundir' && !p.is_bankrupt) {
      const { error } = await supabaseAdmin
        .from('player_achievements')
        .upsert({
          game_room_id: roomId, player_id: p.id, user_id: p.user_id,
          achievement_id: 'survivor', xp_granted: 35,
        }, { onConflict: 'game_room_id,player_id,achievement_id', ignoreDuplicates: true });
      if (!error) awardedAchievements.push({ playerId: p.id, achievementId: 'survivor', xp: 35 });
    }

    // Money achievements
    if (p.totalAssets >= 5000000) {
      await supabaseAdmin.from('player_achievements').upsert({
        game_room_id: roomId, player_id: p.id, user_id: p.user_id,
        achievement_id: 'millionaire', xp_granted: 40,
      }, { onConflict: 'game_room_id,player_id,achievement_id', ignoreDuplicates: true });
    }
    if (p.clean_money >= 3000000) {
      await supabaseAdmin.from('player_achievements').upsert({
        game_room_id: roomId, player_id: p.id, user_id: p.user_id,
        achievement_id: 'cash_king', xp_granted: 30,
      }, { onConflict: 'game_room_id,player_id,achievement_id', ignoreDuplicates: true });
    }

    // XP award
    if (p.user_id) {
      const placementXp = p.placement === 1 ? 150 : p.placement === 2 ? 100 : p.placement === 3 ? 75 : 30;
      const { data: profile } = await supabaseAdmin.from('user_profiles').select('xp, total_games, total_wins').eq('user_id', p.user_id).maybeSingle();
      const currentXp = profile?.xp || 0;
      const currentGames = profile?.total_games || 0;
      const currentWins = profile?.total_wins || 0;

      await supabaseAdmin.from('user_profiles').upsert({
        user_id: p.user_id,
        total_games: currentGames + 1,
        total_wins: p.placement === 1 ? currentWins + 1 : currentWins,
        xp: currentXp + placementXp,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }
  }

  return awardedAchievements;
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { roomId, playerId, userId } = await request.json();

    if (!roomId || !playerId) {
      return NextResponse.json({ error: 'roomId and playerId required' }, { status: 400 });
    }

    // Verify the player belongs to this user
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
    const { data: dbRoom } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .maybeSingle();

    if (!dbRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const room = mapRoomFromDB(dbRoom as Record<string, unknown>);

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

    // Release surrendered player's properties (clear owner_id)
    await supabaseAdmin
      .from('properties')
      .update({ owner_id: null, house_level: 0, is_landmark: false })
      .eq('room_id', roomId)
      .eq('owner_id', playerId);

    // Remove player from turn_order
    const turnOrder = (dbRoom.turn_order as string[]) || [];
    const newTurnOrder = turnOrder.filter((id: string) => id !== playerId);
    const removedIndex = turnOrder.indexOf(playerId);
    const oldCurrentTurn = room.currentTurn;
    // If the removed player was before current turn, decrement; if at or after, keep same
    let currentTurn = oldCurrentTurn;
    if (removedIndex !== -1 && removedIndex < oldCurrentTurn) {
      currentTurn = Math.max(0, oldCurrentTurn - 1);
    } else if (removedIndex === oldCurrentTurn) {
      // If it was the current player's turn, keep the same index (next player takes over)
      currentTurn = Math.min(oldCurrentTurn, Math.max(0, newTurnOrder.length - 1));
    } else {
      currentTurn = Math.min(oldCurrentTurn, Math.max(0, newTurnOrder.length - 1));
    }

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
        // Finish the room
        await supabaseAdmin
          .from('rooms')
          .update({ status: 'finished' })
          .eq('id', roomId);

        // Generate rankings, achievements, XP
        const ranked = await calculateRankings(supabaseAdmin, roomId);
        const gameMode = (dbRoom.game_mode as GameMode) || 'bundir';
        const awardedAchievements = await awardPostGameRewards(supabaseAdmin, roomId, ranked, gameMode);

        // Store game results (per-player rows, matching end-turn schema)
        for (const p of ranked) {
          await supabaseAdmin.from('game_results').insert({
            game_room_id: roomId,
            player_id: p.id,
            user_id: p.user_id,
            placement: p.placement,
            final_clean_money: p.clean_money,
            final_dirty_money: p.dirty_money,
            final_properties: p.properties || [],
            final_total_assets: p.totalAssets,
            xp_earned: p.placement === 1 ? 150 : p.placement === 2 ? 100 : p.placement === 3 ? 75 : 30,
            is_winner: p.id === lastPlayer.id,
            game_mode: gameMode,
            total_rounds: room.currentTurn,
          });
        }

        return NextResponse.json({
          success: true,
          gameOver: true,
          winnerId: lastPlayer.id,
          winnerName: lastPlayer.name,
          rankings: ranked.map(p => ({
            playerId: p.id, playerName: p.name, placement: p.placement,
            totalAssets: p.totalAssets, cleanMoney: p.clean_money,
            properties: p.properties, isBot: p.is_bot, isBankrupt: p.is_bankrupt,
          })),
          achievements: awardedAchievements,
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
