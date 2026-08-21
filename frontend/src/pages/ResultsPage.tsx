import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Star,
  Download,
  Eye,
  Loader2,
  Check,
  Columns,
  Sparkles,
  ArrowRight,
  Sliders,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { CandidateListItem, CandidateMatchReport } from '../types';
import { ScoreBadge } from '../components/common/ScoreBadge';

export const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [sessionReports, setSessionReports] = useState<CandidateMatchReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [minScore, setMinScore] = useState(0);
  const [recommendationFilter, setRecommendationFilter] = useState('');
  const [shortlistedOnly, setShortlistedOnly] = useState(false);

  // Custom Weighting Sliders State (Feature 3)
  const [showWeightingPanel, setShowWeightingPanel] = useState(false);
  const [skillWeight, setSkillWeight] = useState(35);
  const [semanticWeight, setSemanticWeight] = useState(25);
  const [experienceWeight, setExperienceWeight] = useState(15);
  const [projectWeight, setProjectWeight] = useState(10);

  // Compare selection
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchFromUrl = params.get('search');
    if (searchFromUrl !== null) {
      setSearchTerm(searchFromUrl);
    }
    const stateData = location.state?.sessionData;
    if (stateData && stateData.results) {
      setSessionReports(stateData.results);
    }
    const sessionIdFromUrl = params.get('session_id');
    fetchCandidates(searchFromUrl || searchTerm, sessionIdFromUrl);
  }, [location.state, location.search]);

  const fetchCandidates = async (searchOverride?: string, sessionOverride?: string | null) => {
    setLoading(true);
    const activeSearch = searchOverride !== undefined ? searchOverride : searchTerm;
    const activeSessionId = sessionOverride !== undefined ? sessionOverride : queryParams.get('session_id');
    try {
      const data = await api.listCandidates({
        search: activeSearch || undefined,
        min_score: minScore > 0 ? minScore : undefined,
        recommendation: recommendationFilter || undefined,
        shortlisted_only: shortlistedOnly,
        session_id: activeSessionId || undefined
      });
      setCandidates(data);
    } catch (err) {
      console.error('Failed to load candidate results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShortlist = async (candId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.toggleShortlist(candId);
      setCandidates(prev =>
        prev.map(c => c.id === candId ? { ...c, is_shortlisted: res.shortlisted } : c)
      );
    } catch (err) {
      console.error('Shortlist toggle failed:', err);
    }
  };

  const toggleSelectForCompare = (candId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedForCompare.includes(candId)) {
      setSelectedForCompare(selectedForCompare.filter(id => id !== candId));
    } else {
      if (selectedForCompare.length >= 4) return;
      setSelectedForCompare([...selectedForCompare, candId]);
    }
  };

  const handleLaunchCompare = () => {
    if (selectedForCompare.length >= 2) {
      navigate(`/compare?ids=${selectedForCompare.join(',')}`);
    }
  };

  // Recalculated candidates with custom weights
  const processedCandidates = candidates.map(c => {
    const sub = c.latest_screening?.sub_scores;
    if (!sub || typeof sub.skill_match !== 'number' || typeof sub.semantic_fit !== 'number' || typeof sub.experience !== 'number' || typeof sub.projects !== 'number') {
      return c;
    }

    const customScore = Math.round(
      (sub.skill_match * (skillWeight / 100)) +
      (sub.semantic_fit * (semanticWeight / 100)) +
      (sub.experience * (experienceWeight / 100)) +
      (sub.projects * (projectWeight / 100)) +
      (15 * 0.15)
    );

    return {
      ...c,
      latest_screening: {
        ...c.latest_screening!,
        overall_score: customScore
      }
    };
  }).sort((a, b) => (b.latest_screening?.overall_score || 0) - (a.latest_screening?.overall_score || 0));

  const topCandidate = processedCandidates.length > 0 ? processedCandidates[0] : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-midnight-700/80">
        <div>
          <span className="data-label text-cyan-400">CANDIDATE RANKING MATRIX</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
            Screening <span className="gradient-text">Results & Shortlist</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Evaluated profiles ranked by hybrid skill overlap and sentence-transformer fit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWeightingPanel(!showWeightingPanel)}
            className="bg-midnight-900 hover:bg-midnight-850 border border-midnight-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showWeightingPanel ? 'Hide Custom Weights' : 'Custom Scoring Weights'}</span>
          </button>

          {selectedForCompare.length >= 2 && (
            <button
              onClick={handleLaunchCompare}
              className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-glow-cyan"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Compare Selected ({selectedForCompare.length})</span>
            </button>
          )}

          {sessionReports.length > 0 && (
            <a
              href={api.getExportUrl(sessionReports[0].candidate_id)}
              download
              className="bg-midnight-900 hover:bg-midnight-850 border border-midnight-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </a>
          )}
        </div>
      </div>

      {/* Feature 3: Custom Weighting Slider Drawer */}
      <AnimatePresence>
        {showWeightingPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="vibrant-card p-6 border-l-4 border-l-cyan-500 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-midnight-700">
              <div>
                <span className="data-label text-cyan-400">CUSTOM SCORING CRITERIA WEIGHTS</span>
                <h3 className="font-bold text-sm text-white mt-0.5">Recalculate Fit Scores Live</h3>
              </div>
              <button
                onClick={() => {
                  setSkillWeight(35);
                  setSemanticWeight(25);
                  setExperienceWeight(15);
                  setProjectWeight(10);
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
              >
                <RotateCcw className="w-3 h-3" /> Reset Default
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Skill Match:</span>
                  <span className="font-bold text-cyan-400">{skillWeight}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={50}
                  value={skillWeight}
                  onChange={(e) => setSkillWeight(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Semantic Fit:</span>
                  <span className="font-bold text-emerald-400">{semanticWeight}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={50}
                  value={semanticWeight}
                  onChange={(e) => setSemanticWeight(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Experience:</span>
                  <span className="font-bold text-amber-400">{experienceWeight}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={40}
                  value={experienceWeight}
                  onChange={(e) => setExperienceWeight(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Project Impact:</span>
                  <span className="font-bold text-rose-400">{projectWeight}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  value={projectWeight}
                  onChange={(e) => setProjectWeight(Number(e.target.value))}
                  className="w-full accent-rose-400"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured Top Candidate Spotlight Panel */}
      {topCandidate && (
        <div className="vibrant-card p-6 border-l-4 border-l-cyan-500 shadow-glow-cyan/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-4 border-b border-midnight-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-0.5 shadow-glow-cyan flex items-center justify-center font-mono font-black text-white text-base">
                #1
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">FEATURED TOP CANDIDATE</span>
                <h2 className="text-xl font-bold text-white mt-0.5">{topCandidate.name}</h2>
                <p className="text-xs text-slate-400 font-mono">{topCandidate.email} • {topCandidate.location || 'Location Unspecified'}</p>
              </div>
            </div>

            <ScoreBadge
              score={topCandidate.latest_screening?.overall_score || 0}
              category={topCandidate.latest_screening?.score_category}
              size="lg"
            />
          </div>

          <div className="pt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="data-label block mb-2">TOP MATCHED SKILLS</span>
              <div className="flex flex-wrap gap-1.5">
                {topCandidate.latest_screening?.matched_skills?.slice(0, 6).map((sk, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs">
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate(`/candidate/${topCandidate.id}`)}
              className="btn-gradient text-xs px-5 py-2.5 flex items-center gap-2 shrink-0"
            >
              <span>View Full Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Filter Control Bar */}
      <div className="vibrant-card p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full lg:w-auto flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by candidate name, email, or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-midnight-950 border border-midnight-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/60 font-sans"
            />
          </div>

          <button
            onClick={() => fetchCandidates()}
            className="px-4 py-2 rounded-lg bg-midnight-800 border border-midnight-700 text-slate-200 text-xs font-semibold hover:bg-midnight-700"
          >
            Filter
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-sans">Min Score:</span>
            <input
              type="range"
              min={0}
              max={90}
              step={10}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-24 accent-cyan-400"
            />
            <span className="font-bold text-cyan-400">{minScore}%</span>
          </div>

          <select
            value={recommendationFilter}
            onChange={(e) => setRecommendationFilter(e.target.value)}
            className="bg-midnight-950 border border-midnight-700 text-slate-100 rounded-lg px-3 py-2 text-xs font-sans"
          >
            <option value="" className="bg-midnight-950 text-slate-100">All Recommendations</option>
            <option value="Strongly Recommended" className="bg-midnight-950 text-slate-100">Strongly Recommended</option>
            <option value="Recommended" className="bg-midnight-950 text-slate-100">Recommended</option>
            <option value="Consider" className="bg-midnight-950 text-slate-100">Consider</option>
          </select>

          <label className="flex items-center gap-2 text-slate-300 font-sans cursor-pointer">
            <input
              type="checkbox"
              checked={shortlistedOnly}
              onChange={(e) => setShortlistedOnly(e.target.checked)}
              className="rounded accent-cyan-400"
            />
            <span>Shortlisted Only</span>
          </label>
        </div>
      </div>

      {/* Candidate Ranking Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span className="text-xs font-mono">Fetching candidate dossiers...</span>
        </div>
      ) : processedCandidates.length === 0 ? (
        <div className="vibrant-card p-12 text-center text-slate-400">
          <h3 className="font-bold text-base text-white">No Candidates Found</h3>
          <p className="text-xs text-slate-500 mt-1">Adjust search parameters or upload a new resume batch.</p>
        </div>
      ) : (
        <div className="vibrant-card overflow-hidden">
          <div className="p-4 border-b border-midnight-700 flex items-center justify-between">
            <span className="data-label text-cyan-400">CANDIDATE RANKING TABLE ({processedCandidates.length})</span>
            <span className="text-[11px] text-slate-500 font-mono">Click candidate row to view detailed dossier</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-midnight-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-midnight-700">
                <tr>
                  <th className="py-3 px-4 w-10">Compare</th>
                  <th className="py-3 px-4 w-12">Rank</th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Match Score</th>
                  <th className="py-3 px-4">Top Credentials</th>
                  <th className="py-3 px-4">Recommendation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-midnight-700/60 font-mono">
                <AnimatePresence>
                  {processedCandidates.map((cand, idx) => {
                    const score = cand.latest_screening?.overall_score || 0;
                    const category = cand.latest_screening?.score_category || 'N/A';
                    const recommendation = cand.latest_screening?.recommendation || 'N/A';
                    const matchedSkills = cand.latest_screening?.matched_skills || [];
                    const isSelected = selectedForCompare.includes(cand.id);

                    return (
                      <motion.tr
                        key={cand.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => navigate(`/candidate/${cand.id}`)}
                        className={`hover:bg-midnight-850 transition-colors cursor-pointer ${
                          isSelected ? 'bg-cyan-500/5' : ''
                        }`}
                      >
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <div
                            onClick={(e) => toggleSelectForCompare(cand.id, e)}
                            className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                              isSelected ? 'bg-cyan-500 border-cyan-400 text-midnight-950' : 'border-midnight-700 hover:border-slate-400'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-bold text-cyan-400">#{idx + 1}</td>

                        <td className="py-3 px-4 font-sans">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white hover:text-cyan-300 transition-colors">
                              {cand.name}
                            </span>
                            <button
                              onClick={(e) => handleToggleShortlist(cand.id, e)}
                              className={`p-1 ${cand.is_shortlisted ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'}`}
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono block">{cand.email || 'No email'}</span>
                        </td>

                        <td className="py-3 px-4">
                          <ScoreBadge score={score} variant="pill" category={category} />
                        </td>

                        <td className="py-3 px-4 font-sans">
                          <div className="flex flex-wrap gap-1">
                            {matchedSkills.slice(0, 4).map((sk, sidx) => (
                              <span key={sidx} className="px-2 py-0.5 rounded-full bg-midnight-950 border border-midnight-700 text-emerald-300 font-mono text-[10px]">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-sans font-semibold text-slate-300">
                          {recommendation}
                        </td>

                        <td className="py-3 px-4 text-right font-sans">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/candidate/${cand.id}`);
                            }}
                            className="p-1.5 rounded-lg bg-midnight-800 hover:bg-midnight-700 text-slate-300 border border-midnight-700"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
