import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Eye, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { CandidateListItem } from '../types';
import { ScoreBadge } from '../components/common/ScoreBadge';

export const ShortlistedPage: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchShortlisted();
  }, []);

  const fetchShortlisted = async () => {
    try {
      const list = await api.listCandidates({ shortlisted_only: true });
      setCandidates(list);
    } catch (err) {
      console.error('Failed to load shortlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShortlist = async (candId: string) => {
    try {
      await api.toggleShortlist(candId);
      setCandidates(candidates.filter(c => c.id !== candId));
    } catch (err) {
      console.error('Failed to remove shortlist:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        <span className="text-xs font-mono">Loading shortlisted candidate dossiers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="data-label text-cyan-400">SAVED SHORTLIST</span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
          Shortlisted <span className="editorial-title text-cyan-300">Candidates</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          High-priority candidates saved for interview rounds.
        </p>
      </div>

      {candidates.length === 0 ? (
        <div className="vibrant-card p-12 text-center text-slate-400">
          <Star className="w-8 h-8 mx-auto text-slate-600 mb-3" />
          <h3 className="font-bold text-base text-white">No Shortlisted Candidates</h3>
          <p className="text-xs text-slate-500 mt-1">Star candidates on the evaluation results table to shortlist them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {candidates.map(c => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="vibrant-card p-6 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-white">{c.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{c.email}</p>
                  </div>
                  <ScoreBadge score={c.latest_screening?.overall_score || 0} size="sm" />
                </div>

                <div className="flex flex-wrap gap-1 pt-3">
                  {c.latest_screening?.matched_skills.map((sk, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-mono text-[10px]">
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-midnight-700">
                <button
                  onClick={() => handleRemoveShortlist(c.id)}
                  className="text-xs text-rose-400 hover:underline font-semibold"
                >
                  Remove from Shortlist
                </button>
                <button
                  onClick={() => navigate(`/candidate/${c.id}`)}
                  className="px-3.5 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-midnight-950 font-bold text-xs flex items-center gap-1.5 shadow-glow-cyan"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Dossier</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
