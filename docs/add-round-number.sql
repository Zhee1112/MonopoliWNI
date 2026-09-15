-- Migration: Add round_number to rooms
-- Run this in Supabase SQL Editor BEFORE deploying new code

-- 1. Add round_number column to rooms
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS round_number INTEGER DEFAULT 1;

-- 2. Initialize existing playing rooms to round 1
UPDATE rooms SET round_number = 1 WHERE round_number IS NULL AND status = 'playing';

-- Verify
SELECT id, code, status, round_number FROM rooms WHERE status = 'playing';
