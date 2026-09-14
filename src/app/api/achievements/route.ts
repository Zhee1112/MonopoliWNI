import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getAchievement } from '@/lib/game/achievements';

// ============================================================
// ACHIEVEMENTS API - Award & Query achievements
// ============================================================

// POST: Award an achievement to a player (idempotent)
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { roomId, playerId, userId, achievementId } = await request.json();

    if (!roomId || !playerId || !achievementId) {
      return NextResponse.json(
        { error: 'roomId, playerId, and achievementId are required' },
        { status: 400 }
      );
    }

    const achievement = getAchievement(achievementId);
    if (!achievement) {
      return NextResponse.json({ error: 'Invalid achievement ID' }, { status: 400 });
    }

    // Check for duplicate (idempotent)
    const { data: existing } = await supabaseAdmin
      .from('player_achievements')
      .select('id')
      .eq('game_room_id', roomId)
      .eq('player_id', playerId)
      .eq('achievement_id', achievementId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, duplicate: true, achievement: achievementId });
    }

    // Insert achievement
    const { error: insertError } = await supabaseAdmin
      .from('player_achievements')
      .insert({
        game_room_id: roomId,
        player_id: playerId,
        user_id: userId || null,
        achievement_id: achievementId,
        xp_granted: achievement.xp,
      });

    if (insertError) {
      console.error('Achievement insert error:', insertError);
      return NextResponse.json({ error: 'Failed to award achievement' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      achievement: achievementId,
      xp: achievement.xp,
    });
  } catch (error) {
    console.error('Achievement API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Fetch achievements by roomId or userId
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const userId = searchParams.get('userId');

    if (!roomId && !userId) {
      return NextResponse.json({ error: 'roomId or userId is required' }, { status: 400 });
    }

    let query = supabaseAdmin
      .from('player_achievements')
      .select('*');

    if (roomId) {
      query = query.eq('game_room_id', roomId);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Achievement fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
    }

    return NextResponse.json({ success: true, achievements: data || [] });
  } catch (error) {
    console.error('Achievement GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
