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
} from "lucide-react";
import { DashboardAIState, ResultTab } from "./types";
import { ScoreBar } from "./ScoreBar";
import { EmptyState } from "./EmptyState";
import { Resume } from "@/lib/supabase";
import { copyToClipboard } from "@/lib/pdf-export";
import { toast } from "sonner";

interface ResultsPanelProps {
  currentResume: Resume | null;
  userName: string;
  activeTab: ResultTab;
  onTabChange: (tab: ResultTab) => void;
  aiState: DashboardAIState;
}

/**
 * HELPERS: Sanitize and validate AI responses to prevent React render crashes.
 */

const getAnalysisData = (analysis: any) => {
  if (!analysis) return null;
  // Guard against the "Skills Gap" object structure leaking into Analysis
  if (typeof analysis === 'object' && 'gap' in analysis) {
    return { error: true, message: "AI returned skills analysis instead of match summary." };
  }
  return analysis;
};

const getSkillsGapData = (skillsGap: any) => {
  if (!skillsGap) return null;

  // Case 1: AI returned single-object format { gap, action, resource }
  if (typeof skillsGap === 'object' && !Array.isArray(skillsGap) && ('gap' in skillsGap)) {
    return {
      present: [],
      missing: [String(skillsGap.gap || "Requirement")],
      suggestions: [String(skillsGap.action || "No action provided")],
    };
  }

  // Case 2: AI returned an array of objects [{ gap, action }, ...]
  if (Array.isArray(skillsGap) && skillsGap.length > 0 && typeof skillsGap[0] === 'object' && ('gap' in skillsGap[0])) {
    return {
      present: [],
      missing: skillsGap.map((s: any) => String(s.gap)).filter(Boolean),
      suggestions: skillsGap.map((s: any) => String(s.action)).filter(Boolean),
    };
  }

  // Case 3: Standard structure
  if (skillsGap.missing && Array.isArray(skillsGap.missing)) {
    return skillsGap;
  }

  return { error: true, message: "Could not parse analysis format" };
};

const getInterviewPrepData = (interviewPrep: any) => {
  if (!interviewPrep) return null;
  if (typeof interviewPrep === 'object' && 'gap' in interviewPrep) {
    return { error: true, message: "Invalid interview prep format." };
  }
  if (Array.isArray(interviewPrep.likelyQuestions)) return interviewPrep;
  return { error: true, message: "Invalid interview prep format" };
};

const getResumeScoreData = (resumeScore: any) => {
  if (!resumeScore || typeof resumeScore !== 'object') return null;
  if ('gap' in resumeScore) return { error: true, message: "Invalid score format." };
  if (typeof resumeScore.overall !== 'number') return null;
  return resumeScore;
};

export function ResultsPanel({
  currentResume,
  userName,
  activeTab,
  onTabChange,
  aiState,
}: ResultsPanelProps) {
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const { generatedCL, tailoredResume, aiAnalysis, skillsGap, interviewPrep, resumeScore } = aiState;

  // Process data through defensive helpers
  const safeAnalysis = getAnalysisData(aiAnalysis);
  const safeSkillsGap = getSkillsGapData(skillsGap);
  const safeInterviewPrep = getInterviewPrepData(interviewPrep);
  const safeResumeScore = getResumeScoreData(resumeScore);

  const handleCopy = async (text: string, label = "Text") => {
    try {
      await copyToClipboard(text);
      toast.success(`${label} copied!`);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const TABS = [
    { value: "resume", label: "Resume" },
    { value: "analysis", label: "Analysis" },
    { value: "tailored", label: "Tailored" },
    { value: "cover-letter", label: "Cover" },
    { value: "skills", label: "Skills" },
    { value: "interview", label: "Interview" },
    { value: "score", label: "Score" },
  ] as const;

  return (
    <Card className="overflow-hidden flex flex-col h-full bg-card border-sidebar-border shadow-sm">
      {/* Header */}
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
          <div className="flex gap-1 flex-shrink-0">
            <Button
              onClick={() => handleCopy(currentResume.content || "", "Resume")}
              size="icon"
              variant="ghost"
              className="h-7 w-7"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

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
              className="text-[10px] md:text-xs h-full data-[state=active]:bg-background"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-hidden relative">
          {/* RESUME TAB */}
          <TabsContent value="resume" className="m-0 h-full overflow-y-auto p-4 absolute inset-0">
            {currentResume?.content ? (
              <pre className="whitespace-pre-wrap break-words font-sans text-xs text-foreground/80 leading-relaxed">
                {currentResume.content}
              </pre>
            ) : (
              <EmptyState text="Select or create a resume" icon={<FileText className="h-8 w-8 opacity-20" />} />
            )}
          </TabsContent>

          {/* ANALYSIS TAB */}
          <TabsContent value="analysis" className="m-0 h-full overflow-y-auto p-4 space-y-4 absolute inset-0">
            {safeAnalysis ? (
              'error' in safeAnalysis ? (
                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg text-xs text-red-600">
                  {safeAnalysis.message}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-primary/5 p-4 border border-primary/10">
                    <div className="flex-1">
                      <p className="font-bold text-sm">Match Rating</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {typeof safeAnalysis.summary === 'string' ? safeAnalysis.summary : "No summary available"}
                      </p>
                    </div>
                    <div className={`text-3xl font-black ml-4 ${safeAnalysis.matchScore >= 70 ? "text-green-500" : "text-amber-500"}`}>
                      {String(safeAnalysis.matchScore)}%
                    </div>
                  </div>
                  {Array.isArray(safeAnalysis.keep) && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-green-600 uppercase">Strengths</p>
                      {safeAnalysis.keep.map((item: any, i: number) => (
                        <div key={i} className="flex gap-2 text-xs bg-green-500/5 p-2 rounded border border-green-500/10">
                          <Check className="h-3 w-3 text-green-500 mt-0.5" />
                          {typeof item === 'string' ? item : "Validated Skill"}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            ) : (
              <EmptyState text="Run 'Analyze Match' to see results" icon={<Zap className="h-8 w-8 opacity-20" />} />
            )}
          </TabsContent>

          {/* SKILLS TAB */}
          <TabsContent value="skills" className="m-0 h-full overflow-y-auto p-4 space-y-4 absolute inset-0">
            {safeSkillsGap ? (
              'error' in safeSkillsGap ? (
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
                          {typeof s === 'string' ? s : "Requirement"}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-blue-500 uppercase">Action Plan</p>
                    {safeSkillsGap.suggestions?.map((s: any, i: number) => (
                      <div key={i} className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg text-xs text-blue-700 leading-relaxed">
                        {typeof s === 'string' ? s : "Action step provided"}
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <EmptyState text="Check for skill gaps" icon={<Target className="h-8 w-8 opacity-20" />} />
            )}
          </TabsContent>

          {/* COVER LETTER TAB */}
          <TabsContent value="cover-letter" className="m-0 h-full overflow-y-auto p-4 absolute inset-0">
            {generatedCL ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCopy(generatedCL, "Cover Letter")} className="h-7 text-[10px]">
                    <Copy className="mr-1 h-3 w-3" /> Copy
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-xs text-foreground/80 leading-relaxed">
                  {typeof generatedCL === 'string' ? generatedCL : "Drafting..."}
                </pre>
              </div>
            ) : (
              <EmptyState text="Generate a cover letter" icon={<Mail className="h-8 w-8 opacity-20" />} />
            )}
          </TabsContent>

          {/* INTERVIEW TAB */}
          <TabsContent value="interview" className="m-0 h-full overflow-y-auto p-4 absolute inset-0">
            {safeInterviewPrep && !safeInterviewPrep.error ? (
              <div className="space-y-3">
                {safeInterviewPrep.likelyQuestions?.map((q: any, i: number) => (
                  <div key={i} className="border border-sidebar-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedQ(expandedQ === q ? null : q)}
                      className="w-full p-3 text-left text-xs font-medium bg-muted/10 hover:bg-muted/30 flex justify-between items-center"
                    >
                      {String(q)}
                      {expandedQ === q ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
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
              <EmptyState text="Prepare for the interview" icon={<BookOpen className="h-8 w-8 opacity-20" />} />
            )}
          </TabsContent>

          {/* TAILORED TAB */}
          <TabsContent value="tailored" className="m-0 h-full overflow-y-auto p-4 absolute inset-0">
            {tailoredResume ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCopy(tailoredResume, "Tailored Resume")} className="h-7 text-[10px]">
                    <Copy className="mr-1 h-3 w-3" /> Copy
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-xs text-foreground/80 leading-relaxed">
                  {typeof tailoredResume === 'string' ? tailoredResume : "Tailoring..."}
                </pre>
              </div>
            ) : (
              <EmptyState text="Tailor your resume" icon={<Sparkles className="h-8 w-8 opacity-20" />} />
            )}
          </TabsContent>

          {/* SCORE TAB */}
          <TabsContent value="score" className="m-0 h-full overflow-y-auto p-4 absolute inset-0">
            {safeResumeScore ? (
              'error' in safeResumeScore ? (
                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg text-xs text-red-600">
                  {safeResumeScore.message}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl text-center">
                    <p className="text-[10px] uppercase font-bold text-purple-500">ATS Readiness</p>
                    <p className="text-4xl font-black text-purple-600">{safeResumeScore.overall}%</p>
                  </div>
                  <ScoreBar label="Impact" value={safeResumeScore.impact} />
                  <ScoreBar label="Clarity" value={safeResumeScore.clarity} />
                  <ScoreBar label="ATS Match" value={safeResumeScore.atsCompatibility} />
                </div>
              )
            ) : (
              <EmptyState text="Get an ATS score" icon={<Star className="h-8 w-8 opacity-20" />} />
            )}
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}