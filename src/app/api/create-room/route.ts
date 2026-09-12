import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { mapRoomFromDB, mapPlayerFromDB } from '@/lib/types';

// ============================================================
// CREATE ROOM API
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { playerName } = await request.json();

    if (!playerName) {
      return NextResponse.json({ error: 'Player name is required' }, { status: 400 });
    }

    // Generate unique room code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let roomCode = '';
    let isUnique = false;

    while (!isUnique) {
      roomCode = '';
      for (let i = 0; i < 6; i++) {
        roomCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const { data: existingRoom } = await supabaseAdmin
        .from('rooms')
        .select('id')
        .eq('code', roomCode)
        .single();

      if (!existingRoom) {
        isUnique = true;
      }
    }

    // Create room
    const { data: dbRoom, error: roomError } = await supabaseAdmin
      .from('rooms')
      .insert({
        code: roomCode,
        host_id: '',
        status: 'waiting',
      })
      .select()
      .single();

    if (roomError) {
      return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }

    const room = mapRoomFromDB(dbRoom as Record<string, unknown>);

    // Create host player
    const { data: dbPlayer, error: playerError } = await supabaseAdmin
      .from('players')
      .insert({
        room_id: room.id,
        name: playerName,
        token_color: '#3b82f6',
      })
      .select()
      .single();

    if (playerError) {
      return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
    }

    const player = mapPlayerFromDB(dbPlayer as Record<string, unknown>);

    // Update room with host ID
    await supabaseAdmin
      .from('rooms')
      .update({
        host_id: player.id,
        turn_order: [player.id],
      })
      .eq('id', room.id);

    // Create all properties for this room
    const properties = Array.from({ length: 40 }, (_, i) => ({
      room_id: room.id,
      board_index: i,
      owner_id: null,
      house_level: 0,
      is_mortgaged: false,
    }));

    await supabaseAdmin.from('properties').insert(properties);

    return NextResponse.json({
      success: true,
      room: { ...room, hostId: player.id, turnOrder: [player.id] },
      player,
    });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
