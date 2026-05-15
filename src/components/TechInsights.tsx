/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Cpu, Zap, Wind, FastForward, Activity, ShieldCheck } from "lucide-react";

const INSIGHTS = [
  {
    category: "Aerodynamics",
    title: "X-Mode Activation",
    description: "Low-drag configuration enabled on primary straights. Rear and front wing elements adjusted for minimum resistance.",
    icon: Wind,
    color: "text-f1-blue",
    status: "Active // 326 KM/H"
  },
  {
    category: "Power Unit",
    title: "MGU-K 350kW Transfer",
    description: "Maximum regeneration phase initiated. The 2026 E-Turbo core is balancing power 50/50 with the combustion cycle.",
    icon: Zap,
    color: "text-f1-yellow",
    status: "Charge: 88%"
  },
  {
    category: "Chassis Intelligence",
    title: "Z-Mode Optimization",
    description: "High-downforce mapping engaged for slow-speed corner clusters. Suspension hydraulics locked for max stability.",
    icon: Activity,
    color: "text-f1-green",
    status: "Downforce: Peak"
  }
];

export function TechInsights() {
  return (
    <section className="flex flex-col gap-6 my-10">
      <div className="flex items-center gap-4 px-2">
         <div className="w-1.5 h-6 bg-f1-red" />
         <div className="flex flex-col">
            <h3 className="font-display font-black text-xs uppercase tracking-[0.4em] text-white italic">Technical Strategic Buffer</h3>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-0.5">Real-time Engineering Directives</span>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {INSIGHTS.map((insight, idx) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-8 group hover:border-f1-red/20 transition-all cursor-pointer relative overflow-hidden"
            >
              {/* Background Accent */}
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                 <Icon size={120} />
              </div>

              <div className={`w-12 h-12 flex items-center justify-center rounded-sm bg-white/[0.03] mb-8 group-hover:bg-f1-red/10 transition-colors border border-white/10`}>
                <Icon size={24} className={`${insight.color} group-hover:scale-110 transition-transform`} />
              </div>
              
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic mb-3 block">
                {insight.category}
              </span>
              
              <h3 className="font-display font-black text-2xl uppercase italic tracking-tighter text-white mb-4 group-hover:text-f1-red transition-colors leading-[0.9]">
                {insight.title}
              </h3>
              
              <p className="text-sm text-white/40 leading-relaxed font-medium mb-8">
                {insight.description}
              </p>

              <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <ShieldCheck size={12} className="text-f1-green" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">{insight.status}</span>
                 </div>
                 <FastForward size={14} className="text-white/10 group-hover:text-f1-red transition-colors" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
