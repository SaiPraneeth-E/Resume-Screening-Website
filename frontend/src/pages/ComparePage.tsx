import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Columns, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { CompareCandidate } from '../types';
import { ScoreBadge } from '../components/common/ScoreBadge';

export const ComparePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const idsParam = searchParams.get('ids');

  const [candidates, setCandidates] = useState<CompareCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (idsParam) {
      const ids = idsParam.split(',');
      fetchComparison(ids);
    } else {
      setLoading(false);
    }
  }, [idsParam]);

  const fetchComparison = async (ids: string[]) => {
    try {
      const data = await api.compareCandidates(ids);
      setCandidates(data);
    } catch (err) {
      console.error('Failed to compare candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        <span className="text-xs font-mono">Generating side-by-side comparison matrix...</span>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="vibrant-card p-12 text-center text-slate-400">
        <Columns className="w-8 h-8 mx-auto text-slate-600 mb-3" />
        <h3 className="font-bold text-base text-white">No Candidates Selected for Comparison</h3>
        <p className="text-xs text-slate-500 mt-1">Select 2 to 4 candidates from the results table to compare.</p>
        <button onClick={() => navigate('/candidates')} className="mt-4 text-xs text-cyan-400 underline">
          Go to Candidates List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate('/candidates')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Candidate Rankings</span>
      </button>

      <div>
        <span className="data-label text-cyan-400">SIDE-BY-SIDE EVALUATION</span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
          Candidate <span className="editorial-title text-cyan-300">Comparison Matrix</span>
        </h1>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-${candidates.length} gap-6`}>
        {candidates.map((c, idx) => (
          <div key={c.candidate_id} className="dossier-panel space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-center pb-4 border-b border-midnight-700">
                <span className="font-mono text-xs font-bold text-cyan-400 uppercase">Rank #{idx + 1}</span>
                <h3 className="font-bold text-lg text-white mt-1">{c.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{c.email}</p>
                <div className="pt-4 flex justify-center">
                  <ScoreBadge score={c.overall_score} category={c.score_category} size="lg" />
                </div>
              </div>

              {/* Sub-score breakdown */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Skill Match:</span>
                  <span className="font-bold text-emerald-400">{c.skill_score}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Semantic Fit:</span>
                  <span className="font-bold text-cyan-400">{c.semantic_score}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Experience:</span>
                  <span className="font-bold text-indigo-400">{c.experience_score}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Projects:</span>
                  <span className="font-bold text-amber-400">{c.project_score}%</span>
                </div>
              </div>

              {/* Matched skills */}
              <div className="pt-2">
                <span className="data-label text-slate-400 block mb-2">MATCHED SKILLS</span>
                <div className="flex flex-wrap gap-1">
                  {c.matched_skills.map((sk, sidx) => (
                    <span key={sidx} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-mono text-[10px]">
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing skills */}
              <div className="pt-2">
                <span className="data-label text-rose-400 block mb-2">MISSING SKILLS</span>
                <div className="flex flex-wrap gap-1">
                  {c.missing_skills.map((sk, sidx) => (
                    <span key={sidx} className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/25 text-rose-300 font-mono text-[10px]">
                      ✕ {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/candidate/${c.candidate_id}`)}
              className="w-full py-2.5 rounded bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-white font-bold text-xs transition-colors shadow-glow-cyan"
            >
              Open Candidate Dossier
            </motion.button>
          </div>
        ))}
      </div>
    </div>
  );
};
