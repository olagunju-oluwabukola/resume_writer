import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";
import {
  analyzeResumeWithGroq, generateCoverLetter, tailorResume,
  analyzeSkillsGap, generateInterviewPrep, scoreResume,
  type AIRecommendations,
  type SkillsGap,
  type InterviewPrep,
  type ResumeScore,
} from "@/lib/groq";

import { StatsBar }           from "@/components/dashboard/StatsBar";
import { ResumeControls }     from "@/components/dashboard/ResumeControls";
import { ResultsPanel }       from "@/components/dashboard/ResultsPanel";
import { RecentApplications } from "@/components/dashboard/RecentApplications";
import { NewResumeDialog }    from "@/components/dashboard/NewResumeDialog";
import { AITask, ResultTab, DashboardAIState } from "@/components/dashboard/types";

export default function Dashboard() {
  const { userProfile, stats, resumes, applications, addResume, addCoverLetter } = useData();

  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(
    resumes.length > 0 ? resumes[0].id : null
  );
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName]       = useState("");
  const [showNewResume, setShowNewResume]   = useState(false);

  const [loadingTask, setLoadingTask] = useState<AITask | null>(null);
  const [activeTab, setActiveTab]     = useState<ResultTab>("resume");
  const [aiState, setAiState]         = useState<DashboardAIState>({
    aiAnalysis:     null,
    generatedCL:    "",
    tailoredResume: "",
    skillsGap:      null,
    interviewPrep:  null,
    resumeScore:    null,
  });

  const currentResume = resumes.find((r) => r.id === selectedResumeId)
    ?? (resumes.length > 0 ? resumes[0] : null);

  const firstName = userProfile?.full_name?.split(" ")[0] || "there";

  /* ── Helpers ── */
  const isErrorObject = (value: any): boolean =>
    value && typeof value === "object" &&
    ("gap" in value || "resource" in value || "action" in value);

  const safeString = (value: any): string => {
    if (typeof value === "string") return value;
    if (isErrorObject(value))
      return `Error: ${value.action || "API request failed"}. Please try again later.`;
    if (typeof value === "object" && value !== null)
      return JSON.stringify(value, null, 2);
    return String(value || "");
  };

  const safeParseJSON = <T,>(value: any, defaultValue: T): T => {
    if (!value) return defaultValue;
    if (isErrorObject(value)) { toast.error(value.action || "API Error"); return defaultValue; }
    if (typeof value === "object" && value !== null) return value as T;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (isErrorObject(parsed)) { toast.error(parsed.action || "API Error"); return defaultValue; }
        return parsed as T;
      } catch (e) { console.error("Failed to parse JSON:", e); return defaultValue; }
    }
    return defaultValue;
  };

  /* ── AI task runner ── */
  async function runTask(task: AITask) {
    if (!currentResume?.content) { toast.error("Create or select a resume first"); return; }
    const needsJD: AITask[] = ["analyse", "cover-letter", "tailor", "skills-gap", "interview"];
    if (needsJD.includes(task) && !jobDescription.trim()) { toast.error("Paste a job description first"); return; }

    setLoadingTask(task);
    try {
      let response: any;
      switch (task) {
        case "analyse": {
          response = await analyzeResumeWithGroq(currentResume.content, jobDescription);
          if (isErrorObject(response)) throw new Error(response.action || "Analysis failed");
          setAiState((s) => ({ ...s, aiAnalysis: safeParseJSON<AIRecommendations>(response, { keep: [], modify: [], remove: [], matchScore: 0, summary: "Analysis failed" }) }));
          setActiveTab("analysis"); toast.success("Analysis complete!"); break;
        }
        case "cover-letter": {
          response = await generateCoverLetter(currentResume.content, jobDescription, companyName || "the company");
          if (isErrorObject(response)) throw new Error(response.action || "Cover letter generation failed");
          const safeText = safeString(response);
          setAiState((s) => ({ ...s, generatedCL: safeText }));
          addCoverLetter(`${companyName || "Cover Letter"} — ${new Date().toLocaleDateString()}`, safeText);
          setActiveTab("cover-letter"); toast.success("Cover letter generated!"); break;
        }
        case "tailor": {
          response = await tailorResume(currentResume.content, jobDescription);
          if (isErrorObject(response)) throw new Error(response.action || "Resume tailoring failed");
          setAiState((s) => ({ ...s, tailoredResume: safeString(response) }));
          setActiveTab("tailored"); toast.success("Resume tailored!"); break;
        }
        case "skills-gap": {
          response = await analyzeSkillsGap(currentResume.content, jobDescription);
          if (isErrorObject(response)) throw new Error(response.action || "Skills gap analysis failed");
          setAiState((s) => ({ ...s, skillsGap: safeParseJSON<SkillsGap>(response, { present: [], missing: [], suggestions: [] }) }));
          setActiveTab("skills"); toast.success("Skills gap analysed!"); break;
        }
        case "interview": {
          response = await generateInterviewPrep(currentResume.content, jobDescription);
          if (isErrorObject(response)) throw new Error(response.action || "Interview prep generation failed");
          setAiState((s) => ({ ...s, interviewPrep: safeParseJSON<InterviewPrep>(response, { likelyQuestions: [], suggestedAnswers: {}, redFlags: [] }) }));
          setActiveTab("interview"); toast.success("Interview prep ready!"); break;
        }
        case "score": {
          response = await scoreResume(currentResume.content);
          if (isErrorObject(response)) throw new Error(response.action || "Resume scoring failed");
          setAiState((s) => ({ ...s, resumeScore: safeParseJSON<ResumeScore>(response, { overall: 0, clarity: 0, impact: 0, atsCompatibility: 0, feedback: [] }) }));
          setActiveTab("score"); toast.success("Resume scored!"); break;
        }
      }
    } catch (e: any) {
      console.error("AI task error:", e);
      toast.error(e.message || "AI request failed");
      switch (task) {
        case "analyse":      setAiState((s) => ({ ...s, aiAnalysis: null })); break;
        case "cover-letter": setAiState((s) => ({ ...s, generatedCL: `Error: ${e.message}` })); break;
        case "tailor":       setAiState((s) => ({ ...s, tailoredResume: `Error: ${e.message}` })); break;
        case "skills-gap":   setAiState((s) => ({ ...s, skillsGap: null })); break;
        case "interview":    setAiState((s) => ({ ...s, interviewPrep: null })); break;
        case "score":        setAiState((s) => ({ ...s, resumeScore: null })); break;
      }
    } finally {
      setLoadingTask(null);
    }
  }

  const handleNewResume = (name: string, content: string) => {
    const r = addResume(name, content);
    setSelectedResumeId(r.id);
    setShowNewResume(false);
    toast.success("Resume created!");
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">

      {/* ── Fixed top header ── */}
      <header className="flex-shrink-0 h-14 flex items-center justify-between
        px-4 md:px-6 pl-16 md:pl-6
        border-b border-border bg-background/95 backdrop-blur-sm
        sticky top-0 z-20">

        {/* Greeting */}
        <div className="min-w-0">
          <h1 className="font-poppins text-base md:text-lg font-bold text-foreground leading-tight truncate">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            AI-powered resume tailoring and career tools.
          </p>
        </div>

        {/* New Resume button */}
        <Button
          onClick={() => setShowNewResume(true)}
          className="gap-2 bg-primary hover:bg-primary/90 h-8 text-sm flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Resume</span>
          <span className="sm:hidden">New</span>
        </Button>
      </header>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 p-4 md:p-6 min-h-full">

          {/* Stats */}
          <div className="flex-shrink-0">
            <StatsBar stats={stats} />
          </div>

          {/* Main panel: controls + results */}
          <div className="flex flex-col md:flex-row gap-4 flex-1 md:min-h-0">

            {/* Left — Resume Controls */}
            <div className="w-full md:w-64 md:flex-shrink-0">
              <ResumeControls
                resumes={resumes}
                selectedResumeId={selectedResumeId}
                onSelectResume={setSelectedResumeId}
                jobDescription={jobDescription}
                onJobDescriptionChange={setJobDescription}
                companyName={companyName}
                onCompanyNameChange={setCompanyName}
                loadingTask={loadingTask}
                hasResume={!!currentResume}
                onRunTask={runTask}
                onNewResume={() => setShowNewResume(true)}
              />
            </div>

            {/* Right — Results Panel */}
            <div className="flex-1 min-w-0 flex flex-col min-h-[500px] md:min-h-[400px]">
              <ResultsPanel
                currentResume={currentResume}
                userName={userProfile?.full_name || ""}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                aiState={aiState}
                onRunTask={runTask}
                loadingTask={loadingTask}
              />
            </div>
          </div>

          {/* Recent Applications */}
          <div className="flex-shrink-0">
            <RecentApplications
              applications={applications}
              totalCount={stats.applicationsTracked}
            />
          </div>
        </div>
      </div>

      <NewResumeDialog
        open={showNewResume}
        onOpenChange={setShowNewResume}
        onSave={handleNewResume}
      />
    </div>
  );
}