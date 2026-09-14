import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

// ============================================================
// GAME RESULTS API - Query game history
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const roomId = searchParams.get('roomId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId && !roomId) {
      return NextResponse.json({ error: 'userId or roomId is required' }, { status: 400 });
    }

    let query = supabaseAdmin
      .from('game_results')
      .select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (roomId) {
      query = query.eq('game_room_id', roomId);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Game results fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch game results' }, { status: 500 });
    }

    return NextResponse.json({ success: true, results: data || [] });
  } catch (error) {
    console.error('Game results API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
