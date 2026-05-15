/*
  # F1 Advanced Telemetry System Schema

  ## Overview
  Core database for the Race Hub 2026 telemetry, driver comparison, and media ingestion pipeline.

  ## New Tables

  ### 1. `f1_sessions`
  - Stores session metadata (FP, Qualifying, Race)
  - Links to circuit and year data

  ### 2. `f1_driver_telemetry`
  - Full telemetry data per driver per lap
  - Includes sector times, speed, tire compound, fuel load, degradation
  - Core of the comparison engine

  ### 3. `f1_media_assets`
  - CDN asset registry for driver/team/circuit images
  - Tracks ingestion status and CDN URL

  ### 4. `f1_grid_positions`
  - Per-lap grid position snapshots for full grid simulation
  - Supports dynamic position changes, undercut/overcut

  ### 5. `f1_battle_events`
  - Recorded battle/overtake events between drivers
  - Used for visualization of on-track duels

  ## Security
  - RLS enabled on all tables
  - Public read access for telemetry/sessions/media
  - No write access from client (data loaded via server/migration)
*/

-- Sessions table
CREATE TABLE IF NOT EXISTS f1_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key integer UNIQUE,
  session_name text NOT NULL DEFAULT '',
  session_type text NOT NULL DEFAULT 'Race',
  year integer NOT NULL DEFAULT 2026,
  circuit_id text NOT NULL DEFAULT '',
  circuit_short_name text NOT NULL DEFAULT '',
  country_name text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  date_start timestamptz NOT NULL DEFAULT now(),
  date_end timestamptz,
  gmt_offset text DEFAULT '0',
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE f1_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "f1_sessions public read"
  ON f1_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Driver telemetry table
CREATE TABLE IF NOT EXISTS f1_driver_telemetry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key integer NOT NULL,
  driver_id text NOT NULL,
  driver_number integer NOT NULL,
  team text NOT NULL DEFAULT '',
  lap_number integer NOT NULL DEFAULT 1,
  lap_time numeric(10,3),
  sector_1 numeric(10,3),
  sector_2 numeric(10,3),
  sector_3 numeric(10,3),
  top_speed numeric(6,1) DEFAULT 0,
  tire_compound text DEFAULT 'MEDIUM',
  fuel_load numeric(5,1) DEFAULT 100,
  degradation_rate numeric(5,3) DEFAULT 0,
  consistency_score numeric(5,2) DEFAULT 0,
  race_phase text DEFAULT 'RACE',
  position integer,
  gap_to_leader numeric(10,3),
  is_personal_best boolean DEFAULT false,
  is_overall_fastest boolean DEFAULT false,
  pit_stop_lap boolean DEFAULT false,
  ers_deploy_pct numeric(5,2) DEFAULT 0,
  brake_balance numeric(5,2) DEFAULT 50,
  wing_angle text DEFAULT 'MEDIUM',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_compound CHECK (tire_compound IN ('SOFT','MEDIUM','HARD','INTERMEDIATE','WET'))
);

CREATE INDEX IF NOT EXISTS idx_telemetry_session ON f1_driver_telemetry(session_key);
CREATE INDEX IF NOT EXISTS idx_telemetry_driver ON f1_driver_telemetry(driver_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_lap ON f1_driver_telemetry(session_key, driver_number, lap_number);

ALTER TABLE f1_driver_telemetry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "f1_telemetry public read"
  ON f1_driver_telemetry FOR SELECT
  TO anon, authenticated
  USING (true);

-- Media assets table (CDN registry)
CREATE TABLE IF NOT EXISTS f1_media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL DEFAULT 'driver',
  entity_id text NOT NULL,
  asset_type text NOT NULL DEFAULT 'portrait',
  cdn_url text NOT NULL DEFAULT '',
  original_source text,
  file_format text DEFAULT 'jpg',
  width integer,
  height integer,
  ingestion_status text DEFAULT 'pending',
  ingested_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_entity_type CHECK (entity_type IN ('driver','team','circuit','technical')),
  CONSTRAINT valid_asset_type CHECK (asset_type IN ('portrait','suit','helmet','logo','car','hero','map','night','technical')),
  CONSTRAINT valid_ingestion_status CHECK (ingestion_status IN ('pending','processing','completed','failed'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_media_entity_type ON f1_media_assets(entity_id, asset_type);
CREATE INDEX IF NOT EXISTS idx_media_entity ON f1_media_assets(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_media_status ON f1_media_assets(ingestion_status);

ALTER TABLE f1_media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "f1_media public read"
  ON f1_media_assets FOR SELECT
  TO anon, authenticated
  USING (true);

-- Grid positions table
CREATE TABLE IF NOT EXISTS f1_grid_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key integer NOT NULL,
  driver_number integer NOT NULL,
  driver_id text NOT NULL,
  lap_number integer NOT NULL DEFAULT 0,
  position integer NOT NULL DEFAULT 1,
  position_change integer DEFAULT 0,
  gap_to_leader numeric(10,3),
  interval_to_ahead numeric(10,3),
  pit_stop_count integer DEFAULT 0,
  tire_compound text DEFAULT 'MEDIUM',
  tire_age integer DEFAULT 0,
  is_undercut boolean DEFAULT false,
  is_overcut boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grid_session ON f1_grid_positions(session_key, lap_number);
CREATE INDEX IF NOT EXISTS idx_grid_driver ON f1_grid_positions(session_key, driver_number);

ALTER TABLE f1_grid_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "f1_grid public read"
  ON f1_grid_positions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Battle events table
CREATE TABLE IF NOT EXISTS f1_battle_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key integer NOT NULL,
  lap_number integer NOT NULL,
  attacker_number integer NOT NULL,
  defender_number integer NOT NULL,
  gap_seconds numeric(6,3) NOT NULL DEFAULT 0,
  event_type text DEFAULT 'close_following',
  overtake_completed boolean DEFAULT false,
  drs_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_event_type CHECK (event_type IN ('close_following','overtake_attempt','overtake_completed','defensive_move','position_swap'))
);

CREATE INDEX IF NOT EXISTS idx_battle_session ON f1_battle_events(session_key);

ALTER TABLE f1_battle_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "f1_battles public read"
  ON f1_battle_events FOR SELECT
  TO anon, authenticated
  USING (true);
