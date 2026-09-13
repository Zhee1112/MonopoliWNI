-- Add selected_role and is_ready columns to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS selected_role TEXT DEFAULT NULL;
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_ready BOOLEAN DEFAULT FALSE;

-- Allow role column to be NULL (was DEFAULT 'magang')
ALTER TABLE players ALTER COLUMN role DROP DEFAULT;
ALTER TABLE players ALTER COLUMN role TYPE TEXT USING role::TEXT;
