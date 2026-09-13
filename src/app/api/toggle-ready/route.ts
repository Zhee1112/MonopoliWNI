import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { mapPlayerFromDB } from '@/lib/types';

// ============================================================
// TOGGLE READY API
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { playerId } = await request.json();

    if (!playerId) {
      return NextResponse.json({ error: 'playerId is required' }, { status: 400 });
    }

    // Fetch current player
    const { data: dbPlayer, error: fetchError } = await supabaseAdmin
      .from('players')
      .select('is_ready')
      .eq('id', playerId)
      .single();

    if (fetchError || !dbPlayer) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const newReady = !(dbPlayer as Record<string, unknown>).is_ready;

    // Toggle ready
    const { data: updatedPlayer, error: updateError } = await supabaseAdmin
      .from('players')
      .update({ is_ready: newReady })
      .eq('id', playerId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to toggle ready' }, { status: 500 });
    }

    const player = mapPlayerFromDB(updatedPlayer as Record<string, unknown>);

    return NextResponse.json({
      success: true,
      player,
      isReady: newReady,
    });
  } catch (error) {
    console.error('Toggle ready error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
