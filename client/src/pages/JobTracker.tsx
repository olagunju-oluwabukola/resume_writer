import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Calendar, MapPin, DollarSign, Trash2, Edit2, Search, X, Check,
  Briefcase, Sparkles, ExternalLink, Loader2, BookMarked, Building2, Clock,
  AlertCircle, KeyRound,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { TrackedJob } from "@/lib/storage";
import { toast } from "sonner";



interface MuseJob {
  id: number;
  name: string;
  company: { name: string };
  locations: { name: string }[];
  categories: { name: string }[];
  levels: { name: string }[];
  refs: { landing_page: string };
  publication_date: string;
  contents: string;
}


const MUSE_CATEGORIES = [
  "Account Management", "Business & Strategy", "Creative & Design",
  "Customer Service", "Data Science", "DevOps & Sysadmin",
  "Editorial", "Education", "Engineering", "Finance",
  "Fundraising & Development", "HR & Recruiting", "Legal",
  "Management & Operations", "Marketing & PR", "Media & Journalism",
  "Nonprofits & Philanthropy", "Operations", "Product",
  "Project & Program Management", "Public Relations", "QA & Testing",
  "Research", "Sales", "Social Media & Community",
  "Software Engineering", "UX & Design", "Writing",
];


function getGroqKey(): string {
  const envKey = import.meta.env.VITE_GROQ_API_KEY;
  if (envKey && envKey !== "") return envKey;
  return localStorage.getItem("resumerx_groq_key") || "";
}

async function groqPickCategory(input: string, isResume = false): Promise<string | null> {
  const key = getGroqKey();
  if (!key) return null;

  const categoryList = MUSE_CATEGORIES.join(" | ");

  const userPrompt = isResume
    ? `Based on this resume, pick the single best job category from the list below.
Return ONLY the category name, nothing else. No punctuation, no quotes.

CATEGORIES: ${categoryList}

RESUME (first 2000 chars):
${input.slice(0, 2000)}`
    : `The user is searching for jobs using this query: "${input}"
Pick the single best matching category from the list below.
Return ONLY the category name, nothing else. No punctuation, no quotes.

CATEGORIES: ${categoryList}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a job category classifier. Reply with ONLY the exact category name from the provided list. No other text." },
          { role: "user",   content: userPrompt },
        ],
        temperature: 0,
        max_tokens: 30,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const raw  = (data.choices?.[0]?.message?.content || "").trim().replace(/['"]/g, "");
    const match = MUSE_CATEGORIES.find(c => c.toLowerCase() === raw.toLowerCase());
    return match || fuzzyMatchCategory(raw);
  } catch {
    return null;
  }
}

function fuzzyMatchCategory(query: string): string {
  const q = query.toLowerCase();
  let best = "Software Engineering";
  let bestScore = 0;

  for (const cat of MUSE_CATEGORIES) {
    const words = cat.toLowerCase().split(/\s+|&/);
    const score = words.filter(w => q.includes(w) || w.includes(q.split(" ")[0])).length;
    if (score > bestScore) { bestScore = score; best = cat; }
  }
  return best;
}


async function searchMuse(category: string, page = 1): Promise<{
  results: MuseJob[];
  page_count: number;
  total: number;
}> {
  const params = new URLSearchParams({
    page:     String(page),
    category: category,
    descending: "true",
  });

  const res = await fetch(`https://www.themuse.com/api/public/jobs?${params}`);
  if (!res.ok) throw new Error(`The Muse API returned ${res.status}. Try again.`);

  const data = await res.json();
  return {
    results:    data.results    || [],
    page_count: data.page_count || 1,
    total:      data.total      || 0,
  };
}


const emptyForm = {
  title: "", company: "", location: "", salary: "",
  postedDate: new Date().toISOString().split("T")[0],
  deadline: "", notes: "",
};

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function daysAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d}d ago`;
}

function isDeadlineSoon(dl: string) {
  if (!dl) return false;
  const diff = (new Date(dl).getTime() - Date.now()) / 86400000;
  return diff >= 0 && diff <= 7;
}
function isDeadlinePast(dl: string) {
  return dl ? new Date(dl) < new Date() : false;
}

export default function JobTracker() {
  const {
    trackedJobs, addTrackedJob, updateTrackedJob,
    removeTrackedJob, addApplication, resumes,
  } = useData();

  // tracker
  const [search, setSearch]               = useState("");
  const [isDialogOpen, setIsDialogOpen]   = useState(false);
  const [editingId, setEditingId]         = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm]                   = useState(emptyForm);

  const [queryInput, setQueryInput]     = useState("");
  const [vacancies, setVacancies]       = useState<MuseJob[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [aiLoading, setAiLoading]       = useState(false);
  const [searchError, setSearchError]   = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [currentPage, setCurrentPage]   = useState(1);
  const [pageCount, setPageCount]       = useState(1);
  const [totalJobs, setTotalJobs]       = useState(0);
  const [trackedIds, setTrackedIds]     = useState<Set<number>>(new Set());

  // key state
  const [hasGroqKey, setHasGroqKey]     = useState(!!getGroqKey());

  useEffect(() => {
    // re-check whenever localStorage might update
    setHasGroqKey(!!getGroqKey());
  }, []);

  /* ── Tracker helpers ── */

  const filtered = trackedJobs
    .filter(j =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setIsDialogOpen(true); };
  const openEdit   = (job: TrackedJob) => {
    setForm({
      title: job.title, company: job.company, location: job.location,
      salary: job.salary, postedDate: job.posted_date, deadline: job.deadline, notes: job.notes,
    });
    setEditingId(job.id);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.company.trim()) {
      toast.error("Job title and company are required"); return;
    }
    if (editingId) {
      const existing = trackedJobs.find(j => j.id === editingId)!;
      updateTrackedJob({ ...existing, title: form.title, company: form.company,
        location: form.location, salary: form.salary, posted_date: form.postedDate,
        deadline: form.deadline, notes: form.notes, updated_at: new Date().toISOString() });
      toast.success("Job updated!");
    } else {
      addTrackedJob(form.title, form.company, form.location, form.salary,
        form.postedDate, form.deadline, form.notes);
      toast.success("Job added to tracker!");
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    removeTrackedJob(id); setDeleteConfirm(null); toast.success("Job removed");
  };

  const handleApply = (job: TrackedJob) => {
    addApplication(job.title, job.company, new Date().toISOString().split("T")[0]);
    toast.success(`Added ${job.company} application!`);
  };


  const runMuseSearch = async (category: string, page = 1) => {
    setSearchLoading(true);
    setSearchError("");
    try {
      const { results, page_count, total } = await searchMuse(category, page);
      setVacancies(results);
      setActiveCategory(category);
      setCurrentPage(page);
      setPageCount(page_count);
      setTotalJobs(total);
      if (results.length === 0)
        setSearchError(`No results in "${category}". Try a different category.`);
    } catch (e: any) {
      setSearchError(e.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleManualSearch = async () => {
    if (!queryInput.trim()) { toast.error("Enter a job title or keywords"); return; }
    setAiLoading(true);
    setSearchError("");
    try {
      const category = (await groqPickCategory(queryInput, false)) || fuzzyMatchCategory(queryInput);
      toast.info(`Searching in: ${category}`);
      await runMuseSearch(category, 1);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAISearch = async () => {
    const resume = resumes[0];
    if (!resume?.content) {
      toast.error("Add a resume first so AI can read your profile"); return;
    }
    if (!hasGroqKey) {
      toast.error("Add your Groq API key in Settings to use AI Search");
      return;
    }
    setAiLoading(true);
    setSearchError("");
    try {
      const category = (await groqPickCategory(resume.content, true)) || "Software Engineering";
      toast.success(`Matched your profile to: ${category}`);
      await runMuseSearch(category, 1);
    } catch (e: any) {
      setSearchError(e.message || "AI search failed");
      toast.error(e.message || "AI search failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCategoryClick = (cat: string) => {
    setQueryInput(cat);
    runMuseSearch(cat, 1);
  };

  const handlePageChange = (page: number) => {
    if (!activeCategory) return;
    runMuseSearch(activeCategory, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTrackVacancy = (job: MuseJob) => {
    const loc      = job.locations.map(l => l.name).join(", ") || "";
    const category = job.categories.map(c => c.name).join(", ");
    const snippet  = stripHtml(job.contents).slice(0, 300);
    addTrackedJob(
      job.name, job.company.name, loc, "",
      new Date(job.publication_date).toISOString().split("T")[0], "",
      `${category ? `Category: ${category}\n` : ""}${snippet}…\n\nApply: ${job.refs.landing_page}`
    );
    setTrackedIds(prev => new Set([...prev, job.id]));
    toast.success(`"${job.name}" added to tracker!`);
  };

  const isLoading = searchLoading || aiLoading;


  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-poppins text-2xl md:text-3xl font-bold text-foreground">Job Tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse live vacancies from The Muse and manage your pipeline.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-primary hover:bg-primary/90 md:w-auto w-full">
          <Plus className="h-5 w-5" /> Add Job Manually
        </Button>
      </div>

      {/* Groq key warning */}
      {!hasGroqKey && (
        <div className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg text-sm text-amber-700">
          <KeyRound className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-medium">No Groq API key found.</span>
            {" "}Manual search still works using smart keyword matching.
            Add your key in <span className="underline cursor-pointer font-medium">Settings</span> to enable AI Search from resume.
          </div>
        </div>
      )}

      <Tabs defaultValue="find" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="find" className="gap-2">
            <Search className="h-4 w-4" /> Find Jobs
          </TabsTrigger>
          <TabsTrigger value="tracker" className="gap-2">
            <BookMarked className="h-4 w-4" /> My Tracker
            {trackedJobs.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px]">
                {trackedJobs.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ══ FIND JOBS ══ */}
        <TabsContent value="find" className="space-y-4">

          {/* Search card */}
          <Card className="p-4 space-y-3">
            {/* Search row */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={queryInput}
                  onChange={e => setQueryInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleManualSearch()}
                  placeholder="e.g. software engineer, product manager, UX designer…"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleManualSearch}
                disabled={isLoading}
                className="gap-2 bg-primary hover:bg-primary/90 flex-shrink-0"
              >
                {isLoading && !aiLoading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>


            <div className="flex items-center gap-3 pt-1 border-t border-border">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">AI Search from my resume</p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Groq reads your resume and automatically finds the most relevant job category.
                  {!hasGroqKey && " Requires a Groq API key in Settings."}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAISearch}
                disabled={isLoading || !hasGroqKey}
                className="gap-2 border-primary/30 text-primary hover:bg-primary/5 flex-shrink-0 disabled:opacity-40"
              >
                {aiLoading
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Sparkles className="h-3.5 w-3.5" />}
                {aiLoading ? "Searching…" : "AI Search"}
              </Button>
            </div>
          </Card>

          {/* Quick category pills */}
          {vacancies.length === 0 && !isLoading && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Browse by category</p>
              <div className="flex flex-wrap gap-2">
                {["Software Engineering", "Data Science", "Product", "UX & Design",
                  "Marketing & PR", "Finance", "Operations", "Sales", "HR & Recruiting",
                  "Engineering", "DevOps & Sysadmin", "QA & Testing"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    disabled={isLoading}
                    className="px-3 py-1 text-xs rounded-full border border-border
                      hover:border-primary/50 hover:bg-primary/5 hover:text-primary
                      transition-colors text-foreground/70 disabled:opacity-40"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {searchError && (
            <div className="flex items-start gap-2 p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-sm text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              {searchError}
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-2/3" />
                      <div className="h-3 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-4/5" />
                    </div>
                    <div className="space-y-2 flex-shrink-0 w-16">
                      <div className="h-8 bg-muted rounded" />
                      <div className="h-8 bg-muted rounded" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && vacancies.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{totalJobs.toLocaleString()}</span> jobs in{" "}
                  <span className="font-medium text-primary">{activeCategory}</span>
                  {pageCount > 1 && ` · Page ${currentPage} of ${pageCount}`}
                </p>
                {/* Change category */}
                <button
                  onClick={() => { setVacancies([]); setSearchError(""); }}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Change category
                </button>
              </div>

              <div className="space-y-3">
                {vacancies.map(job => {
                  const location  = job.locations.map(l => l.name).join(" · ") || "Flexible / Remote";
                  const level     = job.levels[0]?.name || "";
                  const isTracked = trackedIds.has(job.id);

                  return (
                    <Card key={job.id} className="p-4 hover:shadow-md transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-start gap-2">
                            <h3 className="font-semibold text-sm text-foreground leading-snug">
                              {job.name}
                            </h3>
                            {level && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1.5 flex-shrink-0">
                                {level}
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />{job.company.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />{daysAgo(job.publication_date)}
                            </span>
                          </div>

                          <p className="text-xs text-foreground/60 leading-relaxed line-clamp-2">
                            {stripHtml(job.contents).slice(0, 220)}…
                          </p>
                        </div>

                        <div className="flex sm:flex-col gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTrackVacancy(job)}
                            disabled={isTracked}
                            className={`gap-1.5 text-xs h-8 ${
                              isTracked
                                ? "text-green-600 border-green-300 bg-green-50"
                                : "text-primary border-primary/30 hover:bg-primary/5"
                            }`}
                          >
                            {isTracked
                              ? <><Check className="h-3 w-3" /> Tracked</>
                              : <><BookMarked className="h-3 w-3" /> Track</>}
                          </Button>
                          <Button
                            size="sm"
                            className="gap-1.5 text-xs h-8 bg-primary hover:bg-primary/90"
                            onClick={() => window.open(job.refs.landing_page, "_blank")}
                          >
                            <ExternalLink className="h-3 w-3" /> Apply
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {pageCount > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button variant="outline" size="sm" disabled={currentPage <= 1 || isLoading}
                    onClick={() => handlePageChange(currentPage - 1)} className="h-8 text-xs">
                    ← Prev
                  </Button>
                  <span className="text-xs text-muted-foreground px-2">
                    {currentPage} / {pageCount}
                  </span>
                  <Button variant="outline" size="sm" disabled={currentPage >= pageCount || isLoading}
                    onClick={() => handlePageChange(currentPage + 1)} className="h-8 text-xs">
                    Next →
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Initial empty state */}
          {!isLoading && vacancies.length === 0 && !searchError && (
            <Card className="p-10 text-center border-dashed">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/25 mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Find your next role</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Search by role above, click a category pill, or let AI match jobs from your resume.
              </p>
            </Card>
          )}
        </TabsContent>


        <TabsContent value="tracker" className="space-y-4">
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

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Filter tracked jobs…" className="pl-10" />
            </div>
            {search && <Button variant="outline" onClick={() => setSearch("")}><X className="h-4 w-4" /></Button>}
          </div>

          {filtered.length === 0 ? (
            <Card className="p-12 text-center">
              <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                {search ? "No jobs found" : "No jobs tracked yet"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {search ? "Try a different search" : "Find jobs in the Search tab and hit Track, or add one manually."}
              </p>
              {!search && (
                <Button onClick={openCreate} className="gap-2 bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4" /> Add Manually
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {filtered.map(job => (
                <Card key={job.id}
                  className={`p-5 hover:shadow-md transition-all
                    ${isDeadlineSoon(job.deadline) ? "border-amber-300" : ""}
                    ${isDeadlinePast(job.deadline)  ? "border-red-200 opacity-75" : ""}`}>
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
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            Posted {new Date(job.posted_date).toLocaleDateString()}
                          </div>
                        )}
                        {job.deadline && (
                          <div className={`flex items-center gap-2 text-sm ${
                            isDeadlinePast(job.deadline) ? "text-red-500"
                            : isDeadlineSoon(job.deadline) ? "text-amber-600"
                            : "text-foreground/70"}`}>
                            <Calendar className="h-3.5 w-3.5" />
                            Deadline {new Date(job.deadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      {job.notes && (
                        <div className="rounded bg-muted/50 p-2.5 text-xs text-foreground/70 line-clamp-3">
                          {job.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0 flex-wrap md:flex-col">
                      <Button onClick={() => handleApply(job)} size="sm"
                        className="gap-1.5 bg-primary hover:bg-primary/90 text-xs h-8">
                        <Plus className="h-3 w-3" /> Apply
                      </Button>
                      <Button onClick={() => openEdit(job)} size="sm" variant="outline"
                        className="gap-1.5 text-xs h-8">
                        <Edit2 className="h-3 w-3" /> Edit
                      </Button>
                      {deleteConfirm === job.id ? (
                        <Button onClick={() => handleDelete(job.id)} size="sm" variant="destructive"
                          className="gap-1.5 text-xs h-8">
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
        </TabsContent>
      </Tabs>

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
                <Input type="date" value={form.postedDate}
                  onChange={e => setForm({ ...form, postedDate: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Application Deadline</Label>
                <Input type="date" value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })} className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. Great culture, remote friendly, equity…" className="mt-1 min-h-16" />
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