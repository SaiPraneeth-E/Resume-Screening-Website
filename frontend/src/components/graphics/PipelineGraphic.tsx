import React from 'react';
import { motion } from 'framer-motion';

export const PipelineGraphic: React.FC = () => {
  return (
    <div className="w-full bg-charcoal-950 p-6 rounded-xl border border-charcoal-700/80 shadow-xl overflow-hidden relative">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-charcoal-800">
        <span className="data-label text-amber-400">HYBRID MATCHING PIPELINE</span>
        <span className="text-[10px] font-mono text-slate-500">Live AI Vector Analysis</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {/* Stage 1: Document Parsing */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 rounded-lg bg-charcoal-900 border border-charcoal-700/80 space-y-2 relative"
        >
          <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-mono text-amber-400 text-xs font-bold">
            01
          </div>
          <h4 className="font-bold text-xs text-white">PDF Parsing</h4>
          <p className="text-[11px] text-slate-400 font-mono leading-tight">PyMuPDF extracts raw text & section boundaries.</p>
          <div className="h-1 bg-charcoal-800 rounded-full overflow-hidden mt-2">
            <motion.div
              className="h-full bg-amber-400"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            />
          </div>
        </motion.div>

        {/* Stage 2: Skill Taxonomy */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="p-4 rounded-lg bg-charcoal-900 border border-charcoal-700/80 space-y-2 relative"
        >
          <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-mono text-emerald-400 text-xs font-bold">
            02
          </div>
          <h4 className="font-bold text-xs text-white">Skill Normalization</h4>
          <p className="text-[11px] text-slate-400 font-mono leading-tight">Maps JS $\rightarrow$ JavaScript & ReactJS $\rightarrow$ React.</p>
          <div className="h-1 bg-charcoal-800 rounded-full overflow-hidden mt-2">
            <motion.div
              className="h-full bg-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 0.3, repeat: Infinity, repeatDelay: 2 }}
            />
          </div>
        </motion.div>

        {/* Stage 3: SentenceTransformers Embeddings */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="p-4 rounded-lg bg-charcoal-900 border border-charcoal-700/80 space-y-2 relative"
        >
          <div className="w-8 h-8 rounded bg-sky-500/10 border border-sky-500/30 flex items-center justify-center font-mono text-sky-400 text-xs font-bold">
            03
          </div>
          <h4 className="font-bold text-xs text-white">Vector Embeddings</h4>
          <p className="text-[11px] text-slate-400 font-mono leading-tight">MiniLM-L6-v2 cosine similarity calculation.</p>
          <div className="h-1 bg-charcoal-800 rounded-full overflow-hidden mt-2">
            <motion.div
              className="h-full bg-sky-400"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 0.6, repeat: Infinity, repeatDelay: 2 }}
            />
          </div>
        </motion.div>

        {/* Stage 4: Hybrid Evaluation */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="p-4 rounded-lg bg-charcoal-900 border border-amber-500/30 space-y-2 relative"
        >
          <div className="w-8 h-8 rounded bg-amber-500/20 border border-amber-400 flex items-center justify-center font-mono text-amber-300 text-xs font-bold">
            04
          </div>
          <h4 className="font-bold text-xs text-white">Hybrid Score (0-100)</h4>
          <p className="text-[11px] text-slate-400 font-mono leading-tight">Skill Match + Semantic Fit + Experience.</p>
          <div className="h-1 bg-charcoal-800 rounded-full overflow-hidden mt-2">
            <motion.div
              className="h-full bg-amber-400"
              initial={{ width: 0 }}
              animate={{ width: '92%' }}
              transition={{ duration: 1.2, delay: 0.8 }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
