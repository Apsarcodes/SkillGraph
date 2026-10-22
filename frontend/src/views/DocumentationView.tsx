import React from 'react';
import {
  BookOpen,
  Code,
  Shield,
  Layers,
  Terminal,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

export const DocumentationView: React.FC = () => {
  const wiproModules = [
    {
      module: 'Module 1: Core Programming, OOP & Data Structures',
      skills: 'Python 3.9+, Pydantic v2 Models, Directed Acyclic Graph (DAG) Structures, Topological Sorting',
      implementation: 'backend/core/graph.py implements Kahn algorithm and DFS topological sort with cycle pruning.',
      tests: 'test_graph_topological_sort, test_cycle_resolution',
    },
    {
      module: 'Module 2: Modern Full-Stack Development',
      skills: 'React 18, TypeScript, Tailwind CSS, Vite, FastAPI REST services',
      implementation: 'frontend/src/ with @xyflow/react interactive DAG node visualizer and 10 FastAPI router endpoints.',
      tests: 'test_api_endpoints, npm run build',
    },
    {
      module: 'Module 3: Database & Cloud Persistence',
      skills: 'SQLAlchemy ORM, SQLite Local & Supabase PostgreSQL Compatibility',
      implementation: 'backend/database/models.py defining 8 relational schemas, cascades, and tenant isolation.',
      tests: 'test_database_persistence, test_user_isolation',
    },
    {
      module: 'Module 4: Machine Learning & NLP Applications',
      skills: 'Scikit-learn, TF-IDF, Sentiment Classification, Train/Test Split, Confusion Matrix',
      implementation: 'backend/ml/classifier.py and backend/ml/skill_extractor.py with genuine reproducible metrics.',
      tests: 'test_ml_evaluation_metrics, test_skill_extraction',
    },
    {
      module: 'Module 5: RAG & Agentic AI Systems',
      skills: 'Semantic Chunking, Vector Embeddings, Cosine Similarity, Bounded ReAct Agent',
      implementation: 'backend/rag/vector_store.py and backend/agent/planner.py with 5 typed Pydantic tools.',
      tests: 'test_rag_citations, test_agent_step_limits',
    },
    {
      module: 'Module 6: Enterprise Security, Privacy & DevOps',
      skills: 'Automated PII Redaction, JWT Auth, GDPR Export & Purge, Multi-stage Containers',
      implementation: 'backend/security/pii_scrubber.py, bcrypt password hashing, and test suite.',
      tests: 'test_pii_redaction, test_unauthorized_access',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <h1 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          SkillGraph AI — System Architecture & Industry Competency Specification
        </h1>
        <p className="text-xs text-slate-400">
          Complete engineering reference, system boundaries, and verified module mapping for portfolio presentation.
        </p>
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
            <Cpu className="w-4 h-4" />
            FastAPI + SQLAlchemy Core
          </div>
          <p className="text-[11px] text-slate-400">
            High-performance asynchronous REST API running on Starlette with Pydantic type safety and relational SQLite/Supabase persistence.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <Layers className="w-4 h-4" />
            Vector RAG Knowledge Base
          </div>
          <p className="text-[11px] text-slate-400">
            Semantic text chunking and cosine similarity search over curated curriculum resources with grounded source citations.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
            <Terminal className="w-4 h-4" />
            Bounded ReAct Agent
          </div>
          <p className="text-[11px] text-slate-400">
            Autonomous multi-step planner utilizing 5 typed tools with execution budget constraints (max 5 steps) and explainable traces.
          </p>
        </div>
      </div>

      {/* Wipro Competency Mapping Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Industry Competency Track Mapping (Enterprise Full-Stack & AI)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="p-3 w-1/4">Track Module</th>
                <th className="p-3 w-1/4">Required Competency</th>
                <th className="p-3 w-1/3">SkillGraph AI Implementation</th>
                <th className="p-3">Automated Tests</th>
              </tr>
            </thead>
            <tbody>
              {wiproModules.map((m, idx) => (
                <tr key={idx} className="border-b border-slate-800/60 hover:bg-slate-800/20">
                  <td className="p-3 font-semibold text-white">{m.module}</td>
                  <td className="p-3 text-slate-300">{m.skills}</td>
                  <td className="p-3 text-slate-400">{m.implementation}</td>
                  <td className="p-3 font-mono text-[11px] text-indigo-400">{m.tests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
