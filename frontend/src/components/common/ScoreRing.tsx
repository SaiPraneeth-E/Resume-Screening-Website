import React from 'react';
import { motion } from 'framer-motion';

interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  category?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 'md',
  showLabel = true,
  category
}) => {
  const getColors = (val: number) => {
    if (val >= 90) return { stroke: '#10b981', bg: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    if (val >= 80) return { stroke: '#38bdf8', bg: 'text-sky-400', badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20' };
    if (val >= 70) return { stroke: '#f59e0b', bg: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    return { stroke: '#f43f5e', bg: 'text-rose-400', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
  };

  const colors = getColors(score);

  const dimensions = {
    sm: { r: 18, strokeWidth: 3.5, box: 44, text: 'text-xs font-bold' },
    md: { r: 28, strokeWidth: 4.5, box: 68, text: 'text-base font-extrabold' },
    lg: { r: 42, strokeWidth: 6, box: 100, text: 'text-2xl font-black' },
    xl: { r: 60, strokeWidth: 8, box: 140, text: 'text-4xl font-black' },
  }[size];

  const circumference = 2 * Math.PI * dimensions.r;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-1.5">
      <div className="relative flex items-center justify-center">
        <svg width={dimensions.box} height={dimensions.box} className="transform -rotate-90">
          <circle
            cx={dimensions.box / 2}
            cy={dimensions.box / 2}
            r={dimensions.r}
            stroke="#1e293b"
            strokeWidth={dimensions.strokeWidth}
            fill="transparent"
          />
          <motion.circle
            cx={dimensions.box / 2}
            cy={dimensions.box / 2}
            r={dimensions.r}
            stroke={colors.stroke}
            strokeWidth={dimensions.strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute ${dimensions.text} ${colors.bg}`}>
          {Math.round(score)}%
        </span>
      </div>
      {showLabel && category && (
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${colors.badge}`}>
          {category}
        </span>
      )}
    </div>
  );
};
