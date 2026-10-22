import React, { useState } from 'react';
import { api } from '../services/api';
import {
  Mail,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export const CareerDocsView: React.FC = () => {
  const [docType, setDocType] = useState<'cover_letter' | 'networking_email' | 'interview_prep'>('cover_letter');
  const [targetJob, setTargetJob] = useState('Senior Full Stack & AI Systems Engineer');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    setCopied(false);
    try {
      const res = await api.generateCareerDoc(docType, targetJob);
      setGeneratedContent(res.content);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <h1 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <Mail className="w-5 h-5 text-indigo-400" />
          AI Career Document & Professional Email Generator
        </h1>
        <p className="text-xs text-slate-400 mb-5">
          Generate tailored cover letters, networking outreach emails, and technical interview cheat sheets tailored to your target role.
        </p>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Document Format</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition"
            >
              <option value="cover_letter">Tailored Cover Letter</option>
              <option value="networking_email">Cold Outreach / Networking Email</option>
              <option value="interview_prep">Technical Interview Cheat Sheet</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Engineering Role</label>
            <input
              type="text"
              value={targetJob}
              onChange={(e) => setTargetJob(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGenerating ? 'Synthesizing Document...' : 'Generate Document'}
            </button>
          </div>
        </form>
      </div>

      {/* Output Viewer */}
      {generatedContent ? (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Generated Career Artifact
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button
                onClick={() => handleGenerate()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Regenerate
              </button>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
            {generatedContent}
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-lg mx-auto space-y-3">
          <Mail className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Document Generated Yet</h3>
          <p className="text-xs text-slate-400">
            Select a document type and target role above, then click Generate to create tailored career communication.
          </p>
        </div>
      )}
    </div>
  );
};
