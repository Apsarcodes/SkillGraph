import React, { useState } from 'react';
import { JobAnalysisResult, SkillMatchDetail } from '../types';
import { api } from '../services/api';
import {
  Briefcase,
  Target,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Send,
  Building,
} from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface JobMatcherViewProps {
  job: JobAnalysisResult;
  onUpdateJob: (newJob: JobAnalysisResult) => void;
  onNavigate: (tab: NavTab) => void;
}

export const JobMatcherView: React.FC<JobMatcherViewProps> = ({
  job,
  onUpdateJob,
  onNavigate,
}) => {
  const [jobText, setJobText] = useState('');
  const [jobTitle, setJobTitle] = useState('Senior Full Stack & AI Systems Engineer');
  const [company, setCompany] = useState('CloudScale Technologies');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'MATCHED' | 'MISSING' | 'PARTIAL'>('ALL');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobText.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await api.analyzeJob(jobText, jobTitle, company);
      onUpdateJob(res);
    } catch {
      // Handled via service fallback
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredBreakdown = job.breakdown.filter((item) => {
    if (activeFilter === 'ALL') return true;
    return item.status === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Input Form Box */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <h1 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <Briefcase className="w-5 h-5 text-indigo-400" />
          Job Description Analysis & Gap Matching
        </h1>
        <p className="text-xs text-slate-400 mb-5">
          Paste a target job posting to extract required and preferred skills, classify gaps, and compute your weighted match score.
        </p>

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Full Stack & AI Engineer"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hiring Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. CloudScale Technologies"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Job Description Text</label>
            <textarea
              rows={5}
              required
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste full job description requirements here (e.g. Must have experience with Python, FastAPI, Docker, and Kubernetes. Preferred: RAG pipelines, Vector Databases...)"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition resize-none font-mono"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isAnalyzing || !jobText.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isAnalyzing ? 'Extracting Requirements & Computing Match...' : 'Analyze Job Gaps'}
            </button>
          </div>
        </form>
      </div>

      {/* Match Results Summary Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-400">{job.company}</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">{job.jobTitle}</h2>
            <p className="text-xs text-slate-400 mt-1">
              Analyzed on {new Date(job.analyzedAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center p-3 rounded-xl bg-slate-800/80 border border-slate-700 min-w-[90px]">
              <span className="text-2xl font-black text-indigo-400">{job.matchScore}%</span>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Match Score</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-800/80 border border-slate-700 min-w-[90px]">
              <span className="text-2xl font-black text-emerald-400">{job.matchedCount}</span>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Matched</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-800/80 border border-slate-700 min-w-[90px]">
              <span className="text-2xl font-black text-rose-400">{job.missingCount}</span>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Missing</p>
            </div>
          </div>
        </div>

        {/* Action button to generate roadmap */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            {job.missingCount} missing required skills are blocking qualification for this role.
          </p>
          <button
            onClick={() => onNavigate('roadmap')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition shadow-sm"
          >
            Generate Adaptive Upskilling Roadmap <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['ALL', 'MATCHED', 'PARTIAL', 'MISSING'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === tab
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'ALL' ? 'All Skills' : tab}
          </button>
        ))}
      </div>

      {/* Classified Gap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBreakdown.map((item) => {
          let statusBadge = (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> MATCHED
            </span>
          );
          let borderColor = 'border-emerald-500/30';
          if (item.status === 'MISSING') {
            statusBadge = (
              <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" /> MISSING
              </span>
            );
            borderColor = 'border-rose-500/30';
          } else if (item.status === 'PARTIAL') {
            statusBadge = (
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                <HelpCircle className="w-3.5 h-3.5" /> PARTIAL
              </span>
            );
            borderColor = 'border-amber-500/30';
          }

          return (
            <div
              key={item.skill}
              className={`p-4 rounded-xl bg-slate-900 border ${borderColor} space-y-3 transition hover:border-slate-600`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{item.skill}</span>
                {statusBadge}
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                  {item.category}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {item.importance}
                </span>
              </div>

              {item.prerequisites.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span className="text-slate-500 font-medium">Prerequisites: </span>
                  {item.prerequisites.join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
