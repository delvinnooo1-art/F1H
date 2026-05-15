/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { BookOpen, Zap, Wind, Trophy, Info, Cpu, Award } from "lucide-react";

export function F1Guide() {
  const sections = [
    {
      title: "2026 Power Unit",
      icon: <Zap className="text-f1-yellow" />,
      items: [
        { name: "50/50 Hybrid Split", desc: "Equal power distribution between the 1.6L Internal Combustion Engine and the Electric Motor (MGU-K)." },
        { name: "MGU-H Removed", desc: "Removal of the complex Heat Energy Recovery System for cost reduction and simplicity." },
        { name: "100% Sustainable Fuel", desc: "Fully drop-in sustainable fuels that require no engine modifications." },
        { name: "Enhanced ERS-K", desc: "Electric output increased from 120kW to 350kW (nearly 470hp)." }
      ]
    },
    {
      title: "2026 Aerodynamics",
      icon: <Wind className="text-f1-blue" />,
      items: [
        { name: "Active Aero: X-Mode", desc: "Low-drag configuration for high speed on straights, replacing the traditional DRS." },
        { name: "Active Aero: Z-Mode", desc: "High-downforce configuration for maximum cornering performance." },
        { name: "Agile Chassis", desc: "Reduced wheelbase and width for lighter, more nimble wheel-to-wheel racing." },
        { name: "Manual Override", desc: "Strategic 'Overtake Mode' provides extra electrical energy to the car behind." }
      ]
    },
    {
      title: "Points & Format",
      icon: <Award className="text-f1-red" />,
      items: [
        { name: "Top 12 Points", desc: "Expanded scoring system proposed for 2026 (25-18-15-12-10-8-6-5-4-3-2-1)." },
        { name: "Net Zero Hub", desc: "All logistics and race operations certified carbon neutral by 2030." },
        { name: "Sprint Pro Hub", desc: "Refined standalone Sprint format with separate qualifying and trophies." }
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-8 h-full overflow-y-auto pr-4 custom-scrollbar">
      <header className="relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-f1-red" />
        <h2 className="font-display font-black text-5xl uppercase italic tracking-tighter leading-none">
          THE 2026<br />
          <span className="text-f1-red">REGULATION ERA</span>
        </h2>
        <p className="text-white/40 text-sm mt-4 font-medium uppercase tracking-widest max-w-xl leading-relaxed">
          The pinnacle of sustainable motorsport. A new era of high-output electrical hybrid power and active aerodynamics.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {sections.map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel p-6 border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/5 rounded-lg">
                {section.icon}
              </div>
              <h3 className="font-display font-bold text-xl uppercase italic tracking-tighter">{section.title}</h3>
            </div>
            <div className="flex flex-col gap-5">
              {section.items.map(item => (
                <div key={item.name} className="flex flex-col gap-1">
                  <span className="text-xs font-black uppercase text-white/80 tracking-wider font-display">
                    {item.name}
                  </span>
                  <p className="text-[11px] text-white/30 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-panel p-8 mt-4 relative overflow-hidden border-f1-red/20 shadow-[0_0_50px_rgba(225,6,0,0.05)]">
        <div className="absolute top-0 right-0 p-4">
          <Info size={48} className="text-f1-red opacity-10" />
        </div>
        
        <div className="flex gap-8 items-center flex-col md:flex-row">
          <div className="shrink-0 w-24 h-24 rounded-full border-4 border-f1-red/20 flex items-center justify-center bg-f1-red/5">
             <Cpu size={40} className="text-f1-red" />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-display font-black text-3xl uppercase italic tracking-tighter">Beyond the DRS</h3>
            <p className="text-sm text-white/60 leading-relaxed max-w-2xl">
              In 2026, the traditional Drag Reduction System is replaced by full **Active Aerodynamics**. Drivers can now switch between **X-Mode** (low drag) and **Z-Mode** (high downforce) dynamically. Additionally, the **Manual Override Mode** replaces the DRS activation gap, providing a specific tactical energy boost to promote closer wheel-to-wheel combat.
            </p>
            <div className="flex gap-4 mt-2">
               <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-f1-red">Precision Hybrid</div>
               <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-f1-blue">Kinetic Recovery</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
