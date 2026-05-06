import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, Briefcase, Trash2, Edit2, Search, X, Calendar, Building2, Check,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";
import { JobApplication } from "@/lib/supabase";

const STATUS_OPTIONS = [
  { value: "applied", label: "Applied", color: "bg-blue-100 text-blue-800" },
  { value: "interviewing", label: "Interviewing", color: "bg-green-100 text-green-800" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
  { value: "accepted", label: "Accepted", color: "bg-purple-100 text-purple-800" },
];

const emptyForm = {
  jobTitle: "", company: "", dateApplied: new Date().toISOString().split("T")[0],
  salary: "", notes: "", followUpDate: "", status: "applied" as JobApplication["status"],
};

export default function Applications() {
  const { applications, addApplication, updateApplication, removeApplication } = useData();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = applications
    .filter(a => filterStatus === "all" || a.status === filterStatus)
    .filter(a =>
      a.job_title.toLowerCase().includes(search.toLowerCase()) ||
      a.company.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.date_applied).getTime() - new Date(a.date_applied).getTime());

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const openEdit = (app: JobApplication) => {
    setForm({
      jobTitle: app.job_title,
      company: app.company,
      dateApplied: app.date_applied,
      salary: (app as any).salary || "",
      notes: app.notes || "",
      followUpDate: app.follow_up_date || "",
      status: app.status,
    });
    setEditingId(app.id);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.jobTitle.trim() || !form.company.trim()) {
      toast.error("Job title and company are required");
      return;
    }
    if (editingId) {
      const existing = applications.find(a => a.id === editingId)!;
      updateApplication({
        ...existing,
        job_title: form.jobTitle,
        company: form.company,
        date_applied: form.dateApplied,
        status: form.status,
        notes: form.notes,
        follow_up_date: form.followUpDate || undefined,
        updated_at: new Date().toISOString(),
      });
      toast.success("Application updated!");
    } else {
      addApplication(form.jobTitle, form.company, form.dateApplied, {
        notes: form.notes,
        followUpDate: form.followUpDate || undefined,
      });
      toast.success("Application added!");
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    removeApplication(id);
    setDeleteConfirm(null);
    toast.success("Application deleted");
  };

  const handleStatusChange = (app: JobApplication, status: string) => {
    updateApplication({ ...app, status: status as JobApplication["status"], updated_at: new Date().toISOString() });
    toast.success("Status updated");
  };

  const getStatusInfo = (status: string) => STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-poppins text-2xl md:text-3xl font-bold text-foreground">Applications</h1>
          <p className="mt-2 text-sm text-muted-foreground">Track all your job applications in one place.</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-primary hover:bg-primary/90 md:w-auto w-full">
          <Plus className="h-5 w-5" /> New Application
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATUS_OPTIONS.map(s => (
          <Card key={s.value} className={`p-4 cursor-pointer border-2 transition-all ${filterStatus === s.value ? "border-primary" : "border-transparent"}`}
            onClick={() => setFilterStatus(filterStatus === s.value ? "all" : s.value)}>
            <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {applications.filter(a => a.status === s.value).length}
            </p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by job title or company..." className="pl-10" />
        </div>
        {(search || filterStatus !== "all") && (
          <Button variant="outline" onClick={() => { setSearch(""); setFilterStatus("all"); }}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-foreground mb-2">
            {search || filterStatus !== "all" ? "No applications found" : "No applications yet"}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {search || filterStatus !== "all" ? "Try adjusting your search or filters" : "Start tracking your job applications"}
          </p>
          {!search && filterStatus === "all" && (
            <Button onClick={openCreate} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Add First Application
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => {
            const statusInfo = getStatusInfo(app.status);
            return (
              <Card key={app.id} className="p-4 md:p-5 hover:shadow-md transition-all">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="h-4 w-4 text-primary flex-shrink-0" />
                      <h3 className="font-semibold text-foreground truncate">{app.job_title}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <Building2 className="h-3 w-3" />
                      <span>{app.company}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Applied {new Date(app.date_applied).toLocaleDateString()}
                      </span>
                      {app.follow_up_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Follow up {new Date(app.follow_up_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {app.notes && (
                      <p className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded p-2 line-clamp-2">{app.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Select value={app.status} onValueChange={v => handleStatusChange(app, v)}>
                      <SelectTrigger className="h-8 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={() => openEdit(app)} size="icon" variant="outline" className="h-8 w-8">
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    {deleteConfirm === app.id ? (
                      <Button onClick={() => handleDelete(app.id)} size="icon" variant="destructive" className="h-8 w-8">
                        <Check className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button onClick={() => setDeleteConfirm(app.id)} size="icon" variant="outline"
                        className="h-8 w-8 text-red-500 hover:text-red-600">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Application" : "New Application"}</DialogTitle>
            <DialogDescription>Track a job application</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Job Title *</Label>
                <Input value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })}
                  placeholder="e.g. Senior Frontend Developer" className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label>Company *</Label>
                <Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g. Stripe" className="mt-1" />
              </div>
              <div>
                <Label>Date Applied</Label>
                <Input type="date" value={form.dateApplied} onChange={e => setForm({ ...form, dateApplied: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Follow-up Date</Label>
                <Input type="date" value={form.followUpDate} onChange={e => setForm({ ...form, followUpDate: e.target.value })} className="mt-1" />
              </div>
              {editingId && (
                <div className="col-span-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as any })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="col-span-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any notes about this application..." className="mt-1 min-h-20" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 gap-2">
                <Check className="h-4 w-4" /> {editingId ? "Update" : "Add Application"}
              </Button>
              <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="flex-1">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
