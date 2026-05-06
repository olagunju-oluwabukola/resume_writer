import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy, Download, CheckCircle2, AlertCircle, X, Check,
  BookOpen, Target, ChevronDown, ChevronUp, Zap, FileText, Mail, Star,
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

export function ResultsPanel({
  currentResume, userName, activeTab, onTabChange, aiState,
}: ResultsPanelProps) {
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const { aiAnalysis, generatedCL, tailoredResume, skillsGap, interviewPrep, resumeScore } = aiState;

  const displayCL = generatedCL;

  const handleCopy = async (text: string, label = "Text") => {
    try { await copyToClipboard(text); toast.success(`${label} copied!`); }
    catch { toast.error("Failed to copy"); }
  };

  const handleDownload = (content: string, filename: string) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    a.download = filename; a.click();
    toast.success("Downloaded!");
  };

  const TABS = [
    { value: "resume",       label: "Resume" },
    { value: "analysis",     label: "Analysis" },
    { value: "tailored",     label: "Tailored" },
    { value: "cover-letter", label: "Cover" },
    { value: "skills",       label: "Skills" },
    { value: "interview",    label: "Interview" },
    { value: "score",        label: "Score" },
  ] as const;

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-primary/10 to-primary/5 border-b flex items-center justify-between flex-shrink-0">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{userName || "Your Resume"}</p>
          <p className="text-xs text-primary truncate">{currentResume?.name || "No resume selected"}</p>
        </div>
        {currentResume && (
          <div className="flex gap-1 flex-shrink-0">
            <Button onClick={() => handleCopy(currentResume.content || "", "Resume")} size="icon" variant="ghost" className="h-7 w-7">
              <Copy className="h-3 w-3" />
            </Button>
            <Button onClick={() => handleDownload(currentResume.content || "", `${currentResume.name}.txt`)} size="icon" variant="ghost" className="h-7 w-7">
              <Download className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={v => onTabChange(v as ResultTab)} className="flex flex-col flex-1 overflow-hidden">
        <TabsList className="grid grid-cols-7 rounded-none border-b h-8 bg-muted/30 flex-shrink-0">
          {TABS.map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] px-0.5 h-8">{t.label}</TabsTrigger>
          ))}
        </TabsList>

        {/* All tab contents scroll within their own container */}
        <div className="flex-1 overflow-hidden">

          <TabsContent value="resume" className="m-0 h-full overflow-y-auto p-4">
            {currentResume?.content ? (
              <pre className="whitespace-pre-wrap break-words font-sans text-xs text-foreground/80 leading-relaxed">
                {currentResume.content}
              </pre>
            ) : (
              <EmptyState text="Select or create a resume to get started" icon={<FileText />} />
            )}
          </TabsContent>

          <TabsContent value="analysis" className="m-0 h-full overflow-y-auto p-4 space-y-3">
            {aiAnalysis ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3 border border-primary/20">
                  <div>
                    <p className="font-semibold text-sm text-foreground">Match Score</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{aiAnalysis.summary}</p>
                  </div>
                  <p className={`text-3xl font-bold flex-shrink-0 ml-3 ${aiAnalysis.matchScore >= 70 ? "text-green-600" : aiAnalysis.matchScore >= 50 ? "text-amber-500" : "text-red-500"}`}>
                    {aiAnalysis.matchScore}%
                  </p>
                </div>
                {aiAnalysis.keep.length > 0 && (
                  <div className="rounded-lg bg-green-50 p-3 border border-green-200">
                    <div className="flex items-center gap-2 mb-2"><CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" /><p className="text-xs font-semibold text-green-900">Keep & Highlight</p></div>
                    <ul className="space-y-1">{aiAnalysis.keep.map((item, i) => <li key={i} className="text-xs text-green-700">• {item}</li>)}</ul>
                  </div>
                )}
                {aiAnalysis.modify.length > 0 && (
                  <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
                    <div className="flex items-center gap-2 mb-2"><AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" /><p className="text-xs font-semibold text-amber-900">Modify & Enhance</p></div>
                    <ul className="space-y-1">{aiAnalysis.modify.map((item, i) => <li key={i} className="text-xs text-amber-700">• {item}</li>)}</ul>
                  </div>
                )}
                {aiAnalysis.remove.length > 0 && (
                  <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                    <div className="flex items-center gap-2 mb-2"><X className="h-4 w-4 text-red-600 flex-shrink-0" /><p className="text-xs font-semibold text-red-900">Consider Removing</p></div>
                    <ul className="space-y-1">{aiAnalysis.remove.map((item, i) => <li key={i} className="text-xs text-red-700">• {item}</li>)}</ul>
                  </div>
                )}
              </>
            ) : (
              <EmptyState text="Click 'Analyse vs Job' to get AI recommendations" icon={<Zap />} />
            )}
          </TabsContent>

          <TabsContent value="tailored" className="m-0 h-full overflow-y-auto p-4">
            {tailoredResume ? (
              <>
                <div className="flex gap-2 mb-3">
                  <Button onClick={() => handleCopy(tailoredResume, "Tailored resume")} size="sm" variant="outline" className="gap-1.5 text-xs h-7"><Copy className="h-3 w-3" /> Copy</Button>
                  <Button onClick={() => handleDownload(tailoredResume, "tailored-resume.txt")} size="sm" variant="outline" className="gap-1.5 text-xs h-7"><Download className="h-3 w-3" /> Download</Button>
                </div>
                <pre className="whitespace-pre-wrap break-words font-sans text-xs text-foreground/80 leading-relaxed">{tailoredResume}</pre>
              </>
            ) : (
              <EmptyState text="Click 'Tailor Resume' to get a job-specific version" icon={<FileText />} />
            )}
          </TabsContent>

          <TabsContent value="cover-letter" className="m-0 h-full overflow-y-auto p-4">
            {displayCL ? (
              <>
                <div className="flex gap-2 mb-3">
                  <Button onClick={() => handleCopy(displayCL, "Cover letter")} size="sm" variant="outline" className="gap-1.5 text-xs h-7"><Copy className="h-3 w-3" /> Copy</Button>
                  <Button onClick={() => handleDownload(displayCL, "cover-letter.txt")} size="sm" variant="outline" className="gap-1.5 text-xs h-7"><Download className="h-3 w-3" /> Download</Button>
                </div>
                <pre className="whitespace-pre-wrap break-words font-sans text-xs text-foreground/80 leading-relaxed">{displayCL}</pre>
              </>
            ) : (
              <EmptyState text="Click 'Generate Cover Letter' to create one" icon={<Mail />} />
            )}
          </TabsContent>

          <TabsContent value="skills" className="m-0 h-full overflow-y-auto p-4 space-y-3">
            {skillsGap ? (
              <>
                <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                  <p className="text-xs font-semibold text-green-900 mb-2 flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Skills You Have ({skillsGap.present.length})</p>
                  <div className="flex flex-wrap gap-1.5">{skillsGap.present.map((s, i) => <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{s}</span>)}</div>
                </div>
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-xs font-semibold text-red-900 mb-2 flex items-center gap-1.5"><X className="h-3.5 w-3.5" /> Missing Skills ({skillsGap.missing.length})</p>
                  <div className="flex flex-wrap gap-1.5">{skillsGap.missing.map((s, i) => <span key={i} className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">{s}</span>)}</div>
                </div>
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                  <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> How to Close the Gap</p>
                  <ul className="space-y-1">{skillsGap.suggestions.map((s, i) => <li key={i} className="text-xs text-blue-700">• {s}</li>)}</ul>
                </div>
              </>
            ) : (
              <EmptyState text="Click 'Skills Gap Analysis' to see what you're missing" icon={<Target />} />
            )}
          </TabsContent>

          <TabsContent value="interview" className="m-0 h-full overflow-y-auto p-4 space-y-2">
            {interviewPrep ? (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Likely Questions & Answers</p>
                {interviewPrep.likelyQuestions.map((q, i) => (
                  <div key={i} className="rounded-lg border border-border overflow-hidden">
                    <button onClick={() => setExpandedQ(expandedQ === q ? null : q)}
                      className="w-full flex items-start justify-between gap-2 p-3 text-left hover:bg-muted/30 transition-colors">
                      <span className="text-xs font-medium text-foreground">{q}</span>
                      {expandedQ === q ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />}
                    </button>
                    {expandedQ === q && interviewPrep.suggestedAnswers[q] && (
                      <div className="px-3 pb-3 border-t bg-primary/5">
                        <p className="text-xs text-foreground/70 leading-relaxed pt-2">{interviewPrep.suggestedAnswers[q]}</p>
                      </div>
                    )}
                  </div>
                ))}
                {interviewPrep.redFlags.length > 0 && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mt-2">
                    <p className="text-xs font-semibold text-amber-900 mb-2">⚠️ Potential Concerns</p>
                    <ul className="space-y-1">{interviewPrep.redFlags.map((f, i) => <li key={i} className="text-xs text-amber-700">• {f}</li>)}</ul>
                  </div>
                )}
              </>
            ) : (
              <EmptyState text="Click 'Interview Prep' to get likely questions & answers" icon={<BookOpen />} />
            )}
          </TabsContent>

          <TabsContent value="score" className="m-0 h-full overflow-y-auto p-4 space-y-3">
            {resumeScore ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-purple-50 border border-purple-200 p-4">
                  <p className="font-semibold text-sm text-foreground">Overall Score</p>
                  <p className={`text-3xl font-bold ${resumeScore.overall >= 70 ? "text-green-600" : resumeScore.overall >= 50 ? "text-amber-500" : "text-red-500"}`}>
                    {resumeScore.overall}/100
                  </p>
                </div>
                <ScoreBar label="Clarity" value={resumeScore.clarity} />
                <ScoreBar label="Impact" value={resumeScore.impact} />
                <ScoreBar label="ATS Compatibility" value={resumeScore.atsCompatibility} />
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                  <p className="text-xs font-semibold text-blue-900 mb-2">Feedback</p>
                  <ul className="space-y-1">{resumeScore.feedback.map((f, i) => <li key={i} className="text-xs text-blue-700">• {f}</li>)}</ul>
                </div>
              </>
            ) : (
              <EmptyState text="Click 'Score My Resume' to get a detailed score" icon={<Star />} />
            )}
          </TabsContent>

        </div>
      </Tabs>
    </Card>
  );
}