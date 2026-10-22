import React, { useState } from 'react';
import { AssessmentQuestion, AssessmentResult } from '../types';
import { api } from '../services/api';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

export const AssessmentsView: React.FC = () => {
  const [selectedSkill, setSelectedSkill] = useState('Vector Databases');
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const availableSkills = ['Vector Databases', 'RAG', 'Kubernetes', 'Python'];

  const startQuiz = async (skill: string) => {
    setSelectedSkill(skill);
    setIsLoading(true);
    setResult(null);
    setSelectedAnswers({});
    try {
      const qList = await api.getAssessmentQuestions(skill);
      setQuestions(qList);
      setHasStarted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
  };

  const handleSubmit = async () => {
    const answersArray = questions.map((_, idx) =>
      selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1
    );

    setIsLoading(true);
    try {
      const res = await api.submitAssessment(selectedSkill, answersArray);
      setResult(res);
      setHasStarted(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            Deterministic Skill Assessments
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Validate competencies with server-authoritative scoring. Passing an assessment marks the skill completed on your roadmap.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-semibold">
          <ShieldCheck className="w-4 h-4" />
          Server-Authoritative Evaluation
        </div>
      </div>

      {/* Skill Selector Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-400 font-semibold mr-2">Select Domain:</span>
        {availableSkills.map((skill) => (
          <button
            key={skill}
            onClick={() => startQuiz(skill)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition border ${
              selectedSkill === skill
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            {skill}
          </button>
        ))}
      </div>

      {/* Quiz Body or Result Card */}
      {result ? (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-xl mx-auto space-y-5 animate-fade-in">
          <div
            className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${
              result.passed
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {result.passed ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Evaluation Result — {result.skill}
            </span>
            <h2 className="text-3xl font-black text-white mt-1">{result.percentage}%</h2>
            <p className="text-xs text-slate-400 mt-1">
              Score: {result.score} of {result.totalQuestions} questions correct
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            {result.feedback}
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => startQuiz(result.skill)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-2 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retake Assessment
            </button>
          </div>
        </div>
      ) : hasStarted && questions.length > 0 ? (
        <div className="space-y-6 max-w-3xl">
          {questions.map((q, qIdx) => (
            <div key={q.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-indigo-400">Question {qIdx + 1} of {questions.length}</span>
                <span className="bg-slate-800 px-2.5 py-0.5 rounded text-[10px] font-semibold text-slate-300">{q.skill}</span>
              </div>
              <h3 className="text-sm font-semibold text-white leading-relaxed">{q.question}</h3>

              <div className="space-y-2">
                {q.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[qIdx] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(qIdx, oIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white font-medium shadow-sm'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading || Object.keys(selectedAnswers).length < questions.length}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {isLoading ? 'Grading Answers on Server...' : 'Submit Assessment Authoritatively'}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-xl mx-auto space-y-4">
          <Award className="w-12 h-12 text-indigo-400 mx-auto" />
          <h2 className="text-base font-bold text-white">Select a Domain to Begin Assessment</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Each quiz consists of 3 deterministic multiple-choice questions designed to verify prerequisite mastery.
          </p>
          <button
            onClick={() => startQuiz(selectedSkill)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
          >
            Start {selectedSkill} Assessment
          </button>
        </div>
      )}
    </div>
  );
};
