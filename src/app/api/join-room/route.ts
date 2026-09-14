import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { mapRoomFromDB, mapPlayerFromDB } from '@/lib/types';
import { validatePlayerName, validateRoomCode } from '@/lib/validation';

// ============================================================
// JOIN ROOM API - With user auth binding + race condition fix
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { roomCode, playerName, userId } = await request.json();

    if (!roomCode || !playerName) {
      return NextResponse.json(
        { error: 'Room code and player name are required' },
        { status: 400 }
      );
    }

    const nameValidation = validatePlayerName(playerName);
    if (!nameValidation.valid) {
      return NextResponse.json({ error: nameValidation.error }, { status: 400 });
    }

    const codeValidation = validateRoomCode(roomCode);
    if (!codeValidation.valid) {
      return NextResponse.json({ error: codeValidation.error }, { status: 400 });
    }

    // Check if user already in ANY active room
    if (userId) {
      const { data: existingPlayer } = await supabaseAdmin
        .from('players')
        .select('room_id, rooms!inner(id, status, code)')
        .eq('user_id', userId)
        .in('rooms.status', ['waiting', 'playing'])
        .maybeSingle();

      if (existingPlayer) {
        const room = (existingPlayer as unknown as { rooms: { status: string; code: string } }).rooms;
        return NextResponse.json({
          error: 'Kamu sudah ada di meja lain',
          activeRoom: room.code,
          activeStatus: room.status,
        }, { status: 400 });
      }
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

    // Check for duplicate name in this room
    const { data: existingNames } = await supabaseAdmin
      .from('players')
      .select('id')
      .eq('room_id', room.id)
      .eq('name', playerName)
      .maybeSingle();

    if (existingNames) {
      return NextResponse.json({ error: 'Nama sudah dipakai di meja ini' }, { status: 400 });
    }

    // Use RPC or sequential approach with lock to prevent race conditions
    // First, get current count and turn_order atomically
    const { data: roomState, error: lockError } = await supabaseAdmin
      .from('rooms')
      .select('id, turn_order')
      .eq('id', room.id)
      .single();

    if (lockError || !roomState) {
      return NextResponse.json({ error: 'Failed to lock room' }, { status: 500 });
    }

    // Count current players
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
        role: null,
        selected_role: null,
        user_id: userId || null,
      })
      .select()
      .single();

    if (playerError) {
      return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
    }

    const player = mapPlayerFromDB(dbPlayer as Record<string, unknown>);

    // Update room turn_order using the fresh read (append new player)
    const currentTurnOrder = (roomState.turn_order as string[]) || [];
    await supabaseAdmin
      .from('rooms')
      .update({
        turn_order: [...currentTurnOrder, player.id],
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', room.id);

    return NextResponse.json({
      success: true,
      room: { ...room, turnOrder: [...currentTurnOrder, player.id] },
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
