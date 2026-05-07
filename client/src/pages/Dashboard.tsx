import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Sparkles,
  FileSearch,
  PenTool,
  Target,
  MessageSquare,
  Trophy,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const currentResume = resumes.find(r => r.id === selectedResumeId)
    ?? (resumes.length > 0 ? resumes[0] : null);


  const isErrorObject = (value: any): boolean => {
    return value && typeof value === 'object' &&
           ('gap' in value || 'resource' in value || 'action' in value);
  };

  //  extract text from API responses
  const safeString = (value: any): string => {
    if (typeof value === 'string') return value;
    if (isErrorObject(value)) {
      return `Error: ${value.action || 'API request failed'}. Please try again later.`;
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value || '');
  };

  const safeParseJSON = <T,>(value: any, defaultValue: T): T => {
    if (!value) return defaultValue;

    if (isErrorObject(value)) {
      const errorMsg = value.action || 'API Error';
      toast.error(errorMsg);
      return defaultValue;
    }

    // If it's already the correct object
    if (typeof value === 'object' && value !== null) {
      return value as T;
    }


    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        // Check if parsed is an error object
        if (isErrorObject(parsed)) {
          toast.error(parsed.action || 'API Error');
          return defaultValue;
        }
        return parsed as T;
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        return defaultValue;
      }
    }

    return defaultValue;
  };

  async function runTask(task: AITask) {
    if (!currentResume?.content) {
      toast.error("Create or select a resume first");
      return;
    }
    const needsJD: AITask[] = ["analyse", "cover-letter", "tailor", "skills-gap", "interview"];
    if (needsJD.includes(task) && !jobDescription.trim()) {
      toast.error("Paste a job description first");
      return;
    }

    setLoadingTask(task);
    try {
      let response: any;

      switch (task) {
        case "analyse": {
          response = await analyzeResumeWithGroq(currentResume.content, jobDescription);

          // Check if response is an error object
          if (isErrorObject(response)) {
            throw new Error(response.action || 'Analysis failed');
          }

          const safeResult = safeParseJSON<AIRecommendations>(response, {
            keep: [],
            modify: [],
            remove: [],
            matchScore: 0,
            summary: "Analysis failed"
          });

          setAiState(s => ({ ...s, aiAnalysis: safeResult }));
          setActiveTab("analysis");
          toast.success("Analysis complete!");
          break;
        }
        case "cover-letter": {
          response = await generateCoverLetter(currentResume.content, jobDescription, companyName || "the company");

          // Check if response is an error object
          if (isErrorObject(response)) {
            throw new Error(response.action || 'Cover letter generation failed');
          }

          const safeText = safeString(response);
          setAiState(s => ({ ...s, generatedCL: safeText }));
          addCoverLetter(`${companyName || "Cover Letter"} — ${new Date().toLocaleDateString()}`, safeText);
          setActiveTab("cover-letter");
          toast.success("Cover letter generated!");
          break;
        }
        case "tailor": {
          response = await tailorResume(currentResume.content, jobDescription);

          // Check if response is an error object
          if (isErrorObject(response)) {
            throw new Error(response.action || 'Resume tailoring failed');
          }

          const safeText = safeString(response);
          setAiState(s => ({ ...s, tailoredResume: safeText }));
          setActiveTab("tailored");
          toast.success("Resume tailored!");
          break;
        }
        case "skills-gap": {
          response = await analyzeSkillsGap(currentResume.content, jobDescription);

          // Check if response is an error object
          if (isErrorObject(response)) {
            throw new Error(response.action || 'Skills gap analysis failed');
          }

          const safeResult = safeParseJSON<SkillsGap>(response, {
            present: [],
            missing: [],
            suggestions: []
          });

          setAiState(s => ({ ...s, skillsGap: safeResult }));
          setActiveTab("skills");
          toast.success("Skills gap analysed!");
          break;
        }
        case "interview": {
          response = await generateInterviewPrep(currentResume.content, jobDescription);

          // Check if response is an error object
          if (isErrorObject(response)) {
            throw new Error(response.action || 'Interview prep generation failed');
          }

          const safeResult = safeParseJSON<InterviewPrep>(response, {
            likelyQuestions: [],
            suggestedAnswers: {},
            redFlags: []
          });

          setAiState(s => ({ ...s, interviewPrep: safeResult }));
          setActiveTab("interview");
          toast.success("Interview prep ready!");
          break;
        }
        case "score": {
          response = await scoreResume(currentResume.content);

          // Check if response is an error object
          if (isErrorObject(response)) {
            throw new Error(response.action || 'Resume scoring failed');
          }

          const safeResult = safeParseJSON<ResumeScore>(response, {
            overall: 0,
            clarity: 0,
            impact: 0,
            atsCompatibility: 0,
            feedback: []
          });

          setAiState(s => ({ ...s, resumeScore: safeResult }));
          setActiveTab("score");
          toast.success("Resume scored!");
          break;
        }
      }
    } catch (e: any) {
      console.error("AI task error:", e);
      toast.error(e.message || "AI request failed");

      // Set error state based on task
      switch (task) {
        case "analyse":
          setAiState(s => ({ ...s, aiAnalysis: null }));
          break;
        case "cover-letter":
          setAiState(s => ({ ...s, generatedCL: `Error: ${e.message || 'Failed to generate cover letter'}` }));
          break;
        case "tailor":
          setAiState(s => ({ ...s, tailoredResume: `Error: ${e.message || 'Failed to tailor resume'}` }));
          break;
        case "skills-gap":
          setAiState(s => ({ ...s, skillsGap: null }));
          break;
        case "interview":
          setAiState(s => ({ ...s, interviewPrep: null }));
          break;
        case "score":
          setAiState(s => ({ ...s, resumeScore: null }));
          break;
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
    <div className="md:h-screen md:max-h-screen flex flex-col gap-4 p-4 md:p-6 overflow-hidden bg-background">

      {/* Header row */}
      <div className="md:flex items-center justify-between md:flex-shrink-0">
        <div>
          <h1 className="font-poppins text-xl md:text-2xl font-bold text-foreground">
            Welcome back, {userProfile?.full_name?.split(" ")[0] || "there"}! 👋
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 mb-8 md:mb-0">
            AI-powered resume tailoring and career tools.
          </p>
        </div>

        <div className="md:flex gap-2">
          {/* AI Tools Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 h-8 text-sm border-primary/20 hover:bg-primary/5 text-primary">
                <Sparkles className="h-4 w-4" />
                {loadingTask ? "Processing..." : "AI Tools"}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Optimize & Generate</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => runTask("analyse")} className="gap-2 cursor-pointer">
                <FileSearch className="h-4 w-4 text-blue-500" /> Analyze Match
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => runTask("tailor")} className="gap-2 cursor-pointer">
                <PenTool className="h-4 w-4 text-purple-500" /> Tailor Resume
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => runTask("cover-letter")} className="gap-2 cursor-pointer">
                <Target className="h-4 w-4 text-green-500" /> Generate Cover Letter
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Career Prep</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => runTask("skills-gap")} className="gap-2 cursor-pointer">
                <Sparkles className="h-4 w-4 text-orange-500" /> Skills Gap Analysis
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => runTask("interview")} className="gap-2 cursor-pointer">
                <MessageSquare className="h-4 w-4 text-pink-500" /> Interview Prep
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => runTask("score")} className="gap-2 cursor-pointer">
                <Trophy className="h-4 w-4 text-yellow-500" /> ATS Scoring
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setShowNewResume(true)} className="gap-2 bg-primary hover:bg-primary/90 h-8 text-sm">
            <Plus className="h-4 w-4" /> New Resume
          </Button>
        </div>
      </div>

      <div className="flex-shrink-0">
        <StatsBar stats={stats} />
      </div>

      <div className="md:flex gap-4 flex-1 min-h-0 overflow-hidden mt-8 md:mb-0">
        <div className="w-64 flex-shrink-0 overflow-y-auto">
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

        <div className="flex-1 min-w-0 overflow-hidden flex flex-col mt-8 md:mb-0">
          <ResultsPanel
            currentResume={currentResume}
            userName={userProfile?.full_name || ""}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            aiState={aiState}
          />
        </div>
      </div>

      <div className="flex-shrink-0">
        <RecentApplications
          applications={applications}
          totalCount={stats.applicationsTracked}
        />
      </div>

      <NewResumeDialog
        open={showNewResume}
        onOpenChange={setShowNewResume}
        onSave={handleNewResume}
      />
    </div>
  );
}