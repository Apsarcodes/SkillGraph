import React from 'react';
import { User } from '../types';
import { Network, User as UserIcon, Shield, Sparkles, ChevronDown } from 'lucide-react';

interface NavbarProps {
  user: User;
  onOpenAuth: () => void;
  onLogout: () => void;
  targetRole: string;
  onTargetRoleChange: (role: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onLogout,
  targetRole,
  onTargetRoleChange,
}) => {
  const roles = [
    'Senior Full Stack & AI Systems Engineer',
    'AI / ML Platform Engineer',
    'Cloud DevOps & Distributed Systems Architect',
    'Data & Retrieval Systems Specialist',
  ];

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Network className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              SkillGraph AI
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              v1.0
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">Adaptive Career Intelligence & Skill Graph</p>
        </div>
      </div>

      {/* Target Role Selector & Controls */}
      <div className="flex items-center gap-4">
        {/* Role Selector */}
        <div className="hidden md:flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-slate-400 font-medium">Target Role:</span>
          <select
            value={targetRole}
            onChange={(e) => onTargetRoleChange(e.target.value)}
            className="bg-transparent text-xs text-slate-200 font-medium outline-none cursor-pointer pr-1"
          >
            {roles.map((r) => (
              <option key={r} value={r} className="bg-slate-800 text-slate-200">
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Demo Mode Badge */}
        {user.isDemo && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Demo Mode Active
          </div>
        )}

        {/* User Account / Auth Trigger */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          {user.isDemo ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-md shadow-indigo-600/20"
            >
              <UserIcon className="w-3.5 h-3.5" />
              Sign In / Register
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center border border-slate-600 text-xs font-bold text-slate-200">
                {user.fullName ? user.fullName[0] : 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-200">{user.fullName}</p>
                <p className="text-[10px] text-slate-400">{user.email}</p>
              </div>
              <button
                onClick={onLogout}
                className="text-xs text-slate-400 hover:text-rose-400 ml-2 px-2 py-1 rounded hover:bg-slate-800 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
