/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from "./supabase";

/**
 * RACE HUB — CDN MEDIA INGESTION PIPELINE
 *
 * Architecture:
 * SOURCE (reference only) → VALIDATION → STORE TO CDN → DATABASE REGISTRY → UI
 *
 * The UI ONLY uses cdn_url values from the media_assets table.
 * No source URLs ever reach the frontend.
 */

export type EntityType = "driver" | "team" | "circuit" | "technical";
export type AssetType = "portrait" | "suit" | "helmet" | "logo" | "car" | "hero" | "map" | "night" | "technical";
export type IngestionStatus = "pending" | "processing" | "completed" | "failed";

export interface MediaAssetRecord {
  id?: string;
  entity_type: EntityType;
  entity_id: string;
  asset_type: AssetType;
  cdn_url: string;
  original_source?: string;
  file_format: string;
  ingestion_status: IngestionStatus;
}

// CDN base (2026 season)
const CDN_BASE = "https://cdn.racehub.live";

export function buildCdnUrl(category: string, entityId: string, format = "jpg"): string {
  const normalized = entityId.toLowerCase().replace(/\s+/g, "-");
  return `${CDN_BASE}/f1/${category}/${normalized}.${format}`;
}

// Validates that a URL points to a direct media file on the CDN
export function isCdnUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.startsWith(CDN_BASE) && (
    lower.endsWith(".jpg") ||
    lower.endsWith(".png") ||
    lower.endsWith(".webp")
  );
}

// Validates source URL is a real image (not HTML, not dynamic query)
export function isValidSourceUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  const hasImageExt = lower.endsWith(".jpg") || lower.endsWith(".jpeg") ||
                      lower.endsWith(".png") || lower.endsWith(".webp");
  const isDynamic = lower.includes("?") || lower.includes("&");
  const isHtml = lower.includes(".html") || lower.includes(".php");
  return hasImageExt && !isDynamic && !isHtml;
}

// Look up a CDN URL for an entity from the database
export async function getCdnAsset(
  entityId: string,
  assetType: AssetType,
  entityType: EntityType
): Promise<string | null> {
  const { data, error } = await supabase
    .from("f1_media_assets")
    .select("cdn_url, ingestion_status")
    .eq("entity_id", entityId)
    .eq("asset_type", assetType)
    .eq("ingestion_status", "completed")
    .maybeSingle();

  if (error || !data) return null;
  return isCdnUrl(data.cdn_url) ? data.cdn_url : null;
}

// Register an asset in the media database (pending status)
// Source URL never leaves this layer
export async function registerAsset(
  entityId: string,
  entityType: EntityType,
  assetType: AssetType,
  cdnUrl: string,
  sourceUrl?: string
): Promise<boolean> {
  if (!isCdnUrl(cdnUrl)) {
    console.warn("[INGESTION] Rejected non-CDN URL:", cdnUrl);
    return false;
  }

  const { error } = await supabase
    .from("f1_media_assets")
    .upsert({
      entity_id: entityId,
      entity_type: entityType,
      asset_type: assetType,
      cdn_url: cdnUrl,
      original_source: sourceUrl ?? null,
      file_format: cdnUrl.split(".").pop() ?? "jpg",
      ingestion_status: "completed",
      ingested_at: new Date().toISOString(),
    }, { onConflict: "entity_id,asset_type" });

  if (error) {
    console.error("[INGESTION] Failed to register asset:", error);
    return false;
  }
  return true;
}

// Bulk register assets from the f1Data CDN catalog
export async function syncCdnCatalog(
  assets: Array<{
    entityId: string;
    entityType: EntityType;
    assetType: AssetType;
    cdnUrl: string;
  }>
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  const validAssets = assets.filter(a => isCdnUrl(a.cdnUrl));
  const invalidCount = assets.length - validAssets.length;
  failed += invalidCount;

  if (validAssets.length === 0) return { success, failed };

  const rows = validAssets.map(a => ({
    entity_id: a.entityId,
    entity_type: a.entityType,
    asset_type: a.assetType,
    cdn_url: a.cdnUrl,
    file_format: a.cdnUrl.split(".").pop() ?? "jpg",
    ingestion_status: "completed" as IngestionStatus,
    ingested_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("f1_media_assets")
    .upsert(rows, { onConflict: "entity_id,asset_type" });

  if (error) {
    console.error("[INGESTION] Bulk sync failed:", error);
    failed += validAssets.length;
  } else {
    success += validAssets.length;
  }

  return { success, failed };
}

// List all registered assets with filter
export async function listMediaAssets(
  entityType?: EntityType,
  status?: IngestionStatus
): Promise<MediaAssetRecord[]> {
  let query = supabase
    .from("f1_media_assets")
    .select("*")
    .order("entity_type")
    .order("entity_id");

  if (entityType) query = query.eq("entity_type", entityType);
  if (status) query = query.eq("ingestion_status", status);

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as MediaAssetRecord[];
}
