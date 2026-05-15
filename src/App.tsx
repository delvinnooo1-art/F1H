/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  fetchLatestSession, 
  fetchDrivers, 
  fetchLatestPositions, 
  fetchIntervals, 
  fetchLatestLaps, 
  fetchStints, 
  fetchWeather, 
  fetchRaceControl,
  fetchNextRace,
  fetchDriverStandings,
  fetchConstructorStandings
} from "./services/api.ts";
import { 
  Driver, 
  Session, 
  Position, 
  Interval, 
  Lap, 
  Stint, 
  Weather, 
  RaceControl, 
  FlagStatus 
} from "./types.ts";
import { TimingTower } from "./components/TimingTower.tsx";
import { SessionInfo } from "./components/SessionInfo.tsx";
import { WeatherWidget } from "./components/WeatherWidget.tsx";
import { FastestLapBanner } from "./components/FastestLapBanner.tsx";
import { IncidentAlert } from "./components/IncidentAlert.tsx";
import { BattleMode } from "./components/BattleMode.tsx";
import { CountdownTimer } from "./components/CountdownTimer.tsx";
import { TrackMap } from "./components/TrackMap.tsx";
import { F1Guide } from "./components/F1Guide.tsx";
import { CarUpdates } from "./components/CarUpdates.tsx";
import { FeaturedNews } from "./components/FeaturedNews.tsx";
import { TechInsights } from "./components/TechInsights.tsx";
import { NewsList } from "./components/NewsList.tsx";
import { TelemetryDashboard } from "./components/TelemetryDashboard.tsx";
import { LayoutGrid, List, BarChart2, Settings, MessageSquare, BookOpen, Cpu, ArrowUpRight, Activity, Radio, Trophy, Globe, ShieldAlert, Cpu as Engine, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getTrackMapUrl } from "./services/assetManager.ts";
import { getDriverPortrait } from "./services/driverPhotos";
import { DRIVERS_2026, TEAMS_2026 } from "./constants/f1Data";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [nextRace, setNextRace] = useState<any>(null);
  const [drivers, setDrivers] = useState<Record<number, Driver>>({});
  const [positions, setPositions] = useState<number[]>([]);
  const [intervals, setIntervals] = useState<Record<number, Interval>>({});
  const [laps, setLaps] = useState<Record<number, Lap>>({});
  const [stints, setStints] = useState<Record<number, Stint>>({});
  const [weather, setWeather] = useState<Weather | null>(null);
  const [raceControl, setRaceControl] = useState<RaceControl[]>([]);
  const [trackStatus, setTrackStatus] = useState<FlagStatus>(FlagStatus.GREEN);
  const [pushLapDrivers] = useState<number[]>([]); // Initialize as empty for now
  
  // Standings Data
  const [driverStandings, setDriverStandings] = useState<any[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<any[]>([]);
  const [standingsType, setStandingsType] = useState<"drivers" | "constructors">("drivers");
  
  // UI States
  const [activeTab, setActiveTab] = useState<"dashboard" | "standings" | "telemetry" | "news" | "guide" | "cars">("dashboard");
  const [activeTelemetryDrivers, setActiveTelemetryDrivers] = useState<number[]>([1, 44]); // Default to Max and Lewis/Placeholder 2026 numbers
  const [fastestLapDriver, setFastestLapDriver] = useState<Driver | null>(null);
  const [fastestLapData, setFastestLapData] = useState<Lap | null>(null);
  const [showFastestLap, setShowFastestLap] = useState(false);
  const [showIncident, setShowIncident] = useState(false);
  const [latestIncident, setLatestIncident] = useState<RaceControl | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Computed Session Data
  const activeSessionForInfo = useMemo(() => {
    if (session) {
       const sessionStart = new Date(session.date_start).getTime();
       const now = new Date().getTime();
       if (Math.abs(now - sessionStart) < 7 * 24 * 60 * 60 * 1000) return session;
    }
    if (nextRace) {
      return {
         session_key: 0,
         session_name: "Upcoming Race",
         session_type: "Race",
         year: new Date(nextRace.date).getFullYear() || 2026,
         circuit_key: 0,
         circuit_short_name: nextRace.raceName?.replace(/ Grand Prix/i, '') || nextRace.Circuit?.circuitName,
         country_name: nextRace.Circuit?.Location?.country || "World",
         location: nextRace.Circuit?.Location?.locality || "Paddock",
         date_start: `${nextRace.date}T${nextRace.time || '00:00:00Z'}`,
         date_end: `${nextRace.date}T${nextRace.time || '00:00:00Z'}`,
         gmt_offset: "0"
      };
    }
    return null;
  }, [session, nextRace]);

  // Initial Data Fetch
  useEffect(() => {
    async function init() {
      try {
        const [latest, next, dStandings, cStandings] = await Promise.all([
          fetchLatestSession(),
          fetchNextRace(),
          fetchDriverStandings(),
          fetchConstructorStandings()
        ]);

        if (next) setNextRace(next);
        if (dStandings) setDriverStandings(dStandings);
        if (cStandings) setConstructorStandings(cStandings);

        if (latest) {
          setSession(latest);
          const driverData = await fetchDrivers(latest.session_key);
          const mappedDrivers: Record<number, Driver> = {};
          if (Array.isArray(driverData)) {
            driverData.forEach(d => { mappedDrivers[d.driver_number] = d; });
          }
          setDrivers(mappedDrivers);
        }
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Polling Real-time Data
  const poll = useCallback(async () => {
    if (!session) return;
    setIsSyncing(true);

    try {
      const [posData, intData, lapData, stintData, weatherData, rcData] = await Promise.all([
        fetchLatestPositions(session.session_key),
        fetchIntervals(session.session_key),
        fetchLatestLaps(session.session_key),
        fetchStints(session.session_key),
        fetchWeather(session.session_key),
        fetchRaceControl(session.session_key)
      ]);

      // Positions Map
      if (Array.isArray(posData) && posData.length > 0) {
        const latestPosMap: Record<number, { pos: number, date: string }> = {};
        posData.forEach(p => {
          if (!latestPosMap[p.driver_number] || new Date(p.date) > new Date(latestPosMap[p.driver_number].date)) {
            latestPosMap[p.driver_number] = { pos: p.position, date: p.date };
          }
        });
        const sortedPositions = Object.entries(latestPosMap)
          .sort((a, b) => a[1].pos - b[1].pos)
          .map(entry => parseInt(entry[0]))
          .filter(num => !isNaN(num) && num > 0);
        setPositions(sortedPositions);
      }

      // Intervals
      const intMap: Record<number, Interval> = {};
      if (Array.isArray(intData)) {
        intData.forEach(i => {
          if (!intMap[i.driver_number] || new Date(i.date) > new Date(intMap[i.driver_number].date)) {
            intMap[i.driver_number] = i;
          }
        });
      }
      setIntervals(intMap);

      // Laps & Fastest Lap
      const lapMap: Record<number, Lap> = {};
      let currentFastest: Lap | null = null;
      if (Array.isArray(lapData)) {
        lapData.forEach(l => {
          if (l.lap_duration > 0) {
            if (!lapMap[l.driver_number] || l.lap_number > lapMap[l.driver_number].lap_number) {
              lapMap[l.driver_number] = l;
            }
            if (!currentFastest || l.lap_duration < currentFastest.lap_duration) {
              currentFastest = l;
            }
          }
        });
      }
      setLaps(lapMap);

      if (currentFastest && (!fastestLapData || (currentFastest as Lap).lap_duration < fastestLapData.lap_duration)) {
        const fl = currentFastest as Lap;
        setFastestLapData(fl);
        setFastestLapDriver(drivers[fl.driver_number] || null);
        setShowFastestLap(true);
        setTimeout(() => setShowFastestLap(false), 8000);
      }

      // Stints & Tyres
      const stintMap: Record<number, Stint> = {};
      if (Array.isArray(stintData)) {
        stintData.forEach(s => {
          if (!stintMap[s.driver_number] || s.stint_number > stintMap[s.driver_number].stint_number) {
            stintMap[s.driver_number] = s;
          }
        });
      }
      setStints(stintMap);

      // Weather & Race Control
      if (Array.isArray(weatherData) && weatherData.length > 0) setWeather(weatherData[weatherData.length - 1]);
      if (Array.isArray(rcData) && rcData.length > 0) {
        const latest = rcData[rcData.length - 1];
        if (!latestIncident || latest.date !== latestIncident.date) {
          setLatestIncident(latest);
          if (latest.flag) setTrackStatus(latest.flag as FlagStatus);
          if (latest.category === "Flag" || latest.category === "Incident") {
            setShowIncident(true);
            setTimeout(() => setShowIncident(false), 8000);
          }
        }
        setRaceControl(rcData);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [session, drivers, fastestLapData, latestIncident]);

  useEffect(() => {
    if (session) {
      poll();
      const intervalId = setInterval(poll, 5000);
      return () => clearInterval(intervalId);
    }
  }, [session, poll]);

  // Battles Analysis (2026 Active Aero Context)
  const battles = useMemo(() => {
    const list: any[] = [];
    positions.forEach((dNum, idx) => {
      if (idx === 0) return;
      const interval = intervals[dNum];
      if (interval && interval.interval !== null && interval.interval < 1.1) {
        const d1 = drivers[positions[idx - 1]];
        const d2 = drivers[dNum];
        if (d1 && d2) {
          list.push({
            pos: idx + 1,
            driver1: d1,
            driver2: d2,
            gap: interval.interval,
            overtakeMode: interval.interval < 1.0 // Active Aero / Overtake Trigger
          });
        }
      }
    });
    return list.slice(0, 3);
  }, [positions, intervals, drivers]);

  // Loading State
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-f1-black gap-6">
        <div className="relative w-24 h-24">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-t-2 border-f1-red rounded-full"
          />
          <div className="absolute inset-2 border border-white/5 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Radio className="text-f1-red animate-pulse" size={24} />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="font-display font-black text-2xl uppercase italic tracking-tighter f1-gradient-text">F1HUB 2026</span>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Initialising Digital Twin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-f1-black text-white selection:bg-f1-red selection:text-white">
      {/* Cinematic Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(225,6,0,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(54,113,198,0.05),transparent_40%)]" />
        <div className="scanline" />
      </div>

      {/* Broadcast Overlays */}
      <FastestLapBanner driver={fastestLapDriver!} lap={fastestLapData!} visible={showFastestLap} />
      <IncidentAlert status={trackStatus} message={latestIncident?.message} visible={showIncident} />

      {/* Main Content Area */}
      <main className="relative z-10 max-w-[1700px] mx-auto px-4 md:px-8 pt-8 pb-32 h-auto lg:h-screen lg:overflow-hidden">
        
        {/* Futuristic Global Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-f1-red flex items-center justify-center rounded-sm rotate-3 shadow-[0_0_20px_rgba(225,6,0,0.2)]">
                   <h1 className="font-display font-black text-2xl italic text-white -skew-x-12">H</h1>
                 </div>
                 <div className="flex flex-col">
                   <span className="font-display font-black text-2xl uppercase italic tracking-tighter leading-none">F1<span className="text-f1-red">HUB</span></span>
                   <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">Broadcast Intel // Season 26</span>
                 </div>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-6 border-l border-white/10 pl-6 h-10">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Network Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-f1-green" />
                    <span className="text-[10px] font-black uppercase italic text-white">Encrypted Signal</span>
                  </div>
               </div>
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Telemetry Node</span>
                  <span className="font-mono text-[10px] font-bold text-white uppercase italic tracking-tighter">node-26.rc.01</span>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="glass-panel py-2 px-4 border-white/10 flex items-center gap-4">
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Device Time</span>
                   <span className="font-mono text-xs font-bold text-white/60">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-f1-red uppercase tracking-widest">Circuit Time</span>
                   <span className="font-mono text-xs font-bold text-f1-red">
                     {activeSessionForInfo?.gmt_offset ? 
                       new Date(new Date().getTime() + (parseFloat(activeSessionForInfo.gmt_offset) * 3600)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                       "--:--"}
                   </span>
                </div>
             </div>
             
             <div className="hidden sm:flex items-center gap-3 glass-panel-hover p-2 rounded-lg cursor-pointer">
                <Globe size={18} className="text-white/40" />
                <ShieldAlert size={18} className="text-white/40" />
             </div>
          </div>
        </header>

        <section className="h-full lg:h-[calc(100vh-14rem)]">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-[24rem_1fr] gap-8 h-full"
              >
                {/* Sidebar: Premium Timing Tower */}
                <aside className="h-[400px] lg:h-full overflow-hidden order-2 lg:order-1">
                  <TimingTower 
                    drivers={Object.values(drivers)}
                    timingData={positions.map((num, idx) => ({
                      driver_number: num,
                      position: idx + 1,
                      last_lap: laps[num],
                      best_lap: fastestLapData?.driver_number === num ? fastestLapData : undefined,
                      interval: intervals[num],
                      stint: stints[num]
                    }))}
                    highlightedDriverId={fastestLapDriver?.driver_number}
                    fastestLap={fastestLapData}
                    pushLapDrivers={pushLapDrivers}
                    isSyncing={isSyncing}
                    onDriverClick={(dNum) => {
                      setActiveTelemetryDrivers(prev => {
                        if (prev.includes(dNum)) return prev;
                        return [dNum, prev[0]].slice(0, 2);
                      });
                      setActiveTab("telemetry");
                    }}
                  />
                </aside>

                {/* Main Content: News, Map, Countdown */}
                <div className="flex flex-col gap-8 h-full lg:overflow-y-auto pr-0 lg:pr-4 custom-scrollbar order-1 lg:order-2">
                   <div className="flex flex-col xl:flex-row gap-8 items-start">
                      <div className="flex-1 w-full">
                        <FeaturedNews 
                          circuitName={activeSessionForInfo?.circuit_short_name || "Modern GP"} 
                          onClick={() => setActiveTab("news")}
                        />
                      </div>
                      <div className="w-full xl:w-[400px] shrink-0">
                         {nextRace && (
                           <CountdownTimer 
                             raceDate={nextRace.date} 
                             raceTime={nextRace.time} 
                             raceName={nextRace.raceName} 
                             location={nextRace.Circuit?.Location?.locality || "Global"}
                           />
                         )}
                      </div>
                   </div>

                   <section className="grid grid-cols-1 xl:grid-cols-[1fr_24rem] gap-8">
                      <BattleMode battles={battles} onBattleClick={() => setActiveTab("telemetry")} />
                      <TrackMap session={activeSessionForInfo} />
                   </section>

                   <TechInsights />
                </div>
              </motion.div>
            )}

            {activeTab === "standings" && (
              <motion.div 
                key="standings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="h-full flex flex-col gap-8"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex flex-col gap-2">
                    <h2 className="font-display font-black text-4xl md:text-5xl uppercase italic tracking-tighter">Season <span className="text-f1-red">Standings</span></h2>
                    <span className="text-[10px] font-black uppercase text-white/30 tracking-[0.5em] italic">Official F1 Championship Point Tally</span>
                  </div>
                  <div className="glass-panel p-1.5 flex gap-1">
                    <button 
                      onClick={() => setStandingsType("drivers")}
                      className={`px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest italic transition-all ${standingsType === 'drivers' ? 'bg-f1-red text-white' : 'text-white/40 hover:text-white'}`}
                    >
                      Drivers
                    </button>
                    <button 
                      onClick={() => setStandingsType("constructors")}
                      className={`px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest italic transition-all ${standingsType === 'constructors' ? 'bg-f1-red text-white' : 'text-white/40 hover:text-white'}`}
                    >
                      Teams
                    </button>
                  </div>
                </div>

                <div className="glass-panel flex-1 overflow-y-auto p-8 border-white/5 relative">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                     <Trophy size={120} />
                  </div>
                  {standingsType === "drivers" ? (
                    <div className="flex flex-col gap-1">
                       {driverStandings.map((ds, idx) => {
                          const teamAsset = TEAMS_2026[ds.Constructors[0]?.name?.toUpperCase() || ""];
                          const driverRef = (Object.values(drivers) as Driver[]).find(d => d.last_name === ds.Driver.familyName);
                          return (
                            <motion.div 
                               key={ds.Driver.driverId} 
                               initial={{ opacity: 0, x: -10 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: idx * 0.05 }}
                               className="flex items-center justify-between p-3 glass-panel-hover border border-white/5 bg-white/[0.01] group cursor-pointer"
                               onClick={() => {
                                 if (driverRef) {
                                   setActiveTelemetryDrivers([driverRef.driver_number, activeTelemetryDrivers[0]]);
                                   setActiveTab("telemetry");
                                 }
                               }}
                            >
                               <div className="flex items-center gap-4">
                                  <div className="w-8 font-display font-black text-xl italic text-white/20 group-hover:text-f1-red">{ds.position}</div>
                                  <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/5">
                                     <img 
                                       src={getDriverPortrait(driverRef?.driver_number || ds.Driver.driverId, driverRef?.headshot_url)} 
                                       alt={ds.Driver.familyName}
                                       className="w-full h-full object-cover grayscale group-hover:grayscale-0"
                                     />
                                  </div>
                                  <div className="flex flex-col">
                                     <span className="font-display font-black text-lg uppercase italic tracking-tighter leading-none">{ds.Driver.givenName} {ds.Driver.familyName}</span>
                                     <div className="flex items-center gap-2 mt-1">
                                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: teamAsset?.color || '#333' }} />
                                       <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{ds.Constructors[0]?.name}</span>
                                     </div>
                                  </div>
                               </div>
                               <div className="flex items-center gap-8">
                                  <div className="flex flex-col items-end">
                                     <span className="font-mono text-xl font-bold f1-gradient-text">{ds.points}</span>
                                     <span className="text-[8px] font-black uppercase text-white/20">Points</span>
                                  </div>
                                  <ChevronRight className="text-white/10 group-hover:text-f1-red transition-colors" size={16} />
                                </div>
                            </motion.div>
                          );
                       })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {constructorStandings.map((cs) => {
                         const teamAsset = TEAMS_2026[cs.Constructor.name?.toUpperCase() || ""];
                         return (
                           <div key={cs.Constructor.constructorId} className="glass-panel p-8 flex justify-between items-center group relative overflow-hidden">
                              <div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: teamAsset?.color || '#333' }} />
                              <div className="flex flex-col gap-1">
                                 <span className="text-4xl font-display font-black italic text-white/20">{cs.position}</span>
                                 <h3 className="font-display font-black text-2xl uppercase italic tracking-tighter">{cs.Constructor.name}</h3>
                              </div>
                              <span className="font-mono text-5xl font-black text-f1-red">{cs.points}</span>
                           </div>
                         );
                       })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "news" && (
              <motion.div 
                key="news"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col gap-10"
              >
                <header className="flex justify-between items-end border-b border-white/5 pb-8">
                   <div className="flex flex-col gap-2">
                      <h2 className="font-display font-black text-4xl md:text-6xl uppercase italic tracking-tighter leading-none">THE PADDOCK <span className="text-f1-red">INTELLIGENCE</span></h2>
                      <p className="text-white/40 font-medium uppercase tracking-[0.4em] text-[10px]">Verified 2026 editorial analysis and live technical feed</p>
                   </div>
                   <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-sm">
                      <div className="w-2 h-2 rounded-full bg-f1-red animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Broadcast Signal Active</span>
                   </div>
                </header>
 
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-12 overflow-hidden">
                   <div className="flex flex-col gap-8 overflow-y-auto pr-6 custom-scrollbar no-scrollbar">
                      <NewsList />
                   </div>
 
                   <aside className="hidden xl:flex flex-col gap-8">
                      <div className="cyber-panel p-8 bg-gradient-to-br from-f1-red/10 to-transparent flex flex-col gap-6">
                         <h4 className="font-display font-black text-xl uppercase italic tracking-tighter text-f1-red">The Pulse</h4>
                         <div className="space-y-6">
                            <div className="flex justify-between items-center">
                               <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Track Temp</span>
                               <span className="font-mono text-xl font-bold">{weather?.track_temperature || '--'}°C</span>
                            </div>
                            <div className="flex justify-between items-center">
                               <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Humidity</span>
                               <span className="font-mono text-xl font-bold text-f1-yellow">{weather?.humidity || '--'}%</span>
                            </div>
                         </div>
                      </div>
 
                      <div className="cyber-panel p-8 flex flex-col gap-6">
                         <h4 className="font-display font-black text-xs uppercase tracking-widest text-white/20 italic">Digital Sources</h4>
                         <div className="flex flex-col gap-4">
                            {["Motorsport.com", "The Race", "RaceFans", "Autosport"].map(source => (
                              <a href="#" key={source} className="flex items-center justify-between group">
                                <span className="text-xs font-bold text-white/40 group-hover:text-white transition-colors">{source}</span>
                                <ArrowUpRight size={14} className="text-white/10 group-hover:text-f1-red transition-colors" />
                              </a>
                            ))}
                         </div>
                      </div>
                   </aside>
                </div>
              </motion.div>
            )}

            {activeTab === "guide" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                <F1Guide />
              </motion.div>
            )}

            {activeTab === "telemetry" && (
              <motion.div 
                key="telemetry"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="h-full"
              >
                <TelemetryDashboard 
                  selectedDrivers={activeTelemetryDrivers}
                  drivers={drivers}
                />
              </motion.div>
            )}

            {activeTab === "cars" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                <CarUpdates drivers={Object.values(drivers)} latestLaps={laps} currentStints={stints} positions={positions} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Futuristic Floating Navigation Dock */}
      <nav className="fixed bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 w-[98%] md:w-[95%] max-w-3xl h-16 md:h-18 bg-f1-dark/80 backdrop-blur-3xl border border-white/5 z-50 rounded-[2rem] flex items-center justify-start md:justify-around px-2 md:px-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] overflow-x-auto no-scrollbar">
        {/* Animated Accent Bar */}
        <motion.div 
          layoutId="dock-shine"
          className="absolute -top-[1px] h-[1px] bg-gradient-to-r from-transparent via-f1-red to-transparent z-10"
          style={{ width: '20%' }}
        />
        
        {[
          { id: "dashboard", label: "LIVE TIMING", icon: <LayoutGrid size={22} /> },
          { id: "standings", label: "STANDINGS", icon: <Trophy size={22} /> },
          { id: "telemetry", label: "TELEMETRY", icon: <BarChart2 size={22} /> },
          { id: "news", label: "TRACK VIEW", icon: <Globe size={22} /> },
          { id: "cars", label: "ENGINE", icon: <Engine size={22} /> },
          { id: "guide", label: "GUIDE", icon: <BookOpen size={22} /> }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-500 py-1 min-w-[70px] md:min-w-[80px] flex-1 ${activeTab === tab.id ? 'text-f1-red' : 'text-white/20 hover:text-white/40'}`}
          >
            <motion.div 
              animate={activeTab === tab.id ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {tab.icon}
            </motion.div>
            <span className={`text-[8px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] italic ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="nav-glow"
                className="absolute inset-0 bg-f1-red/5 rounded-full blur-xl z-[-1]"
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
