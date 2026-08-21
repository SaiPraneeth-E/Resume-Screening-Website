import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Plus, Trash2, FileCheck2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { Job } from '../types';

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Job Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const list = await api.listJobs();
      setJobs(list);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    try {
      const newJob = await api.createJob({ title, company, description });
      setJobs([newJob, ...jobs]);
      setShowModal(false);
      setTitle('');
      setCompany('');
      setDescription('');
    } catch (err) {
      console.error('Failed to create job:', err);
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await api.deleteJob(id);
      setJobs(jobs.filter(j => j.id !== id));
    } catch (err) {
      console.error('Failed to delete job:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        <span className="text-xs font-mono">Loading job briefs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-midnight-700/80">
        <div>
          <span className="data-label text-cyan-400">TARGET ROLES</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
            Job Specifications & <span className="editorial-title text-cyan-300">Criteria</span>
          </h1>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-glow-cyan"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Job Specification</span>
        </motion.button>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map(j => (
          <motion.div
            key={j.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="vibrant-card p-6 space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">{j.title}</h3>
                  <p className="text-xs text-cyan-400 font-mono">{j.company}</p>
                </div>
                <button
                  onClick={() => handleDeleteJob(j.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400 font-serif line-clamp-3 mt-3 italic">{j.description}</p>

              <div className="pt-4">
                <span className="data-label block mb-1.5">REQUIRED SKILLS</span>
                <div className="flex flex-wrap gap-1">
                  {j.required_skills.slice(0, 6).map((sk, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-mono text-[10px]">
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/screen`)}
              className="w-full py-2.5 rounded bg-midnight-800 hover:bg-midnight-700 border border-midnight-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Screen Resumes for Job</span>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Create Job Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-midnight-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="vibrant-card max-w-lg w-full p-6 space-y-4 bg-midnight-900 border-midnight-700">
            <h3 className="font-bold text-lg text-white">New Job Specification</h3>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Position Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Data Engineer"
                  className="w-full bg-midnight-950 border border-midnight-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Company / Department</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. DataPulse Systems"
                  className="w-full bg-midnight-950 border border-midnight-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Specification Body</label>
                <textarea
                  rows={6}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Paste job requirements, required skills, and responsibilities..."
                  className="w-full bg-midnight-950 border border-midnight-700 rounded-lg p-3 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-midnight-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-midnight-950 text-xs font-bold"
                >
                  Save Specification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
