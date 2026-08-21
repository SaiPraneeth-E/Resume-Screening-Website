import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Award,
  CheckCircle2,
  XCircle,
  Briefcase,
  GraduationCap,
  Loader2,
  FileText,
  HelpCircle,
  Copy,
  Check,
  Send,
  Sparkles,
  Code
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { CandidateDetailResponse, InterviewKitResponse, OutreachEmailResponse } from '../types';
import { ScoreBadge } from '../components/common/ScoreBadge';
import { SkillGroup } from '../components/common/SkillGroup';

export const CandidateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<CandidateDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'experience' | 'assessment' | 'interview' | 'raw'>('overview');

  // Interview Kit & Outreach States
  const [interviewKit, setInterviewKit] = useState<InterviewKitResponse | null>(null);
  const [loadingKit, setLoadingKit] = useState(false);
  const [outreachEmail, setOutreachEmail] = useState<OutreachEmailResponse | null>(null);
  const [showOutreachModal, setShowOutreachModal] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (id) fetchCandidate();
  }, [id]);

  const fetchCandidate = async () => {
    try {
      const resp = await api.getCandidate(id!);
      setData(resp);
    } catch (err) {
      console.error('Failed to load candidate details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviewKit = async () => {
    if (!id || interviewKit) return;
    setLoadingKit(true);
    try {
      const kit = await api.getInterviewQuestions(id);
      setInterviewKit(kit);
    } catch (err) {
      console.error('Failed to load interview kit:', err);
    } finally {
      setLoadingKit(false);
    }
  };

  const handleOpenOutreachModal = async () => {
    if (!id) return;
    setShowOutreachModal(true);
    if (!outreachEmail) {
      try {
        const mail = await api.getOutreachEmail(id);
        setOutreachEmail(mail);
      } catch (err) {
        console.error('Failed to load outreach email:', err);
      }
    }
  };

  const handleCopyEmail = () => {
    if (!outreachEmail) return;
    const textToCopy = `Subject: ${outreachEmail.subject}\n\n${outreachEmail.body}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleToggleShortlist = async () => {
    if (!data) return;
    try {
      const res = await api.toggleShortlist(data.candidate.id);
      setData({
        ...data,
        candidate: { ...data.candidate, is_shortlisted: res.shortlisted }
      });
    } catch (err) {
      console.error('Shortlist toggle failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        <span className="text-xs font-mono">Opening candidate dossier...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="vibrant-card p-12 text-center text-slate-400">
        <p className="text-sm">Candidate dossier record not found.</p>
        <button onClick={() => navigate('/candidates')} className="mt-4 text-xs text-cyan-400 underline font-mono">
          Return to Candidate Rankings
        </button>
      </div>
    );
  }

  const candidate = data.candidate;
  const analysis = data.screening_analysis;
  const parsed = data.parsed_resume;

  const radarData = analysis ? [
    { subject: 'Skill Match', A: analysis.sub_scores.skill_match, fullMark: 100 },
    { subject: 'Semantic Fit', A: analysis.sub_scores.semantic_fit, fullMark: 100 },
    { subject: 'Experience', A: analysis.sub_scores.experience, fullMark: 100 },
    { subject: 'Projects', A: analysis.sub_scores.projects, fullMark: 100 },
    { subject: 'Education', A: analysis.sub_scores.education, fullMark: 100 },
    { subject: 'Certifications', A: analysis.sub_scores.certifications, fullMark: 100 },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/candidates')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Rankings</span>
        </button>

        <button
          onClick={handleOpenOutreachModal}
          className="btn-gradient text-xs px-4 py-2 flex items-center gap-2"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Draft Outreach Email</span>
        </button>
      </div>

      {/* Candidate Dossier Header Card */}
      <div className="vibrant-card p-6 md:p-8 bg-midnight-900 border-midnight-700">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-midnight-700">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-0.5 shadow-glow-cyan flex items-center justify-center text-white font-mono font-black text-2xl shrink-0">
              {candidate.name.split(' ').map(n => n[0]).join('')}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="data-label text-cyan-400">CANDIDATE PROFILE</span>
                <h1 className="text-2xl font-bold text-white">{candidate.name}</h1>
                <button
                  onClick={handleToggleShortlist}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    candidate.is_shortlisted
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'border-midnight-700 text-slate-500 hover:text-amber-400'
                  }`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                {candidate.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" /> {candidate.email}
                  </span>
                )}
                {candidate.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" /> {candidate.phone}
                  </span>
                )}
                {candidate.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> {candidate.location}
                  </span>
                )}
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 pt-1">
                {candidate.linkedin && (
                  <a href={candidate.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-cyan-400">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {candidate.github && (
                  <a href={candidate.github} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-cyan-400">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {candidate.portfolio && (
                  <a href={candidate.portfolio} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-cyan-400">
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {analysis && (
            <ScoreBadge
              score={analysis.overall_score}
              category={analysis.score_category}
              size="lg"
            />
          )}
        </div>

        {/* Dossier Tabs */}
        <div className="flex items-center gap-2 pt-6 overflow-x-auto font-mono text-xs">
          {[
            { id: 'overview', label: 'Analytics & Radar' },
            { id: 'skills', label: 'Skills Evaluation' },
            { id: 'experience', label: 'Experience & Credentials' },
            { id: 'assessment', label: 'Fit Assessment' },
            { id: 'interview', label: 'Interview Kit' },
            { id: 'raw', label: 'Parsed Resume JSON' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'interview') fetchInterviewKit();
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shadow-glow-cyan/20'
                  : 'bg-midnight-950 text-slate-400 hover:text-slate-200 border border-midnight-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Views */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Radar Chart */}
          <div className="vibrant-card lg:col-span-1 p-6 space-y-4">
            <span className="data-label text-cyan-400">CANDIDATE FIT RADAR ANALYTICS</span>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#1f2e4d" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#2b3f66" />
                  <Radar name="Candidate" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Assessment Summary */}
          <div className="vibrant-card lg:col-span-2 p-6 space-y-6">
            <div>
              <span className="data-label text-cyan-400 block mb-2">RECRUITING ASSESSMENT SUMMARY</span>
              <p className="text-sm text-slate-300 font-serif leading-relaxed italic bg-midnight-950 p-4 rounded-lg border border-midnight-700">
                "{analysis?.explanation || "Evaluation metrics processed from parsed resume and job description criteria."}"
              </p>
            </div>

            {/* Sub-scores Grid */}
            {analysis?.sub_scores && (
              <div>
                <span className="data-label text-slate-400 block mb-2">MATCH SUB-SCORE BREAKDOWN</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-midnight-950 border border-midnight-700">
                    <span className="text-[10px] text-slate-400 block">SKILL MATCH</span>
                    <span className="text-base font-bold text-cyan-400">{analysis.sub_scores.skill_match}%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-midnight-950 border border-midnight-700">
                    <span className="text-[10px] text-slate-400 block">SEMANTIC FIT</span>
                    <span className="text-base font-bold text-emerald-400">{analysis.sub_scores.semantic_fit}%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-midnight-950 border border-midnight-700">
                    <span className="text-[10px] text-slate-400 block">EXPERIENCE</span>
                    <span className="text-base font-bold text-amber-400">{analysis.sub_scores.experience}%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-midnight-950 border border-midnight-700">
                    <span className="text-[10px] text-slate-400 block">PROJECTS</span>
                    <span className="text-base font-bold text-indigo-400">{analysis.sub_scores.projects}%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-midnight-950 border border-midnight-700">
                    <span className="text-[10px] text-slate-400 block">EDUCATION</span>
                    <span className="text-base font-bold text-sky-400">{analysis.sub_scores.education}%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-midnight-950 border border-midnight-700">
                    <span className="text-[10px] text-slate-400 block">CERTIFICATIONS</span>
                    <span className="text-base font-bold text-rose-400">{analysis.sub_scores.certifications}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Strengths & Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-4 h-4" /> VERIFIED STRENGTHS
                </span>
                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                  {analysis?.strengths.map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 space-y-2">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 font-mono">
                  <XCircle className="w-4 h-4" /> IDENTIFIED SKILL GAPS
                </span>
                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                  {analysis?.gaps.map((gap, idx) => (
                    <li key={idx}>{gap}</li>
                  ))}
                </ul>
              </div>

              {analysis?.missing_in_resume && analysis.missing_in_resume.length > 0 && (
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 font-mono">
                    <HelpCircle className="w-4 h-4" /> MISSING IN RESUME
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {analysis.missing_in_resume.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis?.recommendations && analysis.recommendations.length > 0 && (
                <div className="p-4 rounded-lg bg-sky-500/10 border border-sky-500/20 space-y-2">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-4 h-4" /> RECOMMENDATIONS TO ADD
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {analysis.recommendations.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="vibrant-card p-6 space-y-6">
          <span className="data-label text-cyan-400 block mb-2">CATEGORIZED SKILL EVALUATION</span>
          <SkillGroup
            matched={analysis?.matched_skills || []}
            missing={analysis?.missing_skills || []}
            additional={parsed?.skills || []}
          />
        </div>
      )}

      {activeTab === 'experience' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Work Experience */}
          <div className="vibrant-card p-6 space-y-4">
            <span className="data-label text-slate-400 block mb-2">WORK EXPERIENCE TIMELINE</span>
            {parsed?.experience.map((exp, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-midnight-950 border border-midnight-700 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">{exp.role}</h4>
                  <span className="text-[11px] text-slate-500 font-mono">{exp.duration}</span>
                </div>
                <p className="text-xs text-cyan-400 font-medium">{exp.company}</p>
                <ul className="pt-2 text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {exp.responsibilities.map((resp, rindex) => (
                    <li key={rindex}>{resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="vibrant-card p-6 space-y-4">
            <span className="data-label text-slate-400 block mb-2">EDUCATION & DEGREES</span>
            {parsed?.education.map((edu, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-midnight-950 border border-midnight-700 space-y-1">
                <h4 className="font-bold text-sm text-white">{edu.degree}</h4>
                <p className="text-xs text-emerald-400">{edu.institution}</p>
                {edu.year && <span className="text-[11px] text-slate-500 block font-mono">Graduated: {edu.year}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'assessment' && (
        <div className="vibrant-card p-6 space-y-6">
          <span className="data-label text-cyan-400 block mb-2">DETAILED FIT ASSESSMENT</span>
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-lg bg-midnight-950 border border-midnight-700 space-y-2">
              <span className="font-bold text-cyan-400 block font-mono">MATCH EXPLANATION</span>
              <p className="font-serif text-sm italic leading-relaxed text-slate-200">{analysis?.explanation}</p>
            </div>

            <div className="p-4 rounded-lg bg-midnight-950 border border-midnight-700 space-y-2">
              <span className="font-bold text-emerald-400 block font-mono">EXPERIENCE ALIGNMENT</span>
              <p className="leading-relaxed">{analysis?.experience_alignment}</p>
            </div>
          </div>
        </div>
      )}

      {/* Feature 1: Tailored Interview Kit Tab */}
      {activeTab === 'interview' && (
        <div className="vibrant-card p-6 space-y-6">
          <div>
            <span className="data-label text-cyan-400">TAILORED INTERVIEW KIT</span>
            <h3 className="font-bold text-base text-white mt-1">Evidence-Grounded Probing Questions</h3>
            <p className="text-xs text-slate-400">Custom questions generated for {candidate.name} based on missing credentials and matched skills.</p>
          </div>

          {loadingKit ? (
            <div className="flex items-center gap-3 text-slate-400 py-8">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
              <span className="text-xs font-mono">Generating interview benchmarks...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {interviewKit?.questions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-midnight-950 border border-midnight-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] uppercase font-bold">
                      {q.category} — {q.target_skill}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-500">Q{idx + 1}</span>
                  </div>

                  <p className="text-sm font-bold text-white leading-relaxed">{q.question}</p>

                  <div className="p-3 rounded-lg bg-midnight-900 border border-midnight-700 text-xs text-slate-300 space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block">WHAT TO LISTEN FOR:</span>
                    <p className="text-slate-400 italic">{q.what_to_listen_for}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Raw Parsed Resume Tab */}
      {activeTab === 'raw' && (
        <div className="vibrant-card p-6 space-y-6 font-mono text-xs">
          <div>
            <span className="data-label text-slate-400">PARSED RESUME STRUCTURE</span>
            <h3 className="font-bold text-sm text-white mt-1">Extracted Document Data</h3>
          </div>

          {parsed ? (
            <pre className="p-4 rounded-lg bg-midnight-950 border border-midnight-700 text-emerald-400 overflow-x-auto leading-relaxed">
              {JSON.stringify(parsed, null, 2)}
            </pre>
          ) : (
            <p className="text-slate-500 italic">No parsed resume JSON available.</p>
          )}

          {data.raw_text && (
            <div className="space-y-2 pt-4 border-t border-midnight-700">
              <span className="data-label text-slate-400">RAW RESUME TEXT EXTRACT</span>
              <pre className="p-4 rounded-lg bg-midnight-950 border border-midnight-700 text-slate-300 whitespace-pre-wrap font-mono text-xs leading-relaxed">
                {data.raw_text}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Feature 2: Personalized Outreach Email Drawer Modal */}
      {showOutreachModal && (
        <div className="fixed inset-0 z-50 bg-midnight-950/85 backdrop-blur-md flex items-center justify-center p-6">
          <div className="vibrant-card max-w-lg w-full p-6 space-y-4 bg-midnight-900 border-midnight-700 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-midnight-700">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Draft Candidate Outreach Email</h3>
              </div>
              <button onClick={() => setShowOutreachModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {!outreachEmail ? (
              <div className="flex items-center gap-3 text-slate-400 py-8">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                <span className="text-xs font-mono">Generating email draft...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Subject Line</label>
                  <input
                    type="text"
                    readOnly
                    value={outreachEmail.subject}
                    className="w-full bg-midnight-950 border border-midnight-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Email Body Draft</label>
                  <textarea
                    rows={8}
                    readOnly
                    value={outreachEmail.body}
                    className="w-full bg-midnight-950 border border-midnight-700 rounded-lg p-3 text-xs text-slate-100 font-mono leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-slate-500 font-mono">Ready to send via recruiter inbox</span>
                  <button
                    onClick={handleCopyEmail}
                    className="btn-gradient text-xs px-4 py-2 flex items-center gap-2"
                  >
                    {copiedEmail ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedEmail ? 'Copied to Clipboard!' : 'Copy Email Draft'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
