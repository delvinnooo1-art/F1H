/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Database, CheckCircle, XCircle, Clock, RefreshCw, Shield, Image, Users, Map } from "lucide-react";
import { DRIVERS_2026, TEAMS_2026, TRACK_DATABASE } from "../constants/f1Data";
import { syncCdnCatalog, listMediaAssets, buildCdnUrl, type MediaAssetRecord } from "../services/mediaIngestion";
import { getImage } from "../services/imageSourceSystem";

type FilterType = "all" | "driver" | "team" | "circuit";

export function MediaPipelinePanel() {
  const [assets, setAssets] = useState<MediaAssetRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: number; failed: number } | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [stats, setStats] = useState({ drivers: 0, teams: 0, circuits: 0, total: 0, completed: 0 });

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    const data = await listMediaAssets(filter === "all" ? undefined : filter as any);
    setAssets(data);
    setLoading(false);

    setStats({
      drivers: data.filter(a => a.entity_type === "driver").length,
      teams: data.filter(a => a.entity_type === "team").length,
      circuits: data.filter(a => a.entity_type === "circuit").length,
      total: data.length,
      completed: data.filter(a => a.ingestion_status === "completed").length,
    });
  }, [filter]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setSyncResult(null);

    // Build the CDN catalog from f1Data constants
    const catalogAssets: Parameters<typeof syncCdnCatalog>[0] = [];

    // Drivers
    Object.entries(DRIVERS_2026).forEach(([num, d]) => {
      if (d.image) catalogAssets.push({ entityId: d.id, entityType: "driver", assetType: "portrait", cdnUrl: d.image });
      if (d.suit)  catalogAssets.push({ entityId: d.id, entityType: "driver", assetType: "suit",     cdnUrl: d.suit });
    });

    // Teams
    Object.entries(TEAMS_2026).forEach(([key, t]) => {
      if (t.logo)     catalogAssets.push({ entityId: t.id, entityType: "team", assetType: "logo", cdnUrl: t.logo });
      if (t.carImage) catalogAssets.push({ entityId: t.id, entityType: "team", assetType: "car",  cdnUrl: t.carImage });
    });

    // Circuits
    Object.entries(TRACK_DATABASE).forEach(([key, t]) => {
      if (t.heroImage) catalogAssets.push({ entityId: t.id, entityType: "circuit", assetType: "hero", cdnUrl: t.heroImage });
      if (t.mapImage)  catalogAssets.push({ entityId: t.id, entityType: "circuit", assetType: "map",  cdnUrl: t.mapImage });
      if (t.nightImage) catalogAssets.push({ entityId: t.id, entityType: "circuit", assetType: "night", cdnUrl: t.nightImage });
    });

    const result = await syncCdnCatalog(catalogAssets);
    setSyncResult(result);
    setSyncing(false);
    await fetchAssets();
  }, [fetchAssets]);

  const statusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle size={12} className="text-f1-green" />;
    if (status === "failed") return <XCircle size={12} className="text-f1-red" />;
    return <Clock size={12} className="text-f1-yellow animate-pulse" />;
  };

  const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-f1-green/10 border border-f1-green/20 rounded-lg flex items-center justify-center">
            <Database className="text-f1-green" size={18} />
          </div>
          <div>
            <h3 className="font-display font-black text-2xl uppercase italic tracking-tighter">
              Media <span className="text-f1-red">Ingestion Pipeline</span>
            </h3>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
              CDN asset registry // Controlled image delivery
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAssets}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 glass-panel border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-5 py-2 bg-f1-red text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-[0_0_20px_rgba(225,6,0,0.2)] hover:shadow-[0_0_30px_rgba(225,6,0,0.4)] transition-all disabled:opacity-50"
          >
            <Database size={12} className={syncing ? "animate-pulse" : ""} />
            {syncing ? "Syncing CDN..." : "Sync CDN Catalog"}
          </button>
        </div>
      </div>

      {/* Architecture Diagram */}
      <div className="glass-panel p-6 border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={14} className="text-f1-green" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Pipeline Architecture</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: "Source URLs", desc: "Discovery only — never reaches UI", color: "#E10600" },
            { label: "→", desc: "", color: "transparent" },
            { label: "Validation", desc: "Image format + CDN URL check", color: "#FFFB00" },
            { label: "→", desc: "", color: "transparent" },
            { label: "CDN Storage", desc: "cdn.racehub.live/f1/...", color: "#00D2BE" },
            { label: "→", desc: "", color: "transparent" },
            { label: "DB Registry", desc: "Supabase media_assets table", color: "#3671C6" },
            { label: "→", desc: "", color: "transparent" },
            { label: "UI Layer", desc: "CDN URLs only", color: "#52E252" },
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center">
              {step.desc ? (
                <div className="px-3 py-1.5 rounded-sm border text-[9px] font-black uppercase tracking-widest text-white" style={{ borderColor: `${step.color}40`, backgroundColor: `${step.color}10`, color: step.color }}>
                  {step.label}
                </div>
              ) : (
                <span className="text-white/20 font-bold text-lg">→</span>
              )}
              {step.desc && <span className="text-[7px] text-white/20 mt-1 text-center max-w-[80px] leading-tight">{step.desc}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Sync Result */}
      <AnimatePresence>
        {syncResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-4 px-4 py-3 rounded-sm border ${syncResult.failed === 0 ? "bg-f1-green/10 border-f1-green/20" : "bg-f1-yellow/10 border-f1-yellow/20"}`}
          >
            {syncResult.failed === 0 ? <CheckCircle size={16} className="text-f1-green" /> : <XCircle size={16} className="text-f1-yellow" />}
            <span className="text-[10px] font-black uppercase tracking-widest">
              Sync complete: <span className="text-f1-green">{syncResult.success} assets registered</span>
              {syncResult.failed > 0 && <span className="text-f1-yellow ml-2">// {syncResult.failed} non-CDN urls rejected</span>}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Assets", value: stats.total, icon: <Image size={14} />, color: "text-white" },
          { label: "Completed", value: stats.completed, icon: <CheckCircle size={14} />, color: "text-f1-green" },
          { label: "Drivers", value: stats.drivers, icon: <Users size={14} />, color: "text-f1-blue" },
          { label: "Teams", value: stats.teams, icon: <Shield size={14} />, color: "text-f1-yellow" },
          { label: "Circuits", value: stats.circuits, icon: <Map size={14} />, color: "text-f1-red" },
        ].map(stat => (
          <div key={stat.label} className="glass-panel p-4 border-white/5 flex flex-col gap-2">
            <div className={`flex items-center gap-2 ${stat.color}`}>
              {stat.icon}
              <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{stat.label}</span>
            </div>
            <span className={`font-display font-black text-3xl italic ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* CDN Coverage Bar */}
      <div className="glass-panel p-5 border-white/5 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">CDN Coverage</span>
          <span className="font-mono text-sm font-bold text-f1-green">{completionPct}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-f1-green to-f1-blue rounded-full shadow-[0_0_10px_rgba(0,210,190,0.4)]"
          />
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <div className="glass-panel p-1 flex gap-1">
          {(["all", "driver", "team", "circuit"] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? "bg-f1-red text-white" : "text-white/40 hover:text-white"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{assets.length} assets</span>
      </div>

      {/* Asset Table */}
      <div className="glass-panel flex-1 overflow-y-auto border-white/5 custom-scrollbar">
        <div className="sticky top-0 bg-f1-dark/95 backdrop-blur-md px-4 py-2 border-b border-white/5 grid grid-cols-[2rem_1fr_1fr_1fr_1fr_1fr] gap-3 text-[8px] font-black uppercase tracking-widest text-white/20">
          <span />
          <span>Entity ID</span>
          <span>Type</span>
          <span>Asset</span>
          <span>CDN URL</span>
          <span>Status</span>
        </div>
        <div className="p-2 flex flex-col gap-0.5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border border-f1-red border-t-transparent rounded-full animate-spin" />
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Database size={32} className="text-white/10" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">No assets registered. Click "Sync CDN Catalog" to populate.</span>
            </div>
          ) : (
            assets.map((asset, idx) => {
              const previewUrl = getImage(asset.asset_type, asset.entity_id);
              return (
                <motion.div
                  key={`${asset.entity_id}-${asset.asset_type}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(idx * 0.01, 0.3) }}
                  className="grid grid-cols-[2rem_1fr_1fr_1fr_1fr_1fr] gap-3 px-4 py-2 items-center hover:bg-white/[0.02] rounded-sm transition-all"
                >
                  {/* Preview */}
                  <div className="w-6 h-6 rounded bg-white/5 overflow-hidden border border-white/10">
                    <img src={previewUrl} alt="" className="w-full h-full object-cover grayscale" />
                  </div>
                  <span className="font-mono text-[9px] text-white/60 truncate">{asset.entity_id}</span>
                  <span className="text-[9px] font-bold uppercase text-white/30 tracking-widest">{asset.entity_type}</span>
                  <span className="text-[9px] font-bold uppercase text-white/30 tracking-widest">{asset.asset_type}</span>
                  <span className="font-mono text-[8px] text-white/20 truncate">{asset.cdn_url.replace("https://cdn.racehub.live", "…")}</span>
                  <div className="flex items-center gap-1.5">
                    {statusIcon(asset.ingestion_status)}
                    <span className={`text-[8px] font-bold uppercase tracking-widest ${asset.ingestion_status === "completed" ? "text-f1-green" : asset.ingestion_status === "failed" ? "text-f1-red" : "text-f1-yellow"}`}>
                      {asset.ingestion_status}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
