import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { rollDice, updateLuck, rollLuckFluctuation } from '@/lib/game/game-logic';
import { mapPlayerFromDB, mapRoomFromDB } from '@/lib/types';

// ============================================================
// ROLL DICE API
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { roomId, playerId, dice1: clientDice1, dice2: clientDice2 } = await request.json();

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

    if (player.isBankrupt) {
      return NextResponse.json({ error: 'Player is bankrupt' }, { status: 400 });
    }

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

    // Prevent double-roll using status_effects
    const statusEffects = (player.statusEffects as Array<{ type: string; duration: number; effect: string }>) || [];
    if (statusEffects.some(e => e.type === 'has_rolled')) {
      return NextResponse.json({ error: 'Sudah roll giliran ini' }, { status: 400 });
    }

    // Check skip_turn: auto-skip without rolling
    if (statusEffects.some(e => e.type === 'skip_turn')) {
      const skipEffect = statusEffects.find(e => e.type === 'skip_turn');
      // Decrement skip_turn and mark has_rolled so they can end turn
      const updatedEffects = statusEffects
        .map(e => e.type === 'skip_turn' ? { ...e, duration: e.duration - 1 } : e)
        .filter(e => e.duration > 0)
        .concat([{ type: 'has_rolled', duration: 999, effect: 'already_rolled' }]);
      await supabaseAdmin
        .from('players')
        .update({ status_effects: updatedEffects })
        .eq('id', playerId);

      return NextResponse.json({
        success: true,
        dice1: 0,
        dice2: 0,
        total: 0,
        newPosition: player.position,
        passedStart: false,
        luckFluctuation: 0,
        newLuck: player.luck,
        moneyChange: 0,
        skipTurn: true,
        skipReason: skipEffect?.effect || 'Skip putaran',
        gameMode: room.gameMode,
        currentRound: Math.floor(room.currentTurn / room.turnOrder.length) + 1,
        totalRounds: room.totalRounds,
      });
    }

    // Use client dice values (same dice shown in animation)
    const dice1 = Math.max(1, Math.min(6, Number(clientDice1) || rollDice(6)));
    const dice2 = Math.max(1, Math.min(6, Number(clientDice2) || rollDice(6)));
    let total = dice1 + dice2;

    // Check dice_modifier (Ganjil Genap): odd dice = skip + fine
    const diceModifierEffect = statusEffects.find(e => e.type === 'dice_modifier');
    if (diceModifierEffect && total % 2 !== 0) {
      // Odd dice during Ganjil Genap — skip turn and apply fine
      const fineMatch = diceModifierEffect.effect.match(/denda Rp ([\d.]+)/);
      const fine = fineMatch ? parseInt(fineMatch[1].replace(/\./g, ''), 10) : 100000;
      const skipEffect = { type: 'skip_turn', duration: 1, effect: `Ganjil Genap: Dadu ganjil, skip + denda Rp ${fine.toLocaleString('id-ID')}` };
      const updatedEffectsForSkip = [...statusEffects, { type: 'has_rolled', duration: 999, effect: 'already_rolled' }, skipEffect];

      await supabaseAdmin
        .from('players')
        .update({
          clean_money: Math.max(0, player.cleanMoney - fine),
          status_effects: updatedEffectsForSkip,
        })
        .eq('id', playerId);

      // Free Parking Pot: fine goes to pot
      const { data: potRoom } = await supabaseAdmin
        .from('rooms')
        .select('pot_money')
        .eq('id', roomId)
        .maybeSingle();
      if (potRoom) {
        await supabaseAdmin
          .from('rooms')
          .update({ pot_money: (potRoom.pot_money || 0) + fine })
          .eq('id', roomId);
      }

      return NextResponse.json({
        success: true,
        dice1,
        dice2,
        total,
        newPosition: player.position,
        passedStart: false,
        luckFluctuation: 0,
        newLuck: player.luck,
        moneyChange: -fine,
        skipTurn: true,
        skipReason: `Dadu ganjil (${total}) saat Ganjil Genap! Denda Rp ${fine.toLocaleString('id-ID')}`,
        gameMode: room.gameMode,
        currentRound: Math.floor(room.currentTurn / room.turnOrder.length) + 1,
        totalRounds: room.totalRounds,
      });
    }

    // Calculate new position
    const newPosition = (player.position + total) % 40;
    const passedStart = player.position + total >= 40;

    // Update luck
    const luckFluctuation = rollLuckFluctuation();
    const newLuck = updateLuck(player.luck, luckFluctuation);

    // Check luck 0 achievement
    if (newLuck === 0 && player.luck > 0) {
      await supabaseAdmin
        .from('player_achievements')
        .upsert({
          game_room_id: roomId,
          player_id: playerId,
          user_id: dbPlayer.user_id || null,
          achievement_id: 'unlucky_zero',
          xp_granted: 25,
        }, { onConflict: 'game_room_id,player_id,achievement_id', ignoreDuplicates: true });
    }

    // Calculate money changes
    let moneyChange = 0;
    if (passedStart) {
      moneyChange += 200000;
    }

    // Update player + set has_rolled flag
    const updatedEffects = [...statusEffects, { type: 'has_rolled', duration: 999, effect: 'already_rolled' }];
    const { error: updateError } = await supabaseAdmin
      .from('players')
      .update({
        position: newPosition,
        luck: newLuck,
        clean_money: player.cleanMoney + moneyChange,
        status_effects: updatedEffects,
      })
      .eq('id', playerId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
    }

    // Track babak: mark this player as having passed Start this babak
    if (passedStart) {
      const hasPassedEffect = statusEffects.some(e => e.type === 'passed_start_this_babak');
      if (!hasPassedEffect) {
        const effectsWithPassed = [...updatedEffects, { type: 'passed_start_this_babak', duration: 999, effect: 'passed_start' }];
        await supabaseAdmin
          .from('players')
          .update({ status_effects: effectsWithPassed })
          .eq('id', playerId);
      }
    }

    // Update room last_activity_at
    await supabaseAdmin
      .from('rooms')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', roomId);

    // Log the action
    await supabaseAdmin.from('game_log').insert({
      room_id: roomId,
      player_id: playerId,
      action: 'roll',
      detail: { dice1, dice2, total, newPosition, passedStart, luckFluctuation, moneyChange },
    });

    return NextResponse.json({
      success: true,
      dice1,
      dice2,
      total,
      newPosition,
      passedStart,
      luckFluctuation,
      newLuck,
      moneyChange,
      gameMode: room.gameMode,
      currentRound: Math.floor(room.currentTurn / room.turnOrder.length) + 1,
      totalRounds: room.totalRounds,
    });
  } catch (error) {
    console.error('Roll dice error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
