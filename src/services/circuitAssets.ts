import { useState, useEffect } from "react";
import { normalizeTrackId } from "./assetManager";
import { TRACK_DATABASE } from "../constants/f1Data";
import { getImage } from "./imageSourceSystem";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Mapping of circuit short names to visual assets
export interface CircuitAssets {
  name: string;
  fullName: string;
  shortName: string;
  location: string;
  trackMap: string;
  heroImage: string;
  flagCode: string;
}

const DEFAULT_ASSETS: CircuitAssets = {
  name: "Active Grand Prix",
  fullName: "Formula 1 Circuit",
  shortName: "GP Hub",
  location: "Global",
  trackMap: "/placeholders/global_fallback.jpg",
  heroImage: "/placeholders/global_fallback.jpg",
  flagCode: "UN"
};

export function useCircuitAssets(session: any | null): CircuitAssets {
  const [assets, setAssets] = useState<CircuitAssets>(DEFAULT_ASSETS);

  useEffect(() => {
    if (!session?.circuit_short_name && !session?.country_name) return;
    
    const shortName = session.circuit_short_name || "Unknown";
    const location = session.location || session.country_name || "Global";
    const countryName = session.country_name || "";

    // 1. Normalize session data to find a strict database ID
    // We check all relevant fields to find the most accurate mapping
    const trackId = normalizeTrackId(shortName) || normalizeTrackId(countryName) || normalizeTrackId(location);

    if (trackId && TRACK_DATABASE[trackId]) {
      const dbTrack = TRACK_DATABASE[trackId];
      setAssets({
        name: dbTrack.shortName,
        shortName: dbTrack.shortName,
        fullName: dbTrack.fullName,
        location: dbTrack.location,
        trackMap: getImage('map', trackId),
        heroImage: getImage('hero', trackId),
        flagCode: dbTrack.countryCode
      });
    } else {
      // 2. Failsafe: Use professional motorsport placeholders if no ID match exists
      // This prevents random city photos or tourism images
      setAssets({
        ...DEFAULT_ASSETS,
        name: shortName,
        shortName: shortName,
        fullName: shortName.includes('Circuit') ? shortName : `${shortName} Circuit`,
        location: location,
        trackMap: "/placeholders/global_fallback.jpg",
        heroImage: "/placeholders/global_fallback.jpg"
      });
    }

  }, [session?.circuit_short_name, session?.country_name, session?.location]);

  return assets;
}
