import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  GitGraph,
  Compass,
  BotMessageSquare,
  Award,
  Sparkles,
  BarChart3,
  Mail,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'resume'
  | 'job'
  | 'graph'
  | 'roadmap'
  | 'mentor'
  | 'assessments'
  | 'planner'
  | 'ml'
  | 'career_docs'
  | 'privacy'
  | 'docs';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const sections = [
    {
      title: 'Navigation',
      items: [
        { id: 'dashboard' as NavTab, label: 'Overview Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Career Intelligence',
      items: [
        { id: 'resume' as NavTab, label: 'Resume Analyzer', icon: FileText },
        { id: 'job' as NavTab, label: 'Job Gap Matcher', icon: Briefcase },
        { id: 'graph' as NavTab, label: 'Interactive Skill Graph', icon: GitGraph },
        { id: 'roadmap' as NavTab, label: 'Adaptive Roadmap', icon: Compass },
      ],
    },
    {
      title: 'AI & Systems',
      items: [
        { id: 'mentor' as NavTab, label: 'AI Mentor (RAG)', icon: BotMessageSquare },
        { id: 'assessments' as NavTab, label: 'Skill Assessments', icon: Award },
        { id: 'planner' as NavTab, label: 'Agentic Planner', icon: Sparkles },
        { id: 'ml' as NavTab, label: 'NLP & ML Insights', icon: BarChart3 },
      ],
    },
    {
      title: 'Tools & Compliance',
      items: [
        { id: 'career_docs' as NavTab, label: 'Career Doc Generator', icon: Mail },
        { id: 'privacy' as NavTab, label: 'Privacy & Security', icon: ShieldCheck },
        { id: 'docs' as NavTab, label: 'Architecture & Docs', icon: BookOpen },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-4 space-y-6">
        {sections.map((sec, idx) => (
          <div key={idx}>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              {sec.title}
            </p>
            <nav className="space-y-1">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* System Status Footnote */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span>Engine Status:</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Operational
          </span>
        </div>
        <p className="text-[10px] text-slate-500">FastAPI • SQLite / Supabase • RAG</p>
      </div>
    </aside>
  );
};
