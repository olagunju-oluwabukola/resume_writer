export interface Resume {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  status: "uploaded" | "processing" | "ready";
  content?: string;
}

export interface CoverLetter {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  dateApplied: string;
  status: "applied" | "interviewing" | "rejected" | "accepted";
  followUpDate?: string;
  notes?: string;
}

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  description: string;
  addedAt: string;
}

export interface AIAnalysis {
  id: string;
  recommendations: {
    keep: string[];
    modify: string[];
    remove: string[];
  };
  matchScore: number;
}

export interface DashboardStats {
  resumesCreated: number;
  coverLetters: number;
  applicationsTracked: number;
  interviews: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
