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
  Plus, Calendar, MapPin, DollarSign, Trash2, Edit2, Search, X, Check, Briefcase,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { TrackedJob } from "@/lib/storage";
import { toast } from "sonner";

const emptyForm = {
  title: "", company: "", location: "", salary: "",
  postedDate: new Date().toISOString().split("T")[0],
  deadline: "", notes: "",
};

export default function JobTracker() {
  const { trackedJobs, addTrackedJob, updateTrackedJob, removeTrackedJob, addApplication } = useData();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = trackedJobs
    .filter(j =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const openEdit = (job: TrackedJob) => {
    setForm({
      title: job.title, company: job.company, location: job.location,
      salary: job.salary, postedDate: job.posted_date, deadline: job.deadline, notes: job.notes,
    });
    setEditingId(job.id);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.company.trim()) {
      toast.error("Job title and company are required");
      return;
    }
    if (editingId) {
      const existing = trackedJobs.find(j => j.id === editingId)!;
      updateTrackedJob({
        ...existing, title: form.title, company: form.company, location: form.location,
        salary: form.salary, posted_date: form.postedDate, deadline: form.deadline,
        notes: form.notes, updated_at: new Date().toISOString(),
      });
      toast.success("Job updated!");
    } else {
      addTrackedJob(form.title, form.company, form.location, form.salary, form.postedDate, form.deadline, form.notes);
      toast.success("Job added to tracker!");
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    removeTrackedJob(id);
    setDeleteConfirm(null);
    toast.success("Job removed");
  };

  const handleApply = (job: TrackedJob) => {
    addApplication(job.title, job.company, new Date().toISOString().split("T")[0]);
    toast.success(`Added ${job.company} application!`);
  };

  const isDeadlineSoon = (deadline: string) => {
    if (!deadline) return false;
    const d = new Date(deadline);
    const now = new Date();
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  };

  const isDeadlinePast = (deadline: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-poppins text-2xl md:text-3xl font-bold text-foreground">Job Tracker</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Save interesting jobs and track their deadlines.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-primary hover:bg-primary/90 md:w-auto w-full">
          <Plus className="h-5 w-5" /> Add Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Tracking</p>
          <p className="text-2xl font-bold text-foreground mt-1">{trackedJobs.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Deadline Soon</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {trackedJobs.filter(j => isDeadlineSoon(j.deadline)).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Deadline Passed</p>
          <p className="text-2xl font-bold text-red-500 mt-1">
            {trackedJobs.filter(j => isDeadlinePast(j.deadline)).length}
          </p>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search jobs..." className="pl-10" />
        </div>
        {search && <Button variant="outline" onClick={() => setSearch("")}><X className="h-4 w-4" /></Button>}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-foreground mb-2">
            {search ? "No jobs found" : "No jobs tracked yet"}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {search ? "Try a different search" : "Save interesting opportunities to apply later"}
          </p>
          {!search && (
            <Button onClick={openCreate} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Add Your First Job
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(job => (
            <Card key={job.id} className={`p-5 hover:shadow-md transition-all ${isDeadlineSoon(job.deadline) ? "border-amber-300" : ""} ${isDeadlinePast(job.deadline) ? "border-red-200 opacity-75" : ""}`}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{job.title}</h3>
                    {isDeadlineSoon(job.deadline) && !isDeadlinePast(job.deadline) && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex-shrink-0">Deadline soon</span>
                    )}
                    {isDeadlinePast(job.deadline) && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex-shrink-0">Deadline passed</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium mb-3">{job.company}</p>

                  <div className="grid gap-2 sm:grid-cols-2 mb-3">
                    {job.location && (
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <MapPin className="h-3.5 w-3.5 text-primary" />{job.location}
                      </div>
                    )}
                    {job.salary && (
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <DollarSign className="h-3.5 w-3.5 text-primary" />{job.salary}
                      </div>
                    )}
                    {job.posted_date && (
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <Calendar className="h-3.5 w-3.5 text-primary" />Posted {new Date(job.posted_date).toLocaleDateString()}
                      </div>
                    )}
                    {job.deadline && (
                      <div className={`flex items-center gap-2 text-sm ${isDeadlinePast(job.deadline) ? "text-red-500" : isDeadlineSoon(job.deadline) ? "text-amber-600" : "text-foreground/70"}`}>
                        <Calendar className="h-3.5 w-3.5" />Deadline {new Date(job.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {job.notes && (
                    <div className="rounded bg-muted/50 p-2.5 text-xs text-foreground/70">{job.notes}</div>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0 flex-wrap md:flex-col">
                  <Button onClick={() => handleApply(job)} size="sm" className="gap-1.5 bg-primary hover:bg-primary/90 text-xs h-8">
                    <Plus className="h-3 w-3" /> Apply
                  </Button>
                  <Button onClick={() => openEdit(job)} size="sm" variant="outline" className="gap-1.5 text-xs h-8">
                    <Edit2 className="h-3 w-3" /> Edit
                  </Button>
                  {deleteConfirm === job.id ? (
                    <Button onClick={() => handleDelete(job.id)} size="sm" variant="destructive" className="gap-1.5 text-xs h-8">
                      <Check className="h-3 w-3" /> Confirm
                    </Button>
                  ) : (
                    <Button onClick={() => setDeleteConfirm(job.id)} size="sm" variant="outline"
                      className="gap-1.5 text-xs h-8 text-red-500">
                      <Trash2 className="h-3 w-3" /> Remove
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Job" : "Track a Job"}</DialogTitle>
            <DialogDescription>Save an interesting job opportunity</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Job Title *</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Senior Engineer" className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label>Company *</Label>
                <Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g. Stripe" className="mt-1" />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Remote" className="mt-1" />
              </div>
              <div>
                <Label>Salary Range</Label>
                <Input value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })}
                  placeholder="e.g. £80k–£100k" className="mt-1" />
              </div>
              <div>
                <Label>Posted Date</Label>
                <Input type="date" value={form.postedDate} onChange={e => setForm({ ...form, postedDate: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Application Deadline</Label>
                <Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. Great culture, remote friendly, equity..." className="mt-1 min-h-16" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 gap-2">
                <Check className="h-4 w-4" /> {editingId ? "Update" : "Save Job"}
              </Button>
              <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="flex-1">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
