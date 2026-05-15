/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Activity, Gauge, Zap, Disc, ChevronRight, Users, User } from "lucide-react";
import { Driver } from "../types";
import { DRIVERS_2026, TEAMS_2026 } from "../constants/f1Data";

interface TelemetryPoint {
  time: number;
  speed: number;
  throttle: number;
  brake: number;
  gear: number;
  rpm: number;
  drs: boolean;
}

interface TelemetryDashboardProps {
  selectedDrivers: number[];
  drivers: Record<number, Driver>;
}

export function TelemetryDashboard({ selectedDrivers, drivers }: TelemetryDashboardProps) {
  const [telemetryData, setTelemetryData] = useState<Record<number, TelemetryPoint[]>>({});
  const [comparisonMode, setComparisonMode] = useState(selectedDrivers.length > 1);

  // Generate simulated telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryData(prev => {
        const newData = { ...prev };
        selectedDrivers.forEach(dNum => {
          if (!newData[dNum]) newData[dNum] = [];
          
          const lastPoint = newData[dNum][newData[dNum].length - 1] || {
            time: 0,
            speed: 280,
            throttle: 100,
            brake: 0,
            gear: 7,
            rpm: 10500,
            drs: true
          };

          const newPoint: TelemetryPoint = {
            time: lastPoint.time + 1,
            speed: Math.max(80, Math.min(340, lastPoint.speed + (Math.random() - 0.5) * 10)),
            throttle: Math.max(0, Math.min(100, lastPoint.throttle + (Math.random() - 0.5) * 20)),
            brake: Math.random() > 0.9 ? Math.random() * 100 : 0,
            gear: Math.max(1, Math.min(8, lastPoint.gear + (Math.random() > 0.95 ? (Math.random() > 0.5 ? 1 : -1) : 0))),
            rpm: 10000 + Math.random() * 2000,
            drs: lastPoint.speed > 250
          };

          newData[dNum] = [...newData[dNum].slice(-50), newPoint];
        });
        return newData;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [selectedDrivers]);

  const driver1 = selectedDrivers[0];
  const driver2 = selectedDrivers[1];

  const chartData = useMemo(() => {
    const d1Data = telemetryData[driver1] || [];
    const d2Data = telemetryData[driver2] || [];
    
    return d1Data.map((p, i) => ({
      time: p.time,
      p1Speed: p.speed,
      p1Throttle: p.throttle,
      p1Brake: p.brake,
      p2Speed: d2Data[i]?.speed,
      p2Throttle: d2Data[i]?.throttle,
      p2Brake: d2Data[i]?.brake,
    }));
  }, [telemetryData, driver1, driver2]);

  const d1Info = drivers[driver1];
  const d1Asset = DRIVERS_2026[driver1?.toString()];
  const d1Team = TEAMS_2026[d1Info?.team_name?.toUpperCase() || ""];

  const d2Info = drivers[driver2];
  const d2Asset = DRIVERS_2026[driver2?.toString()];
  const d2Team = TEAMS_2026[d2Info?.team_name?.toUpperCase() || ""];

  return (
    <div className="flex flex-col gap-6 h-full text-white">
      {/* Header / Selection Control */}
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-4 rounded-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-lg bg-f1-red/10 border border-f1-red/20 flex items-center justify-center">
               <Activity className="text-f1-red" />
             </div>
             <div>
               <h3 className="font-display font-black text-xl uppercase italic tracking-tighter">Engineering <span className="text-f1-red">Terminal</span></h3>
               <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Live Multi-Channel Telemetry Stream</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setComparisonMode(false)}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${!comparisonMode ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-white/40'}`}
          >
            <User className="inline-block mr-2" size={12} /> Individual
          </button>
          <button 
            onClick={() => setComparisonMode(true)}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${comparisonMode ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-white/40'}`}
          >
            <Users className="inline-block mr-2" size={12} /> Comparative
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
        {/* Speed & Delta Graph */}
        <div className="glass-panel p-6 flex flex-col gap-6 border-white/5 min-h-[400px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="text-f1-green" size={16} />
              <span className="text-xs font-black uppercase tracking-widest text-white/60 italic">Velocity Delta (km/h)</span>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d1Team?.color || '#FF1801' }} />
                <span className="font-mono text-[10px] font-bold uppercase">{d1Info?.name_acronym}</span>
              </div>
              {comparisonMode && d2Info && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d2Team?.color || '#00D2BE' }} />
                  <span className="font-mono text-[10px] font-bold uppercase">{d2Info.name_acronym}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorD1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={d1Team?.color || '#FF1801'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={d1Team?.color || '#FF1801'} stopOpacity={0}/>
                  </linearGradient>
                  {comparisonMode && (
                    <linearGradient id="colorD2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={d2Team?.color || '#00D2BE'} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={d2Team?.color || '#00D2BE'} stopOpacity={0}/>
                    </linearGradient>
                  )}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis hide dataKey="time" />
                <YAxis domain={[0, 360]} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(20, 20, 20, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }}
                  itemStyle={{ padding: '2px 0' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="p1Speed" 
                  stroke={d1Team?.color || '#FF1801'} 
                  fillOpacity={1} 
                  fill="url(#colorD1)" 
                  strokeWidth={2}
                  isAnimationActive={false}
                />
                {comparisonMode && (
                  <Area 
                    type="monotone" 
                    dataKey="p2Speed" 
                    stroke={d2Team?.color || '#00D2BE'} 
                    fillOpacity={1} 
                    fill="url(#colorD2)" 
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <span className="text-[8px] font-black uppercase text-white/30 tracking-widest block mb-1">Max Velocity</span>
              <span className="font-mono text-xl font-bold">{Math.round(chartData[chartData.length-1]?.p1Speed || 0)} <span className="text-[10px] text-white/20">KM/H</span></span>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <span className="text-[8px] font-black uppercase text-white/30 tracking-widest block mb-1">Live RPM</span>
              <span className="font-mono text-xl font-bold">11,402 <span className="text-[10px] text-white/20">RPM</span></span>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <span className="text-[8px] font-black uppercase text-white/30 tracking-widest block mb-1">Active Aero</span>
              <span className="font-mono text-xl font-bold text-f1-green">O_MODE</span>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <span className="text-[8px] font-black uppercase text-white/30 tracking-widest block mb-1">PU Deploy</span>
              <span className="font-mono text-xl font-bold text-f1-yellow">KINETIC</span>
            </div>
          </div>
        </div>

        {/* Input Comparison (Throttle/Brake) */}
        <div className="glass-panel p-6 flex flex-col gap-6 border-white/5 min-h-[400px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Disc className="text-f1-red" size={16} />
              <span className="text-xs font-black uppercase tracking-widest text-white/60 italic">Driver Inputs (%)</span>
            </div>
          </div>

          <div className="flex-1 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis hide dataKey="time" />
                <YAxis domain={[0, 100]} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(20, 20, 20, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }}
                />
                <Line 
                  type="stepAfter" 
                  dataKey="p1Throttle" 
                  stroke={d1Team?.color || '#FF1801'} 
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  name={`${d1Info?.name_acronym} Throttle`}
                />
                <Line 
                  type="stepAfter" 
                  dataKey="p1Brake" 
                  stroke="#FF1801" 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                  name={`${d1Info?.name_acronym} Brake`}
                />
                {comparisonMode && (
                  <>
                    <Line 
                      type="stepAfter" 
                      dataKey="p2Throttle" 
                      stroke={d2Team?.color || '#00D2BE'} 
                      strokeWidth={2}
                      opacity={0.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line 
                      type="stepAfter" 
                      dataKey="p2Brake" 
                      stroke="#00D2BE" 
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      opacity={0.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pedals Viz */}
          <div className="flex gap-4 h-32">
             <div className="flex-1 flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase text-white/20">{d1Info?.name_acronym} INPUT</span>
                <div className="flex-1 flex gap-2">
                   <div className="flex-1 bg-white/5 rounded-lg relative overflow-hidden">
                      <motion.div 
                        animate={{ height: `${chartData[chartData.length-1]?.p1Throttle || 0}%` }}
                        className="absolute bottom-0 w-full bg-f1-green opacity-50"
                      />
                      <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold">THROTTLE</div>
                   </div>
                   <div className="flex-1 bg-white/5 rounded-lg relative overflow-hidden">
                      <motion.div 
                        animate={{ height: `${chartData[chartData.length-1]?.p1Brake || 0}%` }}
                        className="absolute bottom-0 w-full bg-f1-red opacity-50"
                      />
                      <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold">BRAKE</div>
                   </div>
                </div>
             </div>
             {comparisonMode && (
               <div className="flex-1 flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase text-white/20">{d2Info?.name_acronym} INPUT</span>
                  <div className="flex-1 flex gap-2">
                     <div className="flex-1 bg-white/5 rounded-lg relative overflow-hidden">
                        <motion.div 
                          animate={{ height: `${chartData[chartData.length-1]?.p2Throttle || 0}%` }}
                          className="absolute bottom-0 w-full bg-f1-green opacity-30"
                        />
                        <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold">THROTTLE</div>
                     </div>
                     <div className="flex-1 bg-white/5 rounded-lg relative overflow-hidden">
                        <motion.div 
                          animate={{ height: `${chartData[chartData.length-1]?.p2Brake || 0}%` }}
                          className="absolute bottom-0 w-full bg-f1-red opacity-30"
                        />
                        <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold">BRAKE</div>
                     </div>
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Engineering Info Strip */}
      <div className="bg-f1-red/10 border border-f1-red/20 p-4 rounded-xl flex items-center gap-6">
        <div className="p-2 bg-f1-red rounded flex items-center justify-center">
          <Zap className="text-white" size={16} />
        </div>
        <div className="flex-1 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-f1-red">System Alert</span>
            <span className="text-xs font-bold italic">2026 ACTIVE AERO // DRIVER COMMAND: OVERTAKE MODE ALLOWED</span>
          </div>
          <div className="hidden md:flex gap-8">
            <div className="flex flex-col items-end">
               <span className="text-[8px] font-black uppercase text-white/20">Flow Check</span>
               <span className="font-mono text-xs text-f1-green">PASS</span>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[8px] font-black uppercase text-white/20">Encryption</span>
               <span className="font-mono text-xs text-f1-green">SSL/256</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
