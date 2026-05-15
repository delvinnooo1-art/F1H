/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TRACK_DATABASE, DRIVERS_2026, TEAMS_2026 } from "../constants/f1Data";

/**
 * RACE HUB — CONTROLLED IMAGE RESOLUTION SYSTEM (WHITELIST ONLY)
 * 
 * CORE PRINCIPLE:
 * The system MUST ONLY use a predefined whitelist database.
 * No internet search, no scraping, no random fallbacks.
 */

// MASTER IMAGE DATABASE (Strict Whitelist)
export const IMAGE_DATABASE_2026: Record<string, Record<string, string>> = {
    // Tracks
    ...Object.fromEntries(Object.entries(TRACK_DATABASE).map(([key, t]) => [
        key, { hero: t.heroImage, map: t.mapImage, night: t.nightImage || t.heroImage }
    ])),
    // Drivers (indexed by both string number and id)
    ...Object.fromEntries(Object.entries(DRIVERS_2026).map(([key, d]) => [
        key, { standing: d.image, suit: d.suit }
    ])),
    ...Object.fromEntries(Object.values(DRIVERS_2026).map(d => [
        d.id, { standing: d.image, suit: d.suit }
    ])),
    ...Object.fromEntries(Object.values(DRIVERS_2026).map(d => [
        d.firstName.toLowerCase() + "_" + d.lastName.toLowerCase(), { standing: d.image, suit: d.suit }
    ])),
    ...Object.fromEntries(Object.values(DRIVERS_2026).map(d => [
        d.lastName.toLowerCase(), { standing: d.image, suit: d.suit }
    ])),
    // Teams
    ...Object.fromEntries(Object.entries(TEAMS_2026).map(([key, t]) => [
        key, { logo: t.logo, car: t.carImage }
    ])),
    ...Object.fromEntries(Object.values(TEAMS_2026).map(t => [
        t.id, { logo: t.logo, car: t.carImage }
    ])),
};

export /**
 * IMAGE VALIDATION COMPONENT
 * Only allows assets from the official CDN or local curated placeholders.
 * Rejects all external scrapes and HTML pages.
 */
function isValid(url: string | undefined): boolean {
    if (!url) return false;
    
    const lowerUrl = url.toLowerCase();
    
    // STRICT RULE: Only CDN or curated local placeholders
    const isWhitelisted = lowerUrl.startsWith('https://cdn.racehub.live/') || 
                         lowerUrl.startsWith('/placeholders/') ||
                         lowerUrl.startsWith('data:image/'); // Allowed for generated avatars
    
    if (!isWhitelisted) return false;

    // Must be a direct media file or data URI
    const hasValidExtension = lowerUrl.endsWith('.jpg') || 
                             lowerUrl.endsWith('.png') || 
                             lowerUrl.endsWith('.webp') ||
                             lowerUrl.startsWith('data:image/');
                             
    return hasValidExtension;
}

/**
 * MASTER IMAGE RESOLVER (RACE HUB 2026)
 * DETERMINISTIC PIPELINE: LAYER 1 (CDN) -> LAYER 2 (CATEGORIZED) -> LAYER 3 (AVATAR) -> LAYER 4 (GLOBAL)
 */
export function getImage(type: string, id: string | number): string {
    const idStr = String(id).toLowerCase();
    
    // STEP 1: LAYER 1 - Curated Database (CDN)
    const img = IMAGE_DATABASE_2026?.[idStr]?.[type];
    if (img && isValid(img)) {
        return img;
    }

    // Logging only missing primary assets for developer audit (Serverless friendly)
    if (idStr !== '0' && idStr !== 'undefined' && idStr !== 'null') {
        console.warn(`[IMAGE_RESOLVER] Primary asset "${type}" for ID "${idStr}" missing. Invoking Fallback Layer.`);
    }
    
    // STEP 2: LAYER 2 - Categorized Placeholders
    const layer2 = getCategoryPlaceholder(type);
    
    // STEP 3: LAYER 3 - Avatar System (Initials + Team Color)
    // Only for drivers
    if (type === 'standing' || type === 'suit') {
        const driver = findDriverByIdOrName(idStr);
        if (driver) {
            return `data:image/svg+xml;base64,${btoa(generateInitialsSVG(driver))}`;
        }
    }

    return layer2;
}

/**
 * STEP 2: CATEGORY FALLBACKS
 */
function getCategoryPlaceholder(type: string): string {
    switch (type) {
        case 'hero':
        case 'map':
            return "/placeholders/f1_circuit.jpg";
        case 'standing':
        case 'suit':
            return "/placeholders/f1_driver.jpg";
        case 'logo':
        case 'car':
            return "/placeholders/f1_team.jpg";
        default:
            return "/placeholders/global_f1.jpg"; // STEP 4: GLOBAL FALLBACK
    }
}

/**
 * UTILITY: FIND DRIVER FOR AVATAR LOGIC
 */
function findDriverByIdOrName(id: string) {
    return Object.values(DRIVERS_2026).find(d => 
        d.id.toLowerCase() === id || 
        d.lastName.toLowerCase() === id ||
        (d.firstName.toLowerCase() + "_" + d.lastName.toLowerCase()) === id ||
        d.id.split('_').pop() === id // handle last name only from ID
    );
}

/**
 * STEP 3: INITIALS GENERATOR
 */
function generateInitialsSVG(driver: any): string {
    const initials = ((driver.firstName?.[0] || '') + (driver.lastName?.[0] || '')).toUpperCase();
    const color = driver.color || "#3671C6";
    return `
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
            <rect width="200" height="200" fill="${color}" />
            <text x="50%" y="50%" dy=".1em" fill="white" font-size="80" 
                  font-family="Arial, sans-serif" font-weight="bold" 
                  text-anchor="middle" dominant-baseline="middle">${initials}</text>
        </svg>
    `.trim();
}

/**
 * DETERMINISTIC TRACK IMAGE RESOLVER (RACE HUB 2026)
 * @param track_id Standardized track ID (e.g. 'italian_gp_2026')
 */
export function getTrackImage(track_id: string, variant: string = 'hero'): string {
    return getImage(variant, track_id);
}

/**
 * Resolves an image URL based on strict ID matching against the whitelist.
 */
export function resolveWhitelistedImage(type: 'driver' | 'track' | 'team' | 'technical', id: string, variant: string = 'default'): string {
    if (type === 'track') return getImage(variant === 'default' ? 'hero' : variant, id);
    if (type === 'driver') return getImage(variant === 'suit' ? 'suit' : 'standing', id);
    if (type === 'team') return getImage(variant === 'logo' ? 'logo' : 'car', id);
    return "/placeholders/global_fallback.jpg";
}
