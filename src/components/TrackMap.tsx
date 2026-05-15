/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { useCircuitAssets } from "../services/circuitAssets";
import { MapPin, Wind, Thermometer, Droplets } from "lucide-react";

interface TrackMapProps {
  session?: any;
}

export function TrackMap({ session }: TrackMapProps) {
  const assets = useCircuitAssets(session);
  const circuitName = assets.shortName || session?.circuit_short_name || "Monte Carlo";
  const mapUrl = assets.trackMap;

  return (
    <div className="glass-panel p-8 relative overflow-hidden h-full flex flex-col group">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      
      {/* Header Info */}
      <header className="flex justify-between items-start mb-8 z-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={12} className="text-f1-red" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-f1-red italic">Digital Twin Map</span>
          </div>
          <h3 className="font-display font-black text-3xl uppercase italic tracking-tighter leading-none">
            {circuitName}
          </h3>
          <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest mt-1">
            {session?.location || "Monaco"} // Season 2026
          </span>
        </div>
        
        <div className="flex flex-col items-end text-right">
           <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Track Temp</span>
                <div className="flex items-center gap-1">
                  <Thermometer size={12} className="text-f1-yellow" />
                  <span className="font-mono text-sm font-bold text-white">34.2°C</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Wind Velocity</span>
                <div className="flex items-center gap-1">
                  <Wind size={12} className="text-f1-blue" />
                  <span className="font-mono text-sm font-bold text-white">12 km/h</span>
                </div>
              </div>
           </div>
        </div>
      </header>

      {/* Main Map Container */}
      <div className="relative flex-1 flex items-center justify-center py-6 min-h-[300px]">
        {/* Animated Radar Pulse */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 2], opacity: [0.2, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
            className="w-40 h-40 border border-f1-red/30 rounded-full"
          />
        </div>

        <motion.img 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={mapUrl} 
          alt="Track Map Digital Twin" 
          className="max-h-full max-w-full object-contain invert grayscale brightness-200 opacity-80 hover:opacity-100 transition-opacity drop-shadow-[0_0_30px_rgba(255,255,255,0.05)]"
          onError={(e) => { 
            const target = e.target as HTMLImageElement;
            target.src = "/placeholders/f1_track.jpg";
          }}
          referrerPolicy="no-referrer"
        />
        
        {/* Active Aero Zones (Dynamic Markers) */}
        <div className="absolute inset-0 p-8 flex flex-col justify-end gap-2 pointer-events-none">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-f1-green shadow-[0_0_10px_#00D2BE]" />
              <span className="text-[9px] font-black text-f1-green uppercase italic tracking-widest">Active Aero: Zone 01 Enabled</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-f1-blue shadow-[0_0_10px_#3671C6]" />
              <span className="text-[9px] font-black text-f1-blue uppercase italic tracking-widest">Recuperation Active: Sector 03</span>
           </div>
        </div>
      </div>
      
      {/* Footer Connectivity Status */}
      <footer className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center bg-transparent">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Telemetry Sync</span>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-f1-green" />
               <span className="text-[10px] font-bold text-white uppercase italic tracking-tight">Active Pulse</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Sector Latency</span>
            <span className="font-mono text-[10px] font-bold text-white">4ms</span>
          </div>
        </div>

        <div className="flex gap-2">
          {["S1", "S2", "S3"].map(s => (
            <div key={s} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-sm text-[8px] font-black text-white/40 group-hover:text-f1-red transition-colors">
              {s}
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
