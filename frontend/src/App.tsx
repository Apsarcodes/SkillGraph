import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './views/DashboardView';
import { ResumeAnalyzerView } from './views/ResumeAnalyzerView';
import { JobMatcherView } from './views/JobMatcherView';
import { SkillGraphView } from './views/SkillGraphView';
import { RoadmapView } from './views/RoadmapView';
import { MentorView } from './views/MentorView';
import { AssessmentsView } from './views/AssessmentsView';
import { AgentPlannerView } from './views/AgentPlannerView';
import { MLInsightsView } from './views/MLInsightsView';
import { CareerDocsView } from './views/CareerDocsView';
import { PrivacySettingsView } from './views/PrivacySettingsView';
import { DocumentationView } from './views/DocumentationView';
import { api, DEMO_USER, DEMO_RESUME_ANALYSIS, DEMO_JOB_ANALYSIS } from './services/api';
import {
  User,
  ResumeAnalysisResult,
  JobAnalysisResult,
  RoadmapTask,
  AuthResponse,
} from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [user, setUser] = useState<User>(DEMO_USER);
  const [resume, setResume] = useState<ResumeAnalysisResult>(DEMO_RESUME_ANALYSIS);
  const [job, setJob] = useState<JobAnalysisResult>(DEMO_JOB_ANALYSIS);
  const [roadmap, setRoadmap] = useState<RoadmapTask[]>([]);
  const [targetRole, setTargetRole] = useState<string>(DEMO_USER.targetRole);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  useEffect(() => {
    const initData = async () => {
      try {
        const u = await api.getCurrentUser();
        setUser(u);
        setTargetRole(u.targetRole);

        const r = await api.getLatestResume();
        setResume(r);

        const j = await api.getLatestJobAnalysis();
        setJob(j);

        const rTasks = await api.getRoadmap();
        setRoadmap(rTasks);
      } catch (err) {
        console.error('Failed to initialize application state', err);
      }
    };
    initData();
  }, []);

  const handleAuthSuccess = (authData: AuthResponse) => {
    setUser(authData.user);
    setTargetRole(authData.user.targetRole);
  };

  const handleLogout = () => {
    localStorage.removeItem('skillgraph_token');
    setUser(DEMO_USER);
  };

  const handleTargetRoleChange = async (newRole: string) => {
    setTargetRole(newRole);
    setUser((prev) => ({ ...prev, targetRole: newRole }));
    // Trigger updated job analysis for this target role
    try {
      const updatedJob = await api.analyzeJob(
        `Looking for an experienced ${newRole} with background in systems, databases, and microservices.`,
        newRole,
        'Target Enterprise'
      );
      setJob(updatedJob);
      const updatedRoadmap = await api.getRoadmap();
      setRoadmap(updatedRoadmap);
    } catch {
      // Handled
    }
  };

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    try {
      await api.toggleTaskCompletion(taskId, isCompleted);
      setRoadmap((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, isCompleted } : t))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        targetRole={targetRole}
        onTargetRoleChange={handleTargetRoleChange}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {activeTab === 'dashboard' && (
            <DashboardView
              user={user}
              resume={resume}
              job={job}
              roadmap={roadmap}
              onNavigate={setActiveTab}
              onToggleTask={handleToggleTask}
            />
          )}

          {activeTab === 'resume' && (
            <ResumeAnalyzerView
              resume={resume}
              onUpdateResume={(newResume) => {
                setResume(newResume);
                // Also trigger updated graph & roadmap
                api.getRoadmap().then(setRoadmap);
              }}
            />
          )}

          {activeTab === 'job' && (
            <JobMatcherView
              job={job}
              onUpdateJob={(newJob) => {
                setJob(newJob);
                api.getRoadmap().then(setRoadmap);
              }}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'graph' && <SkillGraphView />}

          {activeTab === 'roadmap' && (
            <RoadmapView
              roadmap={roadmap}
              onToggleTask={handleToggleTask}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'mentor' && <MentorView />}

          {activeTab === 'assessments' && <AssessmentsView />}

          {activeTab === 'planner' && <AgentPlannerView />}

          {activeTab === 'ml' && <MLInsightsView />}

          {activeTab === 'career_docs' && <CareerDocsView />}

          {activeTab === 'privacy' && <PrivacySettingsView />}

          {activeTab === 'docs' && <DocumentationView />}
        </main>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default App;
