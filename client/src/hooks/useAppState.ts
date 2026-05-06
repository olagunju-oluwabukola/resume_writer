import { useState, useCallback } from "react";
import {
  Resume,
  CoverLetter,
  JobApplication,
  DashboardStats,
} from "@/types";

export function useAppState() {
  const [resumes, setResumes] = useState<Resume[]>([
    {
      id: "1",
      name: "Master Resume",
      fileName: "Alex_Johnson_Resume.pdf",
      fileSize: 245,
      uploadedAt: "May 1, 2024",
      status: "ready",
    },
  ]);

  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([
    {
      id: "1",
      title: "TechCorp Inc. - Senior Frontend Developer",
      content: "Dear Hiring Manager...",
      createdAt: "May 15, 2024",
      updatedAt: "May 15, 2024",
    },
  ]);

  const [applications, setApplications] = useState<JobApplication[]>([
    {
      id: "1",
      jobTitle: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      dateApplied: "May 15, 2024",
      status: "applied",
      followUpDate: "May 22, 2024",
    },
  ]);

  const [stats] = useState<DashboardStats>({
    resumesCreated: 12,
    coverLetters: 8,
    applicationsTracked: 24,
    interviews: 6,
  });

  const addResume = useCallback((resume: Resume) => {
    setResumes((prev) => [...prev, resume]);
  }, []);

  const deleteResume = useCallback((id: string) => {
    setResumes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addCoverLetter = useCallback((letter: CoverLetter) => {
    setCoverLetters((prev) => [...prev, letter]);
  }, []);

  const deleteCoverLetter = useCallback((id: string) => {
    setCoverLetters((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const addApplication = useCallback((app: JobApplication) => {
    setApplications((prev) => [...prev, app]);
  }, []);

  const updateApplication = useCallback((id: string, updates: Partial<JobApplication>) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...updates } : app))
    );
  }, []);

  const deleteApplication = useCallback((id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return {
    resumes,
    coverLetters,
    applications,
    stats,
    addResume,
    deleteResume,
    addCoverLetter,
    deleteCoverLetter,
    addApplication,
    updateApplication,
    deleteApplication,
  };
}
