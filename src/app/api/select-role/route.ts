import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { NORMAL_ROLES } from '@/lib/game/role-data';
import { mapPlayerFromDB } from '@/lib/types';

// ============================================================
// SELECT ROLE API
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { roomId, playerId, roleId } = await request.json();

    if (!roomId || !playerId || !roleId) {
      return NextResponse.json({ error: 'roomId, playerId, and roleId are required' }, { status: 400 });
    }

    // Validate role exists
    const validRole = NORMAL_ROLES.find((r) => r.id === roleId);
    if (!validRole) {
      return NextResponse.json({ error: 'Invalid role ID' }, { status: 400 });
    }

    // Check if another player already selected this role in this room
    const { data: existingSelection } = await supabaseAdmin
      .from('players')
      .select('id, name')
      .eq('room_id', roomId)
      .eq('selected_role', roleId)
      .neq('id', playerId)
      .single();

    if (existingSelection) {
      return NextResponse.json({
        error: `Role sudah dipilih oleh ${existingSelection.name}`,
      }, { status: 400 });
    }

    // Update player's selected role
    const { data: dbPlayer, error: updateError } = await supabaseAdmin
      .from('players')
      .update({ selected_role: roleId })
      .eq('id', playerId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to select role' }, { status: 500 });
    }

    const player = mapPlayerFromDB(dbPlayer as Record<string, unknown>);

    return NextResponse.json({
      success: true,
      player,
      selectedRole: roleId,
    });
  } catch (error) {
    console.error('Select role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
