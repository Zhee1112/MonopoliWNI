-- ============================================================
-- MONOPOLIWNI: GAME SYSTEM FIXES MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add user_id to players table (for auth binding)
ALTER TABLE players ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- 2. Add UNIQUE constraint on rooms.code (prevent duplicate room codes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_room_code'
  ) THEN
    ALTER TABLE rooms ADD CONSTRAINT unique_room_code UNIQUE (code);
  END IF;
END $$;

-- 3. Index for faster active room check per user
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id) WHERE user_id IS NOT NULL;

-- 4. Index for game_log (faster Warta Meja / event queries)
CREATE INDEX IF NOT EXISTS idx_game_log_room_created ON game_log(room_id, created_at DESC);

-- 5. Index for checking active rooms
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
