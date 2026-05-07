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
      {/* Fixed height dialog — never grows beyond 85vh */}
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Create New Resume</DialogTitle>
          <DialogDescription>
            Paste your resume text — AI tools will use this as context for all analysis
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable body — fills remaining height */}
        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-hidden py-2">
          <div className="flex-shrink-0">
            <Label>Resume Name</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Senior Frontend Developer"
              className="mt-1"
            />
          </div>

          {/* Textarea container fills remaining space, textarea scrolls inside */}
          <div className="flex flex-col flex-1 min-h-0">
            <Label>Resume Content</Label>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Paste your full resume text here..."
              className="mt-1 flex-1 min-h-0 h-full font-mono text-xs resize-none overflow-y-auto"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {content.length} characters
            </p>
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