import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { toast } from "sonner";

interface NewResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, content: string) => void;
}

export function NewResumeDialog({ open, onOpenChange, onSave }: NewResumeDialogProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const handleSave = () => {
    if (!name.trim() || !content.trim()) {
      toast.error("Name and content are required");
      return;
    }
    onSave(name.trim(), content.trim());
    setName("");
    setContent("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Create New Resume</DialogTitle>
          <DialogDescription>
            Paste your resume text — AI tools will use this as context for all analysis
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 flex-1 overflow-y-auto py-2">
          <div>
            <Label>Resume Name</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Senior Frontend Developer"
              className="mt-1"
            />
          </div>
          <div className="flex flex-col flex-1">
            <Label>Resume Content</Label>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Paste your full resume text here..."
              className="mt-1 flex-1 min-h-[280px] font-mono text-xs resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">{content.length} characters</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0 pt-2 border-t">
          <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 gap-2">
            <Check className="h-4 w-4" /> Create Resume
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}