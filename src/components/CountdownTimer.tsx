/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Timer, Clock, MapPin, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CountdownTimerProps {
  raceDate: string;
  raceTime: string;
  raceName: string;
  location: string;
}

export function CountdownTimer({ raceDate, raceTime, raceName, location }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const raceDateTime = new Date(`${raceDate}T${raceTime.endsWith('Z') ? raceTime : `${raceTime}Z`}`);
      const now = new Date();
      const difference = raceDateTime.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [raceDate, raceTime]);

  const raceDateTime = new Date(`${raceDate}T${raceTime.endsWith('Z') ? raceTime : `${raceTime}Z`}`);

  return (
    <div className="glass-panel overflow-hidden relative group">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-f1-red/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-f1-red/10 transition-colors" />
      
      {/* Scanning Line */}
      <motion.div 
        animate={{ left: ["-100%", "200%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 h-[1px] w-full bg-gradient-to-r from-transparent via-f1-red/20 to-transparent pointer-events-none"
      />

      <div className="p-8">
        <header className="flex flex-col md:flex-row justify-between items-start mb-10 gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-f1-red animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-f1-red italic">Next Event</span>
            </div>
            <h3 className="font-display font-black text-4xl uppercase italic tracking-tighter leading-none">
              {raceName}
            </h3>
            <div className="flex items-center gap-2 text-white/40 mt-1">
              <MapPin size={12} className="text-white/20" />
              <span className="text-[11px] font-bold uppercase tracking-wider">{location}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end md:text-right">
             <div className="flex items-center gap-2 mb-2">
                <Globe size={14} className="text-white/20" />
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none">Track Intelligence</span>
             </div>
             <div className="glass-panel py-1.5 px-3 border-white/10">
                <span className="text-[10px] font-mono font-bold text-white tracking-tight">GP-STATUS: PENDING</span>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-4 gap-4 mb-10 relative">
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hrs", value: timeLeft.hours },
            { label: "Min", value: timeLeft.minutes },
            { label: "Sec", value: timeLeft.seconds }
          ].map((item, i) => (
            <div key={item.label} className="flex flex-col">
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={item.value}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -5, opacity: 0 }}
                    className="font-display font-black text-4xl md:text-6xl italic tracking-tighter leading-none block"
                  >
                    {item.value.toString().padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
                {i < 3 && <span className="absolute right-[-10px] top-1 text-white/10 font-black text-3xl">:</span>}
              </div>
              <span className="text-[10px] uppercase font-black text-white/20 tracking-widest mt-2">{item.label}</span>
            </div>
          ))}
        </div>

        <footer className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-white/5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Clock size={12} className="text-f1-red" />
              <span className="text-[8px] uppercase font-black text-white/30 tracking-widest">Local Track Time</span>
            </div>
            <span className="font-mono text-xs font-bold text-white/80">
              {raceDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
            </span>
          </div>
          
          <div className="flex flex-col gap-1.5 items-start sm:items-end sm:text-right">
            <div className="flex items-center gap-2">
              <span className="text-[8px] uppercase font-black text-white/30 tracking-widest">Your Device Time</span>
              <Timer size={12} className="text-f1-blue" />
            </div>
            <span className="font-mono text-xs font-bold text-white/80">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
