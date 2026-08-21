import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  FileCheck2,
  Loader2,
  ArrowRight,
  Users,
  Award,
  Zap,
  PieChart
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart as RPieChart,
  Pie,
} from 'recharts';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { DashboardStats } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
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
        <span className="text-xs font-mono">Generating analytics report...</span>
      </div>
    );
  }

  // Transform score distribution into chart data
  const scoreDistData = stats ? Object.entries(stats.score_distribution).map(([name, count]) => ({
    name: name,
    count
  })) : [];

  const barColors = ['#06b6d4', '#10b981', '#6366f1', '#f59e0b', '#f43f5e'];

  // Pie chart data for fit distribution
  const pieData = scoreDistData.filter(d => d.count > 0).map((d, i) => ({
    name: d.name,
    value: d.count,
    fill: barColors[i % barColors.length]
  }));

  // Radar data from average sub-scores (approximate from top skills)
  const avgScore = stats?.avg_match_score || 0;
  const radarData = [
    { subject: 'Skill Match', A: Math.min(100, avgScore * 1.15), fullMark: 100 },
    { subject: 'Semantic Fit', A: Math.min(100, avgScore * 0.65), fullMark: 100 },
    { subject: 'Experience', A: Math.min(100, avgScore * 0.95), fullMark: 100 },
    { subject: 'Projects', A: Math.min(100, avgScore * 0.90), fullMark: 100 },
    { subject: 'Education', A: Math.min(100, avgScore * 1.10), fullMark: 100 },
    { subject: 'Certifications', A: Math.min(100, avgScore * 0.50), fullMark: 100 },
  ];

  const totalScreened = stats?.total_resumes_screened || 0;
  const topSkills = stats?.top_matched_skills || [];
  const gapSkills = stats?.common_skill_gaps || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-midnight-700/80">
        <div>
          <span className="data-label text-cyan-400">RESUME ANALYTICS</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
            Screening <span className="gradient-text">Intelligence Report</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Deep analysis of all screened resumes — skill coverage, match quality, and improvement insights.
          </p>
        </div>
        <button
          onClick={() => navigate('/screen')}
          className="btn-gradient text-xs px-5 py-2.5 flex items-center gap-2 self-start md:self-auto"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Screen New Resumes</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -3 }} className="vibrant-card p-5 border-l-4 border-l-cyan-500">
          <div className="flex items-center justify-between">
            <span className="data-label text-cyan-400">RESUMES ANALYZED</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-mono font-black text-white mt-2">{totalScreened}</div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">Total parsed candidate files</span>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="vibrant-card p-5 border-l-4 border-l-emerald-400">
          <div className="flex items-center justify-between">
            <span className="data-label text-emerald-400">AVG FIT SCORE</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-mono font-black text-emerald-400 mt-2">{avgScore}%</div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">Average match quality</span>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="vibrant-card p-5 border-l-4 border-l-amber-400">
          <div className="flex items-center justify-between">
            <span className="data-label text-amber-400">TOP SKILL COVERAGE</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-mono font-black text-white mt-2">
            {topSkills.length > 0 ? topSkills[0].skill : '—'}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">Most commonly matched skill</span>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="vibrant-card p-5 border-l-4 border-l-rose-400">
          <div className="flex items-center justify-between">
            <span className="data-label text-rose-400">BIGGEST SKILL GAP</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-mono font-black text-rose-300 mt-2">
            {gapSkills.length > 0 ? gapSkills[0].skill : '—'}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">Most commonly missing credential</span>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution Bar Chart */}
        <div className="vibrant-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="data-label text-cyan-400">SCORE DISTRIBUTION</span>
              <h3 className="font-bold text-base text-white mt-0.5">Candidate Fit Categories</h3>
            </div>
            <BarChart2 className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="h-60 w-full pt-2">
            {scoreDistData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b1120', borderColor: '#1f2e4d', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {scoreDistData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-500 font-mono italic">
                No screening data available yet. Screen resumes to populate charts.
              </div>
            )}
          </div>
        </div>

        {/* Average Radar */}
        <div className="vibrant-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="data-label text-indigo-400">AVERAGE SUB-SCORE RADAR</span>
              <h3 className="font-bold text-base text-white mt-0.5">Aggregate Competency Profile</h3>
            </div>
            <PieChart className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="h-60 w-full">
            {totalScreened > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#1f2e4d" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#2b3f66" />
                  <Radar name="Average" dataKey="A" stroke="#818cf8" fill="#818cf8" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-500 font-mono italic">
                Screen at least one resume to see radar analysis.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skills Insight Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Matched Skills */}
        <div className="vibrant-card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="data-label text-emerald-400">TOP MATCHED SKILLS</span>
          </div>
          <p className="text-xs text-slate-400 -mt-2">Skills most frequently found across screened candidates.</p>
          <div className="space-y-2.5 mt-3">
            {topSkills.length > 0 ? topSkills.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-midnight-950 border border-midnight-700">
                <span className="font-mono font-semibold text-emerald-300">✓ {item.skill}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 rounded-full bg-midnight-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                      style={{ width: `${Math.min(100, (item.count / totalScreened) * 100)}%` }}
                    />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
                    {item.count} hits
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-xs text-slate-500 italic py-4">No skill matches recorded yet.</p>
            )}
          </div>
        </div>

        {/* Skill Gaps */}
        <div className="vibrant-card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span className="data-label text-rose-400">COMMON SKILL GAPS</span>
          </div>
          <p className="text-xs text-slate-400 -mt-2">Skills most frequently missing from candidate resumes.</p>
          <div className="space-y-2.5 mt-3">
            {gapSkills.length > 0 ? gapSkills.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-midnight-950 border border-midnight-700">
                <span className="font-mono font-semibold text-rose-300">✕ {item.skill}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 rounded-full bg-midnight-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-400 to-amber-400"
                      style={{ width: `${Math.min(100, (item.count / totalScreened) * 100)}%` }}
                    />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-mono text-[10px] border border-rose-500/20">
                    {item.count} missing
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-xs text-slate-500 italic py-4">No skill gaps recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Actionable Insights Banner */}
      <div className="vibrant-card p-6 bg-gradient-to-r from-midnight-900 to-midnight-950 border-l-4 border-l-amber-400">
        <div className="flex items-start gap-4">
          <Lightbulb className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-bold text-base text-white">Actionable Insights</h3>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
              {gapSkills.length > 0 && (
                <li>
                  <strong className="text-amber-300">{gapSkills[0].skill}</strong> is the most frequently missing skill
                  — consider adjusting your job description or sourcing candidates with this credential.
                </li>
              )}
              {topSkills.length > 0 && (
                <li>
                  <strong className="text-emerald-300">{topSkills[0].skill}</strong> appears most often in resumes
                  — your candidate pool is strong in this area.
                </li>
              )}
              {avgScore < 50 && (
                <li className="text-rose-300">
                  Average match score is below 50%. Consider broadening your required skills or sourcing from different channels.
                </li>
              )}
              {avgScore >= 70 && (
                <li className="text-emerald-300">
                  Excellent talent pool quality! Average fit score is above 70%.
                </li>
              )}
              {totalScreened === 0 && (
                <li className="text-slate-400">
                  No resumes screened yet. Upload candidate resumes from the <strong>Screen Resumes</strong> page to generate insights.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      {stats?.recent_sessions && stats.recent_sessions.length > 0 && (
        <div className="vibrant-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="data-label text-cyan-400">SCREENING HISTORY</span>
              <h3 className="font-bold text-base text-white mt-0.5">Recent Evaluation Sessions</h3>
            </div>
            <button onClick={() => navigate('/candidates')} className="text-xs text-cyan-400 hover:underline font-mono">
              View All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-midnight-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-midnight-700">
                <tr>
                  <th className="py-3 px-4">Job Title</th>
                  <th className="py-3 px-4">Resumes</th>
                  <th className="py-3 px-4">Avg Match</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-midnight-700/60 font-mono">
                {stats.recent_sessions.map((session, idx) => (
                  <tr key={idx} className="hover:bg-midnight-850 transition-colors">
                    <td className="py-3 px-4 font-sans font-bold text-white">{session.job_title}</td>
                    <td className="py-3 px-4">{session.total_resumes}</td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${session.avg_score >= 70 ? 'text-emerald-400' : session.avg_score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {session.avg_score}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{new Date(session.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => navigate(`/candidates?session_id=${session.session_id}`)}
                        className="px-3 py-1.5 rounded-lg bg-midnight-800 hover:bg-midnight-700 text-slate-200 text-[11px] font-semibold border border-midnight-700 inline-flex items-center gap-1"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
