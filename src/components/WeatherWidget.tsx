/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Weather } from "../types.ts";
import { Thermometer, Droplets, Wind, CloudRain } from "lucide-react";

interface WeatherWidgetProps {
  weather: Weather | null;
}

export function WeatherWidget({ weather }: WeatherWidgetProps) {
  if (!weather) return null;

  return (
    <div className="glass-panel p-4 flex gap-3 md:gap-6 items-center overflow-x-auto no-scrollbar">
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="flex items-center gap-2 text-white/60">
          <Thermometer size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Air</span>
        </div>
        <span className="font-display font-medium text-lg">{weather.air_temperature}°C</span>
      </div>

      <div className="w-px h-8 bg-white/10" />

      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 text-white/60">
          <Activity size={14} className="" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Track</span>
        </div>
        <span className="font-display font-medium text-lg">{weather.track_temperature}°C</span>
      </div>

      <div className="w-px h-8 bg-white/10" />

      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 text-white/60">
          <Droplets size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Humidity</span>
        </div>
        <span className="font-display font-medium text-lg">{weather.humidity}%</span>
      </div>

      {weather.rainfall > 0 && (
        <>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-f1-red">
              <CloudRain size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Rain</span>
            </div>
            <span className="font-display font-medium text-lg text-f1-red">Detected</span>
          </div>
        </>
      )}
    </div>
  );
}

function Activity({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
