import React from 'react';
import {
  ResumeAnalysisResult,
  JobAnalysisResult,
  RoadmapTask,
  User,
} from '../types';
import {
  Target,
  Award,
  AlertTriangle,
  Compass,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Upload,
  Briefcase,
} from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface DashboardViewProps {
  user: User;
  resume: ResumeAnalysisResult;
  job: JobAnalysisResult;
  roadmap: RoadmapTask[];
  onNavigate: (tab: NavTab) => void;
  onToggleTask: (taskId: string, isCompleted: boolean) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  resume,
  job,
  roadmap,
  onNavigate,
  onToggleTask,
}) => {
  const completedTasks = roadmap.filter((t) => t.isCompleted).length;
  const totalHours = roadmap.reduce((acc, t) => acc + t.estimatedHours, 0);
  const completedHours = roadmap
    .filter((t) => t.isCompleted)
    .reduce((acc, t) => acc + t.estimatedHours, 0);

  const roadmapProgress = roadmap.length
    ? Math.round((completedTasks / roadmap.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-extrabold text-white">
              Welcome back, {user.fullName || 'Candidate'}
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {user.experienceLevel}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Targeting: <span className="text-slate-200 font-semibold">{user.targetRole}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('resume')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            Upload New Resume
          </button>
          <button
            onClick={() => onNavigate('job')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition"
          >
            <Briefcase className="w-3.5 h-3.5" />
            Compare Job Posting
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Match Score */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role Match Score</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{job.matchScore}%</span>
            <span className="text-xs text-emerald-400 font-medium">+14% vs baseline</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {job.matchedCount} matched / {job.missingCount} missing required skills
          </p>
        </div>

        {/* Acquired Skills */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Acquired Skills</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{resume.totalSkillsCount}</span>
            <span className="text-xs text-slate-400">normalized items</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Parsed from {resume.filename}</p>
        </div>

        {/* High Priority Gaps */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Skill Gaps</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400">{job.missingCount}</span>
            <span className="text-xs text-slate-400">blocking prerequisites</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Top: Vector Databases, RAG, Kubernetes</p>
        </div>

        {/* Roadmap Hours */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Roadmap Progress</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{roadmapProgress}%</span>
            <span className="text-xs text-slate-400">
              ({completedTasks}/{roadmap.length} completed)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {completedHours} / {totalHours} estimated study hours
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Roadmap Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  Topological Learning Roadmap (Next Action Items)
                </h2>
                <p className="text-xs text-slate-400">
                  Prerequisite-ordered curriculum tasks to close your critical skill gaps.
                </p>
              </div>
              <button
                onClick={() => onNavigate('roadmap')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
              >
                View Full DAG <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {roadmap.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all ${
                    task.isCompleted
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => onToggleTask(task.id, !task.isCompleted)}
                      className="mt-0.5 text-slate-400 hover:text-indigo-400 transition"
                    >
                      <CheckCircle2
                        className={`w-5 h-5 ${
                          task.isCompleted ? 'text-emerald-400 fill-emerald-400/20' : 'text-slate-600'
                        }`}
                      />
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{task.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {task.category}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {task.estimatedHours} hrs
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick AI Mentor Callout */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/30 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Ask AI Career Mentor</h3>
                <p className="text-xs text-slate-400">
                  Search curriculum documents and get grounded answers with source citations.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('mentor')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition"
            >
              Open Mentor Chat
            </button>
          </div>
        </div>

        {/* Right 1 Col: Skill Coverage Breakdown */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Verified Skill Breakdown
            </h2>
            <p className="text-xs text-slate-400 mb-4">Taxonomy categorization of candidate profile.</p>

            <div className="space-y-3">
              {[
                { name: 'Languages', count: resume.categoryBreakdown.languages, total: 5, color: 'bg-indigo-500' },
                { name: 'Frameworks', count: resume.categoryBreakdown.frameworks, total: 6, color: 'bg-cyan-500' },
                { name: 'Databases', count: resume.categoryBreakdown.databases, total: 4, color: 'bg-emerald-500' },
                { name: 'Cloud & DevOps', count: resume.categoryBreakdown.cloud, total: 4, color: 'bg-amber-500' },
                { name: 'Tools & Architecture', count: resume.categoryBreakdown.tools, total: 5, color: 'bg-rose-500' },
              ].map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{cat.name}</span>
                    <span className="text-slate-400 font-semibold">{cat.count} acquired</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cat.color}`}
                      style={{ width: `${Math.min(100, (cat.count / cat.total) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800">
              <button
                onClick={() => onNavigate('graph')}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition text-center"
              >
                Inspect Visual Skill Graph
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
