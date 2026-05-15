/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  TRACK_DATABASE, 
  DRIVERS_2026, 
  TEAMS_2026,
  type DriverAsset,
  type TeamAsset,
  type TrackAsset
} from "../constants/f1Data";
export { 
  TRACK_DATABASE, 
  DRIVERS_2026, 
  TEAMS_2026,
  type DriverAsset,
  type TeamAsset,
  type TrackAsset
};


/**
 * F1 2026 Asset Intelligence Manager
 * Ensures strict synchronization between race data and visual era.
 */

export function normalizeTrackId(input: string): string {
  if (!input) return "";
  const normalized = input.toLowerCase();
  
  // Direct mapping overrides to standardized 2026 format
  if (normalized.includes("montreal") || normalized.includes("villeneuve") || normalized.includes("canada")) return "canada_gp_2026";
  if (normalized.includes("monaco") || normalized.includes("monte carlo")) return "monaco_gp_2026";
  if (normalized.includes("silverstone") || normalized.includes("great britain") || normalized.includes("british")) return "silverstone_gp_2026";
  if (normalized.includes("monza") || normalized.includes("italy") || normalized.includes("italian")) return "italian_gp_2026";
  if (normalized.includes("vegas")) return "las_vegas_gp_2026";
  if (normalized.includes("sakhir") || normalized.includes("bahrain")) return "bahrain_gp_2026";
  if (normalized.includes("jeddah") || normalized.includes("saudi")) return "jeddah_gp_2026";
  if (normalized.includes("melbourne") || normalized.includes("albert park") || normalized.includes("australia")) return "australian_gp_2026";
  if (normalized.includes("suzuka") || normalized.includes("japan")) return "japanese_gp_2026";
  if (normalized.includes("shanghai") || normalized.includes("china")) return "chinese_gp_2026";
  if (normalized.includes("miami")) return "miami_gp_2026";
  if (normalized.includes("imola") || normalized.includes("emilia")) return "emilia_romagna_gp_2026";
  if (normalized.includes("barcelona") || normalized.includes("spain") || normalized.includes("catalunya")) return "spanish_gp_2026";
  if (normalized.includes("spielberg") || normalized.includes("austria") || normalized.includes("red bull ring")) return "austrian_gp_2026";
  if (normalized.includes("hungaroring") || normalized.includes("hungary")) return "hungarian_gp_2026";
  if (normalized.includes("spa") || normalized.includes("belgium")) return "belgian_gp_2026";
  if (normalized.includes("zandvoort") || normalized.includes("netherlands") || normalized.includes("dutch")) return "dutch_gp_2026";
  if (normalized.includes("baku") || normalized.includes("azerbaijan")) return "azerbaijan_gp_2026";
  if (normalized.includes("marina bay") || normalized.includes("singapore")) return "singapore_gp_2026";
  if (normalized.includes("austin") || normalized.includes("cota") || normalized.includes("united states")) return "united_states_gp_2026";
  if (normalized.includes("mexico") || normalized.includes("rodriguez")) return "mexico_city_gp_2026";
  if (normalized.includes("interlagos") || normalized.includes("brazil") || normalized.includes("sao paulo")) return "sao_paulo_gp_2026";
  if (normalized.includes("lusail") || normalized.includes("qatar")) return "qatar_gp_2026";
  if (normalized.includes("yas marina") || normalized.includes("abu dhabi")) return "abu_dhabi_gp_2026";

  return "";
}

export function normalizeDriverId(input: string): string {
  if (!input) return "";
  const normalized = input.toLowerCase();
  
  const match = Object.values(DRIVERS_2026).find(d => 
    d.id === normalized || 
    d.lastName.toLowerCase() === normalized ||
    d.firstName.toLowerCase() === normalized ||
    `${d.firstName} ${d.lastName}`.toLowerCase() === normalized ||
    d.id.includes(normalized)
  );

  return match ? match.id : "";
}

export function normalizeTeamId(input: string): string {
  if (!input) return "";
  const normalized = input.toUpperCase();
  
  const match = Object.keys(TEAMS_2026).find(key => 
    key === normalized || 
    TEAMS_2026[key].name.toUpperCase().includes(normalized) ||
    TEAMS_2026[key].id.toUpperCase() === normalized
  );

  return match ? TEAMS_2026[match].id : "";
}

import { getImage } from "./imageSourceSystem";

export function getTrackMapUrl(circuitInput: string): string {
  const id = normalizeTrackId(circuitInput);
  return getImage('map', id);
}

export function getFeatureImage(category: string, circuitId?: string): string {
  // 1. Target track lookup if provided
  if (circuitId) {
    const id = normalizeTrackId(circuitId);
    return getImage('hero', id);
  }

  // 2. TECHNICAL Visuals from Whitelist (Using Master Placeholder logic as defined)
  if (category === "Active Aero" || category === "Aero") return getImage('hero', 'monaco_gp_2026'); // Example specific fallback or generic
  if (category === "Power Unit") return getImage('hero', 'silverstone_gp_2026');
  
  // 3. High quality fallback
  return "/placeholders/global_fallback.jpg";
}
