import React from 'react';
import { Sparkles } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }[size];

  const titleSizes = {
    sm: 'text-xs font-bold',
    md: 'text-sm font-extrabold',
    lg: 'text-lg font-black',
  }[size];

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`${iconSizes} rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 p-0.5 shadow-glow-cyan flex items-center justify-center text-white shrink-0`}>
        <div className="w-full h-full bg-midnight-950/40 rounded-[6px] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
        </div>
      </div>

      <div>
        <div className={`tracking-tight text-white ${titleSizes} flex items-center gap-1.5`}>
          <span>SMART RESUME</span>
          <span className="gradient-text font-black">SCREENER</span>
        </div>
        {showSubtitle && (
          <p className="text-[10px] font-semibold text-cyan-400 uppercase tracking-widest leading-none mt-0.5 font-mono">
            AI Recruiter Platform
          </p>
        )}
      </div>
    </div>
  );
};
