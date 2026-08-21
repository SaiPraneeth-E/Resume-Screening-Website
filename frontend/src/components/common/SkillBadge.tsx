import React from 'react';
import { CheckCircle2, XCircle, PlusCircle } from 'lucide-react';

interface SkillBadgeProps {
  skill: string;
  type?: 'matched' | 'missing' | 'additional' | 'neutral';
  size?: 'sm' | 'md';
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
  skill,
  type = 'neutral',
  size = 'md'
}) => {
  const styles = {
    matched: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20',
    missing: 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20',
    additional: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
  }[type];

  const icons = {
    matched: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
    missing: <XCircle className="w-3.5 h-3.5 text-rose-400" />,
    additional: <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />,
    neutral: null
  }[type];

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border transition-colors ${padding} ${styles}`}>
      {icons}
      {skill}
    </span>
  );
};
