import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ activeRoom: null });
    }

    const { data: existingPlayer } = await supabaseAdmin
      .from('players')
      .select('room_id, rooms!inner(id, status, code)')
      .eq('user_id', userId)
      .in('rooms.status', ['waiting', 'playing'])
      .maybeSingle();

    if (existingPlayer) {
      const room = (existingPlayer as unknown as { rooms: { status: string; code: string } }).rooms;
      const playerRow = await supabaseAdmin
        .from('players')
        .select('id, name, token_color, role, selected_role, is_ready')
        .eq('user_id', userId)
        .eq('room_id', existingPlayer.room_id)
        .maybeSingle();

      return NextResponse.json({
        activeRoom: {
          code: room.code,
          status: room.status,
          roomId: existingPlayer.room_id,
          player: playerRow.data || null,
        },
      });
    }

    return NextResponse.json({ activeRoom: null });
  } catch (error) {
    console.error('Active room check error:', error);
    return NextResponse.json({ activeRoom: null });
  }
}
