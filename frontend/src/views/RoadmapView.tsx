import React from 'react';
import { RoadmapTask } from '../types';
import {
  Compass,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface RoadmapViewProps {
  roadmap: RoadmapTask[];
  onToggleTask: (taskId: string, isCompleted: boolean) => void;
  onNavigate: (tab: NavTab) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  roadmap,
  onToggleTask,
  onNavigate,
}) => {
  const completedCount = roadmap.filter((t) => t.isCompleted).length;
  const totalHours = roadmap.reduce((acc, t) => acc + t.estimatedHours, 0);
  const completedHours = roadmap
    .filter((t) => t.isCompleted)
    .reduce((acc, t) => acc + t.estimatedHours, 0);
  const remainingHours = totalHours - completedHours;

  return (
    <div className="space-y-6">
      {/* Roadmap Overview Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400" />
              Adaptive Upskilling Roadmap (Topological DAG)
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly ordered learning milestones. Tasks are sequenced based on prerequisite dependencies with cycle detection.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center p-3 rounded-xl bg-slate-800/80 border border-slate-700 min-w-[90px]">
              <span className="text-xl font-bold text-white">{completedCount} / {roadmap.length}</span>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Tasks Done</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-800/80 border border-slate-700 min-w-[90px]">
              <span className="text-xl font-bold text-indigo-400">{remainingHours}h</span>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Remaining</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Overall Curriculum Completion</span>
            <span className="font-semibold text-slate-200">
              {roadmap.length ? Math.round((completedCount / roadmap.length) * 100) : 0}%
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
              style={{
                width: `${roadmap.length ? (completedCount / roadmap.length) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Task Milestones Timeline */}
      <div className="space-y-4">
        {roadmap.map((task, idx) => (
          <div
            key={task.id}
            className={`p-5 rounded-2xl border transition-all ${
              task.isCompleted
                ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {/* Step Circle */}
                <button
                  onClick={() => onToggleTask(task.id, !task.isCompleted)}
                  className="mt-1 transition hover:scale-105"
                  title="Toggle task completion"
                >
                  <CheckCircle2
                    className={`w-6 h-6 ${
                      task.isCompleted
                        ? 'text-emerald-400 fill-emerald-400/20'
                        : 'text-slate-600 hover:text-indigo-400'
                    }`}
                  />
                </button>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-bold">
                      {task.order}
                    </span>
                    <h3 className="text-sm font-bold text-white">{task.title}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                      {task.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {task.estimatedHours} hours
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                    {task.description}
                  </p>

                  {/* Prerequisites */}
                  {task.prerequisites.length > 0 && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>Prerequisites:</span>
                      {task.prerequisites.map((p) => (
                        <span
                          key={p}
                          className="px-2 py-0.5 rounded bg-slate-800/60 text-slate-300 border border-slate-700/60"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Curated Resources */}
                  {task.resources.length > 0 && (
                    <div className="pt-2 flex items-center gap-3 flex-wrap">
                      <span className="text-[11px] text-slate-500 font-medium">Resources:</span>
                      {task.resources.map((res, rIdx) => (
                        <a
                          key={rIdx}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-[11px] text-indigo-300 hover:text-white transition"
                        >
                          <BookOpen className="w-3 h-3 text-indigo-400" />
                          {res.title}
                          <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Assessment CTA */}
              <div className="sm:text-right shrink-0">
                <button
                  onClick={() => onNavigate('assessments')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
                >
                  Verify via Quiz
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
