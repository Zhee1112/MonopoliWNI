import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ error: 'roomId required' }, { status: 400 });
    }

    // Get game results
    const { data: results, error } = await supabaseAdmin
      .from('game_results')
      .select('*')
      .eq('game_room_id', roomId)
      .order('placement', { ascending: true });

    if (error) throw error;

    // Get achievements for all players in this game
    const { data: achievements } = await supabaseAdmin
      .from('player_achievements')
      .select('player_id, achievement_id, xp_granted')
      .eq('game_room_id', roomId);

    // Get player names
    const { data: players } = await supabaseAdmin
      .from('players')
      .select('id, name, is_bot')
      .eq('room_id', roomId);

    const rankings = results?.map(r => {
      const player = players?.find(p => p.id === r.player_id);
      return {
        playerId: r.player_id,
        playerName: player?.name || 'Unknown',
        placement: r.placement,
        totalAssets: r.final_total_assets || 0,
        cleanMoney: r.final_clean_money || 0,
        dirtyMoney: r.final_dirty_money || 0,
        properties: r.final_properties || [],
        isBot: player?.is_bot || false,
        isBankrupt: false,
      };
    }) || [];

    const achievementsList = achievements?.map(a => ({
      playerId: a.player_id,
      achievementId: a.achievement_id,
      xp: a.xp_granted || 0,
    })) || [];

    return NextResponse.json({ rankings, achievements: achievementsList });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
