import React from 'react';
import { motion } from 'framer-motion';

export const EvidenceConnector: React.FC = () => {
  return (
    <div className="w-full recruiter-card p-6 space-y-6 bg-charcoal-950 border-charcoal-800">
      <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
        <span className="data-label text-sage-400">RESUME → EVIDENCE EXTRACTION ENGINE</span>
        <span className="text-[10px] font-mono text-slate-500">Unstructured Document Mapping</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
        {/* Left Side: Realistic Resume Snippet */}
        <div className="p-4 rounded-lg bg-charcoal-900 border border-charcoal-800 font-mono text-xs space-y-3">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-sans font-bold">
            RAW RESUME TEXT INPUT
          </div>
          <div className="p-3 rounded bg-charcoal-950 border border-charcoal-800 text-slate-300 space-y-2">
            <p className="border-l-2 border-sage-500 pl-2 text-slate-200">
              "Built scalable backend API services using <span className="text-sage-300 font-bold bg-sage-500/10 px-1 rounded">FastAPI</span> and <span className="text-sage-300 font-bold bg-sage-500/10 px-1 rounded">PostgreSQL</span>."
            </p>
            <p className="border-l-2 border-emerald-500 pl-2 text-slate-200">
              "Developed interactive SaaS frontend dashboards using <span className="text-emerald-300 font-bold bg-emerald-500/10 px-1 rounded">React</span> and <span className="text-emerald-300 font-bold bg-emerald-500/10 px-1 rounded">TypeScript</span>."
            </p>
          </div>
        </div>

        {/* Right Side: Extracted Hiring Evidence */}
        <div className="p-4 rounded-lg bg-charcoal-900 border border-charcoal-800 font-sans space-y-3">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
            STRUCTURED HIRING SIGNALS
          </div>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-charcoal-950 border border-charcoal-800">
              <span className="text-slate-400">Backend Credentials:</span>
              <span className="text-sage-400 font-bold">FastAPI, PostgreSQL</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-charcoal-950 border border-charcoal-800">
              <span className="text-slate-400">Frontend Credentials:</span>
              <span className="text-emerald-400 font-bold">React, TypeScript</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-charcoal-950 border border-charcoal-800">
              <span className="text-slate-400">Signal Confidence:</span>
              <span className="text-sage-300 font-bold">98% Explicit Evidence</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
