/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from "recharts";
import { Users, User, ArrowLeftRight, Zap, Wind, Disc, ChevronDown, Trophy, TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { DRIVERS_2026, TEAMS_2026, type DriverAsset, type TeamAsset } from "../constants/f1Data";
import { getImage } from "../services/imageSourceSystem";
import {
  generateGridTelemetry,
  compareDrivers,
  formatLapTime,
  getLapTimeDeltaColor,
  getTyreColors,
  type ComparisonResult,
  type GenerationOptions
} from "../services/telemetryEngine";
import type { DriverTelemetry } from "../services/supabase";

type CompareMode = "1v1" | "1v2" | "team" | "grid";

interface DriverComparisonProps {
  initialDrivers?: number[];
  circuit?: string;
}

const ALL_DRIVER_NUMBERS = Object.keys(DRIVERS_2026).map(Number).filter(n => !isNaN(n));

const CIRCUIT_OPTIONS = [
  { id: "default", label: "Generic Circuit" },
  { id: "monaco", label: "Monaco" },
  { id: "monza", label: "Monza" },
  { id: "silverstone", label: "Silverstone" },
  { id: "bahrain", label: "Bahrain" },
  { id: "canada", label: "Canada" },
];

export function DriverComparison({ initialDrivers = [1, 44] }: DriverComparisonProps) {
  const [mode, setMode] = useState<CompareMode>("1v1");
  const [selectedDrivers, setSelectedDrivers] = useState<number[]>(initialDrivers.slice(0, 2));
  const [circuit, setCircuit] = useState("default");
  const [laps, setLaps] = useState(57);
  const [activeChart, setActiveChart] = useState<"delta" | "speed" | "sectors" | "tyre">("delta");

  const opts: GenerationOptions = { totalLaps: laps, circuit, phase: "RACE", sessionKey: 9999 };

  const driverPool = useMemo(() => {
    if (mode === "1v1") return selectedDrivers.slice(0, 2);
    if (mode === "1v2") return selectedDrivers.slice(0, 3);
    if (mode === "team") {
      // Expand to full teams of selected drivers
      const teams = new Set(selectedDrivers.map(n => DRIVERS_2026[n.toString()]?.team).filter(Boolean));
      return ALL_DRIVER_NUMBERS.filter(n => teams.has(DRIVERS_2026[n.toString()]?.team));
    }
    return ALL_DRIVER_NUMBERS.slice(0, 20);
  }, [mode, selectedDrivers]);

  const gridTelemetry = useMemo(() => generateGridTelemetry(driverPool, opts), [driverPool, circuit, laps]);

  const comparison = useMemo<ComparisonResult | null>(() => {
    const d1 = gridTelemetry[selectedDrivers[0]];
    const d2 = gridTelemetry[selectedDrivers[1]];
    if (!d1 || !d2) return null;
    return compareDrivers(d1, d2);
  }, [gridTelemetry, selectedDrivers]);

  const swapDrivers = useCallback(() => {
    setSelectedDrivers(prev => [prev[1], prev[0], ...prev.slice(2)]);
  }, []);

  const d1Num = selectedDrivers[0];
  const d2Num = selectedDrivers[1];
  const d1Asset = DRIVERS_2026[d1Num?.toString()];
  const d2Asset = DRIVERS_2026[d2Num?.toString()];
  const t1 = TEAMS_2026[d1Asset?.team ?? ""];
  const t2 = TEAMS_2026[d2Asset?.team ?? ""];

  return (
    <div className="flex flex-col gap-6 h-full text-white">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-f1-red/10 border border-f1-red/20 rounded-lg flex items-center justify-center">
            <ArrowLeftRight className="text-f1-red" size={18} />
          </div>
          <div>
            <h3 className="font-display font-black text-2xl uppercase italic tracking-tighter">
              Driver <span className="text-f1-red">Comparison Engine</span>
            </h3>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
              Multi-mode telemetry analysis // {laps} laps
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Mode Selector */}
          <div className="glass-panel p-1 flex gap-1">
            {(["1v1", "1v2", "team", "grid"] as CompareMode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all ${mode === m ? "bg-f1-red text-white" : "text-white/40 hover:text-white"}`}
              >
                {m === "grid" ? "Full Grid" : m.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Circuit Selector */}
          <div className="relative glass-panel px-3 py-2 flex items-center gap-2 cursor-pointer group">
            <select
              value={circuit}
              onChange={e => setCircuit(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest text-white/60 appearance-none cursor-pointer pr-4 outline-none"
            >
              {CIRCUIT_OPTIONS.map(c => (
                <option key={c.id} value={c.id} className="bg-f1-dark text-white">{c.label}</option>
              ))}
            </select>
            <ChevronDown size={10} className="text-white/20 absolute right-2 pointer-events-none" />
          </div>

          {/* Lap Count */}
          <div className="glass-panel px-3 py-2 flex items-center gap-2">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Laps</span>
            <select
              value={laps}
              onChange={e => setLaps(Number(e.target.value))}
              className="bg-transparent text-[10px] font-black text-white/70 appearance-none cursor-pointer outline-none"
            >
              {[20, 30, 44, 57, 71].map(l => <option key={l} value={l} className="bg-f1-dark">{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Driver Selector Strip */}
      <DriverSelectorStrip
        driverNumbers={mode === "1v1" ? [d1Num, d2Num] : mode === "1v2" ? selectedDrivers.slice(0, 3) : [d1Num, d2Num]}
        onSelect={(idx, num) => setSelectedDrivers(prev => {
          const next = [...prev];
          next[idx] = num;
          return next;
        })}
        onSwap={swapDrivers}
        t1Color={t1?.color}
        t2Color={t2?.color}
        showSwap={mode === "1v1"}
      />

      {/* Comparison Stats */}
      {comparison && (mode === "1v1" || mode === "1v2") && (
        <ComparisonStatBar comparison={comparison} d1Asset={d1Asset} d2Asset={d2Asset} t1={t1} t2={t2} />
      )}

      {/* Chart Selector */}
      <div className="flex gap-2 flex-wrap">
        {(["delta", "speed", "sectors", "tyre"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveChart(tab)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm border transition-all ${activeChart === tab ? "border-f1-red bg-f1-red/10 text-white" : "border-white/10 text-white/30 hover:text-white/60"}`}
          >
            {tab === "delta" && <><Activity className="inline mr-1.5" size={10} />Lap Delta</>}
            {tab === "speed" && <><Zap className="inline mr-1.5" size={10} />Speed Trace</>}
            {tab === "sectors" && <><Wind className="inline mr-1.5" size={10} />Sectors</>}
            {tab === "tyre" && <><Disc className="inline mr-1.5" size={10} />Tyre Deg</>}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="glass-panel flex-1 p-6 border-white/5 min-h-[300px]">
        <AnimatePresence mode="wait">
          {activeChart === "delta" && comparison && (
            <motion.div key="delta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                Lap Time Delta — {d1Asset?.lastName} vs {d2Asset?.lastName}
              </span>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={comparison.lapDeltas}>
                  <defs>
                    <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E10600" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#E10600" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="negGrad" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="5%" stopColor="#00D2BE" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00D2BE" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="lap" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono" }} label={{ value: "Lap", position: "insideBottomRight", offset: -5, fontSize: 9, fill: "rgba(255,255,255,0.3)" }} />
                  <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono" }} tickFormatter={v => `${v > 0 ? "+" : ""}${v.toFixed(2)}s`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(15,15,15,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: 10 }}
                    formatter={(v: number) => [`${v > 0 ? "+" : ""}${v.toFixed(3)}s`, "Delta"]}
                    labelFormatter={l => `Lap ${l}`}
                  />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="delta" stroke={t1?.color ?? "#E10600"} fill="url(#posGrad)" strokeWidth={2} isAnimationActive={false} dot={false} />
                  <Area type="monotone" dataKey="cumDelta" stroke={t2?.color ?? "#00D2BE"} fill="url(#negGrad)" strokeWidth={1.5} strokeDasharray="5 5" isAnimationActive={false} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5" style={{ backgroundColor: t1?.color ?? "#E10600" }} />
                  <span className="text-[9px] font-bold text-white/40 uppercase">{d1Asset?.lastName} Delta per Lap</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 opacity-60 border-dashed border-t" style={{ borderColor: t2?.color ?? "#00D2BE" }} />
                  <span className="text-[9px] font-bold text-white/40 uppercase">Cumulative Delta</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeChart === "speed" && (
            <motion.div key="speed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Speed Trace — Top Speed per Lap (km/h)</span>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={(gridTelemetry[d1Num] ?? []).map((l, i) => ({
                  lap: l.lap_number,
                  d1Speed: l.top_speed,
                  d2Speed: gridTelemetry[d2Num]?.[i]?.top_speed,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="lap" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono" }} />
                  <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono" }} domain={["auto", "auto"]} tickFormatter={v => `${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(15,15,15,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 10 }}
                    formatter={(v: number) => [`${v.toFixed(1)} km/h`]}
                    labelFormatter={l => `Lap ${l}`}
                  />
                  <Line type="monotone" dataKey="d1Speed" stroke={t1?.color ?? "#E10600"} strokeWidth={2} dot={false} isAnimationActive={false} name={d1Asset?.lastName} />
                  <Line type="monotone" dataKey="d2Speed" stroke={t2?.color ?? "#00D2BE"} strokeWidth={2} dot={false} isAnimationActive={false} name={d2Asset?.lastName} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {activeChart === "sectors" && comparison && (
            <motion.div key="sectors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Sector Delta Analysis (s) — Negative = {d1Asset?.lastName} faster</span>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparison.sectorDeltas.filter((_, i) => i % 5 === 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="lap" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono" }} label={{ value: "Lap", position: "insideBottomRight", offset: -5, fontSize: 9, fill: "rgba(255,255,255,0.3)" }} />
                  <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono" }} tickFormatter={v => `${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(15,15,15,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 10 }}
                    formatter={(v: number) => [`${v > 0 ? "+" : ""}${v.toFixed(3)}s`]}
                    labelFormatter={l => `Lap ${l}`}
                  />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
                  <Bar dataKey="s1Delta" name="S1" fill="#3671C6" opacity={0.8} />
                  <Bar dataKey="s2Delta" name="S2" fill="#FFFB00" opacity={0.8} />
                  <Bar dataKey="s3Delta" name="S3" fill="#E10600" opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-6">
                {[{ key: "S1", color: "#3671C6" }, { key: "S2", color: "#FFFB00" }, { key: "S3", color: "#E10600" }].map(s => (
                  <div key={s.key} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: s.color }} />
                    <span className="text-[9px] font-bold text-white/40 uppercase">{s.key} Delta</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeChart === "tyre" && (
            <motion.div key="tyre" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Tyre Degradation Curve — deg rate per lap</span>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={(gridTelemetry[d1Num] ?? []).map((l, i) => ({
                  lap: l.lap_number,
                  d1Deg: l.degradation_rate,
                  d2Deg: gridTelemetry[d2Num]?.[i]?.degradation_rate,
                  d1Fuel: l.fuel_load,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="lap" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono" }} />
                  <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono" }} tickFormatter={v => `${(v * 1000).toFixed(0)}ms`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(15,15,15,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 10 }}
                    formatter={(v: number, name: string) => [
                      name === "d1Fuel" ? `${v.toFixed(1)} kg` : `${(v * 1000).toFixed(1)} ms/lap`,
                      name.includes("d1Deg") ? `${d1Asset?.lastName} Deg` : name === "d1Fuel" ? "Fuel Load" : `${d2Asset?.lastName} Deg`
                    ]}
                    labelFormatter={l => `Lap ${l}`}
                  />
                  <Line type="monotone" dataKey="d1Deg" stroke={t1?.color ?? "#E10600"} strokeWidth={2} dot={false} isAnimationActive={false} name="d1Deg" />
                  <Line type="monotone" dataKey="d2Deg" stroke={t2?.color ?? "#00D2BE"} strokeWidth={2} dot={false} isAnimationActive={false} name="d2Deg" />
                  <Line type="monotone" dataKey="d1Fuel" stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="4 4" dot={false} isAnimationActive={false} name="d1Fuel" yAxisId={1} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Sub-Components ---

interface DriverSelectorStripProps {
  driverNumbers: number[];
  onSelect: (idx: number, num: number) => void;
  onSwap: () => void;
  t1Color?: string;
  t2Color?: string;
  showSwap?: boolean;
}

function DriverSelectorStrip({ driverNumbers, onSelect, onSwap, t1Color, t2Color, showSwap }: DriverSelectorStripProps) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {driverNumbers.map((dNum, idx) => {
        const asset = DRIVERS_2026[dNum?.toString()];
        const team = TEAMS_2026[asset?.team ?? ""];
        return (
          <div key={idx} className="flex items-center gap-2">
            <div
              className="glass-panel p-1.5 flex items-center gap-3 border-white/5 min-w-[180px] cursor-pointer hover:border-white/20 transition-all"
              style={{ borderLeftColor: team?.color ?? "#666", borderLeftWidth: "3px" }}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-white/5 shrink-0">
                <img src={getImage("standing", dNum)} alt={asset?.lastName} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-display font-black text-base uppercase italic tracking-tighter truncate leading-none">
                  {asset?.lastName ?? "---"}
                </span>
                <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest truncate">{asset?.team ?? "---"}</span>
              </div>
              <select
                value={dNum}
                onChange={e => onSelect(idx, Number(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              >
                {ALL_DRIVER_NUMBERS.map(n => {
                  const a = DRIVERS_2026[n.toString()];
                  return a ? <option key={n} value={n} className="bg-f1-dark text-white">#{n} {a.firstName} {a.lastName}</option> : null;
                })}
              </select>
            </div>
            {idx === 0 && showSwap && (
              <button onClick={onSwap} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-f1-red/20 hover:border-f1-red/40 transition-all">
                <ArrowLeftRight size={12} className="text-white/40" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ComparisonStatBar({
  comparison,
  d1Asset,
  d2Asset,
  t1,
  t2,
}: {
  comparison: ComparisonResult;
  d1Asset: DriverAsset | undefined;
  d2Asset: DriverAsset | undefined;
  t1: TeamAsset | undefined;
  t2: TeamAsset | undefined;
}) {
  const stats = [
    {
      label: "Avg Lap Delta",
      value: `${comparison.avgLapDelta > 0 ? "+" : ""}${comparison.avgLapDelta.toFixed(3)}s`,
      winner: comparison.avgLapDelta < 0 ? "d1" : comparison.avgLapDelta > 0 ? "d2" : "tie",
    },
    {
      label: "Best Lap Delta",
      value: `${comparison.bestLapDelta > 0 ? "+" : ""}${comparison.bestLapDelta.toFixed(3)}s`,
      winner: comparison.bestLapDelta < 0 ? "d1" : comparison.bestLapDelta > 0 ? "d2" : "tie",
    },
    {
      label: "Consistency",
      value: `${Math.abs(comparison.consistencyDiff).toFixed(1)}pts`,
      winner: comparison.consistencyDiff > 0 ? "d1" : comparison.consistencyDiff < 0 ? "d2" : "tie",
    },
    {
      label: "Top Speed",
      value: `${Math.abs(comparison.topSpeedDiff).toFixed(1)} km/h`,
      winner: comparison.topSpeedDiff > 0 ? "d1" : comparison.topSpeedDiff < 0 ? "d2" : "tie",
    },
    {
      label: "Tyre Advantage",
      value: comparison.tyreAdvantage !== null
        ? `${Math.abs(comparison.tyreAdvantage * 1000).toFixed(0)}ms/lap`
        : "---",
      winner: (comparison.tyreAdvantage ?? 0) > 0 ? "d1" : (comparison.tyreAdvantage ?? 0) < 0 ? "d2" : "tie",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {stats.map(stat => (
        <div key={stat.label} className="glass-panel p-4 border-white/5 flex flex-col gap-2 relative overflow-hidden">
          <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{stat.label}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-bold">
              {stat.value}
            </span>
            {stat.winner === "d1" && <TrendingDown size={12} style={{ color: t1?.color ?? "#E10600" }} />}
            {stat.winner === "d2" && <TrendingUp size={12} style={{ color: t2?.color ?? "#00D2BE" }} />}
            {stat.winner === "tie" && <Minus size={12} className="text-white/20" />}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <div
              className="h-1 rounded-full flex-1"
              style={{
                backgroundColor: stat.winner === "d1" ? (t1?.color ?? "#E10600") :
                                  stat.winner === "d2" ? (t2?.color ?? "#00D2BE") : "rgba(255,255,255,0.1)"
              }}
            />
          </div>
          {stat.winner !== "tie" && (
            <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: stat.winner === "d1" ? (t1?.color ?? "#E10600") : (t2?.color ?? "#00D2BE") }}>
              {stat.winner === "d1" ? d1Asset?.lastName : d2Asset?.lastName} advantage
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

const ALL_DRIVER_NUMBERS_EXPORT = ALL_DRIVER_NUMBERS;
export { ALL_DRIVER_NUMBERS_EXPORT as AVAILABLE_DRIVERS };
