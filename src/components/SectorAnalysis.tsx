/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  ScatterChart, Scatter, ZAxis
} from "recharts";
import { Activity, Target, Zap, Wind } from "lucide-react";
import { DRIVERS_2026, TEAMS_2026 } from "../constants/f1Data";
import { getImage } from "../services/imageSourceSystem";
import {
  generateGridTelemetry,
  formatLapTime,
  getTyreColors,
  type GenerationOptions
} from "../services/telemetryEngine";
import type { DriverTelemetry } from "../services/supabase";

interface SectorAnalysisProps {
  driverNumbers: number[];
  circuit?: string;
  totalLaps?: number;
}

const CIRCUIT_OPTS = [
  { id: "monaco", label: "Monaco" },
  { id: "monza", label: "Monza (Power)" },
  { id: "silverstone", label: "Silverstone" },
  { id: "canada", label: "Canada" },
  { id: "bahrain", label: "Bahrain" },
  { id: "default", label: "Generic" },
];

export function SectorAnalysis({ driverNumbers, circuit: initCircuit = "default", totalLaps = 30 }: SectorAnalysisProps) {
  const [circuit, setCircuit] = useState(initCircuit);
  const [viewMode, setViewMode] = useState<"best" | "avg" | "consistency">("best");
  const [selectedLap, setSelectedLap] = useState<number | null>(null);

  const opts: GenerationOptions = { totalLaps, circuit, phase: "RACE", sessionKey: 7777 };
  const telemetry = useMemo(() => generateGridTelemetry(driverNumbers, opts), [driverNumbers, circuit, totalLaps]);

  const driverStats = useMemo(() => {
    return driverNumbers.map(dNum => {
      const laps = (telemetry[dNum] ?? []).filter(l => !l.pit_stop_lap);
      if (laps.length === 0) return null;

      const bestLap = laps.reduce((a, b) => a.lap_time < b.lap_time ? a : b);
      const bestS1 = Math.min(...laps.map(l => l.sector_1));
      const bestS2 = Math.min(...laps.map(l => l.sector_2));
      const bestS3 = Math.min(...laps.map(l => l.sector_3));
      const theoreticalBest = bestS1 + bestS2 + bestS3;

      const avgS1 = laps.reduce((a, b) => a + b.sector_1, 0) / laps.length;
      const avgS2 = laps.reduce((a, b) => a + b.sector_2, 0) / laps.length;
      const avgS3 = laps.reduce((a, b) => a + b.sector_3, 0) / laps.length;
      const avgLap = laps.reduce((a, b) => a + b.lap_time, 0) / laps.length;

      const lapTimes = laps.map(l => l.lap_time);
      const stdDev = Math.sqrt(lapTimes.reduce((a, b) => a + Math.pow(b - avgLap, 2), 0) / lapTimes.length);
      const consistencyScore = Math.max(0, 100 - stdDev * 200);

      return {
        driverNumber: dNum,
        bestLap,
        bestS1,
        bestS2,
        bestS3,
        theoreticalBest,
        avgS1,
        avgS2,
        avgS3,
        avgLap,
        stdDev,
        consistencyScore,
        allLaps: laps,
      };
    }).filter(Boolean);
  }, [telemetry, driverNumbers]);

  // Normalize for radar chart (0-100 scale, higher = better)
  const radarData = useMemo(() => {
    if (driverStats.length < 2) return [];
    const maxAvgLap = Math.max(...driverStats.map(d => d!.avgLap));
    const minAvgLap = Math.min(...driverStats.map(d => d!.avgLap));
    const range = maxAvgLap - minAvgLap || 1;

    return driverStats.map(d => {
      if (!d) return null;
      const asset = DRIVERS_2026[d.driverNumber.toString()];
      return {
        driver: asset?.lastName ?? "---",
        driverNumber: d.driverNumber,
        "Pace": Math.round(100 - ((d.avgLap - minAvgLap) / range) * 80),
        "S1 Speed": Math.round(100 - (d.bestS1 / Math.max(...driverStats.map(s => s!.bestS1))) * 50),
        "S2 Speed": Math.round(100 - (d.bestS2 / Math.max(...driverStats.map(s => s!.bestS2))) * 50),
        "S3 Speed": Math.round(100 - (d.bestS3 / Math.max(...driverStats.map(s => s!.bestS3))) * 50),
        "Consistency": Math.round(d.consistencyScore),
        "Tyre Mgmt": Math.round(100 - (d.allLaps[d.allLaps.length - 1]?.degradation_rate ?? 0.1) * 500),
      };
    }).filter(Boolean);
  }, [driverStats]);

  // Sector heatmap data (best lap sector comparison)
  const sectorComparisonData = useMemo(() => {
    return ["S1", "S2", "S3"].map((sector, sIdx) => {
      const row: Record<string, number | string> = { sector };
      const key = sIdx === 0 ? "bestS1" : sIdx === 1 ? "bestS2" : "bestS3";
      driverStats.forEach(d => {
        if (!d) return;
        const asset = DRIVERS_2026[d.driverNumber.toString()];
        row[asset?.lastName ?? "---"] = d[key as keyof typeof d] as number;
      });
      return row;
    });
  }, [driverStats]);

  const overallBestS = useMemo(() => ({
    s1: Math.min(...driverStats.map(d => d?.bestS1 ?? Infinity)),
    s2: Math.min(...driverStats.map(d => d?.bestS2 ?? Infinity)),
    s3: Math.min(...driverStats.map(d => d?.bestS3 ?? Infinity)),
  }), [driverStats]);

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-f1-blue/10 border border-f1-blue/20 rounded-lg flex items-center justify-center">
            <Target className="text-f1-blue" size={18} />
          </div>
          <div>
            <h3 className="font-display font-black text-2xl uppercase italic tracking-tighter">
              Sector <span className="text-f1-red">Analysis</span>
            </h3>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
              Multi-driver sector decomposition + performance radar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={circuit}
            onChange={e => setCircuit(e.target.value)}
            className="glass-panel px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 bg-transparent appearance-none cursor-pointer outline-none border border-white/10 rounded-lg"
          >
            {CIRCUIT_OPTS.map(c => <option key={c.id} value={c.id} className="bg-f1-dark text-white">{c.label}</option>)}
          </select>
          <div className="glass-panel p-1 flex gap-1">
            {(["best", "avg", "consistency"] as const).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === v ? "bg-f1-red text-white" : "text-white/40 hover:text-white"}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Driver Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {driverStats.map(d => {
          if (!d) return null;
          const asset = DRIVERS_2026[d.driverNumber.toString()];
          const team = TEAMS_2026[asset?.team ?? ""];
          const isS1Fastest = d.bestS1 === overallBestS.s1;
          const isS2Fastest = d.bestS2 === overallBestS.s2;
          const isS3Fastest = d.bestS3 === overallBestS.s3;

          return (
            <motion.div
              key={d.driverNumber}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-5 border-white/5 relative overflow-hidden group"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: team?.color ?? "#666" }} />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-white/5">
                  <img src={getImage("standing", d.driverNumber)} alt={asset?.lastName} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-black text-lg uppercase italic tracking-tighter leading-none">{asset?.lastName}</span>
                  <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{asset?.team}</span>
                </div>
              </div>

              <div className="space-y-2">
                {/* Best Lap */}
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">Best Lap</span>
                  <span className="font-mono text-sm font-bold text-f1-red">{formatLapTime(d.bestLap.lap_time)}</span>
                </div>

                {/* Theoretical Best */}
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">Theoretical</span>
                  <span className="font-mono text-sm font-bold text-white/60">{formatLapTime(d.theoreticalBest)}</span>
                </div>

                {/* Sector Times */}
                <div className="grid grid-cols-3 gap-1 mt-3">
                  {[
                    { label: "S1", value: d.bestS1, isBest: isS1Fastest, color: "#3671C6" },
                    { label: "S2", value: d.bestS2, isBest: isS2Fastest, color: "#FFFB00" },
                    { label: "S3", value: d.bestS3, isBest: isS3Fastest, color: "#E10600" },
                  ].map(s => (
                    <div
                      key={s.label}
                      className="flex flex-col items-center p-2 rounded-sm"
                      style={{ backgroundColor: s.isBest ? `${s.color}15` : "rgba(255,255,255,0.03)", borderWidth: 1, borderStyle: "solid", borderColor: s.isBest ? `${s.color}40` : "rgba(255,255,255,0.05)" }}
                    >
                      <span className="text-[7px] font-black uppercase" style={{ color: s.isBest ? s.color : "rgba(255,255,255,0.3)" }}>{s.label}</span>
                      <span className="font-mono text-xs font-bold" style={{ color: s.isBest ? s.color : "rgba(255,255,255,0.6)" }}>{s.value.toFixed(3)}</span>
                    </div>
                  ))}
                </div>

                {/* Consistency Bar */}
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex justify-between">
                    <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Consistency</span>
                    <span className="text-[8px] font-bold text-white/40">{d.consistencyScore.toFixed(1)}/100</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${d.consistencyScore}%`, backgroundColor: team?.color ?? "#666" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1">
        {/* Radar Chart */}
        <div className="glass-panel p-6 border-white/5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-f1-blue" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Performance Radar</span>
          </div>
          <div className="flex-1 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={[
                { axis: "Pace", ...Object.fromEntries(radarData.map(d => [d!.driver, d!["Pace"]])) },
                { axis: "S1 Speed", ...Object.fromEntries(radarData.map(d => [d!.driver, d!["S1 Speed"]])) },
                { axis: "S2 Speed", ...Object.fromEntries(radarData.map(d => [d!.driver, d!["S2 Speed"]])) },
                { axis: "S3 Speed", ...Object.fromEntries(radarData.map(d => [d!.driver, d!["S3 Speed"]])) },
                { axis: "Consistency", ...Object.fromEntries(radarData.map(d => [d!.driver, d!["Consistency"]])) },
                { axis: "Tyre Mgmt", ...Object.fromEntries(radarData.map(d => [d!.driver, d!["Tyre Mgmt"]])) },
              ]}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.4)", fontFamily: "JetBrains Mono" }} />
                {radarData.map((d, i) => {
                  const team = TEAMS_2026[DRIVERS_2026[d!.driverNumber.toString()]?.team ?? ""];
                  return (
                    <Radar
                      key={d!.driver}
                      name={d!.driver}
                      dataKey={d!.driver}
                      stroke={team?.color ?? "#666"}
                      fill={team?.color ?? "#666"}
                      fillOpacity={0.08}
                      strokeWidth={2}
                    />
                  );
                })}
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 flex-wrap">
            {radarData.map(d => {
              const team = TEAMS_2026[DRIVERS_2026[d!.driverNumber.toString()]?.team ?? ""];
              return (
                <div key={d!.driver} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team?.color ?? "#666" }} />
                  <span className="text-[9px] font-bold text-white/40 uppercase">{d!.driver}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sector Bar Comparison */}
        <div className="glass-panel p-6 border-white/5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Wind size={14} className="text-f1-green" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              {viewMode === "best" ? "Best Sector Times" : viewMode === "avg" ? "Avg Sector Times" : "Consistency Score"}
            </span>
          </div>
          <div className="flex-1 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={driverStats.map(d => {
                  if (!d) return {};
                  const asset = DRIVERS_2026[d.driverNumber.toString()];
                  return {
                    driver: asset?.lastName ?? "---",
                    driverNumber: d.driverNumber,
                    value: viewMode === "best" ? d.bestLap.lap_time :
                           viewMode === "avg" ? d.avgLap :
                           d.consistencyScore,
                  };
                })}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono" }}
                  domain={viewMode === "consistency" ? [0, 100] : ["auto", "auto"]}
                  tickFormatter={v => viewMode === "consistency" ? `${v.toFixed(0)}` : formatLapTime(v)}
                />
                <YAxis type="category" dataKey="driver" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.4)", fontFamily: "JetBrains Mono" }} width={60} />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(15,15,15,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 10 }}
                  formatter={(v: number) => [viewMode === "consistency" ? `${v.toFixed(1)}/100` : formatLapTime(v)]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive>
                  {driverStats.map(d => {
                    if (!d) return null;
                    const team = TEAMS_2026[DRIVERS_2026[d.driverNumber.toString()]?.team ?? ""];
                    return <Cell key={d.driverNumber} fill={team?.color ?? "#666"} opacity={0.8} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pace consistency scatter */}
      <div className="glass-panel p-6 border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={14} className="text-f1-yellow" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Lap Time Distribution — All Laps (scatter)</span>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="lap" type="number" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono" }} label={{ value: "Lap", position: "insideBottomRight", offset: -5, fontSize: 9, fill: "rgba(255,255,255,0.3)" }} />
              <YAxis dataKey="lapTime" type="number" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono" }} tickFormatter={v => formatLapTime(v)} domain={["auto", "auto"]} />
              <ZAxis range={[20, 20]} />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(15,15,15,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 10 }}
                formatter={(v: number, name: string) => [name === "lapTime" ? formatLapTime(v) : v, name === "lapTime" ? "Lap Time" : "Lap"]}
              />
              {driverStats.map(d => {
                if (!d) return null;
                const team = TEAMS_2026[DRIVERS_2026[d.driverNumber.toString()]?.team ?? ""];
                const asset = DRIVERS_2026[d.driverNumber.toString()];
                return (
                  <Scatter
                    key={d.driverNumber}
                    name={asset?.lastName}
                    data={d.allLaps.map(l => ({ lap: l.lap_number, lapTime: l.lap_time }))}
                    fill={team?.color ?? "#666"}
                    opacity={0.6}
                  />
                );
              })}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
