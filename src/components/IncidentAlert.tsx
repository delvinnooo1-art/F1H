/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, ShieldAlert, Flag } from "lucide-react";
import { FlagStatus } from "../types.ts";

interface IncidentAlertProps {
  status: FlagStatus;
  message?: string;
  visible: boolean;
}

export function IncidentAlert({ status, message, visible }: IncidentAlertProps) {
  const getColors = () => {
    switch (status) {
      case FlagStatus.RED: return "bg-f1-red text-white shadow-[0_0_50px_rgba(225,6,0,0.4)]";
      case FlagStatus.YELLOW:
      case FlagStatus.DOUBLE_YELLOW: return "bg-f1-yellow text-black shadow-[0_0_50px_rgba(255,240,0,0.3)]";
      case FlagStatus.SAFETY_CAR:
      case FlagStatus.VIRTUAL_SAFETY_CAR: return "bg-f1-yellow text-black border-l-8 border-black shadow-[0_0_60px_rgba(0,0,0,0.5)]";
      default: return "bg-f1-green text-black";
    }
  };

  const getIcon = () => {
    if (status === FlagStatus.RED) return <ShieldAlert size={28} className="text-white drop-shadow-lg" />;
    if (status === FlagStatus.YELLOW || status === FlagStatus.DOUBLE_YELLOW) return <AlertTriangle size={28} className="text-black drop-shadow-md" />;
    return <Flag size={28} className="text-black" />;
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 400, opacity: 0, skewX: -10 }}
          animate={{ x: 0, opacity: 1, skewX: 0 }}
          exit={{ x: 400, opacity: 0, skewX: 10 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-24 right-8 z-[60] pointer-events-none"
        >
          <div className={`${getColors()} p-6 flex items-center gap-6 min-w-[360px] border-b-4 border-black/20 backdrop-blur-md relative overflow-hidden`}>
            {/* Gloss shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
            
            <motion.div 
              animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="z-10"
            >
              {getIcon()}
            </motion.div>
            
            <div className="flex flex-col z-10">
              <h4 className="font-display font-black text-3xl italic uppercase leading-none tracking-tighter drop-shadow-sm">
                {status}
              </h4>
              <p className="text-xs font-black uppercase opacity-60 mt-1 max-w-[240px] tracking-widest">
                {message || "Session Status Update"}
              </p>
            </div>
            
            {/* sequential reveal bars (visual ornament) */}
            <div className="flex gap-1 ml-auto">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-1.5 h-1.5 bg-black/20 rounded-full" />
              ))}
            </div>

            <motion.div 
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 8, ease: "linear" }}
              className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30 origin-left"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
