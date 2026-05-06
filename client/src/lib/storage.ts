// Local Storage Service for ResumeRX
import {
  Resume,
  CoverLetter,
  JobApplication,
  UserProfile,
} from "./supabase";

export interface TrackedJob {
  id: string;
  user_id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  posted_date: string;
  deadline: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEYS = {
  USER_PROFILE: "resumerx_user_profile",
  RESUMES: "resumerx_resumes",
  COVER_LETTERS: "resumerx_cover_letters",
  JOB_APPLICATIONS: "resumerx_job_applications",
  JOB_DESCRIPTIONS: "resumerx_job_descriptions",
  TRACKED_JOBS: "resumerx_tracked_jobs",
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// User Profile
export function getUserProfile(): UserProfile | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch {}
}

export function initializeUserProfile(): UserProfile {
  let profile = getUserProfile();
  if (!profile) {
    profile = {
      id: generateId(),
      email: "user@example.com",
      full_name: "Your Name",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveUserProfile(profile);
  }
  return profile;
}

// Resumes
export function getResumes(): Resume[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESUMES);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function saveResume(resume: Resume): void {
  try {
    const resumes = getResumes();
    const index = resumes.findIndex((r) => r.id === resume.id);
    if (index >= 0) resumes[index] = resume;
    else resumes.push(resume);
    localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(resumes));
  } catch {}
}

export function deleteResume(resumeId: string): void {
  try {
    const resumes = getResumes().filter((r) => r.id !== resumeId);
    localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(resumes));
  } catch {}
}

export function createResume(name: string, content: string): Resume {
  const resume: Resume = {
    id: generateId(),
    user_id: initializeUserProfile().id,
    name,
    file_name: `${name.replace(/\s+/g, "_")}.txt`,
    file_size: content.length,
    content,
    status: "ready",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  saveResume(resume);
  return resume;
}

// Cover Letters
export function getCoverLetters(): CoverLetter[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COVER_LETTERS);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function saveCoverLetter(letter: CoverLetter): void {
  try {
    const letters = getCoverLetters();
    const index = letters.findIndex((l) => l.id === letter.id);
    if (index >= 0) letters[index] = letter;
    else letters.push(letter);
    localStorage.setItem(STORAGE_KEYS.COVER_LETTERS, JSON.stringify(letters));
  } catch {}
}

export function deleteCoverLetter(letterId: string): void {
  try {
    const letters = getCoverLetters().filter((l) => l.id !== letterId);
    localStorage.setItem(STORAGE_KEYS.COVER_LETTERS, JSON.stringify(letters));
  } catch {}
}

export function createCoverLetter(title: string, content: string): CoverLetter {
  const letter: CoverLetter = {
    id: generateId(),
    user_id: initializeUserProfile().id,
    title,
    content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  saveCoverLetter(letter);
  return letter;
}

// Job Applications
export function getJobApplications(): JobApplication[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.JOB_APPLICATIONS);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function saveJobApplication(application: JobApplication): void {
  try {
    const applications = getJobApplications();
    const index = applications.findIndex((a) => a.id === application.id);
    if (index >= 0) applications[index] = application;
    else applications.push(application);
    localStorage.setItem(STORAGE_KEYS.JOB_APPLICATIONS, JSON.stringify(applications));
  } catch {}
}

export function deleteJobApplication(applicationId: string): void {
  try {
    const applications = getJobApplications().filter((a) => a.id !== applicationId);
    localStorage.setItem(STORAGE_KEYS.JOB_APPLICATIONS, JSON.stringify(applications));
  } catch {}
}

export function createJobApplication(
  jobTitle: string,
  company: string,
  dateApplied: string,
  extra?: { salary?: string; notes?: string; followUpDate?: string }
): JobApplication {
  const application: JobApplication = {
    id: generateId(),
    user_id: initializeUserProfile().id,
    job_title: jobTitle,
    company,
    date_applied: dateApplied,
    status: "applied",
    follow_up_date: extra?.followUpDate,
    notes: extra?.notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  saveJobApplication(application);
  return application;
}

// Tracked Jobs
export function getTrackedJobs(): TrackedJob[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRACKED_JOBS);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function saveTrackedJob(job: TrackedJob): void {
  try {
    const jobs = getTrackedJobs();
    const index = jobs.findIndex((j) => j.id === job.id);
    if (index >= 0) jobs[index] = job;
    else jobs.push(job);
    localStorage.setItem(STORAGE_KEYS.TRACKED_JOBS, JSON.stringify(jobs));
  } catch {}
}

export function deleteTrackedJob(jobId: string): void {
  try {
    const jobs = getTrackedJobs().filter((j) => j.id !== jobId);
    localStorage.setItem(STORAGE_KEYS.TRACKED_JOBS, JSON.stringify(jobs));
  } catch {}
}

export function createTrackedJob(
  title: string, company: string, location: string,
  salary: string, postedDate: string, deadline: string, notes: string
): TrackedJob {
  const job: TrackedJob = {
    id: generateId(),
    user_id: initializeUserProfile().id,
    title, company, location, salary,
    posted_date: postedDate, deadline, notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  saveTrackedJob(job);
  return job;
}

// Statistics
export function getStatistics() {
  const resumes = getResumes();
  const coverLetters = getCoverLetters();
  const applications = getJobApplications();
  return {
    resumesCreated: resumes.length,
    coverLettersCreated: coverLetters.length,
    applicationsTracked: applications.length,
    interviews: applications.filter((a) => a.status === "interviewing").length,
    applied: applications.filter((a) => a.status === "applied").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
  };
}

export function clearAllData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  } catch {}
}

export function exportAllData() {
  return {
    userProfile: getUserProfile(),
    resumes: getResumes(),
    coverLetters: getCoverLetters(),
    jobApplications: getJobApplications(),
    trackedJobs: getTrackedJobs(),
    exportedAt: new Date().toISOString(),
  };
}
