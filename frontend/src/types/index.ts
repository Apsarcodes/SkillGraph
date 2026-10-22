export type SkillCategory = 'languages' | 'frameworks' | 'databases' | 'cloud' | 'tools';

export interface ExtractedSkill {
  name: string;
  category: SkillCategory;
  confidence: number;
  evidence: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  targetRole: string;
  experienceLevel: string;
  isDemo?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ResumeAnalysisResult {
  id: string;
  filename: string;
  skills: ExtractedSkill[];
  totalSkillsCount: number;
  categoryBreakdown: Record<SkillCategory, number>;
  redactedPreview: string;
  uploadedAt: string;
}

export interface SkillMatchDetail {
  skill: string;
  category: SkillCategory;
  status: 'MATCHED' | 'PARTIAL' | 'MISSING';
  importance: 'REQUIRED' | 'PREFERRED';
  prerequisites: string[];
}

export interface JobAnalysisResult {
  id: string;
  jobTitle: string;
  company: string;
  matchScore: number;
  matchedCount: number;
  missingCount: number;
  partialCount: number;
  requiredSkills: string[];
  preferredSkills: string[];
  breakdown: SkillMatchDetail[];
  analyzedAt: string;
}

export interface SkillGraphNode {
  id: string;
  label: string;
  category: SkillCategory;
  status: 'acquired' | 'target' | 'missing' | 'in_progress' | 'foundation';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours?: number;
}

export interface SkillGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  isPrerequisite?: boolean;
}

export interface RoadmapTask {
  id: string;
  skill: string;
  category: SkillCategory;
  order: number;
  title: string;
  description: string;
  estimatedHours: number;
  prerequisites: string[];
  resources: { title: string; url: string; type: string }[];
  isCompleted: boolean;
  score?: number;
}

export interface AssessmentQuestion {
  id: number;
  skill: string;
  question: string;
  options: string[];
}

export interface AssessmentSubmission {
  skill: string;
  answers: number[];
}

export interface AssessmentResult {
  skill: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  feedback: string;
  timestamp: string;
}

export interface MentorCitation {
  documentId: string;
  title: string;
  source: string;
  chapter: string;
  relevanceScore: number;
  excerpt: string;
}

export interface MentorMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: string;
  citations?: MentorCitation[];
  isFallback?: boolean;
}

export interface AgentStep {
  step: number;
  tool: string;
  input: Record<string, any>;
  output: Record<string, any>;
  reasoning: string;
}

export interface AgentPlanResult {
  objective: string;
  completedSteps: AgentStep[];
  finalRecommendations: string[];
  generatedCurriculum: {
    week: number;
    focus: string;
    topics: string[];
    checkpointAssessment: string;
  }[];
  totalIterations: number;
  persisted: boolean;
}

export interface ConfusionMatrixData {
  labels: string[];
  matrix: number[][];
}

export interface MLMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  support: number;
  confusionMatrix: ConfusionMatrixData;
  topSkillsDemand: { skill: string; demandFrequency: number; growthPct: number }[];
  trainingTimestamp: string;
}

export interface PrivacyAuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  ipMasked: string;
}
