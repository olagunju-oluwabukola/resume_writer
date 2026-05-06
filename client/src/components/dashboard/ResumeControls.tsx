import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Zap, FileText, Mail, Target, BookOpen, Star, Loader, Plus,
} from "lucide-react";
import { Resume } from "@/lib/supabase";
import { AITask } from "./types";

interface ResumeControlsProps {
  resumes: Resume[];
  selectedResumeId: string | null;
  onSelectResume: (id: string) => void;
  jobDescription: string;
  onJobDescriptionChange: (val: string) => void;
  companyName: string;
  onCompanyNameChange: (val: string) => void;
  loadingTask: AITask | null;
  hasResume: boolean;
  onRunTask: (task: AITask) => void;
  onNewResume: () => void;
}

const AI_TOOLS: { task: AITask; icon: React.ReactNode; label: string }[] = [
  { task: "analyse",      icon: <Zap className="h-4 w-4" />,      label: "Analyse vs Job" },
  { task: "tailor",       icon: <FileText className="h-4 w-4" />,  label: "Tailor Resume" },
  { task: "cover-letter", icon: <Mail className="h-4 w-4" />,      label: "Generate Cover Letter" },
  { task: "skills-gap",   icon: <Target className="h-4 w-4" />,    label: "Skills Gap Analysis" },
  { task: "interview",    icon: <BookOpen className="h-4 w-4" />,  label: "Interview Prep" },
  { task: "score",        icon: <Star className="h-4 w-4" />,      label: "Score My Resume" },
];

export function ResumeControls({
  resumes, selectedResumeId, onSelectResume,
  jobDescription, onJobDescriptionChange,
  companyName, onCompanyNameChange,
  loadingTask, hasResume, onRunTask, onNewResume,
}: ResumeControlsProps) {
  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1">
      {/* Resume selector */}
      <Card className="p-3 flex-shrink-0">
        <Label className="text-xs font-semibold mb-2 block">Active Resume</Label>
        {resumes.length > 0 ? (
          <Select value={selectedResumeId || ""} onValueChange={onSelectResume}>
            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select resume..." /></SelectTrigger>
            <SelectContent>
              {resumes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : (
          <Button onClick={onNewResume} size="sm" className="w-full bg-primary hover:bg-primary/90 gap-2 h-8 text-xs">
            <Plus className="h-3 w-3" /> Create Your First Resume
          </Button>
        )}
      </Card>

      {/* Job description — fixed height, no grow */}
      <Card className="p-3 flex-shrink-0">
        <Label className="text-xs font-semibold mb-2 block">Job Description</Label>
        <Textarea
          value={jobDescription}
          onChange={e => onJobDescriptionChange(e.target.value)}
          placeholder="Paste the job description here..."
          className="text-xs resize-none h-32"
        />
        <Input
          value={companyName}
          onChange={e => onCompanyNameChange(e.target.value)}
          placeholder="Company name (for cover letter)"
          className="h-8 text-xs mt-2"
        />
        <p className="text-xs text-muted-foreground text-right mt-1">{jobDescription.length} chars</p>
      </Card>

      {/* AI tools */}
      <Card className="p-3 flex-shrink-0">
        <p className="text-xs font-semibold mb-2">AI Tools</p>
        <div className="space-y-1.5">
          {AI_TOOLS.map(({ task, icon, label }) => (
            <Button
              key={task}
              onClick={() => onRunTask(task)}
              disabled={!!loadingTask || !hasResume}
              variant="outline"
              className="w-full justify-start gap-2 h-8 text-xs hover:bg-primary/5 hover:border-primary/40"
            >
              {loadingTask === task ? <Loader className="h-3.5 w-3.5 animate-spin" /> : icon}
              {loadingTask === task ? "Working..." : label}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}