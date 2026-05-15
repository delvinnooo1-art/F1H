/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Driver {
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  first_name: string;
  last_name: string;
  headshot_url: string;
  country_code: string;
}

export interface Lap {
  driver_number: number;
  lap_number: number;
  lap_duration: number;
  is_pit_out_lap: boolean;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  i1_speed: number | null;
  i2_speed: number | null;
  st_speed: number | null;
}

export interface Position {
  driver_number: number;
  position: number;
  date: string;
}

export interface Interval {
  driver_number: number;
  interval: number | null;
  gap_to_leader: number | null;
  date: string;
}

export interface RaceControl {
  date: string;
  category: string;
  flag: string | null;
  message: string;
  scope: string | null;
}

export interface Session {
  session_key: number;
  session_name: string;
  session_type: string;
  year: number;
  circuit_key: number;
  circuit_short_name: string;
  country_name: string;
  location: string;
  date_start: string;
  date_end: string;
  gmt_offset: string;
}

export interface Weather {
  date: string;
  air_temperature: number;
  track_temperature: number;
  humidity: number;
  pressure: number;
  rainfall: number;
  wind_direction: number;
  wind_speed: number;
}

export interface Stint {
  driver_number: number;
  stint_number: number;
  compound: string;
  tyre_age_at_start: number;
  lap_start: number;
  lap_end: number | null;
}

export enum FlagStatus {
  GREEN = "GREEN",
  YELLOW = "YELLOW",
  DOUBLE_YELLOW = "DOUBLE YELLOW",
  RED = "RED",
  SAFETY_CAR = "SAFETY CAR",
  VIRTUAL_SAFETY_CAR = "VIRTUAL SAFETY CAR",
  CHEQUERED = "CHEQUERED",
  CLEAR = "CLEAR",
}

export interface LiveTimingState {
  drivers: Record<number, Driver>;
  positions: Record<number, number>;
  intervals: Record<number, Interval>;
  laps: Record<number, Lap[]>;
  stints: Record<number, Stint[]>;
  weather: Weather | null;
  raceControl: RaceControl[];
  session: Session | null;
  lastUpdated: string;
  trackStatus: FlagStatus;
}
