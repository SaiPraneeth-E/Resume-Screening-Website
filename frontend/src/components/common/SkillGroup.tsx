import React from 'react';
import { motion } from 'framer-motion';

interface SkillGroupProps {
  matched: string[];
  missing: string[];
  additional?: string[];
}

export const SkillGroup: React.FC<SkillGroupProps> = ({
  matched,
  missing,
  additional = []
}) => {
  return (
    <div className="space-y-4">
      {/* Matched Skills */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            MATCHED SKILLS ({matched.length})
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {matched.map((sk, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              whileHover={{ scale: 1.05 }}
              className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs cursor-default shadow-glow-emerald"
            >
              ✓ {sk}
            </motion.span>
          ))}
          {matched.length === 0 && (
            <span className="text-xs text-slate-500 italic">No direct required skill matches identified.</span>
          )}
        </div>
      </div>

      {/* Missing Skills */}
      {missing.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              NOT FOUND IN RESUME ({missing.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((sk, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                whileHover={{ scale: 1.05 }}
                className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-xs cursor-default"
              >
                ✕ {sk}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Additional Candidate Skills */}
      {additional.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              ADDITIONAL CANDIDATE CREDENTIALS ({additional.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {additional.slice(0, 8).map((sk, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                whileHover={{ scale: 1.05 }}
                className="px-2.5 py-1 rounded-full bg-midnight-800 border border-midnight-700 text-slate-300 font-mono text-xs cursor-default"
              >
                + {sk}
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
