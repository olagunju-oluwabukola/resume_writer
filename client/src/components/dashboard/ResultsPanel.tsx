import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Check,
  BookOpen,
  Target,
  ChevronDown,
  ChevronUp,
  Zap,
  FileText,
  Mail,
  Star,
  Sparkles,
  FileSearch,
  PenTool,
  MessageSquare,
  Trophy,
  Loader2,
} from "lucide-react";
import { DashboardAIState, ResultTab, AITask } from "./types";
import { ScoreBar } from "./ScoreBar";
import { Resume } from "@/lib/supabase";
import { copyToClipboard } from "@/lib/pdf-export";
import { toast } from "sonner";

interface ResultsPanelProps {
  currentResume: Resume | null;
  userName: string;
  activeTab: ResultTab;
  onTabChange: (tab: ResultTab) => void;
  aiState: DashboardAIState;
  onRunTask: (task: AITask) => void;
  loadingTask: AITask | null;
}

/* ─── Defensive data helpers ─────────────────────────────────────────── */

const getAnalysisData = (analysis: any) => {
  if (!analysis) return null;
  if (typeof analysis === "object" && "gap" in analysis)
    return { error: true, message: "AI returned skills analysis instead of match summary." };
  return analysis;
};

const getSkillsGapData = (skillsGap: any) => {
  if (!skillsGap) return null;
  if (typeof skillsGap === "object" && !Array.isArray(skillsGap) && "gap" in skillsGap) {
    return {
      present: [],
      missing: [String(skillsGap.gap || "Requirement")],
      suggestions: [String(skillsGap.action || "No action provided")],
    };
  }
  if (Array.isArray(skillsGap) && skillsGap.length > 0 && "gap" in skillsGap[0]) {
    return {
      present: [],
      missing: skillsGap.map((s: any) => String(s.gap)).filter(Boolean),
      suggestions: skillsGap.map((s: any) => String(s.action)).filter(Boolean),
    };
  }
  if (skillsGap.missing && Array.isArray(skillsGap.missing)) return skillsGap;
  return { error: true, message: "Could not parse analysis format" };
};

const getInterviewPrepData = (interviewPrep: any) => {
  if (!interviewPrep) return null;
  if (typeof interviewPrep === "object" && "gap" in interviewPrep)
    return { error: true, message: "Invalid interview prep format." };
  if (Array.isArray(interviewPrep.likelyQuestions)) return interviewPrep;
  return { error: true, message: "Invalid interview prep format" };
};

const getResumeScoreData = (resumeScore: any) => {
  if (!resumeScore || typeof resumeScore !== "object") return null;
  if ("gap" in resumeScore) return { error: true, message: "Invalid score format." };
  if (typeof resumeScore.overall !== "number") return null;
  return resumeScore;
};

/* ─── Reusable inline empty state with CTA ───────────────────────────── */

function TabEmptyState({
  icon,
  title,
  description,
  buttonLabel,
  buttonIcon: ButtonIcon,
  task,
  onRunTask,
  loadingTask,
  requiresJD = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  buttonIcon: React.ElementType;
  task: AITask;
  onRunTask: (task: AITask) => void;
  loadingTask: AITask | null;
  requiresJD?: boolean;
}) {
  const isLoading = loadingTask === task;
  const isOtherLoading = loadingTask !== null && loadingTask !== task;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-12 px-6 text-center">
      <div className="text-muted-foreground/30">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-foreground/70">{title}</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[220px] leading-relaxed">{description}</p>
        {requiresJD && (
          <p className="text-[10px] text-amber-500/80 mt-1.5 max-w-[220px]">
            ⚠ Paste a job description in the left panel first.
          </p>
        )}
      </div>
      <Button
        size="sm"
        onClick={() => onRunTask(task)}
        disabled={isLoading || isOtherLoading}
        className="gap-2 h-8 text-xs bg-primary hover:bg-primary/90"
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ButtonIcon className="h-3.5 w-3.5" />
        )}
        {isLoading ? "Running…" : buttonLabel}
      </Button>
    </div>
  );
}

/* ─── Tab definitions ────────────────────────────────────────────────── */

const TABS = [
  { value: "resume",       label: "Resume",    short: "CV"     },
  { value: "analysis",     label: "Analysis",  short: "Match"  },
  { value: "tailored",     label: "Tailored",  short: "Tailor" },
  { value: "cover-letter", label: "Cover",     short: "Cover"  },
  { value: "skills",       label: "Skills",    short: "Skills" },
  { value: "interview",    label: "Interview", short: "Prep"   },
  { value: "score",        label: "Score",     short: "Score"  },
] as const;

/* ─── Component ──────────────────────────────────────────────────────── */

export function ResultsPanel({
  currentResume,
  userName,
  activeTab,
  onTabChange,
  aiState,
  onRunTask,
  loadingTask,
}: ResultsPanelProps) {
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const { generatedCL, tailoredResume, aiAnalysis, skillsGap, interviewPrep, resumeScore } = aiState;

  const safeAnalysis      = getAnalysisData(aiAnalysis);
  const safeSkillsGap     = getSkillsGapData(skillsGap);
  const safeInterviewPrep = getInterviewPrepData(interviewPrep);
  const safeResumeScore   = getResumeScoreData(resumeScore);

  const handleCopy = async (text: string, label = "Text") => {
    try {
      await copyToClipboard(text);
      toast.success(`${label} copied!`);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full bg-card border-sidebar-border shadow-sm">

      {/* ── Header ── */}
      <div className="px-4 py-3 bg-muted/30 border-b flex items-center justify-between flex-shrink-0">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">
            {userName || "Your Resume"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {currentResume?.name || "No resume selected"}
          </p>
        </div>
        {currentResume && (
          <Button
            onClick={() => handleCopy(currentResume.content || "", "Resume")}
            size="icon"
            variant="ghost"
            className="h-7 w-7 flex-shrink-0"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* ── Tabs ── */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => onTabChange(v as ResultTab)}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <TabsList className="grid grid-cols-7 rounded-none border-b h-10 bg-muted/20 flex-shrink-0">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="h-full data-[state=active]:bg-background px-0"
            >
              <span className="hidden sm:inline text-[10px] md:text-xs">{t.label}</span>
              <span className="sm:hidden text-[9px]">{t.short}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-hidden relative">

          {/* ── RESUME ── */}
          <TabsContent value="resume" className="m-0 h-full overflow-y-auto p-4 absolute inset-0">
            {currentResume?.content ? (
              <pre className="whitespace-pre-wrap break-words font-sans text-xs text-foreground/80 leading-relaxed">
                {currentResume.content}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-12 text-center">
                <FileText className="h-8 w-8 opacity-20" />
                <p className="text-sm text-muted-foreground">Select or create a resume to get started</p>
              </div>
            )}
          </TabsContent>

          {/* ── ANALYSIS ── */}
          <TabsContent value="analysis" className="m-0 h-full overflow-y-auto p-4 space-y-4 absolute inset-0">
            {safeAnalysis ? (
              "error" in safeAnalysis ? (
                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg text-xs text-red-600">
                  {safeAnalysis.message}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-primary/5 p-4 border border-primary/10">
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="font-bold text-sm">Match Rating</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {typeof safeAnalysis.summary === "string" ? safeAnalysis.summary : "No summary available"}
                      </p>
                    </div>
                    <div className={`text-3xl font-black flex-shrink-0 ${safeAnalysis.matchScore >= 70 ? "text-green-500" : "text-amber-500"}`}>
                      {String(safeAnalysis.matchScore)}%
                    </div>
                  </div>
                  {Array.isArray(safeAnalysis.keep) && safeAnalysis.keep.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-green-600 uppercase">Strengths</p>
                      {safeAnalysis.keep.map((item: any, i: number) => (
                        <div key={i} className="flex gap-2 text-xs bg-green-500/5 p-2 rounded border border-green-500/10">
                          <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {typeof item === "string" ? item : "Validated Skill"}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            ) : (
              <TabEmptyState
                icon={<FileSearch className="h-10 w-10" />}
                title="No analysis yet"
                description="Compare your resume against a job description to get a match score and strengths breakdown."
                buttonLabel="Analyse Match"
                buttonIcon={FileSearch}
                task="analyse"
                onRunTask={onRunTask}
                loadingTask={loadingTask}
                requiresJD
              />
            )}
          </TabsContent>

          {/* ── TAILORED ── */}
          <TabsContent value="tailored" className="m-0 h-full overflow-y-auto p-4 absolute inset-0">
            {tailoredResume ? (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(tailoredResume, "Tailored Resume")}
                  className="h-7 text-[10px]"
                >
                  <Copy className="mr-1 h-3 w-3" /> Copy
                </Button>
                <pre className="whitespace-pre-wrap font-sans text-xs text-foreground/80 leading-relaxed">
                  {typeof tailoredResume === "string" ? tailoredResume : "Tailoring…"}
                </pre>
              </div>
            ) : (
              <TabEmptyState
                icon={<PenTool className="h-10 w-10" />}
                title="Resume not tailored yet"
                description="Rewrite your resume to better match the job description with targeted keywords and phrasing."
                buttonLabel="Tailor Resume"
                buttonIcon={PenTool}
                task="tailor"
                onRunTask={onRunTask}
                loadingTask={loadingTask}
                requiresJD
              />
            )}
          </TabsContent>

          {/* ── COVER LETTER ── */}
          <TabsContent value="cover-letter" className="m-0 h-full overflow-y-auto p-4 absolute inset-0">
            {generatedCL ? (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(generatedCL, "Cover Letter")}
                  className="h-7 text-[10px]"
                >
                  <Copy className="mr-1 h-3 w-3" /> Copy
                </Button>
                <pre className="whitespace-pre-wrap font-sans text-xs text-foreground/80 leading-relaxed">
                  {typeof generatedCL === "string" ? generatedCL : "Drafting…"}
                </pre>
              </div>
            ) : (
              <TabEmptyState
                icon={<Mail className="h-10 w-10" />}
                title="No cover letter yet"
                description="Generate a personalised cover letter tailored to the job and company you're applying to."
                buttonLabel="Generate Cover Letter"
                buttonIcon={Mail}
                task="cover-letter"
                onRunTask={onRunTask}
                loadingTask={loadingTask}
                requiresJD
              />
            )}
          </TabsContent>

          {/* ── SKILLS ── */}
          <TabsContent value="skills" className="m-0 h-full overflow-y-auto p-4 space-y-4 absolute inset-0">
            {safeSkillsGap ? (
              "error" in safeSkillsGap ? (
                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg text-xs text-red-600">
                  {safeSkillsGap.message}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-red-500 uppercase">Missing Requirements</p>
                    <div className="flex flex-wrap gap-2">
                      {safeSkillsGap.missing?.map((s: any, i: number) => (
                        <span key={i} className="px-2 py-1 bg-red-500/10 text-red-600 rounded text-[10px] font-medium border border-red-500/10">
                          {typeof s === "string" ? s : "Requirement"}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-blue-500 uppercase">Action Plan</p>
                    {safeSkillsGap.suggestions?.map((s: any, i: number) => (
                      <div key={i} className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg text-xs text-blue-700 leading-relaxed">
                        {typeof s === "string" ? s : "Action step provided"}
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <TabEmptyState
                icon={<Target className="h-10 w-10" />}
                title="No skills analysis yet"
                description="Find out which skills and requirements you're missing compared to the job description."
                buttonLabel="Analyse Skills Gap"
                buttonIcon={Target}
                task="skills-gap"
                onRunTask={onRunTask}
                loadingTask={loadingTask}
                requiresJD
              />
            )}
          </TabsContent>

          {/* ── INTERVIEW ── */}
          <TabsContent value="interview" className="m-0 h-full overflow-y-auto p-4 absolute inset-0">
            {safeInterviewPrep && !safeInterviewPrep.error ? (
              <div className="space-y-3">
                {safeInterviewPrep.likelyQuestions?.map((q: any, i: number) => (
                  <div key={i} className="border border-sidebar-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedQ(expandedQ === q ? null : q)}
                      className="w-full p-3 text-left text-xs font-medium bg-muted/10 hover:bg-muted/30 flex justify-between items-center gap-2"
                    >
                      <span className="flex-1 min-w-0">{String(q)}</span>
                      {expandedQ === q
                        ? <ChevronUp className="h-3 w-3 flex-shrink-0" />
                        : <ChevronDown className="h-3 w-3 flex-shrink-0" />}
                    </button>
                    {expandedQ === q && (
                      <div className="p-3 text-xs text-muted-foreground border-t bg-background leading-relaxed">
                        {safeInterviewPrep.suggestedAnswers?.[q] || "No answer generated."}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <TabEmptyState
                icon={<BookOpen className="h-10 w-10" />}
                title="No interview prep yet"
                description="Get likely interview questions and suggested answers based on your resume and the role."
                buttonLabel="Generate Interview Prep"
                buttonIcon={MessageSquare}
                task="interview"
                onRunTask={onRunTask}
                loadingTask={loadingTask}
                requiresJD
              />
            )}
          </TabsContent>

          {/* ── SCORE ── */}
          <TabsContent value="score" className="m-0 h-full overflow-y-auto p-4 absolute inset-0">
            {safeResumeScore ? (
              "error" in safeResumeScore ? (
                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg text-xs text-red-600">
                  {safeResumeScore.message}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl text-center">
                    <p className="text-[10px] uppercase font-bold text-purple-500">ATS Readiness</p>
                    <p className="text-4xl font-black text-purple-600">{safeResumeScore.overall}%</p>
                  </div>
                  <ScoreBar label="Impact"    value={safeResumeScore.impact} />
                  <ScoreBar label="Clarity"   value={safeResumeScore.clarity} />
                  <ScoreBar label="ATS Match" value={safeResumeScore.atsCompatibility} />
                  {/* Re-run button */}
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRunTask("score")}
                      disabled={loadingTask !== null}
                      className="w-full h-8 text-xs gap-2"
                    >
                      {loadingTask === "score"
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trophy className="h-3.5 w-3.5" />}
                      {loadingTask === "score" ? "Scoring…" : "Re-run Score"}
                    </Button>
                  </div>
                </div>
              )
            ) : (
              <TabEmptyState
                icon={<Star className="h-10 w-10" />}
                title="No ATS score yet"
                description="Score your resume for clarity, impact, and ATS compatibility — no job description needed."
                buttonLabel="Score My Resume"
                buttonIcon={Trophy}
                task="score"
                onRunTask={onRunTask}
                loadingTask={loadingTask}
              />
            )}
          </TabsContent>

        </div>
      </Tabs>
    </Card>
  );
}