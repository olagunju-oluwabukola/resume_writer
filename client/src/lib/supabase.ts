import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database types
export interface Resume {
  id: string;
  user_id: string;
  name: string;
  file_name: string;
  file_size: number;
  file_url?: string;
  content?: string;
  status: "uploaded" | "processing" | "ready";
  created_at: string;
  updated_at: string;
}

export interface CoverLetter {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  date_applied: string;
  status: "applied" | "interviewing" | "rejected" | "accepted";
  follow_up_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface JobDescription {
  id: string;
  user_id: string;
  title: string;
  company: string;
  description: string;
  created_at: string;
}

export interface AIAnalysis {
  id: string;
  user_id: string;
  resume_id: string;
  job_description_id: string;
  recommendations: {
    keep: string[];
    modify: string[];
    remove: string[];
  };
  match_score: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
