/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Session } from "../types.ts";
import { MapPin, Calendar, Radio, Info } from "lucide-react";
import { useCircuitAssets } from "../services/circuitAssets.ts";
import { motion } from "motion/react";

interface SessionInfoProps {
  session: Session | null;
}

export function SessionInfo({ session }: SessionInfoProps) {
  const assets = useCircuitAssets(session);

  if (!session) return (
    <div className="flex flex-col gap-2">
      <div className="h-4 w-32 bg-white/5 animate-pulse rounded-sm" />
      <div className="h-10 w-80 bg-white/5 animate-pulse rounded-sm" />
    </div>
  );

  return (
    <div className="flex flex-col relative">
      {/* Top Metadata */}
      <div className="flex items-center gap-4 text-white/30 mb-3">
        <div className="flex items-center gap-1.5 transition-colors hover:text-white/60 cursor-default">
          <Calendar size={12} className="text-f1-red" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{session.year} ERA</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-white/10" />
        <div className="flex items-center gap-1.5 transition-colors hover:text-white/60 cursor-default">
          <MapPin size={12} className="text-f1-red" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{assets.location?.toUpperCase()}</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 ml-4 px-2 py-0.5 bg-white/5 border border-white/10 rounded-sm">
           <Radio size={10} className="text-f1-green animate-pulse" />
           <span className="text-[9px] font-black uppercase text-f1-green tracking-widest">Digital Twin Status: Online</span>
        </div>
      </div>
      
      {/* Main Title Group */}
      <div className="flex flex-col group">
        <h1 className="font-display font-black text-4xl md:text-6xl uppercase italic tracking-tighter leading-[0.8] mb-4 group-hover:tracking-tight transition-all duration-700">
          <span className="text-white/40 block text-2xl md:text-3xl mb-1">{assets.shortName || "FORMULA 1"}</span>
          {assets.name?.split(' ').map((word, i) => (
             <span key={i} className={i === 0 ? "text-white" : "text-f1-red"}> {word}</span>
          ))}
        </h1>
        
        {/* Status Pills */}
        <div className="flex items-center gap-3">
          <motion.div 
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-f1-red text-white text-[11px] font-black px-4 py-1 uppercase italic rounded-sm skew-x-[-15deg] shadow-[0_0_20px_rgba(225,6,0,0.3)]"
          >
            <span className="block skew-x-[15deg]">FIA OFFICIAL HUB</span>
          </motion.div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-sm">
             <Info size={12} className="text-white/40" />
             <span className="font-display font-bold text-xs uppercase text-white/50 tracking-tighter">
                {session.session_name || "Season Round"}
             </span>
          </div>
        </div>
      </div>

      {/* Synchronous Scanning Line (Subtle) */}
      <div className="absolute -left-4 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />
    </div>
  );
}
