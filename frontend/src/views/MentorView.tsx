import React, { useState } from 'react';
import { MentorMessage } from '../types';
import { api } from '../services/api';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  BookOpen,
  Info,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';

export const MentorView: React.FC = () => {
  const [messages, setMessages] = useState<MentorMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'mentor',
      text: "Hello! I am your SkillGraph AI Career Mentor. I am connected directly to our verified engineering curriculum vector store. Ask me any question about your skill gaps, system design trade-offs, or recommended learning resources.",
      timestamp: new Date().toISOString(),
      isFallback: true,
      citations: [
        {
          documentId: 'doc_rag_01',
          title: 'Production RAG Architectures & Vector Indexing',
          source: 'curriculum/rag_architecture.md',
          chapter: 'Chapter 3: Dense Retrieval & HNSW Indexing',
          relevanceScore: 0.95,
          excerpt: 'Retrieval-Augmented Generation (RAG) grounds language models on private or specialized domain data through vector similarity search.',
        },
      ],
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;

    const userText = inputQuery.trim();
    setInputQuery('');

    const userMsg: MentorMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const mentorReply = await api.askMentor(userText);
      setMessages((prev) => [...prev, mentorReply]);
    } catch {
      // Fallback
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'mentor',
          text: 'Unable to retrieve context at this moment. Please verify backend connectivity.',
          timestamp: new Date().toISOString(),
          isFallback: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputQuery(prompt);
  };

  return (
    <div className="space-y-4 h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Top Header */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            <BotMessageSquare className="w-5 h-5 text-indigo-400" />
            AI Career Mentor (Vector RAG Knowledge Base)
          </h1>
          <p className="text-xs text-slate-400">
            Grounded architectural guidance retrieved from semantic curriculum embeddings with source citations.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-lg">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          RAG Cosine Retrieval Active
        </div>
      </div>

      {/* Suggested Queries */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">Suggested Queries:</span>
        {[
          'Explain HNSW indexing in Vector Databases',
          'What are the prerequisites for Kubernetes pods?',
          'How should I chunk documents for a RAG pipeline?',
          'Why use FastAPI over standard Flask?',
        ].map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSuggestedPrompt(q)}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 whitespace-nowrap transition border border-slate-700/60"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 rounded-2xl bg-slate-950 border border-slate-800 p-5 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
              }`}
            >
              {msg.isFallback && msg.sender === 'mentor' && (
                <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-semibold mb-1">
                  <Info className="w-3.5 h-3.5" />
                  Grounded Deterministic Engine (Local Fallback)
                </div>
              )}

              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* RAG Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> Grounded Source Citations:
                  </span>
                  <div className="space-y-1.5">
                    {msg.citations.map((cite, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-300">{cite.title}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            relevance: {cite.relevanceScore}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">{cite.chapter} • <code className="text-slate-500">{cite.source}</code></p>
                        <p className="text-[10px] text-slate-300 italic bg-slate-900/60 p-1.5 rounded">
                          "{cite.excerpt}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Searching semantic vector chunks and formulating grounded response...
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="flex gap-2 shrink-0">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask a question about systems, vector databases, or prerequisite concepts..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center justify-center transition disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
