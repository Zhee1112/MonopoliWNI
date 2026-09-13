-- ============================================================
-- ADD GAME MODE COLUMNS TO ROOMS TABLE
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add game_mode column (bundir, sultan, kilat)
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS game_mode TEXT DEFAULT 'bundir';

-- Add total_rounds column
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS total_rounds INTEGER DEFAULT 20;

-- Add winner_id column for game end
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS winner_id TEXT DEFAULT NULL;
