import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Mail, Plus, Trash2, Edit2, Download, Copy, Search, X, Check, Loader, FileText, Zap,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { generateCoverLetter } from "@/lib/groq";
import { copyToClipboard } from "@/lib/pdf-export";
import { CoverLetter } from "@/lib/supabase";
import { toast } from "sonner";

const emptyForm = { title: "", content: "", company: "", jobDesc: "" };

export default function CoverLetters() {
  const { coverLetters, addCoverLetter, updateCoverLetter, removeCoverLetter, resumes } = useData();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = coverLetters
    .filter(l => l.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const viewingLetter = coverLetters.find(l => l.id === viewingId);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const openEdit = (letter: CoverLetter) => {
    setForm({ title: letter.title, content: letter.content, company: "", jobDesc: "" });
    setEditingId(letter.id);
    setIsDialogOpen(true);
  };

  const handleGenerate = async () => {
    if (!form.company.trim() || !form.jobDesc.trim()) {
      toast.error("Enter company name and job description to generate");
      return;
    }
    setIsGenerating(true);
    try {
      const resumeContent = resumes.length > 0 ? resumes[0].content || "" : "";
      const content = await generateCoverLetter(resumeContent, form.jobDesc, form.company);
      setForm(prev => ({
        ...prev,
        content,
        title: prev.title || `${form.company} - Cover Letter`,
      }));
      toast.success("Cover letter generated!");
    } catch {
      toast.error("Failed to generate cover letter");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    if (editingId) {
      const existing = coverLetters.find(l => l.id === editingId)!;
      updateCoverLetter({ ...existing, title: form.title, content: form.content, updated_at: new Date().toISOString() });
      toast.success("Cover letter updated!");
    } else {
      addCoverLetter(form.title, form.content);
      toast.success("Cover letter saved!");
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    removeCoverLetter(id);
    setDeleteConfirm(null);
    if (viewingId === id) setViewingId(null);
    toast.success("Deleted");
  };

  const handleDownload = (letter: CoverLetter) => {
    const blob = new Blob([letter.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${letter.title.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  const handleCopy = async (content: string) => {
    try {
      await copyToClipboard(content);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-poppins text-2xl md:text-3xl font-bold text-foreground">Cover Letters</h1>
          <p className="mt-2 text-sm text-muted-foreground">Create and manage tailored cover letters.</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-primary hover:bg-primary/90 md:w-auto w-full">
          <Plus className="h-5 w-5" /> New Cover Letter
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search cover letters..." className="pl-10" />
        </div>
        {search && (
          <Button variant="outline" onClick={() => setSearch("")}><X className="h-4 w-4" /></Button>
        )}
      </div>

      {/* View dialog */}
      <Dialog open={!!viewingId} onOpenChange={open => !open && setViewingId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingLetter?.title}</DialogTitle>
            <DialogDescription>
              Created {viewingLetter ? new Date(viewingLetter.created_at).toLocaleDateString() : ""}
            </DialogDescription>
          </DialogHeader>
          <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/80 leading-relaxed">
            {viewingLetter?.content}
          </pre>
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={() => viewingLetter && handleCopy(viewingLetter.content)} variant="outline" className="gap-2 flex-1">
              <Copy className="h-4 w-4" /> Copy
            </Button>
            <Button onClick={() => viewingLetter && handleDownload(viewingLetter)} variant="outline" className="gap-2 flex-1">
              <Download className="h-4 w-4" /> Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Mail className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-foreground mb-2">
            {search ? "No cover letters found" : "No cover letters yet"}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {search ? "Try a different search" : "Create a tailored cover letter with AI assistance"}
          </p>
          {!search && (
            <Button onClick={openCreate} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Create Cover Letter
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(letter => (
            <Card key={letter.id} className="overflow-hidden hover:shadow-md transition-all flex flex-col">
              <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10 flex-shrink-0">
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <h3 className="font-semibold text-foreground text-sm line-clamp-2">{letter.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(letter.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="p-4 flex-1">
                <p className="text-xs text-foreground/70 line-clamp-4 leading-relaxed">{letter.content}</p>
              </div>
              <div className="p-4 border-t space-y-2">
                <Button onClick={() => setViewingId(letter.id)} variant="outline" size="sm" className="w-full gap-2">
                  <FileText className="h-3 w-3" /> View Full Letter
                </Button>
                <div className="grid grid-cols-3 gap-2">
                  <Button onClick={() => openEdit(letter)} size="sm" variant="outline" className="gap-1 text-xs h-8">
                    <Edit2 className="h-3 w-3" /> Edit
                  </Button>
                  <Button onClick={() => handleCopy(letter.content)} size="sm" variant="outline" className="gap-1 text-xs h-8">
                    <Copy className="h-3 w-3" /> Copy
                  </Button>
                  {deleteConfirm === letter.id ? (
                    <Button onClick={() => handleDelete(letter.id)} size="sm" variant="destructive" className="gap-1 text-xs h-8">
                      <Check className="h-3 w-3" /> Yes
                    </Button>
                  ) : (
                    <Button onClick={() => setDeleteConfirm(letter.id)} size="sm" variant="outline"
                      className="gap-1 text-xs h-8 text-red-500 hover:text-red-600">
                      <Trash2 className="h-3 w-3" /> Del
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Cover Letter" : "New Cover Letter"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Edit your cover letter" : "Write manually or generate with AI"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Stripe — Software Engineer" className="mt-1" />
            </div>

            {!editingId && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> AI Generation
                </p>
                <div>
                  <Label className="text-xs">Company Name</Label>
                  <Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                    placeholder="e.g. Stripe" className="mt-1 h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Job Description (for AI context)</Label>
                  <Textarea value={form.jobDesc} onChange={e => setForm({ ...form, jobDesc: e.target.value })}
                    placeholder="Paste job description..." className="mt-1 min-h-20 text-sm" />
                </div>
                <Button onClick={handleGenerate} disabled={isGenerating} size="sm"
                  className="w-full gap-2 bg-primary hover:bg-primary/90">
                  {isGenerating ? <><Loader className="h-3 w-3 animate-spin" /> Generating...</> : <><Zap className="h-3 w-3" /> Generate with AI</>}
                </Button>
              </div>
            )}

            <div>
              <Label>Content</Label>
              <Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                placeholder="Write or paste your cover letter here..." className="mt-1 min-h-64 font-mono text-xs" />
              <p className="text-xs text-muted-foreground mt-1">{form.content.length} characters</p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 gap-2">
                <Check className="h-4 w-4" /> {editingId ? "Update" : "Save"}
              </Button>
              <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="flex-1">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
