import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { mapPlayerFromDB } from '@/lib/types';
import { getPropertyCells } from '@/lib/game/board-data';

// ============================================================
// BANKRUPT LOAN API
// POST: Take a loan from the bank (50% of total property value)
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { roomId, playerId, amount } = await request.json();

    if (!roomId || !playerId || !amount) {
      return NextResponse.json(
        { error: 'Room ID, Player ID, and Amount are required' },
        { status: 400 }
      );
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

    const player = mapPlayerFromDB(dbPlayer as Record<string, unknown>);

    // Calculate max loan (50% of total property value)
    const propertyCells = getPropertyCells();
    const playerProperties = (player.properties || [])
      .map(name => propertyCells.find(c => c.name === name))
      .filter(Boolean);

    const totalPropertyValue = playerProperties.reduce((sum, cell) => sum + (cell?.price || 0), 0);
    const maxLoan = Math.floor(totalPropertyValue * 0.5);

    // Validate loan amount
    if (amount > maxLoan) {
      return NextResponse.json({ error: `Maximum loan is Rp ${maxLoan.toLocaleString('id-ID')}` }, { status: 400 });
    }

    // Add loan to player
    const newBalance = player.cleanMoney + amount;
    await supabaseAdmin
      .from('players')
      .update({
        clean_money: newBalance,
        status_effects: [...(player.statusEffects || []), {
          type: 'loan',
          duration: 999,
          effect: `Pinjaman Rp ${amount.toLocaleString('id-ID')}`,
        }],
      })
      .eq('id', playerId);

    // Log
    await supabaseAdmin.from('game_log').insert({
      room_id: roomId,
      player_id: playerId,
      action: 'loan',
      detail: { amount, type: 'bankruptcy_loan' },
    });

    return NextResponse.json({
      success: true,
      loanAmount: amount,
      newBalance,
      message: `Pinjaman Rp ${amount.toLocaleString('id-ID')} berhasil!`,
    });
  } catch (error) {
    console.error('Bankrupt loan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
