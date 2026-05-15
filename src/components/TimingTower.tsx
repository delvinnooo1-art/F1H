/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { DriverAsset, DRIVERS_2026, TEAMS_2026 } from "../constants/f1Data";
import { getDriverPortrait } from "../services/driverPhotos";

interface Lap {
  lap_number: number;
  lap_duration: number;
  duration_sector_1: number;
  duration_sector_2: number;
  duration_sector_3: number;
}

interface TimingData {
  driver_number: number;
  position: number;
  last_lap?: Lap;
  best_lap?: Lap;
  interval?: {
    interval: number;
    gap_to_leader: number;
  };
  stint?: {
    compound: string;
    tyre_age_at_start: number;
  };
}

interface TimingTowerProps {
  timingData: TimingData[];
  drivers: any[];
  highlightedDriverId?: number;
  fastestLap?: Lap | null;
  pushLapDrivers?: number[];
  isSyncing?: boolean;
  onDriverClick?: (driverNumber: number) => void;
}

export function TimingTower({
  timingData,
  drivers,
  highlightedDriverId,
  fastestLap,
  pushLapDrivers = [],
  isSyncing = false,
  onDriverClick
}: TimingTowerProps) {
  const getSectorStatus = (driverLap: Lap, sectorNum: 1 | 2 | 3) => {
    if (!fastestLap) return "green";
    
    const driverSector = sectorNum === 1 ? driverLap.duration_sector_1 : 
                        sectorNum === 2 ? driverLap.duration_sector_2 : 
                        driverLap.duration_sector_3;
    
    const bestSector = sectorNum === 1 ? fastestLap.duration_sector_1 : 
                      sectorNum === 2 ? fastestLap.duration_sector_2 : 
                      fastestLap.duration_sector_3;

    if (!driverSector) return "default";
    return driverSector <= bestSector ? "purple" : "green";
  };

  const sortedData = [...timingData].sort((a, b) => a.position - b.position);

  return (
    <div className="glass-panel flex flex-col h-full overflow-hidden border-white/5">
      {/* Dynamic Session Header */}
      <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-f1-red animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white italic">Live Timing Tower</span>
        </div>
        <div className="flex items-center gap-4">
           {isSyncing && (
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
               className="w-3 h-3 border border-f1-red border-t-transparent rounded-full"
             />
           )}
           <span className="font-mono text-[9px] text-white/40 font-bold uppercase">v2026.1.0</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        <AnimatePresence initial={false}>
          {sortedData.map((data, idx) => {
            const driver = drivers.find(d => d.driver_number === data.driver_number);
            const driverAsset = DRIVERS_2026[data.driver_number.toString()];
            const teamAsset = TEAMS_2026[driver?.team_name?.toUpperCase() || ""];
            const isHighlighted = highlightedDriverId === data.driver_number;
            const isPushLap = pushLapDrivers.includes(data.driver_number);
            const isPodium = data.position <= 3;
            const lap = data.last_lap;
            
            return (
              <motion.div
                key={data.driver_number}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.5, 
                  ease: [0.23, 1, 0.32, 1],
                  layout: { duration: 0.4 }
                }}
                onClick={() => onDriverClick?.(data.driver_number)}
                className={`group relative mb-1 px-4 py-2.5 transition-all duration-300 cursor-pointer rounded-lg border border-transparent
                  ${isPodium ? 'bg-gradient-to-r from-white/[0.03] to-transparent py-4 my-1.5' : 'hover:bg-white/[0.03]'}
                  ${isHighlighted ? 'bg-f1-purple/10 !border-f1-purple/30' : ''}
                `}
              >
                {/* Team Color Accent */}
                <div 
                  className="absolute left-0 top-[15%] bottom-[15%] w-[3px] rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                  style={{ backgroundColor: teamAsset?.color || driver?.team_colour || '#666' }}
                />

                  <div className="flex items-center gap-2">
                    {/* Position */}
                    <div className="w-6 text-center">
                      <span className={`font-display font-black italic tracking-tighter ${isPodium ? 'text-xl text-f1-red' : 'text-base text-white/40'}`}>
                        {data.position}
                      </span>
                    </div>

                    {/* Driver Image Thumb */}
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 overflow-hidden shrink-0">
                       <img 
                         src={getDriverPortrait(data.driver_number, driver?.headshot_url)} 
                         alt={driver?.name_acronym} 
                         className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                       />
                    </div>

                    {/* Driver Info */}
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-black text-lg uppercase italic tracking-tighter leading-none">
                            {driver?.name_acronym || "UNN"}
                          </span>
                          {isPushLap && (
                             <div className="px-1.5 py-0.5 bg-f1-purple text-white text-[7px] font-black uppercase rounded-[2px] animate-pulse">Push</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Team Icon placeholder (Using small color block or logo if available) */}
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                       <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: teamAsset?.color || driver?.team_colour || '#666' }} />
                    </div>

                    {/* Telemetry Visuals */}
                    <div className="flex items-center gap-3 min-w-[6rem] justify-end">
                      {/* Interval Data */}
                      <span className="font-mono text-[10px] font-bold text-white italic tracking-tighter">
                        {data.position === 1 ? "LEADER" : data.interval?.interval ? `+${data.interval.interval.toFixed(3)}` : ". . ."}
                      </span>
                      
                      {/* Sector Performance (Very Compact) */}
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map(s => {
                          const status = lap ? getSectorStatus(lap, s as 1|2|3) : 'default';
                          return (
                            <div 
                              key={s} 
                              className={`w-2 h-2 rounded-[1px] ${
                                status === 'purple' ? 'bg-f1-purple' : 
                                status === 'green' ? 'bg-f1-green' : 'bg-white/5'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Tire Status (Very Compact) */}
                    <div className="w-6 flex flex-col items-center">
                      {data.stint && (
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[8px] font-black
                            ${data.stint.compound === 'SOFT' ? 'border-f1-red text-f1-red bg-f1-red/10' : 
                              data.stint.compound === 'MEDIUM' ? 'border-f1-yellow text-f1-yellow bg-f1-yellow/10' : 
                              data.stint.compound === 'HARD' ? 'border-white text-white bg-white/10' : 'border-f1-green text-f1-green bg-f1-green/10'}
                          `}>
                            {data.stint.compound.charAt(0)}
                          </div>
                      )}
                    </div>
                  </div>

                {/* Live Position Highlight Overlay */}
                {isHighlighted && (
                  <motion.div 
                    layoutId="highlight"
                    className="absolute inset-0 border-l-4 border-f1-purple pointer-events-none"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
