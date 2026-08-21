import React from 'react';
import { motion } from 'framer-motion';

interface ScoreBadgeProps {
  score: number;
  category?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'arc' | 'pill' | 'bar';
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  score,
  category,
  size = 'md',
  variant = 'arc'
}) => {
  const roundedScore = Math.round(score);

  const getScoreColor = (val: number) => {
    if (val >= 90) return { stroke: '#38bdf8', text: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10' };
    if (val >= 80) return { stroke: '#34d399', text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' };
    if (val >= 70) return { stroke: '#fbbf24', text: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' };
    return { stroke: '#f43f5e', text: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10' };
  };

  const style = getScoreColor(roundedScore);

  if (variant === 'pill') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-mono font-bold text-xs ${style.bg} ${style.border} ${style.text}`}>
        <span>{roundedScore}%</span>
        {category && <span className="font-sans font-medium text-[10px] text-slate-300">({category})</span>}
      </div>
    );
  }

  if (variant === 'bar') {
    return (
      <div className="w-full space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-medium">{category || 'Match Score'}</span>
          <span className={`font-mono font-bold ${style.text}`}>{roundedScore}%</span>
        </div>
        <div className="w-full h-2 bg-midnight-950 rounded-full overflow-hidden border border-midnight-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${roundedScore}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${
              roundedScore >= 90 ? 'bg-gradient-to-r from-cyan-500 to-indigo-500' : roundedScore >= 80 ? 'bg-emerald-400' : roundedScore >= 70 ? 'bg-amber-400' : 'bg-rose-500'
            }`}
          />
        </div>
      </div>
    );
  }

  const dimensions = {
    sm: { box: 44, r: 17, stroke: 3, text: 'text-xs font-bold' },
    md: { box: 60, r: 24, stroke: 4, text: 'text-sm font-extrabold' },
    lg: { box: 84, r: 34, stroke: 5, text: 'text-2xl font-black' },
  }[size];

  const circumference = 2 * Math.PI * dimensions.r;
  const strokeDashoffset = circumference - (roundedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <div className="relative flex items-center justify-center">
        <svg width={dimensions.box} height={dimensions.box} className="transform -rotate-90">
          <circle
            cx={dimensions.box / 2}
            cy={dimensions.box / 2}
            r={dimensions.r}
            stroke="#17223b"
            strokeWidth={dimensions.stroke}
            fill="transparent"
          />
          <motion.circle
            cx={dimensions.box / 2}
            cy={dimensions.box / 2}
            r={dimensions.r}
            stroke={style.stroke}
            strokeWidth={dimensions.stroke}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className={`absolute font-mono ${dimensions.text} ${style.text}`}>
          {roundedScore}%
        </div>
      </div>
      {category && (
        <span className={`text-[10px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full border ${style.bg} ${style.border} ${style.text}`}>
          {category}
        </span>
      )}
    </div>
  );
};
