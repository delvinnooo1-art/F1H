/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { normalizeTrackId, normalizeDriverId, normalizeTeamId } from "./assetManager";
import { resolveWhitelistedImage } from "./imageSourceSystem";

/**
 * RACE HUB 2026 Synchronization & Validation Engine
 * Ensures 100% professional immersion by preventing random or mismatched images.
 * Uses a CLOSED DATABASE architecture.
 */

export type AssetCategory = "TECHNICAL" | "RACE_ANALYSIS" | "DRIVER_NEWS" | "TRACK_PREVIEW" | "ATMOSPHERE" | "TELEMETRY";

export interface ImageValidationContext {
  trackId?: string;
  driverId?: string;
  teamId?: string;
  category?: AssetCategory;
  sessionType?: string;
  tags?: string[];
}

/**
 * Validates and returns the perfect image URL based on context.
 * This is the ONLY bridge between UI components and race visuals.
 * No internet search is performed; only whitelist lookups.
 */
export function getValidatedImageUrl(context: ImageValidationContext): string {
  const { trackId: rawTrackId, driverId: rawDriverId, teamId: rawTeamId, category = "ATMOSPHERE" } = context;

  // 1. ID NORMALIZATION LAYER
  const trackId = normalizeTrackId(rawTrackId || "");
  const driverId = normalizeDriverId(rawDriverId || "");
  const teamId = normalizeTeamId(rawTeamId || "");

  // 2. TRACK PREVIEW LOGIC (Strict ID Validation)
  if (category === "TRACK_PREVIEW" && trackId) {
    return resolveWhitelistedImage('track', trackId);
  }

  // 3. TECHNICAL ARTICLE LOGIC
  if (category === "TECHNICAL") {
    if (idMatch(rawTrackId, ["aero", "active"])) return resolveWhitelistedImage('technical', 'active_aero');
    if (idMatch(rawTrackId, ["unit", "pu", "engine"])) return resolveWhitelistedImage('technical', 'power_unit');
    return "/placeholders/global_fallback.jpg";
  }

  // 4. DRIVER NEWS LOGIC
  if (category === "DRIVER_NEWS" && driverId) {
    return resolveWhitelistedImage('driver', driverId);
  }

  // 5. TEAM LOGIC
  if (teamId) {
    return resolveWhitelistedImage('team', teamId);
  }

  // 6. TRACK ATMOSPHERE (Strict Relational Sync)
  if (trackId) {
    const variant = (context.sessionType === "Qualifying" || context.tags?.includes("Night")) ? 'night' : 'default';
    return resolveWhitelistedImage('track', trackId, variant);
  }

  // 7. GLOBAL MASTER FALLBACK (Controlled)
  return "/placeholders/global_fallback.jpg";
}

/**
 * Helper to match keywords against raw IDs for technical/contextual resolution.
 */
function idMatch(input: string | undefined, keywords: string[]): boolean {
    if (!input) return false;
    const lower = input.toLowerCase();
    return keywords.some(k => lower.includes(k));
}
