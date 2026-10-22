import React, { useState, useEffect } from 'react';
import { PrivacyAuditLog } from '../types';
import { api } from '../services/api';
import {
  ShieldCheck,
  Download,
  Trash2,
  Clock,
  AlertTriangle,
  Lock,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

export const PrivacySettingsView: React.FC = () => {
  const [logs, setLogs] = useState<PrivacyAuditLog[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.getPrivacyAudit();
        setLogs(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLogs();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await api.exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skillgraph_user_data_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePurge = async () => {
    if (!confirm('Are you certain you want to permanently purge all your resumes, assessments, and roadmap data? This action cannot be undone.')) {
      return;
    }
    setIsPurging(true);
    setPurgeSuccess(null);
    try {
      const res = await api.purgeUserData();
      setPurgeSuccess(`Purge confirmed: ${res.purgedRecordsCount} records permanently deleted.`);
      setLogs([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <h1 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          Responsible AI, Privacy & GDPR/CCPA Controls
        </h1>
        <p className="text-xs text-slate-400">
          Candidate data protection, automated PII scrubbing, immutable audit trails, and self-service compliance controls.
        </p>
      </div>

      {/* Compliance Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
            <EyeOff className="w-4 h-4" />
            Automatic PII Redaction
          </div>
          <p className="text-[11px] text-slate-400">
            Emails, phone numbers, and SSN patterns are scrubbed from resumes before vector embedding or LLM prompting.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <Lock className="w-4 h-4" />
            Tenant Record Isolation
          </div>
          <p className="text-[11px] text-slate-400">
            Database queries enforce strict user foreign key scoping. Candidates cannot query peer data.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            Server-Authoritative
          </div>
          <p className="text-[11px] text-slate-400">
            Assessment scores and prerequisite milestones are graded exclusively on backend servers to prevent tampering.
          </p>
        </div>
      </div>

      {/* Data Subject Rights Controls */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white">Data Subject Rights (GDPR / CCPA)</h2>

        {purgeSuccess && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {purgeSuccess}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            {isExporting ? 'Exporting...' : 'Export Candidate Profile (JSON)'}
          </button>

          <button
            onClick={handlePurge}
            disabled={isPurging}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 text-xs font-semibold border border-rose-500/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            {isPurging ? 'Purging...' : 'Purge All My Data (Right to be Forgotten)'}
          </button>
        </div>
      </div>

      {/* Immutable Audit Log Timeline */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Compliance Audit Log
          </h2>
          <span className="text-xs text-slate-500">Last 50 entries</span>
        </div>

        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-indigo-300 font-bold">{log.action}</span>
                  <span className="text-[10px] text-slate-500 font-mono">ip: {log.ipMasked}</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">{log.details}</p>
              </div>
              <span className="text-[10px] text-slate-500 whitespace-nowrap">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
