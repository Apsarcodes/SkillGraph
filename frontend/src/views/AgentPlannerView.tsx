import React, { useState } from 'react';
import { AgentPlanResult } from '../types';
import { api } from '../services/api';
import {
  Sparkles,
  Play,
  CheckCircle2,
  Terminal,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const AgentPlannerView: React.FC = () => {
  const [objective, setObjective] = useState(
    'Synthesize a 4-week prerequisite upskilling plan for Senior Full Stack & AI Systems Engineer'
  );
  const [planResult, setPlanResult] = useState<AgentPlanResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective.trim()) return;

    setIsRunning(true);
    try {
      const res = await api.runAgentPlan(objective);
      setPlanResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Bounded Agentic Learning Planner
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-step autonomous execution loop with typed Pydantic tools, iteration bounds, and safety guards.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg font-semibold">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Bounded ReAct Loop (Max 5 Iterations)
          </div>
        </div>

        {/* Objective Trigger Form */}
        <form onSubmit={handleRunAgent} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Agent Planning Objective
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Specify planning goal (e.g. Prioritize missing AI retrieval skills)..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={isRunning}
                className="px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                {isRunning ? 'Orchestrating Tools...' : 'Run Agent Loop'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Plan Results Layout */}
      {planResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Tool Execution Step Timeline */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              Execution Trace: Tool Invocations & Reasoning Steps
            </h2>

            <div className="space-y-3">
              {planResult.completedSteps.map((step) => (
                <div
                  key={step.step}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold flex items-center justify-center">
                        {step.step}
                      </span>
                      <span className="font-mono text-indigo-300 font-bold">{step.tool}()</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Tool Executed
                    </span>
                  </div>

                  <p className="text-slate-300 font-medium">{step.reasoning}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-900 font-mono text-[11px]">
                    <div className="p-2 rounded bg-slate-900 text-slate-400 overflow-x-auto">
                      <span className="text-slate-500 block text-[10px]">Input Parameters:</span>
                      {JSON.stringify(step.input)}
                    </div>
                    <div className="p-2 rounded bg-slate-900 text-slate-300 overflow-x-auto">
                      <span className="text-slate-500 block text-[10px]">Validated Output:</span>
                      {JSON.stringify(step.output)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generated Curriculum & Strategic Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Multi-Week Curriculum */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Synthesized Multi-Week Curriculum
              </h2>

              <div className="space-y-3">
                {planResult.generatedCurriculum.map((week) => (
                  <div key={week.week} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        Week {week.week}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {week.checkpointAssessment}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white">{week.focus}</h3>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {week.topics.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] border border-slate-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Recommendations */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Agent Synthesis & Recommendations
              </h2>

              <div className="space-y-3">
                {planResult.finalRecommendations.map((rec, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-3 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>All recommendations have been persisted to your user roadmap profile.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
