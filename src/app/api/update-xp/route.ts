import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

// ============================================================
// UPDATE XP API - Called after game ends
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { userId, xpGain, won } = await request.json();

    if (!userId || xpGain === undefined) {
      return NextResponse.json({ error: 'userId and xpGain are required' }, { status: 400 });
    }

    // Fetch current profile
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('xp, total_games, total_wins')
      .eq('user_id', userId)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const newXp = Math.max(0, (profile.xp || 0) + xpGain);
    const newTotalGames = (profile.total_games || 0) + 1;
    const newTotalWins = (profile.total_wins || 0) + (won ? 1 : 0);

    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        xp: newXp,
        total_games: newTotalGames,
        total_wins: newTotalWins,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    const newLevel = Math.floor(newXp / 1000) + 1;

    return NextResponse.json({
      success: true,
      xp: newXp,
      level: newLevel,
      totalGames: newTotalGames,
      totalWins: newTotalWins,
    });
  } catch (error) {
    console.error('Update XP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
