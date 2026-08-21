import React from 'react';
import { motion } from 'framer-motion';

interface ScoreGaugeGraphicProps {
  score: number;
  subScores?: {
    skill: number;
    semantic: number;
    experience: number;
  };
}

export const ScoreGaugeGraphic: React.FC<ScoreGaugeGraphicProps> = ({
  score,
  subScores = { skill: 95, semantic: 88, experience: 90 }
}) => {
  const roundedScore = Math.round(score);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-midnight-950 border border-midnight-700/80 rounded-xl space-y-4 shadow-inner">
      <span className="data-label text-amber-400">FIT EVALUATION GAUGE</span>

      <div className="relative flex items-center justify-center w-36 h-36">
        <svg width="144" height="144" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="72"
            cy="72"
            r="54"
            stroke="#1d2330"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Outer Score Arc */}
          <motion.circle
            cx="72"
            cy="72"
            r="54"
            stroke="#f59e0b"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={339}
            initial={{ strokeDashoffset: 339 }}
            animate={{ strokeDashoffset: 339 - (roundedScore / 100) * 339 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute flex flex-col items-center text-center">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="font-mono text-3xl font-black text-amber-300"
          >
            {roundedScore}%
          </motion.span>
          <span className="text-[10px] font-sans font-semibold text-slate-400 uppercase tracking-wider">
            Overall Fit
          </span>
        </div>
      </div>

      {/* Sub-metric progress bars */}
      <div className="w-full space-y-2 text-xs font-mono">
        <div>
          <div className="flex justify-between text-slate-400 text-[11px] mb-1">
            <span>Skill Match:</span>
            <span className="text-emerald-400 font-bold">{subScores.skill}%</span>
          </div>
          <div className="w-full h-1 bg-midnight-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${subScores.skill}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-slate-400 text-[11px] mb-1">
            <span>Semantic Fit:</span>
            <span className="text-amber-400 font-bold">{subScores.semantic}%</span>
          </div>
          <div className="w-full h-1 bg-midnight-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-amber-400"
              initial={{ width: 0 }}
              animate={{ width: `${subScores.semantic}%` }}
              transition={{ duration: 0.8, delay: 0.1 }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-slate-400 text-[11px] mb-1">
            <span>Experience:</span>
            <span className="text-sky-400 font-bold">{subScores.experience}%</span>
          </div>
          <div className="w-full h-1 bg-midnight-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-sky-400"
              initial={{ width: 0 }}
              animate={{ width: `${subScores.experience}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
