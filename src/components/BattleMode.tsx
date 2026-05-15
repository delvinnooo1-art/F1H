/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Driver } from "../types.ts";
import { Swords, Radio, Zap } from "lucide-react";
import { DRIVERS_2026, TEAMS_2026 } from "../constants/f1Data";
import { getDriverPortrait } from "../services/driverPhotos";

interface Battle {
  pos: number;
  driver1: Driver;
  driver2: Driver;
  gap: number;
  overtakeMode: boolean;
}

interface BattleModeProps {
  battles: Battle[];
  onBattleClick?: (driverNumber: number) => void;
}

export function BattleMode({ battles, onBattleClick }: BattleModeProps) {
  if (battles.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-3 mb-2 px-2">
        <div className="p-1 px-2 bg-f1-red/10 border border-f1-red/20 rounded">
           <Swords size={14} className="text-f1-red" />
        </div>
        <div className="flex flex-col">
          <h3 className="font-display font-black text-xs uppercase tracking-[0.3em] text-white italic">Active Battle Tracking</h3>
          <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest leading-none">Detection Window: 1.2s Gap</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-4">
        {battles.map((battle, idx) => {
          const d1Asset = DRIVERS_2026[battle.driver1.driver_number.toString()];
          const d2Asset = DRIVERS_2026[battle.driver2.driver_number.toString()];
          const t1Asset = TEAMS_2026[battle.driver1.team_name?.toUpperCase() || ""];
          const t2Asset = TEAMS_2026[battle.driver2.team_name?.toUpperCase() || ""];

          return (
            <motion.div
              key={`${battle.driver1.driver_number}-${battle.driver2.driver_number}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onBattleClick?.(battle.driver1.driver_number)}
              className="glass-panel p-6 relative overflow-hidden group border-white/5 cursor-pointer hover:bg-white/[0.05] transition-all duration-300"
            >
              {/* Animated Progress/Gap Line (Background) */}
              <div className="absolute top-0 right-0 p-2 opacity-5">
                 <Swords size={64} className="text-white" />
              </div>

              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-f1-red" />
                   <span className="text-[10px] font-black text-white/80 uppercase tracking-widest italic leading-none">Battle for Position {battle.pos}</span>
                </div>
                {battle.overtakeMode ? (
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1], rotate: [-1, 1, -1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="flex items-center gap-1.5 bg-f1-green text-black text-[9px] font-black px-2 py-1 rounded-sm italic shadow-[0_0_15px_rgba(0,210,190,0.4)]"
                  >
                    <Zap size={10} fill="currentColor" /> X-MODE ACTIVE
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-white/20 uppercase">Aero: Balanced</span>
                    <Radio size={12} className="text-white/10" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-6 relative z-10">
                {/* Attacker (Driver Behind) */}
                <div className="flex flex-col items-center flex-1">
                  <div className="relative mb-3 group-hover:scale-105 transition-transform duration-500">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 rounded-lg" />
                    <div className="w-24 h-24 bg-white/[0.02] rounded-lg overflow-hidden border border-white/5 relative">
                       <img 
                         src={getDriverPortrait(battle.driver2.driver_number, d2Asset?.suit || battle.driver2.headshot_url)} 
                         alt={battle.driver2.name_acronym} 
                         className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                       />
                       <div className="absolute bottom-1 left-1 z-20 flex flex-col">
                          <span className="font-display font-black text-xs italic tracking-tighter text-white">{battle.driver2.name_acronym}</span>
                       </div>
                    </div>
                    <div 
                      className="absolute left-0 bottom-0 top-0 w-1" 
                      style={{ backgroundColor: t2Asset?.color || '#333' }}
                    />
                  </div>
                </div>

                {/* Gap Visualization */}
                <div className="flex flex-col items-center justify-center min-w-[100px]">
                  <motion.div 
                    key={battle.gap}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="font-mono text-2xl font-black italic italic-outline tracking-tighter text-f1-red bg-f1-red/5 px-3 py-1 rounded"
                  >
                    {battle.gap.toFixed(3)}s
                  </motion.div>
                  <div className="mt-4 flex gap-1 items-center">
                     <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">In Combat</span>
                  </div>
                </div>

                {/* Defender (Driver in Front) */}
                <div className="flex flex-col items-center flex-1">
                  <div className="relative mb-3 group-hover:scale-105 transition-transform duration-500">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 rounded-lg" />
                    <div className="w-24 h-24 bg-white/[0.02] rounded-lg overflow-hidden border border-white/5 relative">
                       <img 
                         src={getDriverPortrait(battle.driver1.driver_number, d1Asset?.suit || battle.driver1.headshot_url)} 
                         alt={battle.driver1.name_acronym} 
                         className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                       />
                       <div className="absolute bottom-1 left-1 z-20 flex flex-col">
                          <span className="font-display font-black text-xs italic tracking-tighter text-white">{battle.driver1.name_acronym}</span>
                       </div>
                    </div>
                    <div 
                      className="absolute right-0 bottom-0 top-0 w-1" 
                      style={{ backgroundColor: t1Asset?.color || '#333' }}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Bottom Line Accent */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
                 <motion.div 
                  className="h-full bg-f1-red shadow-[0_0_10px_#E10600]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.max(0, 100 - (battle.gap * 100))}%` }}
                 />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
