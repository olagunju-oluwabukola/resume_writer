import { AIRecommendations, SkillsGap, InterviewPrep, ResumeScore } from "@/lib/groq";

export type AITask = "analyse" | "cover-letter" | "tailor" | "skills-gap" | "interview" | "score";

export type ResultTab = "resume" | "analysis" | "tailored" | "cover-letter" | "skills" | "interview" | "score";

export interface DashboardAIState {
  aiAnalysis: AIRecommendations | null;
  generatedCL: string;
  tailoredResume: string;
  skillsGap: SkillsGap | SkillsGap[] | any | null;
  interviewPrep: InterviewPrep | any | null;
  resumeScore: ResumeScore | any | null;
}