import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { mapRoomFromDB, mapPlayerFromDB } from '@/lib/types';

// ============================================================
// JOIN ROOM API
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { roomCode, playerName } = await request.json();

    if (!roomCode || !playerName) {
      return NextResponse.json(
        { error: 'Room code and player name are required' },
        { status: 400 }
      );
    }

    // Find room
    const { data: dbRoom, error: roomError } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .eq('code', roomCode.toUpperCase())
      .single();

    if (roomError || !dbRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const room = mapRoomFromDB(dbRoom as Record<string, unknown>);

    if (room.status !== 'waiting') {
      return NextResponse.json({ error: 'Game already started' }, { status: 400 });
    }

    // Count players
    const { count, error: countError } = await supabaseAdmin
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', room.id);

    if (countError) {
      return NextResponse.json({ error: 'Failed to count players' }, { status: 500 });
    }

    if (count && count >= 8) {
      return NextResponse.json({ error: 'Room is full (max 8 players)' }, { status: 400 });
    }

    const tokenColors = [
      '#ef4444', '#22c55e', '#eab308', '#a855f7',
      '#ec4899', '#06b6d4', '#f97316', '#6b7280',
    ];

    // Create player
    const { data: dbPlayer, error: playerError } = await supabaseAdmin
      .from('players')
      .insert({
        room_id: room.id,
        name: playerName,
        token_color: tokenColors[count || 0],
      })
      .select()
      .single();

    if (playerError) {
      return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
    }

    const player = mapPlayerFromDB(dbPlayer as Record<string, unknown>);

    // Update room turn_order
    await supabaseAdmin
      .from('rooms')
      .update({ turn_order: [...room.turnOrder, player.id] })
      .eq('id', room.id);

    return NextResponse.json({
      success: true,
      room: { ...room, turnOrder: [...room.turnOrder, player.id] },
      player,
    });
  } catch (error) {
    console.error('Join room error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const roomCode = searchParams.get('code');

    if (!roomCode) {
      return NextResponse.json({ error: 'Room code is required' }, { status: 400 });
    }

    // Find room with players
    const { data: dbRoom, error: roomError } = await supabaseAdmin
      .from('rooms')
      .select('*, players(*)')
      .eq('code', roomCode.toUpperCase())
      .single();

    if (roomError || !dbRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const room = mapRoomFromDB(dbRoom as Record<string, unknown>);
    const players = (dbRoom.players as Record<string, unknown>[] || []).map(mapPlayerFromDB);

    return NextResponse.json({ success: true, room, players });
  } catch (error) {
    console.error('Get room error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
