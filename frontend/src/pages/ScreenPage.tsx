import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  Cpu,
  Loader2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { Job } from '../types';

export const ScreenPage: React.FC = () => {
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [jobTitle, setJobTitle] = useState('Senior Full Stack AI Engineer');
  const [company, setCompany] = useState('Cognitive Cloud AI');
  const [jobDescription, setJobDescription] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Workflow Processing Overlay State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const list = await api.listJobs();
        setJobs(list);
        if (list.length > 0) {
          setSelectedJobId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load jobs list:', err);
      }
    };
    fetchJobs();
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    setErrorMsg(null);
    const validFiles = acceptedFiles.filter(
      file => file.name.endsWith('.pdf') || file.name.endsWith('.txt')
    );
    if (validFiles.length !== acceptedFiles.length) {
      setErrorMsg('Only PDF and TXT file formats are supported.');
    }
    setFiles(prev => [...prev, ...validFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024
  });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const steps = [
    "Resume documents received",
    "Raw text and contact links extracted",
    "Technical credentials and skills parsed",
    "SentenceTransformer embeddings generated",
    "Hybrid match scores calculated",
    "Evidence-grounded fit assessments compiled",
    "Candidate shortlist rankings ready"
  ];

  const handleStartScreening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setErrorMsg('Please upload at least one candidate resume PDF or TXT file.');
      return;
    }

    if (!selectedJobId && (!jobDescription || jobDescription.trim().length < 20)) {
      setErrorMsg('Please select a target job brief or paste job requirements.');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 700);

    try {
      const formData = new FormData();
      if (selectedJobId) {
        formData.append('job_id', selectedJobId);
      } else {
        formData.append('job_title', jobTitle);
        formData.append('company', company);
        formData.append('job_description', jobDescription);
      }

      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await api.screenResumes(formData);
      clearInterval(stepInterval);
      
      navigate('/candidates', { state: { sessionData: response } });
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsProcessing(false);
      setErrorMsg(err.response?.data?.detail || 'Screening process failed. Please check server status.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Step Indicator Header */}
      <div className="pb-6 border-b border-midnight-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="data-label text-cyan-400">AI SCREENING ENGINE</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
            Screen Candidate <span className="gradient-text">Resumes</span>
          </h1>
        </div>

        {/* Step Flow Indicators */}
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">01 Job Specification</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-3 py-1 rounded-full bg-midnight-800 border border-midnight-700 text-slate-300">02 PDF Upload</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-3 py-1 rounded-full bg-midnight-850 border border-midnight-800 text-slate-500">03 AI Match</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form Layout */}
      <form onSubmit={handleStartScreening} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Document Styled Job Brief Editor */}
          <div className="vibrant-card p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-midnight-700">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">Target Job Specification</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Select Job Specification</label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => {
                      setSelectedJobId(e.target.value);
                      if (e.target.value) setJobDescription('');
                    }}
                    className="w-full bg-midnight-950 border border-midnight-700 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/60"
                  >
                    <option value="" className="bg-midnight-950 text-slate-100">-- Create Custom Job Specification --</option>
                    {jobs.map(j => (
                      <option key={j.id} value={j.id} className="bg-midnight-950 text-slate-100">
                        {j.title} ({j.company})
                      </option>
                    ))}
                  </select>
                </div>

                {!selectedJobId && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Position Title</label>
                        <input
                          type="text"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          placeholder="e.g. Senior Software Engineer"
                          className="w-full bg-midnight-950 border border-midnight-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/60"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Company / Team</label>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="e.g. Acme Corp"
                          className="w-full bg-midnight-950 border border-midnight-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/60"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-400">Job Specification Body</label>
                        <span className="text-[10px] font-mono text-slate-500">{jobDescription.length} chars</span>
                      </div>
                      <textarea
                        rows={8}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste required skills (Python, React, SQL), experience requirements, and key responsibilities..."
                        className="w-full bg-midnight-950 border border-midnight-700 rounded-lg p-3 text-xs text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Candidate Resumes Document Uploader */}
          <div className="vibrant-card p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-midnight-700">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">Candidate Resumes</h3>
              </div>

              {/* Dropzone area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-glow-cyan'
                    : 'border-midnight-700 hover:border-slate-500 bg-midnight-950'
                }`}
              >
                <input {...getInputProps()} />
                <UploadCloud className="w-10 h-10 mx-auto text-cyan-400 mb-3" />
                <p className="font-bold text-xs text-slate-200">
                  {isDragActive ? 'Drop candidate PDF resumes here now...' : 'Add Candidate Resumes'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Drag & drop PDF files or click to browse</p>
                <span className="inline-block mt-3 px-3 py-1 rounded-full bg-midnight-850 text-[10px] text-slate-400 font-mono border border-midnight-700">
                  PDF, TXT (Max 10MB per document)
                </span>
              </div>

              {/* Uploaded document rows */}
              {files.length > 0 && (
                <div className="mt-5 space-y-2 max-h-48 overflow-y-auto pr-1">
                  <span className="data-label text-slate-400">ATTACHED DOCUMENTS ({files.length}):</span>
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-midnight-950 border border-midnight-700 text-xs font-mono">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate text-slate-200 font-sans font-medium">{file.name}</span>
                        <span className="text-[10px] text-slate-500">
                          ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isProcessing || files.length === 0}
            className="w-full md:w-auto btn-gradient text-sm px-8 py-3.5 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Candidates...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Analyze & Rank Candidates ({files.length})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Vertical Processing Overlay Timeline */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-midnight-950/85 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="vibrant-card max-w-md w-full p-8 text-center space-y-6 border-midnight-700 bg-midnight-900 shadow-2xl">
              <div className="w-14 h-14 rounded-full bg-midnight-800 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-glow-cyan">
                <Cpu className="w-7 h-7 animate-pulse" />
              </div>

              <div>
                <h3 className="font-extrabold text-lg text-white">Evaluating Candidate Resumes</h3>
                <p className="text-xs text-slate-400 mt-1">Executing PyMuPDF extraction & sentence-transformer embeddings...</p>
              </div>

              <div className="space-y-3 text-left font-mono">
                {steps.map((st, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    {idx < currentStep ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : idx === currentStep ? (
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-midnight-700 shrink-0" />
                    )}
                    <span className={idx === currentStep ? "text-cyan-300 font-bold" : idx < currentStep ? "text-slate-300" : "text-slate-600"}>
                      {st}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
