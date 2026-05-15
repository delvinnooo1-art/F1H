/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Driver, Stint, Lap } from "../types.ts";
import { Gauge, Zap, Waves, Cpu, BarChart3, Activity, Wind } from "lucide-react";
import { DRIVERS_2026, TEAMS_2026 } from "../constants/f1Data";

interface CarUpdatesProps {
  drivers: Driver[];
  latestLaps: Record<number, Lap>;
  currentStints: Record<number, Stint>;
  positions: number[];
}

export function CarUpdates({ drivers, latestLaps, currentStints, positions }: CarUpdatesProps) {
  return (
    <div className="flex flex-col gap-10 h-full overflow-y-auto pr-4 custom-scrollbar">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
           <Cpu className="text-f1-red" size={24} />
           <h2 className="font-display font-black text-5xl uppercase italic tracking-tighter">
             CAR <span className="text-f1-red">ENGINEERING</span> DATA
           </h2>
        </div>
        <p className="text-white/40 text-sm font-medium uppercase tracking-[0.4em] italic">Real-time status of the 2026 Power Units and Active Aerodynamics</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {positions.map((dNum) => {
          const driver = drivers.find(d => d.driver_number === dNum);
          const lap = latestLaps[dNum];
          const stint = currentStints[dNum];
          const dAsset = DRIVERS_2026[dNum.toString()];
          const tAsset = TEAMS_2026[driver?.team_name?.toUpperCase() || ""];
          
          if (!driver) return null;

          return (
            <motion.div 
              key={dNum} 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-panel p-8 flex flex-col gap-8 relative overflow-hidden group border-white/5 hover:border-f1-red/20 transition-all duration-500"
            >
              {/* Card Decoration */}
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                 <Activity size={80} />
              </div>

              {/* Driver Identity */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 relative bg-white/[0.03] rounded-sm overflow-hidden border border-white/10 p-1 shadow-2xl">
                    <img 
                      src={dAsset?.suit || driver.headshot_url} 
                      alt={driver.broadcast_name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1" 
                      style={{ backgroundColor: tAsset?.color || driver.team_colour || '#333' }}
                    />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-3xl uppercase italic tracking-tighter leading-none">{driver.name_acronym}</span>
                    <span className="font-mono text-[10px] text-f1-red font-bold">#{driver.driver_number}</span>
                  </div>
                  <span className="text-[10px] uppercase font-black text-white/30 tracking-[0.3em] mt-1 italic">{driver.team_name}</span>
                </div>
              </div>

              {/* High-Level Telemetry */}
              <div className="grid grid-cols-2 gap-6">
                 <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 telemetry-label">
                       <Zap size={12} className="text-f1-yellow" />
                       <span>ERS DEPLOY</span>
                    </div>
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center justify-between font-mono text-xs font-bold text-white/60">
                          <span>350kW</span>
                          <span>92%</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "92%" }}
                            className="h-full bg-gradient-to-r from-f1-yellow to-f1-green" 
                          />
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 telemetry-label">
                       <Wind size={12} className="text-f1-blue" />
                       <span>AERO MODE</span>
                    </div>
                    <div className="h-8 flex items-center justify-center bg-white/5 border border-white/5 rounded-sm">
                       <span className="font-display font-black text-sm text-f1-blue animate-pulse">X-MODE LITE</span>
                    </div>
                 </div>
              </div>

              {/* Detailed Specs */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col p-4 bg-white/[0.02] rounded-sm gap-1">
                    <span className="telemetry-label">Speed Trap</span>
                    <span className="font-mono text-2xl font-bold italic">{lap?.st_speed || "---"}<span className="text-xs opacity-30 ml-1">KM/H</span></span>
                 </div>
                 <div className="flex flex-col p-4 bg-white/[0.02] rounded-sm gap-1">
                    <span className="telemetry-label">Avg Latency</span>
                    <span className="font-mono text-2xl font-bold italic">0.42<span className="text-xs opacity-30 ml-1">MS</span></span>
                 </div>
              </div>

              {/* Tyre Intelligence */}
              <div className="p-6 bg-white/[0.03] border border-white/5 rounded-sm flex flex-col gap-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <BarChart3 size={14} className="text-white/40" />
                      <span className="telemetry-label">Active Stint Performance</span>
                   </div>
                   <span className="font-mono text-[10px] font-bold text-white/20">L{stint?.tyre_age_at_start || 0} // {stint?.stint_number || 1}STINT</span>
                </div>
                <div className="flex items-center gap-6">
                   <div className={`w-14 h-14 rounded-full border-[3px] flex items-center justify-center font-display font-black text-2xl italic shadow-[0_0_20px_rgba(255,255,255,0.05)]
                     ${stint?.compound === 'SOFT' ? 'border-f1-red text-f1-red bg-f1-red/10' : 
                       stint?.compound === 'MEDIUM' ? 'border-f1-yellow text-f1-yellow bg-f1-yellow/10' : 
                       stint?.compound === 'HARD' ? 'border-white text-white bg-white/10' : 'border-f1-green text-f1-green bg-f1-green/10'}
                   `}>
                     {stint?.compound.charAt(0) || "U"}
                   </div>
                   <div className="flex flex-col gap-1.5 flex-1">
                      <div className="flex items-center justify-between">
                         <span className="font-display font-black text-xl uppercase italic tracking-tighter leading-none">{stint?.compound || "DATA PENDING"}</span>
                         <span className="text-[10px] font-black text-f1-green uppercase tracking-widest italic">Optimal</span>
                      </div>
                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-white/40 w-3/4" />
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
