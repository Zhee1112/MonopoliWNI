-- Add last_activity_at column to rooms table for idle auto-dissolve
-- Run this in Supabase SQL Editor

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now();

-- Set initial value for existing rooms
UPDATE rooms SET last_activity_at = created_at WHERE last_activity_at IS NULL;

-- Index for faster auto-dissolve queries
CREATE INDEX IF NOT EXISTS idx_rooms_idle_check ON rooms (status, last_activity_at) WHERE status = 'waiting';
