import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  FileText, Plus, Edit2, Trash2, Download, Copy, Search, X, Check,
  Loader, Star, Calendar, HardDrive,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { copyToClipboard } from "@/lib/pdf-export";
import { scoreResume, ResumeScore } from "@/lib/groq";
import { Resume } from "@/lib/supabase";
import { toast } from "sonner";

export default function MyResumes() {
  const { resumes, addResume, updateResume, removeResume, userProfile } = useData();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [scoringId, setScoringId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, ResumeScore>>({});
  const [form, setForm] = useState({ name: "", content: "" });

  const filtered = resumes
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || (r.content || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const openCreate = () => { setForm({ name: "", content: "" }); setEditingId(null); setIsDialogOpen(true); };
  const openEdit = (r: Resume) => { setForm({ name: r.name, content: r.content || "" }); setEditingId(r.id); setIsDialogOpen(true); };

  const handleSave = () => {
    if (!form.name.trim() || !form.content.trim()) { toast.error("Name and content required"); return; }
    if (editingId) {
      const existing = resumes.find(r => r.id === editingId)!;
      updateResume({ ...existing, name: form.name, content: form.content, file_size: form.content.length, updated_at: new Date().toISOString() });
      toast.success("Resume updated!");
    } else {
      addResume(form.name, form.content);
      toast.success("Resume created!");
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => { removeResume(id); setDeleteConfirm(null); toast.success("Deleted"); };

  const handleDownload = (r: Resume) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([r.content || ""], { type: "text/plain" }));
    a.download = `${r.name.replace(/\s+/g, "_")}.txt`; a.click();
    toast.success("Downloaded!");
  };

  const handleCopy = async (r: Resume) => {
    try { await copyToClipboard(r.content || ""); toast.success("Copied!"); }
    catch { toast.error("Failed to copy"); }
  };

  const handleScore = async (r: Resume) => {
    if (!r.content) { toast.error("Resume has no content"); return; }
    setScoringId(r.id);
    try {
      const score = await scoreResume(r.content);
      setScores(prev => ({ ...prev, [r.id]: score }));
      toast.success("Resume scored!");
    } catch (e: any) {
      toast.error(e.message || "Scoring failed");
    } finally {
      setScoringId(null);
    }
  };

  const ScoreBar = ({ label, value }: { label: string; value: number }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-semibold ${value >= 70 ? "text-green-600" : value >= 50 ? "text-amber-500" : "text-red-500"}`}>{value}</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-poppins text-2xl md:text-3xl font-bold text-foreground">My Resumes</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage, score, and organise your resume collection.</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-primary hover:bg-primary/90 md:w-auto w-full">
          <Plus className="h-5 w-5" /> New Resume
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resumes..." className="pl-10" />
        </div>
        {search && <Button variant="outline" onClick={() => setSearch("")}><X className="h-4 w-4" /></Button>}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold mb-2">{search ? "No resumes found" : "No resumes yet"}</h3>
          <p className="text-sm text-muted-foreground mb-6">{search ? "Try a different search" : "Create your first resume"}</p>
          {!search && <Button onClick={openCreate} className="gap-2 bg-primary hover:bg-primary/90"><Plus className="h-4 w-4" /> Create Resume</Button>}
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(resume => {
            const score = scores[resume.id];
            return (
              <Card key={resume.id} className="overflow-hidden hover:shadow-lg transition-all flex flex-col border-l-4 border-l-primary">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b">
                  <h3 className="font-semibold text-foreground truncate">{resume.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="secondary" className="text-xs capitalize">{resume.status}</Badge>
                    {score && (
                      <span className={`text-xs font-bold ${score.overall >= 70 ? "text-green-600" : score.overall >= 50 ? "text-amber-500" : "text-red-500"}`}>
                        Score: {score.overall}/100
                      </span>
                    )}
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 flex-1 space-y-3">
                  <div className="bg-muted/30 rounded-lg p-3 max-h-24 overflow-hidden">
                    <p className="text-xs text-foreground/60 line-clamp-4 font-mono">
                      {resume.content || "No content"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(resume.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      {(resume.content?.length || 0).toLocaleString()} chars
                    </span>
                  </div>

                  {/* Score breakdown */}
                  {score && (
                    <div className="space-y-2 pt-1 border-t">
                      <ScoreBar label="Clarity" value={score.clarity} />
                      <ScoreBar label="Impact" value={score.impact} />
                      <ScoreBar label="ATS" value={score.atsCompatibility} />
                      {score.feedback.length > 0 && (
                        <div className="bg-blue-50 rounded p-2 mt-2">
                          <p className="text-xs font-medium text-blue-800 mb-1">Top Suggestion</p>
                          <p className="text-xs text-blue-700">• {score.feedback[0]}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="border-t p-4 space-y-2">
                  <Button onClick={() => handleScore(resume)} disabled={scoringId === resume.id}
                    size="sm" variant="outline" className="w-full gap-2 text-xs h-8 hover:bg-primary/5 hover:border-primary/50">
                    {scoringId === resume.id ? <><Loader className="h-3 w-3 animate-spin" /> Scoring...</> : <><Star className="h-3 w-3" /> AI Score This Resume</>}
                  </Button>
                  <div className="grid grid-cols-4 gap-1.5">
                    <Button onClick={() => openEdit(resume)} size="sm" className="gap-1 text-xs h-8 bg-primary hover:bg-primary/90 col-span-2">
                      <Edit2 className="h-3 w-3" /> Edit
                    </Button>
                    <Button onClick={() => handleDownload(resume)} size="sm" variant="outline" className="text-xs h-8">
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button onClick={() => handleCopy(resume)} size="sm" variant="outline" className="text-xs h-8">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div>
                    {deleteConfirm === resume.id ? (
                      <div className="flex gap-1.5">
                        <Button onClick={() => handleDelete(resume.id)} size="sm" variant="destructive" className="flex-1 text-xs h-8 gap-1">
                          <Check className="h-3 w-3" /> Confirm Delete
                        </Button>
                        <Button onClick={() => setDeleteConfirm(null)} size="sm" variant="outline" className="text-xs h-8">
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={() => setDeleteConfirm(resume.id)} size="sm" variant="ghost"
                        className="w-full text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-50 gap-1">
                        <Trash2 className="h-3 w-3" /> Delete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Resume" : "Create New Resume"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update resume details" : "Paste your resume text — AI tools will use this as context"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1">Resume Name</label>
              <Input placeholder="e.g. Senior Frontend Developer" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1">Resume Content</label>
              <Textarea placeholder="Paste your full resume text here..." value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                className="min-h-64 font-mono text-xs" />
              <p className="text-xs text-muted-foreground mt-1">{form.content.length} characters</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 gap-2">
                <Check className="h-4 w-4" /> {editingId ? "Update" : "Create"}
              </Button>
              <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="flex-1">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
