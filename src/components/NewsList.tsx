/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Clock, User, ChevronRight, Share2, Bookmark } from "lucide-react";
import { getValidatedImageUrl, AssetCategory } from "../services/imageIntelligence";

interface NewsItem {
  id: string;
  image?: string; 
  category: AssetCategory;
  headline: string;
  summary: string;
  weekendTag: string;
  publishTime: string;
  author: string;
  trackId?: string;
  driverId?: string;
  teamId?: string;
  tags?: string[];
}

const NEWS_DATA: NewsItem[] = [
  {
    id: "1",
    category: "TECHNICAL",
    headline: "Ferrari's 2026 Power Unit: The Hydrogen Combustion Secret?",
    summary: "New reports suggest Maranello has found a revolutionary way to optimize thermal efficiency under the new 'Power Unit 26' regulations.",
    weekendTag: "Italian GP 2026",
    publishTime: "2h ago",
    author: "Alberto G.",
    teamId: "FERRARI",
    trackId: "italian_gp_2026",
    tags: ["Power Unit", "Innovation"]
  },
  {
    id: "2",
    category: "RACE_ANALYSIS",
    headline: "Active Aero Software Patch: FIA Investigates 'Flexible' Solution",
    summary: "A software-driven approach to active aerodynamics has caught the attention of the technical delegates after the last session.",
    weekendTag: "Monaco GP 2026",
    publishTime: "4h ago",
    author: "Sarah J.",
    trackId: "monaco_gp_2026",
    tags: ["Aero", "FIA"]
  },
  {
    id: "3",
    category: "TRACK_PREVIEW",
    headline: "Canada Preparation: How 2026 Cars Handle The Wall of Champions",
    summary: "Telemetry analysis reveals a shift in deployment patterns as drivers manage the new 350kW ERS system for late-race surges.",
    weekendTag: "Canadian GP 2026",
    publishTime: "6h ago",
    author: "Mark Webb",
    trackId: "canada_gp_2026",
    tags: ["Montreal", "Setup"]
  }
];

interface NewsListProps {
  onItemClick?: (id: string) => void;
}

export function NewsList({ onItemClick }: NewsListProps) {
  return (
    <div className="flex flex-col gap-8">
      {NEWS_DATA.map((item, idx) => {
        const imageUrl = getValidatedImageUrl({
            trackId: item.trackId,
            driverId: item.driverId,
            teamId: item.teamId,
            category: item.category,
            tags: item.tags
        });

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onItemClick?.(item.id)}
            className="group grid grid-cols-1 md:grid-cols-[20rem_1fr] gap-6 cyber-panel p-4 hover:border-white/20 transition-all cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="h-48 md:h-full rounded-sm overflow-hidden relative bg-white/5">
              <img 
                src={imageUrl} 
                alt={item.headline}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholders/global_fallback.jpg";
                }}
                className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
              />
              <div className="absolute top-2 left-2 px-2 py-1 bg-f1-black/80 backdrop-blur-md rounded-sm border border-white/10 text-[8px] font-black uppercase text-f1-red">
                {item.weekendTag}
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-between py-2">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-f1-red italic">{item.category.replace("_", " ")}</span>
                   <div className="flex items-center gap-3 text-white/20">
                      <Share2 size={14} className="hover:text-white transition-colors" />
                      <Bookmark size={14} className="hover:text-white transition-colors" />
                   </div>
                </div>
                
                <h3 className="font-display font-black text-2xl uppercase italic tracking-tighter text-white group-hover:text-f1-red transition-colors leading-tight">
                  {item.headline}
                </h3>
              
              <p className="text-sm text-white/50 leading-relaxed max-w-2xl font-medium">
                {item.summary}
              </p>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <User size={12} className="text-white/30" />
                   <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{item.author}</span>
                </div>
                <div className="flex items-center gap-2">
                   <Clock size={12} className="text-white/30" />
                   <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{item.publishTime}</span>
                </div>
              </div>
              
              <button className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-f1-red group-hover:gap-2 transition-all italic">
                Read Story <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      );
    })}
    </div>
  );
}
