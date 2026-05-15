/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { Driver, Lap } from "../types.ts";
import { Timer } from "lucide-react";
import { getDriverPortrait } from "../services/driverPhotos.ts";

interface FastestLapBannerProps {
  driver: Driver;
  lap: Lap;
  visible: boolean;
}

export function FastestLapBanner({ driver, lap, visible }: FastestLapBannerProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4"
        >
          <div className="bg-f1-purple relative overflow-hidden rounded-lg shadow-[0_0_50px_rgba(180,0,191,0.5)] border border-white/30 backdrop-blur-md">
            {/* Animated background sweep - Broadcast style */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] z-10"
            />
            
            <div className="relative p-8 flex items-center justify-between z-20">
              <div className="flex items-center gap-8">
                <motion.div 
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/40 overflow-hidden shadow-2xl relative"
                >
                   {driver && (
                     <img 
                       src={getDriverPortrait(driver.driver_number, driver.headshot_url)} 
                       alt={driver.broadcast_name}
                       className="w-full h-full object-contain filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] scale-110 translate-y-1"
                     />
                   )}
                </motion.div>
                
                <div className="flex flex-col gap-1">
                  <motion.h3 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-display font-black text-3xl italic tracking-tighter text-white uppercase leading-none drop-shadow-md"
                  >
                    Purple Sector <span className="text-white/60">Performance</span>
                  </motion.h3>
                  
                  <div className="flex flex-col">
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="font-display font-black text-5xl text-white italic tracking-tighter drop-shadow-xl"
                    >
                      {driver?.name_acronym || "---"}
                    </motion.span>
                    
                    <motion.div 
                      className="flex items-center gap-4 mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span className="font-mono text-4xl font-black text-white italic">
                        {lap.lap_duration.toFixed(3)}
                      </span>
                      <div className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black text-white italic uppercase tracking-widest">
                        NEW FASTEST LAP
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 min-w-[120px]">
                <div className="flex gap-2">
                  {[1, 2, 3].map((s, idx) => (
                    <motion.div 
                      key={s}
                      initial={{ scale: 0, rotateY: 90 }}
                      animate={{ scale: 1, rotateY: 0 }}
                      transition={{ delay: 0.5 + (idx * 0.2), type: "spring" }}
                      className="w-10 h-3 bg-white rounded-sm shadow-lg"
                    />
                  ))}
                </div>
                <div className="flex flex-col items-end">
                   <div className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] italic mb-1">Sector Dominance</div>
                   <div className="h-1 w-24 bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, delay: 1 }}
                        className="h-full bg-white shadow-[0_0_10px_white]"
                      />
                   </div>
                </div>
              </div>
            </div>
            
            {/* Bottom progress bar */}
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 8 }}
              className="h-1 bg-white origin-left"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
