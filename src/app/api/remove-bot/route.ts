import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { roomId, hostId, playerId } = await request.json();

    if (!roomId || !hostId || !playerId) {
      return NextResponse.json({ error: 'roomId, hostId, and playerId are required' }, { status: 400 });
    }

    const { data: dbRoom, error: roomError } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !dbRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if ((dbRoom as Record<string, unknown>).host_id !== hostId) {
      return NextResponse.json({ error: 'Only the host can remove bots' }, { status: 403 });
    }

    if ((dbRoom as Record<string, unknown>).status !== 'waiting') {
      return NextResponse.json({ error: 'Cannot remove bots after game started' }, { status: 400 });
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

    if (!(dbPlayer as Record<string, unknown>).is_bot) {
      return NextResponse.json({ error: 'Can only remove bots' }, { status: 400 });
    }

    await supabaseAdmin
      .from('players')
      .delete()
      .eq('id', playerId);

    const turnOrder = ((dbRoom as Record<string, unknown>).turn_order as string[] || []).filter(
      (id: string) => id !== playerId
    );
    await supabaseAdmin
      .from('rooms')
      .update({ turn_order: turnOrder })
      .eq('id', roomId);

    return NextResponse.json({ success: true, removedPlayerId: playerId, turnOrder });
  } catch (error) {
    console.error('Remove bot error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
