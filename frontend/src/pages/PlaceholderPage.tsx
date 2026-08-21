import React from 'react';
import { Settings, Key, HelpCircle, Construction } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const PlaceholderPage: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  
  let title = 'Page Content';
  let icon = <Construction className="w-16 h-16 text-cyan-400 mb-6" />;
  
  if (path.includes('settings')) {
    title = 'Platform Settings';
    icon = <Settings className="w-16 h-16 text-cyan-400 mb-6 animate-spin-slow" />;
  } else if (path.includes('api-keys')) {
    title = 'API Keys Management';
    icon = <Key className="w-16 h-16 text-emerald-400 mb-6" />;
  } else if (path.includes('help')) {
    title = 'Help Center & Documentation';
    icon = <HelpCircle className="w-16 h-16 text-indigo-400 mb-6" />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="p-8 rounded-2xl bg-midnight-900 border border-midnight-700 shadow-2xl flex flex-col items-center justify-center w-full relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {icon}
        <h1 className="text-3xl font-bold text-white mb-3">{title}</h1>
        <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
          This feature module is currently under active development. You will be able to configure and manage these resources in the upcoming version release.
        </p>
        
        <div className="mt-8 px-4 py-2 rounded-lg bg-midnight-950 border border-midnight-800 text-xs text-slate-500 font-mono inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Module Status: Under Construction
        </div>
      </div>
    </div>
  );
};
