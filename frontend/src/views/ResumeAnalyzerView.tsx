import React, { useState } from 'react';
import { ResumeAnalysisResult, ExtractedSkill, SkillCategory } from '../types';
import { api } from '../services/api';
import {
  Upload,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Sparkles,
  Info,
} from 'lucide-react';

interface ResumeAnalyzerViewProps {
  resume: ResumeAnalysisResult;
  onUpdateResume: (newResume: ResumeAnalysisResult) => void;
}

export const ResumeAnalyzerView: React.FC<ResumeAnalyzerViewProps> = ({
  resume,
  onUpdateResume,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<ExtractedSkill | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(pdf|docx|txt)$/i)) {
      setUploadError('Unsupported document format. Please upload a .pdf, .docx, or .txt file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Document size exceeds 5MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await api.uploadResume(file);
      onUpdateResume(res);
    } catch (err: any) {
      setUploadError(err?.response?.data?.detail || 'Failed to process document.');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredSkills = resume.skills.filter((s) => {
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Upload Header Box */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Resume Ingestion & Skill Extraction
            </h1>
            <p className="text-xs text-slate-400">
              Upload candidate resume in PDF or DOCX format. PII is scrubbed before taxonomy parsing.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Automatic PII Redaction Active
          </div>
        </div>

        {uploadError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {uploadError}
          </div>
        )}

        {/* Drag & Drop Zone */}
        <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 hover:bg-slate-800/20 transition-all text-center">
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-slate-200">
            {isUploading ? 'Extracting text and identifying technical skills...' : 'Drop your resume here, or browse'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Supports PDF and Word DOCX (up to 5 MB)</p>
        </label>
      </div>

      {/* Scrubbed PII & Verification Summary */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400">Currently Parsed File:</span>
          <p className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
            <FileText className="w-4 h-4 text-indigo-400" />
            {resume.filename}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400">Skills Extracted:</span>
            <p className="text-sm font-extrabold text-emerald-400">{resume.totalSkillsCount} normalized</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {[
            { id: 'all', label: 'All Skills' },
            { id: 'languages', label: 'Languages' },
            { id: 'frameworks', label: 'Frameworks' },
            { id: 'databases', label: 'Databases' },
            { id: 'cloud', label: 'Cloud & DevOps' },
            { id: 'tools', label: 'Tools & Architecture' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search extracted skills..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Extracted Skills Grid & Traceable Evidence Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Skills Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredSkills.map((skill) => (
            <div
              key={skill.name}
              onClick={() => setSelectedSkill(skill)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedSkill?.name === skill.name
                  ? 'bg-indigo-600/10 border-indigo-500 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">{skill.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                  {skill.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">{skill.evidence}</p>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                <span>Confidence: {Math.round(skill.confidence * 100)}%</span>
                <span className="text-indigo-400 font-medium">Click to inspect context</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right 1 Col: Traceable Evidence Inspector */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 h-fit space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Info className="w-4 h-4 text-indigo-400" />
            Traceable Evidence Inspector
          </div>

          {selectedSkill ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{selectedSkill.name}</span>
                  <span className="text-[10px] font-semibold text-indigo-400 uppercase">
                    {selectedSkill.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 italic mt-2">
                  "{selectedSkill.evidence}"
                </p>
              </div>
              <p className="text-[11px] text-slate-400">
                Extracted with verified word boundary regex and mapped to the canonical SkillGraph ontology.
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-500">
              Select any skill card on the left to inspect its traceable document excerpt.
            </div>
          )}

          {/* Redacted Document Preview */}
          <div className="pt-4 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300 mb-2 block">
              Redacted Ingestion Stream:
            </span>
            <pre className="p-3 rounded-lg bg-slate-950 font-mono text-[10px] text-slate-400 overflow-x-auto whitespace-pre-wrap max-h-48">
              {resume.redactedPreview}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
