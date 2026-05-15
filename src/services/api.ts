/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Driver, Session, Position, Interval, Lap, Stint, Weather, RaceControl } from "../types.ts";

const BASE_URL = "/api/openf1";

export async function fetchLatestSession(): Promise<Session | null> {
  try {
    const now = new Date();
    const response = await fetch(`${BASE_URL}/sessions`);
    if (!response.ok) return null;
    const sessions = await response.json();
    if (!Array.isArray(sessions)) return null;
    
    // Sort by date desc
    const sorted = sessions.sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime());
    
    // Find a session that is either active now, or the most recently ended one this week
    const currentOrRecent = sorted.find(s => {
      const start = new Date(s.date_start);
      // Give a 5 day window for "current weekend"
      return (now.getTime() - start.getTime()) < (5 * 24 * 60 * 60 * 1000) && start.getTime() <= now.getTime();
    });

    return currentOrRecent || null;
  } catch (error) {
    console.error("Failed to fetch latest session:", error);
    return null;
  }
}

export async function fetchDrivers(sessionKey: number): Promise<Driver[]> {
  try {
    const response = await fetch(`${BASE_URL}/drivers?session_key=${sessionKey}`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch drivers:", error);
    return [];
  }
}

export async function fetchLatestPositions(sessionKey: number): Promise<Position[]> {
  try {
    const response = await fetch(`${BASE_URL}/position?session_key=${sessionKey}`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch positions:", error);
    return [];
  }
}

export async function fetchIntervals(sessionKey: number): Promise<Interval[]> {
  try {
    const response = await fetch(`${BASE_URL}/intervals?session_key=${sessionKey}`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch intervals:", error);
    return [];
  }
}

export async function fetchLatestLaps(sessionKey: number): Promise<Lap[]> {
  try {
    const response = await fetch(`${BASE_URL}/laps?session_key=${sessionKey}`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch laps:", error);
    return [];
  }
}

export async function fetchStints(sessionKey: number): Promise<Stint[]> {
  try {
    const response = await fetch(`${BASE_URL}/stints?session_key=${sessionKey}`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch stints:", error);
    return [];
  }
}

export async function fetchWeather(sessionKey: number): Promise<Weather[]> {
  try {
    const response = await fetch(`${BASE_URL}/weather?session_key=${sessionKey}`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return [];
  }
}

export async function fetchRaceControl(sessionKey: number): Promise<RaceControl[]> {
  try {
    const response = await fetch(`${BASE_URL}/race_control?session_key=${sessionKey}`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch race control:", error);
    return [];
  }
}

export async function fetchNextRace(): Promise<any> {
  try {
    const response = await fetch(`https://api.jolpi.ca/ergast/f1/current/next.json`);
    if (!response.ok) return null;
    const data = await response.json();
    return data?.MRData?.RaceTable?.Races?.[0] || null;
  } catch (error) {
    console.error("Failed to fetch next race:", error);
    return null;
  }
}

export async function fetchDriverStandings(): Promise<any[]> {
  try {
    const response = await fetch(`https://api.jolpi.ca/ergast/f1/current/driverStandings.json`);
    if (!response.ok) return [];
    const data = await response.json();
    return data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
  } catch (error) {
    console.error("Failed to fetch driver standings:", error);
    return [];
  }
}

export async function fetchConstructorStandings(): Promise<any[]> {
  try {
    const response = await fetch(`https://api.jolpi.ca/ergast/f1/current/constructorStandings.json`);
    if (!response.ok) return [];
    const data = await response.json();
    return data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
  } catch (error) {
    console.error("Failed to fetch constructor standings:", error);
    return [];
  }
}
