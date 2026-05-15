/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, RotateCcw, Flag, ArrowUp, ArrowDown, Minus, SkipForward } from "lucide-react";
import { DRIVERS_2026, TEAMS_2026 } from "../constants/f1Data";
import { getImage } from "../services/imageSourceSystem";
import {
  generateGridTelemetry,
  formatLapTime,
  getTyreColors,
  type GenerationOptions
} from "../services/telemetryEngine";
import type { DriverTelemetry } from "../services/supabase";

const GRID_DRIVERS = Object.keys(DRIVERS_2026).map(Number).filter(n => !isNaN(n)).slice(0, 20);

interface GridSimulationProps {
  circuit?: string;
  totalLaps?: number;
}

interface GridEntry {
  driverNumber: number;
  position: number;
  prevPosition: number;
  lapTime: number;
  gap: number;
  interval: number;
  compound: string;
  tyreAge: number;
  pitStops: number;
  isPitLap: boolean;
  isUndercut: boolean;
  isOvercut: boolean;
}

export function GridSimulation({ circuit = "default", totalLaps = 57 }: GridSimulationProps) {
  const [currentLap, setCurrentLap] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 5>(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const opts: GenerationOptions = { totalLaps, circuit, phase: "RACE", sessionKey: 8888 };
  const telemetry = useMemo(() => generateGridTelemetry(GRID_DRIVERS, opts), [circuit, totalLaps]);

  const maxLap = useMemo(
    () => Math.min(...GRID_DRIVERS.map(n => (telemetry[n]?.length ?? 0))),
    [telemetry]
  );

  const getLapData = useCallback((lap: number): GridEntry[] => {
    const lapIdx = Math.max(0, Math.min(lap - 1, maxLap - 1));

    const entries: Array<{ dNum: number; lapData: DriverTelemetry; totalTime: number }> = [];

    for (const dNum of GRID_DRIVERS) {
      const laps = telemetry[dNum];
      if (!laps || laps.length === 0) continue;

      // Cumulative race time (sum of all laps up to current)
      let totalTime = 0;
      let pitCount = 0;
      for (let i = 0; i <= lapIdx; i++) {
        const l = laps[i];
        if (l) {
          totalTime += l.lap_time + (l.pit_stop_lap ? 25 : 0);
          if (l.pit_stop_lap) pitCount++;
        }
      }
      entries.push({ dNum, lapData: laps[lapIdx], totalTime });
    }

    // Sort by total race time
    entries.sort((a, b) => a.totalTime - b.totalTime);

    const leaderTime = entries[0]?.totalTime ?? 0;

    return entries.map((entry, idx) => {
      const { dNum, lapData } = entry;
      const prevLapIdx = Math.max(0, lapIdx - 1);
      const prevLapData = telemetry[dNum]?.[prevLapIdx];
      const prevPos = prevLapData?.position ?? idx + 1;

      let pitCount = 0;
      for (let i = 0; i <= lapIdx; i++) {
        if (telemetry[dNum]?.[i]?.pit_stop_lap) pitCount++;
      }

      // Undercut: driver pitted before car ahead and gained position
      const isUndercut = lapData?.pit_stop_lap === true && idx < (prevLapData?.position ?? idx + 1) - 1;
      // Overcut: driver stayed out and got position from tire degradation of rival
      const isOvercut = !lapData?.pit_stop_lap && idx < (prevLapData?.position ?? idx + 1) - 1;

      const prevGapToLeader = entries[idx - 1]?.totalTime;
      const interval = idx === 0 ? 0 : entry.totalTime - (entries[idx - 1]?.totalTime ?? 0);

      return {
        driverNumber: dNum,
        position: idx + 1,
        prevPosition: prevPos,
        lapTime: lapData?.lap_time ?? 0,
        gap: Math.max(0, entry.totalTime - leaderTime),
        interval,
        compound: lapData?.tire_compound ?? "MEDIUM",
        tyreAge: lapData ? lapIdx - (lapIdx - Math.min(lapIdx, 20)) : 0,
        pitStops: pitCount,
        isPitLap: lapData?.pit_stop_lap ?? false,
        isUndercut,
        isOvercut,
      };
    });
  }, [telemetry, maxLap]);

  const gridData = useMemo(() => getLapData(currentLap), [getLapData, currentLap]);

  const play = useCallback(() => {
    if (currentLap >= maxLap) return;
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentLap(prev => {
        if (prev >= maxLap) {
          clearInterval(intervalRef.current!);
          setIsPlaying(false);
          return prev;
        }
        return prev + speed;
      });
    }, 600 / speed);
  }, [currentLap, maxLap, speed]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const reset = useCallback(() => {
    pause();
    setCurrentLap(1);
  }, [pause]);

  const stepForward = useCallback(() => {
    pause();
    setCurrentLap(prev => Math.min(maxLap, prev + 1));
  }, [pause, maxLap]);

  const overallFastest = useMemo(() => {
    let best = Infinity;
    let bestNum = 0;
    for (const dNum of GRID_DRIVERS) {
      const lap = telemetry[dNum]?.[currentLap - 1];
      if (lap && !lap.pit_stop_lap && lap.lap_time < best) {
        best = lap.lap_time;
        bestNum = dNum;
      }
    }
    return { driverNumber: bestNum, lapTime: best };
  }, [telemetry, currentLap]);

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-display font-black text-2xl uppercase italic tracking-tighter">
            Grid <span className="text-f1-red">Simulation</span>
          </h3>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
            Full 20-car race simulation // Lap {currentLap} of {maxLap}
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          {/* Speed multiplier */}
          <div className="glass-panel p-1 flex gap-1">
            {([1, 2, 5] as const).map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded-sm text-[9px] font-black transition-all ${speed === s ? "bg-white/10 text-white" : "text-white/30"}`}
              >
                {s}x
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={reset} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
              <RotateCcw size={12} className="text-white/40" />
            </button>
            <button
              onClick={isPlaying ? pause : play}
              className="w-10 h-10 rounded-full bg-f1-red flex items-center justify-center shadow-[0_0_20px_rgba(225,6,0,0.3)] hover:shadow-[0_0_30px_rgba(225,6,0,0.5)] transition-all"
            >
              {isPlaying ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white ml-0.5" />}
            </button>
            <button onClick={stepForward} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
              <SkipForward size={12} className="text-white/40" />
            </button>
          </div>
        </div>
      </div>

      {/* Lap Scrubber */}
      <div className="flex items-center gap-4">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/20 w-12">L{currentLap}</span>
        <div className="flex-1 relative h-2">
          <div className="absolute inset-0 bg-white/5 rounded-full" />
          <motion.div
            className="absolute left-0 top-0 h-full bg-f1-red rounded-full shadow-[0_0_10px_rgba(225,6,0,0.4)]"
            style={{ width: `${(currentLap / maxLap) * 100}%` }}
          />
          <input
            type="range"
            min={1}
            max={maxLap}
            value={currentLap}
            onChange={e => { pause(); setCurrentLap(Number(e.target.value)); }}
            className="absolute inset-0 opacity-0 cursor-pointer w-full"
          />
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-white/20 w-12 text-right">L{maxLap}</span>
      </div>

      {/* Fastest Lap Banner */}
      {overallFastest.driverNumber > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-[#9C27B0]/10 border border-[#9C27B0]/20 rounded-sm">
          <Flag size={12} className="text-[#9C27B0]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#9C27B0]">Fastest Lap L{currentLap}</span>
          <span className="font-display font-black text-sm italic text-white">
            {DRIVERS_2026[overallFastest.driverNumber.toString()]?.lastName}
          </span>
          <span className="font-mono text-sm font-bold text-white/60">{formatLapTime(overallFastest.lapTime)}</span>
        </div>
      )}

      {/* Grid Table */}
      <div className="glass-panel flex-1 overflow-y-auto border-white/5 custom-scrollbar">
        {/* Table Header */}
        <div className="sticky top-0 bg-f1-dark/95 backdrop-blur-md px-4 py-2 border-b border-white/5 grid grid-cols-[3rem_1fr_1fr_1fr_1fr_1fr_2rem] gap-2 text-[8px] font-black uppercase tracking-widest text-white/20">
          <span>Pos</span>
          <span>Driver</span>
          <span className="text-right">Gap</span>
          <span className="text-right">Interval</span>
          <span className="text-right">Lap Time</span>
          <span className="text-right">Tyre</span>
          <span />
        </div>

        <div className="p-2 flex flex-col gap-0.5">
          <AnimatePresence initial={false}>
            {gridData.map((entry, _idx) => {
              const asset = DRIVERS_2026[entry.driverNumber.toString()];
              const team = TEAMS_2026[asset?.team ?? ""];
              const posChange = entry.prevPosition - entry.position;
              const tyreColors = getTyreColors(entry.compound as any);
              const isFastest = overallFastest.driverNumber === entry.driverNumber;

              return (
                <motion.div
                  key={entry.driverNumber}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ layout: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } }}
                  className={`grid grid-cols-[3rem_1fr_1fr_1fr_1fr_1fr_2rem] gap-2 px-4 py-2 items-center border-l-2 transition-all duration-300 rounded-sm
                    ${isFastest ? "bg-[#9C27B0]/5 border-[#9C27B0]/40" : "border-transparent hover:bg-white/[0.02]"}
                    ${entry.isPitLap ? "bg-f1-yellow/5" : ""}
                  `}
                  style={{ borderLeftColor: team?.color ?? "#666" }}
                >
                  {/* Position */}
                  <div className="flex items-center gap-1">
                    <span className={`font-display font-black text-xl italic ${entry.position <= 3 ? "text-f1-red" : "text-white/40"}`}>
                      {entry.position}
                    </span>
                  </div>

                  {/* Driver */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 bg-white/5 shrink-0">
                      <img src={getImage("standing", entry.driverNumber)} alt={asset?.lastName} className="w-full h-full object-cover grayscale" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-display font-black text-sm uppercase italic tracking-tighter truncate leading-none">{asset?.lastName ?? "---"}</span>
                      <span className="text-[8px] font-bold text-white/20 uppercase truncate">{asset?.team}</span>
                    </div>
                  </div>

                  {/* Gap to leader */}
                  <span className="font-mono text-xs font-bold text-white/60 text-right">
                    {entry.position === 1 ? "LEADER" : entry.gap > 60 ? `+${Math.floor(entry.gap / 60)}L` : `+${entry.gap.toFixed(3)}`}
                  </span>

                  {/* Interval */}
                  <span className="font-mono text-xs font-bold text-white/40 text-right">
                    {entry.position === 1 ? "--" : `+${entry.interval.toFixed(3)}`}
                  </span>

                  {/* Lap Time */}
                  <span className={`font-mono text-xs font-bold text-right ${isFastest ? "text-[#9C27B0]" : entry.isPitLap ? "text-f1-yellow" : "text-white/60"}`}>
                    {entry.isPitLap ? "PIT" : formatLapTime(entry.lapTime)}
                  </span>

                  {/* Tyre */}
                  <div className="flex items-center justify-end gap-1">
                    <div
                      className="w-5 h-5 rounded-full border text-[8px] font-black flex items-center justify-center"
                      style={{ borderColor: tyreColors.border, color: tyreColors.text, backgroundColor: tyreColors.bg }}
                    >
                      {entry.compound.charAt(0)}
                    </div>
                    <span className="text-[8px] font-bold text-white/20 w-4">{entry.pitStops}p</span>
                  </div>

                  {/* Position Change */}
                  <div className="flex justify-center">
                    {posChange > 0 && <ArrowUp size={10} className="text-f1-green" />}
                    {posChange < 0 && <ArrowDown size={10} className="text-f1-red" />}
                    {posChange === 0 && <Minus size={10} className="text-white/10" />}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
