import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";
import {
  analyzeResumeWithGroq, generateCoverLetter, tailorResume,
  analyzeSkillsGap, generateInterviewPrep, scoreResume,
  AIRecommendations, SkillsGap, InterviewPrep, ResumeScore,
} from "@/lib/groq";

import { StatsBar }           from "@/components/dashboard/StatsBar";
import { ResumeControls }     from "@/components/dashboard/ResumeControls";
import { ResultsPanel }       from "@/components/dashboard/ResultsPanel";
import { RecentApplications } from "@/components/dashboard/RecentApplications";
import { NewResumeDialog }    from "@/components/dashboard/NewResumeDialog";
import { AITask, ResultTab, DashboardAIState } from "@/components/dashboard/types";

export default function Dashboard() {
  const { userProfile, stats, resumes, applications, addResume, addCoverLetter } = useData();

  // Controls state
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(
    resumes.length > 0 ? resumes[0].id : null
  );
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName]       = useState("");
  const [showNewResume, setShowNewResume]   = useState(false);

  // AI state
  const [loadingTask, setLoadingTask] = useState<AITask | null>(null);
  const [activeTab, setActiveTab]     = useState<ResultTab>("resume");
  const [aiState, setAiState]         = useState<DashboardAIState>({
    aiAnalysis:    null,
    generatedCL:   "",
    tailoredResume:"",
    skillsGap:     null,
    interviewPrep: null,
    resumeScore:   null,
  });

  const currentResume = resumes.find(r => r.id === selectedResumeId)
    ?? (resumes.length > 0 ? resumes[0] : null);

  async function runTask(task: AITask) {
    if (!currentResume?.content) { toast.error("Create or select a resume first"); return; }
    const needsJD: AITask[] = ["analyse", "cover-letter", "tailor", "skills-gap", "interview"];
    if (needsJD.includes(task) && !jobDescription.trim()) {
      toast.error("Paste a job description first"); return;
    }

    setLoadingTask(task);
    try {
      switch (task) {
        case "analyse": {
          const r = await analyzeResumeWithGroq(currentResume.content, jobDescription);
          setAiState(s => ({ ...s, aiAnalysis: r }));
          setActiveTab("analysis");
          toast.success("Analysis complete!");
          break;
        }
        case "cover-letter": {
          const r = await generateCoverLetter(currentResume.content, jobDescription, companyName || "the company");
          setAiState(s => ({ ...s, generatedCL: r }));
          addCoverLetter(`${companyName || "Cover Letter"} — ${new Date().toLocaleDateString()}`, r);
          setActiveTab("cover-letter");
          toast.success("Cover letter generated & saved!");
          break;
        }
        case "tailor": {
          const r = await tailorResume(currentResume.content, jobDescription);
          setAiState(s => ({ ...s, tailoredResume: r }));
          setActiveTab("tailored");
          toast.success("Resume tailored!");
          break;
        }
        case "skills-gap": {
          const r = await analyzeSkillsGap(currentResume.content, jobDescription);
          setAiState(s => ({ ...s, skillsGap: r }));
          setActiveTab("skills");
          toast.success("Skills gap analysed!");
          break;
        }
        case "interview": {
          const r = await generateInterviewPrep(currentResume.content, jobDescription);
          setAiState(s => ({ ...s, interviewPrep: r }));
          setActiveTab("interview");
          toast.success("Interview prep ready!");
          break;
        }
        case "score": {
          const r = await scoreResume(currentResume.content);
          setAiState(s => ({ ...s, resumeScore: r }));
          setActiveTab("score");
          toast.success("Resume scored!");
          break;
        }
      }
    } catch (e: any) {
      toast.error(e.message || "AI request failed");
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
    // Full viewport height, no overflow — page must never exceed sidebar
    <div className="h-full flex flex-col gap-4 p-4 md:p-6 overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="font-poppins text-xl md:text-2xl font-bold text-foreground">
            Welcome back, {userProfile?.full_name?.split(" ")[0] || "there"}! 👋
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            AI-powered resume tailoring and career tools.
          </p>
        </div>
        <Button onClick={() => setShowNewResume(true)} className="gap-2 bg-primary hover:bg-primary/90 h-8 text-sm">
          <Plus className="h-4 w-4" /> New Resume
        </Button>
      </div>

      {/* Stats — fixed height */}
      <StatsBar stats={stats} />

      {/* Main panel — takes remaining height, never overflows */}
      <div className="flex gap-4 flex-1 overflow-hidden min-h-0">
        {/* Left controls — scrollable internally */}
        <div className="w-64 flex-shrink-0 overflow-hidden">
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

        {/* Results panel — fills remaining width & height */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <ResultsPanel
            currentResume={currentResume}
            userName={userProfile?.full_name || ""}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            aiState={aiState}
          />
        </div>
      </div>

      {/* Recent applications — only shows if data exists, fixed height */}
      <RecentApplications
        applications={applications}
        totalCount={stats.applicationsTracked}
      />

      <NewResumeDialog
        open={showNewResume}
        onOpenChange={setShowNewResume}
        onSave={handleNewResume}
      />
    </div>
  );
}