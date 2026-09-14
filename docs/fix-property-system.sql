-- ============================================================
-- MONOPOLIWNI: PROPERTY SYSTEM MIGRATION
-- Run this in Supabase SQL Editor AFTER fix-game-system.sql
-- ============================================================

-- 1. Fix properties column: UUID[] → TEXT[] (stores property names)
DO $$
BEGIN
  -- Only convert if currently UUID[]
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'properties'
    AND udt_name = '_uuid'
  ) THEN
    ALTER TABLE players ALTER COLUMN properties TYPE TEXT[] USING properties::TEXT[];
  END IF;
END $$;

-- 2. Add is_landmark to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_landmark BOOLEAN DEFAULT FALSE;

-- 3. Add building_level column (ensure it exists, default 0)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS house_level INTEGER DEFAULT 0;
