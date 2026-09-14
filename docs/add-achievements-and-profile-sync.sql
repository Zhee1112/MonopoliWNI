-- ============================================================
-- MONOPOLIWNI: ACHIEVEMENTS + PROFILE SYNC MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add missing columns to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS highest_cash integer DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS properties_owned integer DEFAULT 0;

-- 2. Create player_achievements table
CREATE TABLE IF NOT EXISTS player_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id text NOT NULL,
  xp_granted integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 3. Create game_results table
CREATE TABLE IF NOT EXISTS game_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  placement integer,
  final_clean_money integer DEFAULT 0,
  final_dirty_money integer DEFAULT 0,
  final_properties jsonb DEFAULT '[]'::jsonb,
  final_total_assets integer DEFAULT 0,
  xp_earned integer DEFAULT 0,
  is_winner boolean DEFAULT false,
  game_mode text DEFAULT 'bundir',
  total_rounds integer DEFAULT 20,
  created_at timestamptz DEFAULT now()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_pa_game_room ON player_achievements(game_room_id);
CREATE INDEX IF NOT EXISTS idx_pa_user ON player_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_pa_player ON player_achievements(player_id);
CREATE INDEX IF NOT EXISTS idx_gr_game_room ON game_results(game_room_id);
CREATE INDEX IF NOT EXISTS idx_gr_user ON game_results(user_id);
CREATE INDEX IF NOT EXISTS idx_gr_player ON game_results(player_id);

-- 5. Row Level Security
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to player_achievements" ON player_achievements
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to game_results" ON game_results
  FOR SELECT USING (true);

-- Allow insert/update for authenticated users
CREATE POLICY "Allow authenticated insert to player_achievements" ON player_achievements
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated insert to game_results" ON game_results
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update to player_achievements" ON player_achievements
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated update to game_results" ON game_results
  FOR UPDATE USING (true);

-- 6. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE player_achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE game_results;
