/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type TireCompound = "SOFT" | "MEDIUM" | "HARD" | "INTERMEDIATE" | "WET";
export type RacePhase = "FP" | "QUALI" | "RACE";

export interface DriverTelemetry {
  id?: string;
  session_key: number;
  driver_id: string;
  driver_number: number;
  team: string;
  lap_number: number;
  lap_time: number;
  sector_1: number;
  sector_2: number;
  sector_3: number;
  top_speed: number;
  tire_compound: TireCompound;
  fuel_load: number;
  degradation_rate: number;
  consistency_score: number;
  race_phase: RacePhase;
  position: number;
  gap_to_leader: number;
  is_personal_best: boolean;
  is_overall_fastest: boolean;
  pit_stop_lap: boolean;
  ers_deploy_pct: number;
  brake_balance: number;
  wing_angle: string;
}

export interface GridPosition {
  session_key: number;
  driver_number: number;
  driver_id: string;
  lap_number: number;
  position: number;
  position_change: number;
  gap_to_leader: number;
  interval_to_ahead: number;
  pit_stop_count: number;
  tire_compound: TireCompound;
  tire_age: number;
  is_undercut: boolean;
  is_overcut: boolean;
}

export interface BattleEvent {
  session_key: number;
  lap_number: number;
  attacker_number: number;
  defender_number: number;
  gap_seconds: number;
  event_type: string;
  overtake_completed: boolean;
  drs_active: boolean;
}

export interface MediaAsset {
  entity_type: "driver" | "team" | "circuit" | "technical";
  entity_id: string;
  asset_type: string;
  cdn_url: string;
  original_source?: string;
  file_format?: string;
  ingestion_status: "pending" | "processing" | "completed" | "failed";
}
