import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Cpu,
  ArrowRight,
  Sparkles,
  BarChart3,
  Zap,
  Globe,
  Database,
  Search,
  LayoutDashboard,
  ShieldCheck,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BrandLogo } from '../components/common/BrandLogo';
import { AmbientBackground } from '../components/common/AmbientBackground';
import { ScoreGaugeGraphic } from '../components/graphics/ScoreGaugeGraphic';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-midnight-950 text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-300 relative overflow-x-hidden">
      {/* Animated Light Beams & Particles */}
      <AmbientBackground />

      {/* Dynamic Cursor Glow Effect */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[120px] mix-blend-screen z-0 hidden lg:block"
        animate={{
          x: mousePosition.x - 200,
          y: mousePosition.y - 200,
        }}
        transition={{ type: 'spring', damping: 40, stiffness: 100, mass: 0.5 }}
      />

      {/* Navigation Header */}
      <header className="border-b border-midnight-700/50 bg-midnight-950/60 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <BrandLogo size="md" />

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold">
            <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-cyan-300 transition-colors">
              Platform
            </button>
            <a href="#features" className="text-slate-400 hover:text-emerald-300 transition-colors">
              Features
            </a>
            <button onClick={() => navigate('/candidates')} className="text-slate-400 hover:text-indigo-300 transition-colors">
              Candidates
            </button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/screen')}
            className="btn-gradient text-xs px-5 py-2.5 flex items-center gap-2 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4" />
              <span>Screen Resumes</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </motion.button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-32 px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Hero Left Narrative */}
          <div className="space-y-8 relative">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-sm"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>Next-Gen AI Recruiting Engine</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]"
            >
              Hire smarter with <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400">semantic AI.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="text-lg text-slate-300 leading-relaxed font-sans max-w-xl"
            >
              Eliminate manual screening. Our AI reads resumes like a senior engineering manager—evaluating deep semantic fit, verifying tech stacks, and surfacing the top 1% of talent instantly.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(6, 182, 212, 0.4)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/screen')}
                className="btn-gradient text-sm px-8 py-4 flex items-center gap-2 shadow-glow-cyan"
              >
                <span>Start Screening Now</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: "rgba(30, 41, 59, 0.8)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/dashboard')}
                className="bg-midnight-800/50 backdrop-blur-md border border-midnight-700 text-slate-200 font-semibold text-sm px-8 py-4 rounded-xl flex items-center gap-2 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                <span>Explore Dashboard</span>
              </motion.button>
            </motion.div>
            
            {/* Trust Indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="pt-10 flex items-center gap-6 text-slate-400 font-mono text-xs"
            >
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`w-8 h-8 rounded-full border border-midnight-700 bg-midnight-800 flex items-center justify-center`}>
                      <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  ))}
               </div>
               <p><span className="text-white font-bold">10,000+</span> resumes evaluated</p>
            </motion.div>
          </div>

          {/* Hero Right Interactive Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.3, type: "spring", bounce: 0.4 }}
            className="relative lg:ml-10 perspective-1000"
          >
            {/* Abstract Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-emerald-500/20 blur-3xl -z-10 rounded-full animate-pulse" />
            
            {/* Interactive Floating Card */}
            <motion.div 
              className="vibrant-card p-8 pb-16 border-t border-l border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl relative overflow-hidden"
              whileHover={{ y: -5, boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400" />
              
              <div className="flex items-start justify-between mb-8">
                <div>
                  <span className="data-label text-cyan-400 mb-1 block">LIVE EVALUATION</span>
                  <h3 className="font-bold text-xl text-white">Senior Backend Engineer</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">Analyzing candidate profile...</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-midnight-900 border border-midnight-700 flex items-center justify-center shadow-inner">
                  <Database className="w-5 h-5 text-indigo-400" />
                </div>
              </div>

              <div className="flex justify-center mb-8 relative">
                <div className="absolute inset-0 bg-cyan-500/10 blur-2xl rounded-full scale-150 -z-10" />
                <motion.div
                  initial={{ rotate: -180, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.6, type: "spring" }}
                >
                  <ScoreGaugeGraphic 
                    score={94} 
                    subScores={{ skill: 98, semantic: 91, experience: 92 }} 
                  />
                </motion.div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <span className="data-label block text-emerald-400">KEY MATCHES IDENTIFIED</span>
                <div className="flex flex-wrap gap-2">
                  {["Python", "FastAPI", "PostgreSQL", "Kafka", "AWS"].map((sk, idx) => (
                    <motion.span 
                      key={idx} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + (idx * 0.1) }}
                      className="px-3 py-1.5 rounded-md bg-midnight-900 border border-midnight-700 text-slate-200"
                    >
                      <span className="text-emerald-400 mr-1.5">✓</span>
                      {sk}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
            
            {/* Floating decoration elements */}
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-8 p-4 rounded-2xl bg-midnight-800/90 backdrop-blur-md border border-midnight-700 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-white">Strongly Recommended</p>
                  <p className="text-[10px] text-slate-400 font-mono">Top 5% of applicant pool</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="data-label text-cyan-400 tracking-[0.2em]"
          >
            ENTERPRISE CAPABILITIES
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-white tracking-tight"
          >
            Built for modern engineering teams.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-slate-400 font-sans"
          >
            Move beyond fragile keyword matching. Our pipeline leverages large language models and vector embeddings to truly understand candidate experience.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Cpu,
              title: "Semantic Understanding",
              desc: "Embeddings capture context. If you need 'React', we recognize 'Next.js' and 'Frontend Engineering' as highly relevant.",
              color: "text-cyan-400",
              bg: "bg-cyan-500/10",
              border: "border-cyan-500/30",
              hoverBorder: "hover:border-cyan-500/60"
            },
            {
              icon: BarChart3,
              title: "Custom Weighting Matrix",
              desc: "Dial in the exact scoring algorithm you need. Prioritize pure technical skill or emphasize relevant past experience dynamically.",
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
              border: "border-emerald-500/30",
              hoverBorder: "hover:border-emerald-500/60"
            },
            {
              icon: ShieldCheck,
              title: "Evidence-Grounded",
              desc: "Every score is backed by extracted text. See exactly why a candidate was recommended without black-box mystery.",
              color: "text-indigo-400",
              bg: "bg-indigo-500/10",
              border: "border-indigo-500/30",
              hoverBorder: "hover:border-indigo-500/60"
            },
            {
              icon: Zap,
              title: "Instant Interview Prep",
              desc: "Generate tailored interview questions based on the candidate's specific skill gaps and strengths automatically.",
              color: "text-rose-400",
              bg: "bg-rose-500/10",
              border: "border-rose-500/30",
              hoverBorder: "hover:border-rose-500/60"
            },
            {
              icon: Search,
              title: "Deep Parsing Engine",
              desc: "Extracts nuanced data from messy PDFs. Identifies distinct projects, durations, and overlapping technology stacks.",
              color: "text-amber-400",
              bg: "bg-amber-500/10",
              border: "border-amber-500/30",
              hoverBorder: "hover:border-amber-500/60"
            },
            {
              icon: Globe,
              title: "Local & Secure",
              desc: "Process sensitive applicant data locally. No external APIs required for the core semantic search pipeline.",
              color: "text-sky-400",
              bg: "bg-sky-500/10",
              border: "border-sky-500/30",
              hoverBorder: "hover:border-sky-500/60"
            }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className={`vibrant-card p-8 group transition-all duration-300 ${feature.hoverBorder}`}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.border} border flex items-center justify-center ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white mb-3">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-sans group-hover:text-slate-300 transition-colors">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="mt-20 border-t border-midnight-700/80 bg-midnight-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 py-20 text-center space-y-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Ready to transform your hiring?</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/screen')}
            className="btn-gradient text-base px-12 py-5 mx-auto inline-flex items-center gap-3 shadow-glow-cyan rounded-xl"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">Launch Resume Screener</span>
          </motion.button>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 border-t border-midnight-800 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-500">
          <BrandLogo size="sm" />
          <p>© 2026 Smart Resume Screener. Designed for the Future of Recruitment.</p>
        </div>
      </footer>
    </div>
  );
};
