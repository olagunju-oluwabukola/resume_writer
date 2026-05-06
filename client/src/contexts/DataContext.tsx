import React, { createContext, useContext, useState, useEffect } from "react";
import { Resume, CoverLetter, JobApplication, UserProfile } from "@/lib/supabase";
import {
  getResumes, getCoverLetters, getJobApplications, getUserProfile,
  createResume, createCoverLetter, createJobApplication,
  saveResume, saveCoverLetter, saveJobApplication,
  deleteResume, deleteCoverLetter, deleteJobApplication,
  getStatistics, initializeUserProfile, saveUserProfile,
  getTrackedJobs, saveTrackedJob, deleteTrackedJob, createTrackedJob,
  TrackedJob,
} from "@/lib/storage";

interface DataContextType {
  userProfile: UserProfile | null;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  resumes: Resume[];
  addResume: (name: string, content: string) => Resume;
  updateResume: (resume: Resume) => void;
  removeResume: (resumeId: string) => void;
  coverLetters: CoverLetter[];
  addCoverLetter: (title: string, content: string) => CoverLetter;
  updateCoverLetter: (letter: CoverLetter) => void;
  removeCoverLetter: (letterId: string) => void;
  applications: JobApplication[];
  addApplication: (jobTitle: string, company: string, dateApplied: string, extra?: { salary?: string; notes?: string; followUpDate?: string }) => JobApplication;
  updateApplication: (application: JobApplication) => void;
  removeApplication: (applicationId: string) => void;
  trackedJobs: TrackedJob[];
  addTrackedJob: (title: string, company: string, location: string, salary: string, postedDate: string, deadline: string, notes: string) => TrackedJob;
  updateTrackedJob: (job: TrackedJob) => void;
  removeTrackedJob: (jobId: string) => void;
  stats: ReturnType<typeof getStatistics>;
  refreshStats: () => void;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [trackedJobs, setTrackedJobs] = useState<TrackedJob[]>([]);
  const [stats, setStats] = useState(getStatistics());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const profile = getUserProfile() || initializeUserProfile();
      setUserProfile(profile);
      setResumes(getResumes());
      setCoverLetters(getCoverLetters());
      setApplications(getJobApplications());
      setTrackedJobs(getTrackedJobs());
      setStats(getStatistics());
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, []);

  const refreshStats = () => setStats(getStatistics());

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...updates, updated_at: new Date().toISOString() };
    saveUserProfile(updated);
    setUserProfile(updated);
  };

  const addResume = (name: string, content: string): Resume => {
    const resume = createResume(name, content);
    setResumes(prev => [...prev, resume]);
    refreshStats();
    return resume;
  };
  const updateResume = (resume: Resume) => {
    saveResume(resume);
    setResumes(prev => prev.map(r => r.id === resume.id ? resume : r));
    refreshStats();
  };
  const removeResume = (id: string) => {
    deleteResume(id);
    setResumes(prev => prev.filter(r => r.id !== id));
    refreshStats();
  };

  const addCoverLetter = (title: string, content: string): CoverLetter => {
    const letter = createCoverLetter(title, content);
    setCoverLetters(prev => [...prev, letter]);
    refreshStats();
    return letter;
  };
  const updateCoverLetter = (letter: CoverLetter) => {
    saveCoverLetter(letter);
    setCoverLetters(prev => prev.map(l => l.id === letter.id ? letter : l));
  };
  const removeCoverLetter = (id: string) => {
    deleteCoverLetter(id);
    setCoverLetters(prev => prev.filter(l => l.id !== id));
    refreshStats();
  };

  const addApplication = (jobTitle: string, company: string, dateApplied: string, extra?: { salary?: string; notes?: string; followUpDate?: string }): JobApplication => {
    const app = createJobApplication(jobTitle, company, dateApplied, extra);
    setApplications(prev => [...prev, app]);
    refreshStats();
    return app;
  };
  const updateApplication = (application: JobApplication) => {
    saveJobApplication(application);
    setApplications(prev => prev.map(a => a.id === application.id ? application : a));
    refreshStats();
  };
  const removeApplication = (id: string) => {
    deleteJobApplication(id);
    setApplications(prev => prev.filter(a => a.id !== id));
    refreshStats();
  };

  const addTrackedJob = (title: string, company: string, location: string, salary: string, postedDate: string, deadline: string, notes: string): TrackedJob => {
    const job = createTrackedJob(title, company, location, salary, postedDate, deadline, notes);
    setTrackedJobs(prev => [...prev, job]);
    return job;
  };
  const updateTrackedJob = (job: TrackedJob) => {
    saveTrackedJob(job);
    setTrackedJobs(prev => prev.map(j => j.id === job.id ? job : j));
  };
  const removeTrackedJob = (id: string) => {
    deleteTrackedJob(id);
    setTrackedJobs(prev => prev.filter(j => j.id !== id));
  };

  return (
    <DataContext.Provider value={{
      userProfile, updateUserProfile,
      resumes, addResume, updateResume, removeResume,
      coverLetters, addCoverLetter, updateCoverLetter, removeCoverLetter,
      applications, addApplication, updateApplication, removeApplication,
      trackedJobs, addTrackedJob, updateTrackedJob, removeTrackedJob,
      stats, refreshStats, isLoading,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
}
