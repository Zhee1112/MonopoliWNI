import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { NORMAL_ROLES } from '@/lib/game/role-data';
import { mapPlayerFromDB } from '@/lib/types';

const BOT_NAMES = [
  'Bot_Rahmat', 'Bot_Dewi', 'Bot_Budi', 'Bot_Siti',
  'Bot_Andi', 'Bot_Wati', 'Bot_Joko', 'Bot_Lina',
  'Bot_Agus', 'Bot_Maya', 'Bot_Dodi', 'Bot_Nina',
];

const TOKEN_COLORS = [
  '#ef4444', '#22c55e', '#eab308', '#a855f7',
  '#ec4899', '#06b6d4', '#f97316', '#94a3b8',
];

// ============================================================
// ADD BOT API - Host only, adds a bot player
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { roomId, hostId } = await request.json();

    if (!roomId || !hostId) {
      return NextResponse.json({ error: 'roomId and hostId are required' }, { status: 400 });
    }

    // Verify room exists and requester is host
    const { data: dbRoom, error: roomError } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !dbRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if ((dbRoom as Record<string, unknown>).host_id !== hostId) {
      return NextResponse.json({ error: 'Only the host can add bots' }, { status: 403 });
    }

    if ((dbRoom as Record<string, unknown>).status !== 'waiting') {
      return NextResponse.json({ error: 'Cannot add bots after game started' }, { status: 400 });
    }

    // Count current players
    const { count } = await supabaseAdmin
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId);

    if (count && count >= 8) {
      return NextResponse.json({ error: 'Room is full (max 8 players)' }, { status: 400 });
    }

    // Get existing selected roles
    const { data: existingPlayers } = await supabaseAdmin
      .from('players')
      .select('selected_role, name')
      .eq('room_id', roomId);

    const takenRoles = new Set((existingPlayers || []).map((p) => (p as Record<string, unknown>).selected_role).filter(Boolean));
    const takenNames = new Set((existingPlayers || []).map((p) => (p as Record<string, unknown>).name));

    // Find available bot name
    const availableName = BOT_NAMES.find((n) => !takenNames.has(n)) || `Bot_${Date.now()}`;

    // Find available role
    const availableRole = NORMAL_ROLES.find((r) => !takenRoles.has(r.id));
    if (!availableRole) {
      return NextResponse.json({ error: 'Semua role sudah dipilih' }, { status: 400 });
    }

    // Pick token color
    const colorIndex = count || 0;

    // Create bot player
    const { data: dbPlayer, error: playerError } = await supabaseAdmin
      .from('players')
      .insert({
        room_id: roomId,
        name: availableName,
        token_color: TOKEN_COLORS[colorIndex] || '#94a3b8',
        role: null,
        selected_role: availableRole.id,
        is_ready: true,
        is_bot: true,
      })
      .select()
      .single();

    if (playerError) {
      return NextResponse.json({ error: 'Failed to add bot' }, { status: 500 });
    }

    const player = mapPlayerFromDB(dbPlayer as Record<string, unknown>);

    // Update room turn_order
    const turnOrder = [...(dbRoom as Record<string, unknown>).turn_order as string[] || [], player.id];
    await supabaseAdmin
      .from('rooms')
      .update({ turn_order: turnOrder })
      .eq('id', roomId);

    return NextResponse.json({
      success: true,
      player,
      turnOrder,
    });
  } catch (error) {
    console.error('Add bot error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
