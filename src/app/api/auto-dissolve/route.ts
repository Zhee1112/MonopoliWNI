import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

const IDLE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

export async function POST() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const cutoff = new Date(Date.now() - IDLE_TIMEOUT_MS).toISOString();

    // Find all waiting rooms that have been idle for >2 minutes
    const { data: staleRooms } = await supabaseAdmin
      .from('rooms')
      .select('id, code')
      .eq('status', 'waiting')
      .lt('last_activity_at', cutoff);

    if (!staleRooms || staleRooms.length === 0) {
      return NextResponse.json({ dissolved: 0 });
    }

    let dissolvedCount = 0;
    for (const room of staleRooms) {
      // Remove all players from this room
      await supabaseAdmin.from('players').delete().eq('room_id', room.id);
      // Delete properties
      await supabaseAdmin.from('properties').delete().eq('room_id', room.id);
      // Delete the room
      await supabaseAdmin.from('rooms').delete().eq('id', room.id);
      dissolvedCount++;
    }

    return NextResponse.json({ dissolved: dissolvedCount });
  } catch (error) {
    console.error('Auto-dissolve error:', error);
    return NextResponse.json({ dissolved: 0 });
  }
}
