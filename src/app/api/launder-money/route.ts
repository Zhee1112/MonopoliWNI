import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { mapPlayerFromDB } from '@/lib/types';
import { processLaundering } from '@/lib/game/game-logic';

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { roomId, playerId, amount } = await request.json();

    if (!roomId || !playerId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
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

    const statusEffects = (player.statusEffects as Array<{ type: string; duration: number; effect: string }>) || [];
    if (statusEffects.some(e => e.type === 'laundering_cooldown')) {
      return NextResponse.json({ error: 'Masih dalam cooldown pencucian uang (3 babak)' }, { status: 400 });
    }

    if (player.dirtyMoney < amount) {
      return NextResponse.json({ error: 'Uang kotor tidak cukup' }, { status: 400 });
    }

    const evidenceBonus = Array.isArray(player.evidence)
      ? player.evidence.reduce((sum: number, ev: { bonusModifier?: number }) => sum + (ev.bonusModifier || 0), 0)
      : 0;

    const result = processLaundering(amount, player.stats, evidenceBonus);

    let cleanMoneyDelta = 0;
    let dirtyMoneyDelta = -amount;

    if (result.success) {
      cleanMoneyDelta = result.cleanAmount;
    }

    const newDirtyMoney = Math.max(0, player.dirtyMoney + dirtyMoneyDelta);
    const newCleanMoney = Math.max(0, player.cleanMoney + cleanMoneyDelta);
    const newEffects = [...statusEffects, { type: 'laundering_cooldown', duration: 3, effect: 'Cooldown pencucian uang' }];

    await supabaseAdmin
      .from('players')
      .update({
        dirty_money: newDirtyMoney,
        clean_money: newCleanMoney,
        status_effects: newEffects,
      })
      .eq('id', playerId);

    await supabaseAdmin.from('game_log').insert({
      room_id: roomId,
      player_id: playerId,
      action: 'launder',
      detail: { amount, success: result.success, cleanAmount: result.cleanAmount, fee: result.fee },
    });

    return NextResponse.json({
      success: true,
      launderingSuccess: result.success,
      cleanAmount: result.cleanAmount,
      fee: result.fee,
      newCleanMoney,
      newDirtyMoney,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
