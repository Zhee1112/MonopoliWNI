-- ============================================================
-- MONOPOLIWNI DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  host_id TEXT NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  current_turn INTEGER DEFAULT 0,
  turn_order UUID[] DEFAULT '{}',
  pot_money INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  clean_money INTEGER DEFAULT 1500000,
  dirty_money INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  properties UUID[] DEFAULT '{}',
  role TEXT DEFAULT 'magang',
  role_level INTEGER DEFAULT 1,
  luck INTEGER DEFAULT 50,
  permanent_luck_modifiers JSONB DEFAULT '[]',
  stats JSONB DEFAULT '{"negotiation": 5, "investigation": 3, "persuasion": 5, "streetSmart": 3, "charm": 5}',
  evidence JSONB DEFAULT '[]',
  status_effects JSONB DEFAULT '[]',
  is_bankrupt BOOLEAN DEFAULT FALSE,
  is_connected BOOLEAN DEFAULT TRUE,
  token_color TEXT DEFAULT '#3b82f6',
  dirty_history JSONB DEFAULT '[]',
  meme_role_buff TEXT DEFAULT NULL,
  meme_role_active BOOLEAN DEFAULT FALSE,
  is_bot BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  board_index INTEGER NOT NULL,
  owner_id UUID REFERENCES players(id) ON DELETE SET NULL,
  house_level INTEGER DEFAULT 0,
  is_mortgaged BOOLEAN DEFAULT FALSE
);

-- Game log table
CREATE TABLE IF NOT EXISTS game_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  detail JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_players_room_id ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_properties_room_id ON properties(room_id);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_game_log_room_id ON game_log(room_id);
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);

-- ============================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE properties;
ALTER PUBLICATION supabase_realtime ADD TABLE game_log;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_log ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for game rooms)
CREATE POLICY "Allow public read access to rooms" ON rooms
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to players" ON players
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to properties" ON properties
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to game_log" ON game_log
  FOR SELECT USING (true);

-- Allow insert/update for authenticated users
CREATE POLICY "Allow authenticated insert to rooms" ON rooms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated insert to players" ON players
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated insert to properties" ON properties
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated insert to game_log" ON game_log
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update to rooms" ON rooms
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated update to players" ON players
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated update to properties" ON properties
  FOR UPDATE USING (true);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function to generate room code
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to create a new room
CREATE OR REPLACE FUNCTION create_room(host_player_name TEXT)
RETURNS JSON AS $$
DECLARE
  new_room rooms%ROWTYPE;
  new_player players%ROWTYPE;
  room_code TEXT;
BEGIN
  -- Generate unique room code
  LOOP
    room_code := generate_room_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM rooms WHERE code = room_code);
  END LOOP;

  -- Create room
  INSERT INTO rooms (code, host_id, status)
  VALUES (room_code, '', 'waiting')
  RETURNING * INTO new_room;

  -- Create host player
  INSERT INTO players (room_id, name, token_color)
  VALUES (new_room.id, host_player_name, '#3b82f6')
  RETURNING * INTO new_player;

  -- Update room host_id
  UPDATE rooms SET host_id = new_player.id WHERE id = new_room.id;

  -- Create all properties for this room
  INSERT INTO properties (room_id, board_index)
  SELECT new_room.id, generate_series(0, 39);

  RETURN json_build_object(
    'room', row_to_json(new_room),
    'player', row_to_json(new_player)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to join a room
CREATE OR REPLACE FUNCTION join_room(room_code TEXT, player_name TEXT)
RETURNS JSON AS $$
DECLARE
  target_room rooms%ROWTYPE;
  new_player players%ROWTYPE;
  player_count INTEGER;
  token_colors TEXT[] := ARRAY['#ef4444', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#06b6d4', '#f97316', '#6b7280'];
  color_index INTEGER;
BEGIN
  -- Find room
  SELECT * INTO target_room FROM rooms WHERE code = room_code AND status = 'waiting';

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Room not found or already started');
  END IF;

  -- Count players
  SELECT COUNT(*) INTO player_count FROM players WHERE room_id = target_room.id;

  IF player_count >= 8 THEN
    RETURN json_build_object('error', 'Room is full (max 8 players)');
  END IF;

  -- Get next color
  color_index := player_count + 1;

  -- Create player
  INSERT INTO players (room_id, name, token_color)
  VALUES (target_room.id, player_name, token_colors[color_index])
  RETURNING * INTO new_player;

  RETURN json_build_object(
    'room', row_to_json(target_room),
    'player', row_to_json(new_player)
  );
END;
$$ LANGUAGE plpgsql;
