import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Award,
  Star,
  Briefcase,
  ArrowRight,
  Loader2,
  BarChart2,
  TrendingUp,
  Sparkles,
  Users
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { DashboardStats } from '../types';
import { ScoreBadge } from '../components/common/ScoreBadge';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        <span className="text-xs font-mono">Loading recruiter metrics...</span>
      </div>
    );
  }

  const scoreDistData = stats ? Object.entries(stats.score_distribution).map(([name, count]) => ({
    name: name.split(' ')[0],
    count
  })) : [];

  const barColors = ['#06b6d4', '#10b981', '#6366f1', '#f59e0b', '#f43f5e'];

  return (
    <div className="space-y-8">
      {/* Recruiter Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-midnight-700/80">
        <div>
          <span className="data-label text-cyan-400">RECRUITER DASHBOARD</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
            Smart Resume Screener <span className="gradient-text">Analytics Overview</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Real-time candidate evaluation metrics, match score distributions, and missing skill frequency.
          </p>
        </div>
        <button
          onClick={() => navigate('/screen')}
          className="btn-gradient text-xs px-5 py-2.5 flex items-center gap-2 self-start md:self-auto"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Screen New Batch</span>
        </button>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => navigate('/candidates')}
          className="vibrant-card p-5 border-l-4 border-l-cyan-500 cursor-pointer shadow-glow-cyan/10"
        >
          <div className="flex items-center justify-between">
            <span className="data-label text-cyan-400">TOTAL SCREENED</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-mono font-black text-white mt-2">
            {stats?.total_resumes_screened || 0}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">Parsed PDF & TXT candidate resumes</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => navigate('/candidates')}
          className="vibrant-card p-5 border-l-4 border-l-emerald-400 cursor-pointer shadow-glow-emerald/10"
        >
          <div className="flex items-center justify-between">
            <span className="data-label text-emerald-400">AVG MATCH SCORE</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-mono font-black text-emerald-400 mt-2">
            {stats?.avg_match_score || 0}%
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">Overall candidate quality ratio</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => navigate('/shortlisted')}
          className="vibrant-card p-5 border-l-4 border-l-amber-400 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="data-label text-amber-400">SHORTLISTED</span>
            <Star className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-mono font-black text-white mt-2">
            {stats?.shortlisted_count || 0}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">Saved high-fit candidates</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => navigate('/jobs')}
          className="vibrant-card p-5 border-l-4 border-l-indigo-500 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="data-label text-indigo-400">JOBS ANALYZED</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-mono font-black text-white mt-2">
            {stats?.total_jobs_analyzed || 0}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">Active job specifications</span>
        </motion.div>
      </div>

      {/* Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Distribution */}
        <div className="lg:col-span-2 vibrant-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="data-label text-cyan-400">SCORE DISTRIBUTION</span>
              <h3 className="font-bold text-base text-white mt-0.5">Candidate Fit Categories</h3>
            </div>
            <BarChart2 className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1120', borderColor: '#1f2e4d', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {scoreDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Gap Analysis List */}
        <div className="vibrant-card p-6 flex flex-col justify-between">
          <div>
            <span className="data-label text-rose-400">SKILL GAP ANALYSIS</span>
            <h3 className="font-bold text-base text-white mt-0.5 mb-4">Most Common Missing Credentials</h3>

            <div className="space-y-2.5">
              {stats?.common_skill_gaps.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-midnight-950 border border-midnight-700">
                  <span className="font-mono font-semibold text-rose-300">✕ {item.skill}</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-mono text-[10px] border border-rose-500/20">
                    {item.count} missing
                  </span>
                </div>
              ))}

              {(!stats?.common_skill_gaps || stats.common_skill_gaps.length === 0) && (
                <p className="text-xs text-slate-500 italic py-4">No skill gaps recorded yet.</p>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/candidates')}
            className="mt-6 w-full py-2.5 rounded-lg bg-midnight-800 hover:bg-midnight-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-midnight-700"
          >
            <span>Explore All Candidate Dossiers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Screening Sessions Table */}
      <div className="vibrant-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="data-label text-cyan-400">SCREENING HISTORY</span>
            <h3 className="font-bold text-base text-white mt-0.5">Recent Evaluation Sessions</h3>
          </div>
          <button onClick={() => navigate('/candidates')} className="text-xs text-cyan-400 hover:underline">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-midnight-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-midnight-700">
              <tr>
                <th className="py-3 px-4">Job Title</th>
                <th className="py-3 px-4">Resumes Screened</th>
                <th className="py-3 px-4">Average Match</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-midnight-700/60 font-mono">
              {stats?.recent_sessions.map((session, idx) => (
                <tr key={idx} className="hover:bg-midnight-850 transition-colors">
                  <td className="py-3 px-4 font-sans font-bold text-white">{session.job_title}</td>
                  <td className="py-3 px-4">{session.total_resumes} candidates</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-cyan-400">{session.avg_score}%</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{session.created_at}</td>
                  <td className="py-3 px-4 text-right font-sans">
                    <button
                      onClick={() => navigate(`/candidates?session_id=${session.session_id}`)}
                      className="px-3 py-1.5 rounded-lg bg-midnight-800 hover:bg-midnight-700 text-slate-200 text-[11px] font-semibold border border-midnight-700"
                    >
                      View Results
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
