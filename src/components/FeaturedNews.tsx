/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { ArrowRight, Newspaper } from "lucide-react";
import { getValidatedImageUrl, AssetCategory } from "../services/imageIntelligence";

interface FeaturedNewsProps {
  heroImage?: string;
  circuitName: string;
  category?: AssetCategory;
  onClick?: () => void;
}

export function FeaturedNews({ heroImage, circuitName, category = "TRACK_PREVIEW", onClick }: FeaturedNewsProps) {
  const displayImage = heroImage || getValidatedImageUrl({
    trackId: circuitName.toLowerCase(),
    category: category
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClick}
      className="relative w-full h-[320px] rounded-lg overflow-hidden group cursor-pointer mb-10 border border-white/5 bg-f1-black shadow-2xl"
    >
      {/* Background Image with subtle zoom */}
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
        className="absolute right-0 top-0 w-full md:w-3/4 h-full z-0"
      >
        <img 
          src={displayImage}
          alt="Featured news background"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholders/global_fallback.jpg";
          }}
          className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000"
        />
      </motion.div>
      
      {/* Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-f1-black via-f1-black/90 md:via-f1-black/70 to-transparent" />
      
      {/* Red Accent line (Top) */}
      <div className="absolute top-0 left-0 w-24 h-[3px] bg-f1-red z-20" />
      
      {/* Content */}
      <div className="absolute inset-0 p-8 md:p-14 flex flex-col justify-center max-w-3xl z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Newspaper size={14} className="text-f1-red" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white italic">{category}</span>
          </div>
          <div className="w-16 h-px bg-white/10" />
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Ais Intelligence System</span>
        </div>
        
        <h2 className="font-display font-black text-4xl md:text-6xl text-white uppercase italic tracking-tighter leading-[0.82] mb-6 drop-shadow-2xl">
          THE 2026<br/>
          <span className="text-white/40">TRANSFORMATION</span><br/>
          AT {circuitName}
        </h2>
        
        <p className="text-white/50 text-sm md:text-base font-medium max-w-lg leading-relaxed mb-8 group-hover:text-white/80 transition-colors">
          As the paddock enters the new era, teams are optimizing active aerodynamics (X-mode) for the unique demands of {circuitName}. High-output electrical recovery systems reach new benchmarks.
        </p>
        
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ x: 5 }}
            className="flex items-center gap-2 px-6 py-3 bg-f1-red text-white font-black text-xs uppercase tracking-[0.2em] italic rounded-sm transition-all shadow-[0_0_20px_rgba(225,6,0,0.3)]"
          >
            Read Report <ArrowRight size={14} />
          </motion.div>
          <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
            Update v4.26 // Final Regulatory Spec
          </div>
        </div>
      </div>
      
      {/* Synchronous Pattern Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Scanning Line */}
      <motion.div 
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[1px] bg-white/5 pointer-events-none z-20"
      />
    </motion.div>
  );
}
