import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { NORMAL_ROLES } from '@/lib/game/role-data';
import { mapRoomFromDB, mapPlayerFromDB } from '@/lib/types';

// ============================================================
// START GAME API - Host only, validates all players have roles
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { roomId, hostId } = await request.json();

    if (!roomId || !hostId) {
      return NextResponse.json({ error: 'roomId and hostId are required' }, { status: 400 });
    }

    // Fetch room
    const { data: dbRoom, error: roomError } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !dbRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const room = mapRoomFromDB(dbRoom as Record<string, unknown>);

    // Verify requester is host
    if (room.hostId !== hostId) {
      return NextResponse.json({ error: 'Only the host can start the game' }, { status: 403 });
    }

    // Verify room is in waiting status
    if (room.status !== 'waiting') {
      return NextResponse.json({ error: 'Game already started' }, { status: 400 });
    }

    // Fetch all players
    const { data: dbPlayers, error: playersError } = await supabaseAdmin
      .from('players')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (playersError || !dbPlayers) {
      return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
    }

    const players = dbPlayers.map((p) => mapPlayerFromDB(p as Record<string, unknown>));

    // Validate minimum 2 players
    if (players.length < 2) {
      return NextResponse.json({ error: 'Minimal 2 pemain untuk memulai game' }, { status: 400 });
    }

    // Validate all players have selected a role
    const playersWithoutRole = players.filter((p) => !p.selectedRole);
    if (playersWithoutRole.length > 0) {
      return NextResponse.json({
        error: `Masih ada pemain belum memilih role: ${playersWithoutRole.map((p) => p.name).join(', ')}`,
      }, { status: 400 });
    }

    // Validate no duplicate roles
    const selectedRoles = players.map((p) => p.selectedRole);
    const uniqueRoles = new Set(selectedRoles);
    if (uniqueRoles.size !== selectedRoles.length) {
      return NextResponse.json({ error: 'Tidak boleh ada role yang sama' }, { status: 400 });
    }

    // Assign roles with stats + set initial cleanMoney
    const roleUpdates = players.map((player) => {
      const roleDef = NORMAL_ROLES.find((r) => r.id === player.selectedRole);
      if (!roleDef) return null;

      return supabaseAdmin
        .from('players')
        .update({
          role: player.selectedRole,
          clean_money: roleDef.baseIncome * 5, // 5x starting capital
          stats: roleDef.stats,
          luck: roleDef.baseLuck,
        })
        .eq('id', player.id);
    });

    await Promise.all(roleUpdates.filter(Boolean));

    // Update room status to playing
    await supabaseAdmin
      .from('rooms')
      .update({
        status: 'playing',
        current_turn: 0,
        turn_order: players.map((p) => p.id),
      })
      .eq('id', roomId);

    return NextResponse.json({
      success: true,
      message: 'Game dimulai!',
    });
  } catch (error) {
    console.error('Start game error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
