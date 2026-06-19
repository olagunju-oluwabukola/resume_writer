import { useState, useEffect, useCallback, useRef } from "react";

// ── Types ───────────────────────────────────────────────────────────
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  jobTypes: string[];
  tags: string[];
  url: string;
  postedAt: string;
  salary?: string;
  description?: string;
}

interface JobSearchState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

// ── Constants ───────────────────────────────────────────────────────
const ARBEITNOW_BASE = "https://www.arbeitnow.com/api/job-board-api";
const ADZUNA_BASE = "https://api.adzuna.com/v1/api/jobs";
const RESULTS_PER_PAGE = 20;

// Mock jobs for demo / offline fallback
const MOCK_JOBS: Job[] = [
  {
    id: "mock-1",
    title: "Senior Product Manager",
    company: "Stripe",
    location: "Remote",
    remote: true,
    jobTypes: ["Full-time"],
    tags: ["product-management", "saas", "fintech"],
    url: "https://stripe.com/jobs",
    postedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    salary: "$140k - $180k",
    description: "Lead product strategy for Stripe's payment infrastructure platform.",
  },
  {
    id: "mock-2",
    title: "Frontend Engineer",
    company: "Vercel",
    location: "Remote",
    remote: true,
    jobTypes: ["Full-time"],
    tags: ["react", "typescript", "nextjs"],
    url: "https://vercel.com/careers",
    postedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    salary: "$120k - $160k",
    description: "Build the future of web development with Next.js and React.",
  },
  {
    id: "mock-3",
    title: "UX Designer",
    company: "Figma",
    location: "San Francisco, CA / Remote",
    remote: true,
    jobTypes: ["Full-time"],
    tags: ["design-systems", "ui-ux", "product-design"],
    url: "https://www.figma.com/careers",
    postedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    salary: "$130k - $170k",
    description: "Design tools that empower millions of creators worldwide.",
  },
  {
    id: "mock-4",
    title: "Data Analyst",
    company: "Spotify",
    location: "New York, NY / Remote",
    remote: true,
    jobTypes: ["Full-time"],
    tags: ["sql", "python", "data-visualization"],
    url: "https://www.lifeatspotify.com/jobs",
    postedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    salary: "$110k - $150k",
    description: "Turn billions of data points into insights that shape music streaming.",
  },
  {
    id: "mock-5",
    title: "DevOps Engineer",
    company: "GitLab",
    location: "Remote",
    remote: true,
    jobTypes: ["Full-time"],
    tags: ["kubernetes", "ci-cd", "aws"],
    url: "https://about.gitlab.com/jobs",
    postedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    salary: "$125k - $165k",
    description: "Build and maintain the infrastructure powering the world's largest all-remote company.",
  },
  {
    id: "mock-6",
    title: "Marketing Manager",
    company: "Notion",
    location: "Remote",
    remote: true,
    jobTypes: ["Full-time"],
    tags: ["growth", "content-marketing", "saas"],
    url: "https://www.notion.so/careers",
    postedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    salary: "$100k - $140k",
    description: "Drive growth for the all-in-one workspace used by millions.",
  },
];

// ── Helpers ─────────────────────────────────────────────────────────
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ── Arbeitnow API (no key needed) ───────────────────────────────────
async function fetchArbeitnowJobs(
  query: string,
  location: string,
  remoteOnly: boolean,
  page: number
): Promise<{ jobs: Job[]; hasMore: boolean }> {
  const params = new URLSearchParams();
  if (query) params.append("search", query);
  if (remoteOnly) params.append("remote", "true");
  params.append("page", String(page));
  params.append("sort_by", "date");

  const res = await fetch(`${ARBEITNOW_BASE}?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`Arbeitnow error: ${res.status}`);

  const data = await res.json();
  const jobs: Job[] = (data.data || []).map((j: any) => ({
    id: `arbeitnow-${j.slug || slugify(j.title + j.company_name)}`,
    title: j.title,
    company: j.company_name,
    location: j.location || (j.remote ? "Remote" : "Not specified"),
    remote: j.remote || false,
    jobTypes: j.job_types || [],
    tags: j.tags || [],
    url: j.url,
    postedAt: j.created_at || new Date().toISOString(),
    description: j.description?.replace(/<[^>]+>/g, " ").slice(0, 300) + "...",
  }));

  return { jobs, hasMore: jobs.length === RESULTS_PER_PAGE };
}

// ── Adzuna API (free tier, needs app_id + app_key) ──────────────────
// Set these in your .env or use the demo key below for testing
const ADZUNA_APP_ID = import.meta.env.VITE_ADZUNA_APP_ID || "demo";
const ADZUNA_APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY || "demo";

async function fetchAdzunaJobs(
  query: string,
  location: string,
  page: number
): Promise<{ jobs: Job[]; hasMore: boolean }> {
  if (ADZUNA_APP_ID === "demo" || ADZUNA_APP_KEY === "demo") {
    return { jobs: [], hasMore: false };
  }

  const country = location?.toLowerCase().includes("uk") ? "gb" : "us";
  const params = new URLSearchParams({
    app_id: ADZUNA_APP_ID,
    app_key: ADZUNA_APP_KEY,
    what: query,
    where: location,
    page: String(page - 1),
    results_per_page: String(RESULTS_PER_PAGE),
  });

  const res = await fetch(`${ADZUNA_BASE}/${country}/search/${page}?${params.toString()}`);
  if (!res.ok) throw new Error(`Adzuna error: ${res.status}`);

  const data = await res.json();
  const jobs: Job[] = (data.results || []).map((j: any) => ({
    id: `adzuna-${j.id}`,
    title: j.title,
    company: j.company?.display_name || "Unknown",
    location: j.location?.display_name || "Not specified",
    remote: j.title.toLowerCase().includes("remote") || j.description?.toLowerCase().includes("remote"),
    jobTypes: [j.contract_type || "Full-time"],
    tags: j.category?.tag ? [j.category.tag] : [],
    url: j.redirect_url,
    postedAt: j.created_at || new Date().toISOString(),
    salary: j.salary_max
      ? `$${Math.round(j.salary_min / 1000)}k - $${Math.round(j.salary_max / 1000)}k`
      : undefined,
    description: j.description?.replace(/<[^>]+>/g, " ").slice(0, 300) + "...",
  }));

  return { jobs, hasMore: page < data.page_count };
}

// ── Mock data fallback ──────────────────────────────────────────────
function fetchMockJobs(query: string, remoteOnly: boolean): Job[] {
  let filtered = [...MOCK_JOBS];
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (remoteOnly) {
    filtered = filtered.filter((j) => j.remote);
  }
  return filtered;
}

// ── Main Hook ───────────────────────────────────────────────────────
export function useJobSearch() {
  const [state, setState] = useState<JobSearchState>({
    jobs: [],
    loading: false,
    error: null,
    hasMore: false,
    page: 1,
  });

  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [useMock, setUseMock] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(
    async (page = 1, append = false) => {
      // Cancel previous request
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        let jobs: Job[] = [];
        let hasMore = false;

        if (useMock) {
          jobs = fetchMockJobs(query, remoteOnly);
          hasMore = false;
        } else {
          // Try Arbeitnow first (no key needed)
          const arbeit = await fetchArbeitnowJobs(query, location, remoteOnly, page);
          jobs = arbeit.jobs;
          hasMore = arbeit.hasMore;

          // If Arbeitnow returns empty and we have Adzuna keys, try Adzuna
          if (jobs.length === 0 && ADZUNA_APP_ID !== "demo") {
            const adzuna = await fetchAdzunaJobs(query, location, page);
            jobs = adzuna.jobs;
            hasMore = adzuna.hasMore;
          }

          // Final fallback: mock data
          if (jobs.length === 0) {
            jobs = fetchMockJobs(query, remoteOnly);
            hasMore = false;
          }
        }

        setState((s) => ({
          jobs: append ? [...s.jobs, ...jobs] : jobs,
          loading: false,
          error: null,
          hasMore,
          page,
        }));
      } catch (err: any) {
        if (err.name === "AbortError") return;
        // Fallback to mock on any error
        const mockJobs = fetchMockJobs(query, remoteOnly);
        setState((s) => ({
          jobs: append ? [...s.jobs, ...mockJobs] : mockJobs,
          loading: false,
          error: null,
          hasMore: false,
          page,
        }));
      }
    },
    [query, location, remoteOnly, useMock]
  );

  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      search(state.page + 1, true);
    }
  }, [state.loading, state.hasMore, state.page, search]);

  const refresh = useCallback(() => {
    setState({ jobs: [], loading: false, error: null, hasMore: false, page: 1 });
    search(1, false);
  }, [search]);

  // Auto-search on filter change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => search(1, false), 400);
    return () => clearTimeout(timer);
  }, [query, location, remoteOnly, useMock, search]);

  return {
    ...state,
    query,
    setQuery,
    location,
    setLocation,
    remoteOnly,
    setRemoteOnly,
    useMock,
    setUseMock,
    search,
    loadMore,
    refresh,
    formatDate,
  };
}

// ── React Component: JobSearchPanel ─────────────────────────────────
export function JobSearchPanel(): JSX.Element {
  const {
    jobs,
    loading,
    hasMore,
    query,
    setQuery,
    location,
    setLocation,
    remoteOnly,
    setRemoteOnly,
    useMock,
    setUseMock,
    loadMore,
    formatDate,
  } = useJobSearch();

  return (
    <div className="mx-auto w-full max-w-[900px]">
      {/* Search bar */}
      <div className="mb-6 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Job title, keywords, or company"
              className="w-full rounded-xl border border-violet-100 bg-[#FDFAFF] py-3 pl-10 pr-4 text-sm text-[#0F0920] placeholder-gray-400 outline-none transition-all focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, country, or 'remote'"
              className="w-full rounded-xl border border-violet-100 bg-[#FDFAFF] py-3 pl-10 pr-4 text-sm text-[#0F0920] placeholder-gray-400 outline-none transition-all focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2">
            <div
              className={`flex h-5 w-9 items-center rounded-full transition-colors ${remoteOnly ? "bg-violet-700" : "bg-gray-200"}`}
              onClick={() => setRemoteOnly(!remoteOnly)}
            >
              <div
                className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${remoteOnly ? "translate-x-4" : "translate-x-0.5"}`}
              />
            </div>
            <span className="text-sm font-medium text-gray-600">Remote only</span>
          </label>

          <label className="flex cursor-pointer items-center gap-2">
            <div
              className={`flex h-5 w-9 items-center rounded-full transition-colors ${useMock ? "bg-violet-700" : "bg-gray-200"}`}
              onClick={() => setUseMock(!useMock)}
            >
              <div
                className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${useMock ? "translate-x-4" : "translate-x-0.5"}`}
              />
            </div>
            <span className="text-sm font-medium text-gray-600">Demo mode</span>
          </label>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-400">
        {loading && jobs.length === 0 ? (
          "Searching..."
        ) : (
          <>
            <span className="font-semibold text-[#0F0920]">{jobs.length}</span> jobs found
            {useMock && <span className="ml-2 text-violet-600">(demo data)</span>}
          </>
        )}
      </div>

      {/* Job cards */}
      <div className="flex flex-col gap-3">
        {jobs.map((job) => (
          <a
            key={job.id}
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-violet-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md hover:shadow-violet-900/5 md:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-[#0F0920] group-hover:text-violet-700 transition-colors md:text-lg">
                    {job.title}
                  </h3>
                  {job.remote && (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-600 border border-green-200">
                      Remote
                    </span>
                  )}
                </div>
                <div className="mb-2 text-sm font-semibold text-violet-700">
                  {job.company}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 md:text-sm">
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {job.location}
                  </span>
                  {job.salary && (
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" x2="12" y1="2" y2="22" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      {job.salary}
                    </span>
                  )}
                  <span>{formatDate(job.postedAt)}</span>
                </div>
                {job.description && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-500 line-clamp-2">
                    {job.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 border border-violet-100"
                    >
                      {tag}
                    </span>
                  ))}
                  {job.jobTypes.map((type) => (
                    <span
                      key={type}
                      className="rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-500 border border-gray-100"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              <div className="hidden shrink-0 sm:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-violet-700 transition-colors group-hover:bg-violet-700 group-hover:text-white">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Load more / Empty state */}
      {jobs.length > 0 && (
        <div className="mt-6 text-center">
          {hasMore ? (
            <button
              onClick={loadMore}
              disabled={loading}
              className="rounded-xl border border-violet-300 bg-white px-6 py-2.5 text-sm font-semibold text-violet-700 transition-all hover:bg-violet-50 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load more jobs"}
            </button>
          ) : (
            <p className="text-sm text-gray-400">No more jobs to show</p>
          )}
        </div>
      )}

      {jobs.length === 0 && !loading && (
        <div className="rounded-xl border border-violet-100 bg-[#FDFAFF] p-10 text-center">
          <div className="mb-3 text-4xl">🔍</div>
          <h3 className="mb-1 text-lg font-bold text-[#0F0920]">No jobs found</h3>
          <p className="text-sm text-gray-400">Try adjusting your search or enable demo mode to see sample jobs.</p>
        </div>
      )}

      {loading && jobs.length === 0 && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-violet-100 bg-white p-5">
              <div className="h-5 w-2/3 animate-pulse rounded bg-gray-100 mb-2" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100 mb-3" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobSearchPanel;