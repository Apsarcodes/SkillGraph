import React, { useState, useEffect } from 'react';
import { MLMetrics } from '../types';
import { api } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  Target,
  Layers,
  Cpu,
  RefreshCw,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const MLInsightsView: React.FC = () => {
  const [metrics, setMetrics] = useState<MLMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMLMetrics();
      setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Machine Learning Evaluation & Market Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real evaluation metrics computed from a reproducible 70/30 train/test split. Supervised sentiment & query intent model.
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Re-evaluate Model
        </button>
      </div>

      {metrics && (
        <div className="space-y-6 animate-fade-in">
          {/* Classification Performance Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Test Accuracy</span>
              <p className="text-2xl font-black text-indigo-400 mt-1">{Math.round(metrics.accuracy * 100)}%</p>
              <span className="text-[10px] text-slate-500 mt-1 block">Stratified Holdout Set</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Weighted Precision</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{metrics.precision}</p>
              <span className="text-[10px] text-slate-500 mt-1 block">Precision (Weighted)</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Weighted Recall</span>
              <p className="text-2xl font-black text-cyan-400 mt-1">{metrics.recall}</p>
              <span className="text-[10px] text-slate-500 mt-1 block">True Positive Rate</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">F1-Score</span>
              <p className="text-2xl font-black text-purple-400 mt-1">{metrics.f1Score}</p>
              <span className="text-[10px] text-slate-500 mt-1 block">Harmonic Mean</span>
            </div>
          </div>

          {/* Confusion Matrix & Model Architecture */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Confusion Matrix Table */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                Confusion Matrix (True vs Predicted)
              </h2>
              <p className="text-xs text-slate-400">
                Performance breakdown across Negative Feedback, Neutral Query, and Positive Feedback classes.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="p-2 text-left font-semibold">True \ Pred</th>
                      {metrics.confusionMatrix.labels.map((lbl) => (
                        <th key={lbl} className="p-2 font-semibold text-[11px]">
                          {lbl.split(' ')[0]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.confusionMatrix.matrix.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-slate-800/60">
                        <td className="p-2 text-left text-slate-300 font-semibold">
                          {metrics.confusionMatrix.labels[rIdx]}
                        </td>
                        {row.map((val, cIdx) => (
                          <td
                            key={cIdx}
                            className={`p-2 font-mono font-bold ${
                              rIdx === cIdx
                                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                                : val > 0
                                ? 'bg-slate-800/40 text-slate-400'
                                : 'text-slate-600'
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Model Architecture & Baseline Comparison */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Model Pipeline & Reproducibility
              </h2>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">Primary Classifier</span>
                  <p className="text-white font-semibold">Logistic Regression (L2 regularization, max_iter=200)</p>
                  <p className="text-slate-400 text-[11px]">Feature Extractor: TfidfVectorizer (unigrams + bigrams)</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Comparator Baseline</span>
                  <p className="text-white font-semibold">Multinomial Naive Bayes</p>
                  <p className="text-slate-400 text-[11px]">Validates linear decision boundaries against probabilistic independence</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Reproducibility Seed</span>
                  <p className="font-mono text-slate-300">train_test_split(..., random_state=42, test_size=0.33)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Market Skill Demand Frequencies */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Technical Skill Demand Frequency in Job Postings
            </h2>
            <p className="text-xs text-slate-400">
              Aggregated frequency of technical competencies across parsed job descriptions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.topSkillsDemand.map((item) => (
                <div key={item.skill} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.skill}</span>
                    <span className="text-[11px] font-bold text-emerald-400">+{item.growthPct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${item.demandFrequency}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-400 block">{item.demandFrequency}% appearance rate</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
