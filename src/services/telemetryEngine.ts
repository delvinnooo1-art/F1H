/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DRIVERS_2026, TEAMS_2026 } from "../constants/f1Data";
import type { TireCompound, RacePhase, DriverTelemetry } from "./supabase";

// Circuit telemetry profiles: sector split ratios + base times
const CIRCUIT_PROFILES: Record<string, { baseLap: number; s1: number; s2: number; s3: number; topSpeed: number }> = {
  monaco:        { baseLap: 74.0, s1: 0.23, s2: 0.42, s3: 0.35, topSpeed: 280 },
  silverstone:   { baseLap: 87.5, s1: 0.28, s2: 0.38, s3: 0.34, topSpeed: 320 },
  monza:         { baseLap: 78.2, s1: 0.27, s2: 0.38, s3: 0.35, topSpeed: 358 },
  bahrain:       { baseLap: 91.5, s1: 0.31, s2: 0.36, s3: 0.33, topSpeed: 328 },
  canada:        { baseLap: 70.8, s1: 0.30, s2: 0.40, s3: 0.30, topSpeed: 332 },
  default:       { baseLap: 88.0, s1: 0.30, s2: 0.38, s3: 0.32, topSpeed: 318 },
};

// Team performance coefficients (relative lap time delta in seconds)
const TEAM_COEFFICIENTS: Record<string, number> = {
  "RED BULL":    -0.35,
  "FERRARI":     -0.28,
  "MCLAREN":     -0.25,
  "MERCEDES":    -0.18,
  "ASTON MARTIN": 0.12,
  "ALPINE":       0.38,
  "WILLIAMS":     0.42,
  "RB":           0.55,
  "HAAS":         0.68,
  "SAUBER":       0.82,
};

// Driver talent coefficients (relative to team baseline)
const DRIVER_TALENT: Record<string, number> = {
  "1": -0.22,  // Verstappen
  "16": -0.18, // Leclerc
  "44": -0.20, // Hamilton
  "4": -0.17,  // Norris
  "81": -0.15, // Piastri
  "63": -0.14, // Russell
  "14": -0.12, // Alonso
  "55": -0.10, // Sainz
  "12": -0.08, // Antonelli
  "87": -0.06, // Bearman
  "10": -0.05, // Gasly
  "30": -0.04, // Lawson
  "43": -0.03, // Colapinto
  "22": -0.07, // Tsunoda
  "23": -0.08, // Albon
  "18": -0.09, // Stroll
  "11": -0.11, // Perez
  "31": -0.04, // Ocon
  "27": -0.06, // Hulkenberg
  "20": -0.03, // Magnussen
  "5": -0.04,  // Doohan
  "98": -0.02, // Lindblad
  "99": -0.01, // Hadjar
};

// Tyre degradation profiles per compound
const TYRE_DEGRADATION: Record<TireCompound, { deg: number; optimal: number }> = {
  SOFT:         { deg: 0.080, optimal: 6 },
  MEDIUM:       { deg: 0.045, optimal: 15 },
  HARD:         { deg: 0.022, optimal: 30 },
  INTERMEDIATE: { deg: 0.035, optimal: 20 },
  WET:          { deg: 0.028, optimal: 25 },
};

// Fuel correction per lap (lighter car = faster)
const FUEL_DELTA_PER_KG = 0.032; // ~0.032s per kg
const FUEL_BURN_PER_LAP = 1.8;   // kg per lap

export interface GenerationOptions {
  totalLaps?: number;
  circuit?: string;
  phase?: RacePhase;
  compound?: TireCompound;
  sessionKey?: number;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function gaussianNoise(rand: () => number, mean = 0, std = 1): number {
  const u1 = rand();
  const u2 = rand();
  return mean + std * Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
}

export function generateDriverTelemetry(
  driverNumber: number,
  opts: GenerationOptions = {}
): DriverTelemetry[] {
  const {
    totalLaps = 57,
    circuit = "default",
    phase = "RACE",
    sessionKey = 9999,
  } = opts;

  const driverAsset = DRIVERS_2026[driverNumber.toString()];
  if (!driverAsset) return [];

  const profile = CIRCUIT_PROFILES[circuit] ?? CIRCUIT_PROFILES.default;
  const teamDelta = TEAM_COEFFICIENTS[driverAsset.team] ?? 0.5;
  const talentDelta = DRIVER_TALENT[driverNumber.toString()] ?? 0;
  const baseTime = profile.baseLap + teamDelta + talentDelta;

  const rand = seededRandom(driverNumber * 7919 + sessionKey * 31);

  let currentCompound: TireCompound = opts.compound ?? (rand() > 0.5 ? "MEDIUM" : "HARD");
  let tyreAge = 0;
  let pitStops = 0;
  let fuelLoad = 105 + rand() * 5;
  let position = Math.floor(rand() * 15) + 1;

  const laps: DriverTelemetry[] = [];

  for (let lap = 1; lap <= totalLaps; lap++) {
    // Pit stop simulation
    let isPitLap = false;
    if (phase === "RACE") {
      const pitWindow = totalLaps * 0.45;
      if (pitStops === 0 && lap > pitWindow && rand() > 0.92) {
        isPitLap = true;
        pitStops++;
        currentCompound = rand() > 0.5 ? "SOFT" : "HARD";
        tyreAge = 0;
      }
    }

    const tyreProfile = TYRE_DEGRADATION[currentCompound];
    const tyreEffect = tyreAge * tyreProfile.deg;

    // Fuel correction (cars get lighter each lap)
    const fuelCorrection = (fuelLoad - 100) * FUEL_DELTA_PER_KG;
    fuelLoad = Math.max(5, fuelLoad - FUEL_BURN_PER_LAP);

    // Lap time
    const rawLap = baseTime + tyreEffect + fuelCorrection + gaussianNoise(rand, 0, 0.12);
    const lapTime = isPitLap ? rawLap + 24 + rand() * 2 : Math.max(baseTime * 0.97, rawLap);

    // Sector times
    const s1 = lapTime * profile.s1 + gaussianNoise(rand, 0, 0.05);
    const s2 = lapTime * profile.s2 + gaussianNoise(rand, 0, 0.07);
    const s3 = lapTime - s1 - s2;

    // Speed
    const topSpeed = profile.topSpeed + gaussianNoise(rand, 0, 4);

    // ERS
    const ersDeployPct = phase === "QUALI" ? 95 + rand() * 5 : 60 + rand() * 35;

    // Degradation rate (percentage per lap)
    const degRate = tyreProfile.deg * (1 + gaussianNoise(rand, 0, 0.1));

    // Consistency score (0–100, higher = more consistent)
    const consistency = Math.max(50, Math.min(100, 85 + talentDelta * 20 + gaussianNoise(rand, 0, 3)));

    // Position drift
    if (lap % 5 === 0 && !isPitLap) {
      position = Math.max(1, Math.min(20, position + Math.round(gaussianNoise(rand, 0, 0.6))));
    }
    if (isPitLap) position = Math.min(20, position + 3 + Math.floor(rand() * 3));

    const gapToLeader = Math.max(0, (position - 1) * 1.8 + gaussianNoise(rand, 0, 0.3));

    laps.push({
      session_key: sessionKey,
      driver_id: driverAsset.id,
      driver_number: driverNumber,
      team: driverAsset.team,
      lap_number: lap,
      lap_time: Math.round(lapTime * 1000) / 1000,
      sector_1: Math.round(Math.abs(s1) * 1000) / 1000,
      sector_2: Math.round(Math.abs(s2) * 1000) / 1000,
      sector_3: Math.round(Math.abs(s3) * 1000) / 1000,
      top_speed: Math.round(topSpeed * 10) / 10,
      tire_compound: currentCompound,
      fuel_load: Math.round(fuelLoad * 10) / 10,
      degradation_rate: Math.round(degRate * 1000) / 1000,
      consistency_score: Math.round(consistency * 100) / 100,
      race_phase: phase,
      position,
      gap_to_leader: Math.round(gapToLeader * 1000) / 1000,
      is_personal_best: false,
      is_overall_fastest: false,
      pit_stop_lap: isPitLap,
      ers_deploy_pct: Math.round(ersDeployPct * 100) / 100,
      brake_balance: 50 + gaussianNoise(rand, 0, 1.5),
      wing_angle: currentCompound === "SOFT" ? "HIGH" : currentCompound === "HARD" ? "LOW" : "MEDIUM",
    });

    tyreAge++;
  }

  // Mark personal bests
  let pbTime = Infinity;
  for (const lap of laps) {
    if (!lap.pit_stop_lap && lap.lap_time < pbTime) {
      pbTime = lap.lap_time;
      lap.is_personal_best = true;
    }
  }

  return laps;
}

export function generateGridTelemetry(
  driverNumbers: number[],
  opts: GenerationOptions = {}
): Record<number, DriverTelemetry[]> {
  const result: Record<number, DriverTelemetry[]> = {};
  const allLaps = driverNumbers.map(n => ({ n, laps: generateDriverTelemetry(n, opts) }));

  // Mark overall fastest lap
  let fastestTime = Infinity;
  let fastestEntry: { dNum: number; lapIdx: number } | null = null;
  for (const { n, laps } of allLaps) {
    laps.forEach((lap, i) => {
      if (!lap.pit_stop_lap && lap.lap_time < fastestTime) {
        fastestTime = lap.lap_time;
        fastestEntry = { dNum: n, lapIdx: i };
      }
    });
  }
  if (fastestEntry) {
    allLaps.find(d => d.n === fastestEntry!.dNum)!.laps[fastestEntry.lapIdx].is_overall_fastest = true;
  }

  for (const { n, laps } of allLaps) {
    result[n] = laps;
  }

  return result;
}

export interface ComparisonResult {
  driver1: number;
  driver2: number;
  lapDeltas: Array<{ lap: number; delta: number; cumDelta: number }>;
  sectorDeltas: Array<{ lap: number; s1Delta: number; s2Delta: number; s3Delta: number }>;
  avgLapDelta: number;
  bestLapDelta: number;
  consistencyDiff: number;
  topSpeedDiff: number;
  tyreAdvantage: number | null;
}

export function compareDrivers(
  d1Laps: DriverTelemetry[],
  d2Laps: DriverTelemetry[]
): ComparisonResult {
  const maxLap = Math.min(d1Laps.length, d2Laps.length);
  const lapDeltas: ComparisonResult["lapDeltas"] = [];
  const sectorDeltas: ComparisonResult["sectorDeltas"] = [];
  let cumDelta = 0;

  for (let i = 0; i < maxLap; i++) {
    const l1 = d1Laps[i];
    const l2 = d2Laps[i];
    if (!l1 || !l2) continue;
    if (l1.pit_stop_lap || l2.pit_stop_lap) continue;

    const delta = l1.lap_time - l2.lap_time;
    cumDelta += delta;
    lapDeltas.push({ lap: l1.lap_number, delta: Math.round(delta * 1000) / 1000, cumDelta: Math.round(cumDelta * 1000) / 1000 });

    sectorDeltas.push({
      lap: l1.lap_number,
      s1Delta: Math.round((l1.sector_1 - l2.sector_1) * 1000) / 1000,
      s2Delta: Math.round((l1.sector_2 - l2.sector_2) * 1000) / 1000,
      s3Delta: Math.round((l1.sector_3 - l2.sector_3) * 1000) / 1000,
    });
  }

  const validDeltas = lapDeltas.map(d => d.delta);
  const avgLapDelta = validDeltas.length > 0
    ? Math.round((validDeltas.reduce((a, b) => a + b, 0) / validDeltas.length) * 1000) / 1000
    : 0;

  const bestD1 = Math.min(...d1Laps.filter(l => !l.pit_stop_lap).map(l => l.lap_time));
  const bestD2 = Math.min(...d2Laps.filter(l => !l.pit_stop_lap).map(l => l.lap_time));
  const bestLapDelta = Math.round((bestD1 - bestD2) * 1000) / 1000;

  const avgCons1 = d1Laps.reduce((a, b) => a + b.consistency_score, 0) / d1Laps.length;
  const avgCons2 = d2Laps.reduce((a, b) => a + b.consistency_score, 0) / d2Laps.length;

  const avgSpeed1 = d1Laps.reduce((a, b) => a + b.top_speed, 0) / d1Laps.length;
  const avgSpeed2 = d2Laps.reduce((a, b) => a + b.top_speed, 0) / d2Laps.length;

  // Tyre advantage in seconds per lap (negative = d1 advantages)
  const avgDeg1 = d1Laps.reduce((a, b) => a + b.degradation_rate, 0) / d1Laps.length;
  const avgDeg2 = d2Laps.reduce((a, b) => a + b.degradation_rate, 0) / d2Laps.length;

  return {
    driver1: d1Laps[0]?.driver_number ?? 0,
    driver2: d2Laps[0]?.driver_number ?? 0,
    lapDeltas,
    sectorDeltas,
    avgLapDelta,
    bestLapDelta,
    consistencyDiff: Math.round((avgCons1 - avgCons2) * 100) / 100,
    topSpeedDiff: Math.round((avgSpeed1 - avgSpeed2) * 10) / 10,
    tyreAdvantage: Math.round((avgDeg2 - avgDeg1) * 1000) / 1000,
  };
}

export function formatLapTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "--:--.---";
  const mins = Math.floor(seconds / 60);
  const secs = seconds - mins * 60;
  return `${mins}:${secs.toFixed(3).padStart(6, "0")}`;
}

export function getLapTimeDeltaColor(delta: number): string {
  if (Math.abs(delta) < 0.05) return "#FFFB00"; // yellow - very close
  return delta < 0 ? "#00D2BE" : "#E10600"; // green if faster, red if slower
}

export type CompoundColor = { border: string; text: string; bg: string };
export function getTyreColors(compound: TireCompound): CompoundColor {
  switch (compound) {
    case "SOFT":         return { border: "#E10600", text: "#E10600", bg: "rgba(225,6,0,0.1)" };
    case "MEDIUM":       return { border: "#FFFB00", text: "#FFFB00", bg: "rgba(255,251,0,0.1)" };
    case "HARD":         return { border: "#FFFFFF", text: "#FFFFFF", bg: "rgba(255,255,255,0.1)" };
    case "INTERMEDIATE": return { border: "#00D2BE", text: "#00D2BE", bg: "rgba(0,210,190,0.1)" };
    case "WET":          return { border: "#3671C6", text: "#3671C6", bg: "rgba(54,113,198,0.1)" };
  }
}
