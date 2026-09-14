import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { mapPlayerFromDB, mapRoomFromDB, GameMode } from '@/lib/types';
import { getNormalRoleById } from '@/lib/game/role-data';
import { getPropertyCells, getCellByIndex } from '@/lib/game/board-data';
import { getPlacementXp, getAchievement, ACHIEVEMENTS } from '@/lib/game/achievements';

// ============================================================
// END TURN API - With Game Mode Win Conditions + Achievements
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

async function awardPlacementAchievements(
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

    const placement = p.placement;

    // Winner always gets achievement
    if (placement === 1) {
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

        if (!error) {
          awardedAchievements.push({ playerId: p.id, achievementId: result.achievementId, xp: result.xp });
        }
      }
    }

    // Runner-up (only 5+ real players)
    if (placement === 2 && realCount >= 5) {
      const result = getPlacementXp(2, realCount);
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

        if (!error) {
          awardedAchievements.push({ playerId: p.id, achievementId: result.achievementId, xp: result.xp });
        }
      }
    }

    // Third place (only 5+ real players)
    if (placement === 3 && realCount >= 5) {
      const result = getPlacementXp(3, realCount);
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

        if (!error) {
          awardedAchievements.push({ playerId: p.id, achievementId: result.achievementId, xp: result.xp });
        }
      }
    }

    // Participation (all players who didn't go bankrupt)
    if (!p.is_bankrupt) {
      const result = getPlacementXp(placement, realCount);
      if (result) {
        const { error } = await supabaseAdmin
          .from('player_achievements')
          .upsert({
            game_room_id: roomId,
            player_id: p.id,
            user_id: p.user_id,
            achievement_id: 'participation',
            xp_granted: 30,
          }, { onConflict: 'game_room_id,player_id,achievement_id', ignoreDuplicates: true });

        if (!error) {
          awardedAchievements.push({ playerId: p.id, achievementId: 'participation', xp: 30 });
        }
      }
    }

    // Speed demon (kilat mode winner)
    if (placement === 1 && gameMode === 'kilat') {
      const { error } = await supabaseAdmin
        .from('player_achievements')
        .upsert({
          game_room_id: roomId,
          player_id: p.id,
          user_id: p.user_id,
          achievement_id: 'speed_demon',
          xp_granted: 40,
        }, { onConflict: 'game_room_id,player_id,achievement_id', ignoreDuplicates: true });

      if (!error) {
        awardedAchievements.push({ playerId: p.id, achievementId: 'speed_demon', xp: 40 });
      }
    }

    // Survivor bundir (didn't go bankrupt in bundir mode)
    if (gameMode === 'bundir' && !p.is_bankrupt) {
      const { error } = await supabaseAdmin
        .from('player_achievements')
        .upsert({
          game_room_id: roomId,
          player_id: p.id,
          user_id: p.user_id,
          achievement_id: 'survivor',
          xp_granted: 35,
        }, { onConflict: 'game_room_id,player_id,achievement_id', ignoreDuplicates: true });

      if (!error) {
        awardedAchievements.push({ playerId: p.id, achievementId: 'survivor', xp: 35 });
      }
    }

    // Money achievements
    if (p.totalAssets >= 5000000) {
      await supabaseAdmin
        .from('player_achievements')
        .upsert({
          game_room_id: roomId,
          player_id: p.id,
          user_id: p.user_id,
          achievement_id: 'millionaire',
          xp_granted: 40,
        }, { onConflict: 'game_room_id,player_id,achievement_id', ignoreDuplicates: true });
    }

    if (p.clean_money >= 3000000) {
      await supabaseAdmin
        .from('player_achievements')
        .upsert({
          game_room_id: roomId,
          player_id: p.id,
          user_id: p.user_id,
          achievement_id: 'cash_king',
          xp_granted: 30,
        }, { onConflict: 'game_room_id,player_id,achievement_id', ignoreDuplicates: true });
    }

    // Property achievements
    const propCount = (p.properties || []).length;
    if (propCount >= 5) {
      await supabaseAdmin
        .from('player_achievements')
        .upsert({
          game_room_id: roomId,
          player_id: p.id,
          user_id: p.user_id,
          achievement_id: 'treasure_hunter',
          xp_granted: 40,
        }, { onConflict: 'game_room_id,player_id,achievement_id', ignoreDuplicates: true });
    }
    if (propCount >= 8) {
      await supabaseAdmin
        .from('player_achievements')
        .upsert({
          game_room_id: roomId,
          player_id: p.id,
          user_id: p.user_id,
          achievement_id: 'property_mogul',
          xp_granted: 45,
        }, { onConflict: 'game_room_id,player_id,achievement_id', ignoreDuplicates: true });
    }
  }

  return awardedAchievements;
}

async function syncUserProfiles(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  roomId: string,
  ranked: Array<{ id: string; user_id: string | null; name: string; totalAssets: number; placement: number; clean_money: number; dirty_money: number; properties: string[]; is_bot: boolean }>,
  gameMode: GameMode,
  winnerId: string | null,
) {
  for (const p of ranked) {
    if (p.is_bot || !p.user_id) continue;

    // Get current profile
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', p.user_id)
      .maybeSingle();

    const currentHighestCash = profile?.highest_cash || 0;
    const currentPropertiesOwned = profile?.properties_owned || 0;
    const currentGamesPlayed = profile?.total_games || 0;
    const currentWins = profile?.total_wins || 0;
    const currentTotalXp = profile?.xp || 0;

    const newHighestCash = Math.max(currentHighestCash, p.clean_money);
    const newPropertiesOwned = Math.max(currentPropertiesOwned, (p.properties || []).length);
    const isWinner = p.id === winnerId;
    const newWins = currentWins + (isWinner ? 1 : 0);

    // Get XP from achievements for this game
    const { data: achievements } = await supabaseAdmin
      .from('player_achievements')
      .select('xp_granted')
      .eq('game_room_id', roomId)
      .eq('player_id', p.id);

    const gameXp = achievements?.reduce((sum, a) => sum + (a.xp_granted || 0), 0) || 0;
    // Placement XP
    const placementXp = isWinner ? 150 : p.placement === 2 ? 100 : p.placement === 3 ? 75 : 30;

    // Upsert profile
    await supabaseAdmin
      .from('user_profiles')
      .upsert({
        user_id: p.user_id,
        display_name: p.name || profile?.display_name || 'Player',
        highest_cash: newHighestCash,
        properties_owned: newPropertiesOwned,
        total_games: currentGamesPlayed + 1,
        total_wins: newWins,
        xp: currentTotalXp + gameXp + placementXp,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
  }
}

async function checkGameOver(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  roomId: string,
  room: ReturnType<typeof mapRoomFromDB>,
  completedRound: number,
): Promise<{ gameOver: boolean; winnerId?: string; winnerName?: string }> {
  const gameMode = room.gameMode as GameMode;

  if (gameMode === 'bundir') {
    const { data: activePlayers } = await supabaseAdmin
      .from('players')
      .select('*')
      .eq('room_id', roomId)
      .eq('is_bankrupt', false);

    if (activePlayers && activePlayers.length === 1) {
      return { gameOver: true, winnerId: activePlayers[0].id, winnerName: activePlayers[0].name };
    }
    if (activePlayers && activePlayers.length === 0) {
      return { gameOver: true };
    }
  }

  if (gameMode === 'sultan' || gameMode === 'kilat') {
    if (completedRound >= room.totalRounds) {
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

    const statusEffects = (player.statusEffects as Array<{ type: string; duration: number; effect: string }>) || [];
    const skipEffect = statusEffects.find(e => e.type === 'skip_turn' && e.duration > 0);

    if (skipEffect) {
      const updatedEffects = statusEffects.map(e =>
        e.type === 'skip_turn' ? { ...e, duration: e.duration - 1 } : e
      ).filter(e => e.duration > 0);

      await supabaseAdmin
        .from('players')
        .update({ status_effects: updatedEffects })
        .eq('id', playerId);

      const nextTurn = (room.currentTurn + 1) % room.turnOrder.length;
      await supabaseAdmin
        .from('rooms')
        .update({ current_turn: nextTurn, last_activity_at: new Date().toISOString() })
        .eq('id', roomId);

      // Clear has_rolled for the next player (same as normal path)
      const nextPlayerId = room.turnOrder[nextTurn];
      const { data: nextPlayer } = await supabaseAdmin
        .from('players')
        .select('status_effects')
        .eq('id', nextPlayerId)
        .maybeSingle();

      if (nextPlayer) {
        const nextEffects = ((nextPlayer.status_effects as Array<{ type: string; duration: number; effect: string }>) || [])
          .filter(e => e.type !== 'has_rolled')
          .map(e => ({ ...e, duration: e.duration - 1 }))
          .filter(e => e.duration > 0);
        await supabaseAdmin
          .from('players')
          .update({ status_effects: nextEffects })
          .eq('id', nextPlayerId);
      }

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

    const role = getNormalRoleById(player.role);
    let income = 0;

    if (role) {
      income = role.baseIncome;

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

    await supabaseAdmin
      .from('players')
      .update({ clean_money: player.cleanMoney + income })
      .eq('id', playerId);

    const nextTurn = (room.currentTurn + 1) % room.turnOrder.length;

    await supabaseAdmin
      .from('rooms')
      .update({ current_turn: nextTurn, last_activity_at: new Date().toISOString() })
      .eq('id', roomId);

    // Check if new round started (all players have had a turn)
    let globalEventTriggered = false;
    let globalEventName = '';
    let globalEventEmoji = '';
    let globalEventDescription = '';

    if (nextTurn === 0) {
      // New round! Check for global events
      const newRound = Math.floor(room.currentTurn / room.turnOrder.length) + 1;
      const { getGlobalEventsForRound } = await import('@/lib/game/global-events');
      const triggeredEvents = getGlobalEventsForRound(newRound);

      if (triggeredEvents.length > 0) {
        const { event, subEvent } = triggeredEvents[0]; // Take first triggered event
        globalEventTriggered = true;
        globalEventName = event.name;
        globalEventEmoji = event.emoji;
        globalEventDescription = subEvent.description;

        // Apply effects based on subEvent
        const allPlayers = await supabaseAdmin
          .from('players')
          .select('*')
          .eq('room_id', roomId);

        if (allPlayers.data) {
          // Handle swap_positions separately (needs all positions first)
          if (subEvent.effect.type === 'swap_positions') {
            const positions = allPlayers.data.map(p => ({ id: p.id, position: p.position }));
            const shuffled = [...positions].sort(() => Math.random() - 0.5);
            for (let i = 0; i < positions.length; i++) {
              await supabaseAdmin
                .from('players')
                .update({ position: shuffled[i].position })
                .eq('id', positions[i].id);
            }
          } else {
          for (const p of allPlayers.data) {
            // Skip bankrupt players
            if (p.is_bankrupt) continue;
            const playerProps = (p.properties as string[]) || [];
            let moneyChange = 0;
            const newStatusEffects = [...((p.status_effects as Array<{ type: string; duration: number; effect: string }>) || [])];

            switch (subEvent.effect.type as string) {
              case 'all_money_divide': {
                const divisor = subEvent.effect.value || 10;
                moneyChange = -(p.clean_money - Math.floor(p.clean_money / divisor));
                break;
              }
              case 'all_pay_percent': {
                const percent = subEvent.effect.value || 10;
                moneyChange = -Math.floor(p.clean_money * (percent / 100));
                break;
              }
              case 'seize_dirty': {
                moneyChange = 0;
                const seizedDirty = p.dirty_money || 0;
                const seizeFine = subEvent.effect.value || 0;
                // Clear dirty money
                await supabaseAdmin
                  .from('players')
                  .update({ dirty_money: 0, dirty_history: [] })
                  .eq('id', p.id);
                // Apply fine from clean money if any
                if (seizeFine > 0) {
                  moneyChange = -seizeFine;
                }
                break;
              }
              case 'cancel_rent': {
                const duration = subEvent.effect.duration || 2;
                newStatusEffects.push({
                  type: 'rent_frozen',
                  duration,
                  effect: `Sewa dibekukan selama ${duration} babak (Cancel Culture)`,
                });
                break;
              }
              case 'skip_even': {
                const duration = subEvent.effect.duration || 1;
                const fine = subEvent.effect.value || 100000;
                newStatusEffects.push({
                  type: 'dice_modifier',
                  duration,
                  effect: `Ganjil Genap: Dadu ganjil = skip + denda Rp ${fine.toLocaleString('id-ID')}`,
                });
                break;
              }
              case 'property_disable': {
                const duration = subEvent.effect.duration || 1;
                newStatusEffects.push({
                  type: 'rent_frozen',
                  duration,
                  effect: `Semua properti tidak bisa disewa selama ${duration} babak`,
                });
                break;
              }
              case 'tech_disable': {
                const duration = subEvent.effect.duration || 1;
                newStatusEffects.push({
                  type: 'rent_frozen',
                  duration,
                  effect: `Properti digital tidak berfungsi selama ${duration} babak`,
                });
                break;
              }
              case 'rich_penalty': {
                const percent = subEvent.effect.value || 30;
                moneyChange = -Math.floor(p.clean_money * (percent / 100));
                break;
              }
              case 'random_fine': {
                const fine = subEvent.effect.value || 200000;
                // Random 1-2 players get fined
                if (Math.random() < 0.4) {
                  moneyChange = -fine;
                }
                break;
              }
              case 'swap_positions': {
                // Handled after the per-player loop
                break;
              }
              default:
                break;
            }

            const newMoney = Math.max(0, p.clean_money + moneyChange);
            await supabaseAdmin
              .from('players')
              .update({ clean_money: newMoney, status_effects: newStatusEffects })
              .eq('id', p.id);
          }
          } // end else (non-swap)
        }

        // Log the global event
        await supabaseAdmin.from('game_log').insert({
          room_id: roomId,
          player_id: room.turnOrder[0],
          action: 'event',
          detail: { globalEvent: true, eventName: event.name, subEventName: subEvent.name },
        });
      }
    }

    // Clear has_rolled flag for the next player
    const nextPlayerId = room.turnOrder[nextTurn];
    const { data: nextPlayer } = await supabaseAdmin
      .from('players')
      .select('status_effects')
      .eq('id', nextPlayerId)
      .maybeSingle();

    if (nextPlayer) {
      // Decrement all status effect durations and remove expired ones
      const nextEffects = ((nextPlayer.status_effects as Array<{ type: string; duration: number; effect: string }>) || [])
        .filter(e => e.type !== 'has_rolled')
        .map(e => ({ ...e, duration: e.duration - 1 }))
        .filter(e => e.duration > 0);
      await supabaseAdmin
        .from('players')
        .update({ status_effects: nextEffects })
        .eq('id', nextPlayerId);
    }

    await supabaseAdmin.from('game_log').insert({
      room_id: roomId,
      player_id: playerId,
      action: 'end_turn',
      detail: { income, nextPlayerId: room.turnOrder[nextTurn], nextTurn },
    });

    const updatedRoom = { ...room, currentTurn: nextTurn };
    const completedRound = Math.floor(room.currentTurn / room.turnOrder.length) + 1;
    const gameOverResult = await checkGameOver(supabaseAdmin, roomId, updatedRoom, completedRound);

    if (gameOverResult.gameOver) {
      // Calculate final rankings
      const ranked = await calculateRankings(supabaseAdmin, roomId);

      // Mark game as finished
      await supabaseAdmin
        .from('rooms')
        .update({
          status: 'finished',
          winner_id: gameOverResult.winnerId || null,
        })
        .eq('id', roomId);

      // Award placement achievements
      const awardedAchievements = await awardPlacementAchievements(
        supabaseAdmin,
        roomId,
        ranked,
        room.gameMode as GameMode,
      );

      // Sync user profiles
      await syncUserProfiles(supabaseAdmin, roomId, ranked, room.gameMode as GameMode, gameOverResult.winnerId);

      // Save game results
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
          xp_earned: awardedAchievements
            .filter(a => a.playerId === p.id)
            .reduce((sum, a) => sum + a.xp, 0) + (p.placement === 1 ? 150 : p.placement === 2 ? 100 : p.placement === 3 ? 75 : 30),
          is_winner: p.id === gameOverResult.winnerId,
          game_mode: room.gameMode as GameMode,
          total_rounds: room.totalRounds,
        });
      }

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
        rankings: ranked.map(p => ({
          playerId: p.id,
          playerName: p.name,
          placement: p.placement,
          totalAssets: p.totalAssets,
          cleanMoney: p.clean_money,
          properties: p.properties || [],
          isBot: p.is_bot,
          isBankrupt: p.is_bankrupt,
        })),
        achievements: awardedAchievements,
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
      globalEventTriggered,
      globalEventName,
      globalEventEmoji,
      globalEventDescription,
    });
  } catch (error) {
    console.error('End turn error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
