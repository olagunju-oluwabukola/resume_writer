import { useState, useEffect } from "react";
import { Link } from "wouter";

// ── Types ───────────────────────────────────────────────────────────
interface Feature {
  icon: string;
  title: string;
  desc: string;
}

interface Stat {
  value: string;
  label: string;
}

interface Step {
  n: string;
  title: string;
  desc: string;
  img: "upload" | "paste" | "run" | "apply";
}

interface Testimonial {
  name: string;
  role: string;
  text: string;
  initials: string;
  color: string;
}

interface FaqEntry {
  q: string;
  a: string;
}

// ── Constants ────────────────────────────────────────────────────────
const NAV_LINKS: readonly string[] = ["Features", "How it Works", "Success Stories", "FAQ"];

const STATS: readonly Stat[] = [
  { value: "6", label: "AI-powered tools" },
  { value: "< 30s", label: "to tailor a resume" },
  { value: "10k+", label: "job seekers helped" },
  { value: "100%", label: "free to start" },
];

const FEATURES: readonly Feature[] = [
  {
    icon: "✦",
    title: "Resume Tailoring",
    desc: "Paste a job description and get your resume rewritten to match it — instantly. Every section optimised for what that employer is looking for.",
  },
  {
    icon: "✉",
    title: "Cover Letter Generation",
    desc: "From blank page to compelling letter in seconds. Personalised to the role, the company, and your own experience.",
  },
  {
    icon: "◎",
    title: "Skills Gap Analysis",
    desc: "Find out exactly which skills you're missing for a role and get a concrete, actionable plan to close the gap.",
  },
  {
    icon: "◈",
    title: "Interview Prep",
    desc: "Likely questions, suggested answers, and red flags — all generated from your resume and the specific job description.",
  },
  {
    icon: "◉",
    title: "Resume Scoring",
    desc: "Clarity, impact, ATS compatibility — scored and improved before you hit send. Stop guessing; start optimising.",
  },
  {
    icon: "▦",
    title: "Application Tracker",
    desc: "Every application, every status, in one place. No more spreadsheets, no more forgotten follow-ups.",
  },
];

const STEPS: readonly Step[] = [
  {
    n: "01",
    title: "Upload your resume",
    desc: "Paste your existing resume or start from scratch. ResumeRx reads your experience so you don't have to explain it twice.",
    img: "upload",
  },
  {
    n: "02",
    title: "Paste a job description",
    desc: "Drop in the role you're targeting. Our AI analyses every requirement and maps it against your background.",
    img: "paste",
  },
  {
    n: "03",
    title: "Run the AI tools",
    desc: "Tailor, score, analyse, prep — pick what you need. Results land in under 30 seconds.",
    img: "run",
  },
  {
    n: "04",
    title: "Apply with confidence",
    desc: "Track applications, follow-ups, and outcomes all in one dashboard. Stay organised from first click to offer letter.",
    img: "apply",
  },
];

const TESTIMONIALS: readonly Testimonial[] = [
  {
    name: "Adaeze O.",
    role: "Product Manager · Lagos",
    text: "I'd been applying for months with no callbacks. ResumeRx tailored my CV for each role in seconds. Two weeks later I had three interviews lined up.",
    initials: "AO",
    color: "#7C3AED",
  },
  {
    name: "Kemi A.",
    role: "Software Engineer · Abuja",
    text: "The skills gap analysis alone was worth it. It showed me exactly what to learn and even suggested how to frame what I already knew. Got my offer within a month.",
    initials: "KA",
    color: "#9333EA",
  },
  {
    name: "Tunde B.",
    role: "UX Designer · London",
    text: "I kept freezing in interviews despite having the right skills. The interview prep tool structured my answers clearly. I finally stopped underselling myself.",
    initials: "TB",
    color: "#6D28D9",
  },
];

const FAQS: readonly FaqEntry[] = [
  {
    q: "How does ResumeRx tailor my resume?",
    a: "You paste a job description and ResumeRx uses AI to rewrite your resume — matching keywords, restructuring bullet points, and emphasising the experience most relevant to that specific role.",
  },
  {
    q: "Will it work for any industry?",
    a: "Yes. ResumeRx has been used across tech, finance, healthcare, design, and operations roles. The AI reads the job description itself, so it adapts to any field automatically.",
  },
  {
    q: "Is my data secure?",
    a: "Your resume and personal information are encrypted in transit and at rest. We never share or sell your data to third parties.",
  },
  {
    q: "How many resumes can I create?",
    a: "You can create and store multiple resume versions on your account — one tailored per role, if you like. The free plan includes a generous allowance to get started.",
  },
  {
    q: "Does it work with ATS systems?",
    a: "Yes. ResumeRx scores your resume for ATS compatibility and flags issues like missing keywords, unusual formatting, or sections that automated systems tend to skip.",
  },
];

const SIDEBAR_ITEMS = ["Dashboard", "My Resumes", "Cover Letters", "Applications", "Interview Prep", "Analytics"] as const;

const AVATAR_INITIALS = ["AO", "KA", "TB", "MO", "EI"] as const;

// ── Sub-components ───────────────────────────────────────────────────

function Avatar({ initials, color }: { initials: string; color: string }): JSX.Element {
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
      style={{
        background: color + "20",
        border: `2px solid ${color}40`,
        color,
      }}
    >
      {initials}
    </div>
  );
}

function FAQItem({ q, a }: FaqEntry): JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <div className={`border-b border-violet-100 ${open ? "pb-4" : ""}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left bg-transparent border-none cursor-pointer py-5 flex justify-between items-center gap-4 text-[#1a1033] text-base font-semibold font-sans"
        type="button"
      >
        <span>{q}</span>
        <span
          className="shrink-0 w-7 h-7 rounded-full border border-violet-300 flex items-center justify-center text-violet-700 text-lg transition-transform duration-200"
          style={{ transform: open ? "rotate(45deg)" : "none" }}
        >
          +
        </span>
      </button>
      {open && (
        <p className="mt-0 mb-1 text-gray-500 text-[15px] leading-relaxed">{a}</p>
      )}
    </div>
  );
}

function StepMockup({ img }: { img: Step["img"] }): JSX.Element | null {
  const cardClass = "bg-white rounded-xl border border-violet-100 p-4 min-w-[200px] max-w-[260px]";
  const labelClass = "text-[11px] text-gray-400 mb-2.5 font-semibold uppercase tracking-widest";

  const mockups: Record<Step["img"], JSX.Element> = {
    upload: (
      <div className={cardClass} style={{ boxShadow: "0 4px 24px #7C3AED10" }}>
        <div className={labelClass}>Your Resume</div>
        {(["Professional Summary", "Experience", "Education", "Skills"] as const).map((s, i) => (
          <div
            key={s}
            className={`px-3 py-2 rounded-md mb-1.5 text-xs font-${i === 0 ? "semibold" : "normal"} border`}
            style={{
              background: i === 0 ? "#F5F3FF" : "#FAFAFA",
              color: i === 0 ? "#7C3AED" : "#6B7280",
              borderColor: i === 0 ? "#EDE9FE" : "#F3F4F6",
            }}
          >
            {s}
          </div>
        ))}
        <div className="mt-3 py-2.5 bg-violet-700 rounded-lg text-white text-xs font-semibold text-center cursor-default">
          Upload Resume →
        </div>
      </div>
    ),
    paste: (
      <div className={cardClass} style={{ boxShadow: "0 4px 24px #7C3AED10" }}>
        <div className={labelClass}>Job Description</div>
        <div className="bg-gray-50 border border-violet-100 rounded-lg p-2.5 text-[11px] text-gray-500 leading-relaxed mb-2.5">
          We are looking for a{" "}
          <span className="text-violet-700 font-semibold">Product Manager</span> to join our
          team. You'll work cross-functionally to define the roadmap…
        </div>
        <div className="flex gap-1.5">
          {(["Agile", "Roadmapping", "SQL"] as const).map((t) => (
            <span
              key={t}
              className="bg-violet-50 border border-violet-300 rounded px-2 py-0.5 text-[10px] text-violet-700 font-semibold"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
    run: (
      <div className={cardClass} style={{ boxShadow: "0 4px 24px #7C3AED10" }}>
        <div className={labelClass}>AI Results</div>
        {([
          { label: "Resume Match", val: 91, color: "#7C3AED" },
          { label: "ATS Score", val: 87, color: "#9333EA" },
        ] as const).map(({ label, val, color }) => (
          <div key={label} className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-700">{label}</span>
              <span className="text-xs font-bold" style={{ color }}>{val}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded overflow-hidden">
              <div
                className="h-full rounded"
                style={{ width: `${val}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
              />
            </div>
          </div>
        ))}
        <div className="bg-violet-50 rounded-lg px-3 py-2 text-[11px] text-violet-700 font-medium">
          ✦ 3 improvements suggested
        </div>
      </div>
    ),
    apply: (
      <div className={cardClass} style={{ boxShadow: "0 4px 24px #7C3AED10" }}>
        <div className={labelClass}>Application Tracker</div>
        {([
          { co: "Stripe", role: "PM", status: "Interview", c: "#7C3AED" },
          { co: "Flutterwave", role: "PM", status: "Applied", c: "#9CA3AF" },
          { co: "Paystack", role: "PM", status: "Offer ✓", c: "#059669" },
        ] as const).map(({ co, role, status, c }) => (
          <div
            key={co}
            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
          >
            <div>
              <div className="text-xs font-semibold text-gray-800">{co}</div>
              <div className="text-[10px] text-gray-400">{role}</div>
            </div>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded"
              style={{ color: c, background: c + "15" }}
            >
              {status}
            </span>
          </div>
        ))}
      </div>
    ),
  };

  return mockups[img] ?? null;
}

// ── Main Component ───────────────────────────────────────────────────
export default function Landing(): JSX.Element {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#1a1033] overflow-x-hidden font-sans antialiased">

      {/* ── NAV ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-10 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl border-b border-violet-100 shadow-sm"
            : "bg-transparent border-b border-transparent"
        }`}
        aria-label="Primary navigation"
      >
        <div className="text-[22px] font-black tracking-tight text-[#0F0920]">
          Resume<span className="text-violet-700">Rx</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/\s/g, "-")}`}
              className="text-gray-500 text-sm font-medium hover:text-violet-700 transition-colors no-underline"
            >
              {l}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login"
            type="button"
            className="px-5 py-2.5 text-sm font-semibold text-violet-700 border border-violet-300 rounded-xl bg-white hover:bg-violet-50 hover:border-violet-600 transition-all"
          >
            Log in
          </Link>
          <button
            type="button"
            className="px-5 py-2.5 text-sm font-bold text-white bg-violet-700 rounded-xl hover:bg-violet-600 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-violet-700/30"
          >
            Get started free
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative pt-36 pb-20 overflow-hidden"
        style={{ background: "linear-gradient(180deg, #FDFAFF 0%, #fff 100%)" }}
        aria-labelledby="hero-heading"
      >
        {/* Background blobs */}
        <div
          className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[900px] h-[500px]"
          style={{ background: "radial-gradient(ellipse at 50% 30%, #EDE9FE 0%, transparent 65%)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-28 -right-24 w-96 h-96"
          style={{ background: "radial-gradient(circle, #F5F3FF 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 -left-20 w-72 h-72"
          style={{ background: "radial-gradient(circle, #EDE9FE 0%, transparent 70%)" }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-[1100px] mx-auto px-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-300 rounded-full px-4 py-1.5 text-xs font-bold text-violet-700 uppercase tracking-widest mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-700 inline-block" />
            AI-Powered Career Tools
          </div>

          {/* Headline */}
          <h1
            id="hero-heading"
            className="text-[clamp(2.8rem,5.5vw,4.2rem)] font-black leading-[1.07] tracking-[-0.04em] text-[#0F0920] mb-6"
          >
            Land Your Dream Job
            <br />
            <span className="relative text-violet-700 inline-block">
              Faster with AI
              <svg
                className="absolute -bottom-1 left-0 w-full h-2"
                viewBox="0 0 300 8"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 6 C75 2, 150 2, 298 6"
                  stroke="#C4B5FD"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
          </h1>

          {/* Sub */}
          <p className="text-[clamp(1rem,1.5vw,1.15rem)] text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            ResumeRx uses AI to tailor your resume, write cover letters, close skill gaps, and
            prepare you for interviews — all from one dashboard.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <button
              type="button"
              className="inline-flex items-center gap-2 bg-violet-700 text-white font-bold text-base px-7 py-3.5 rounded-xl hover:bg-violet-600 hover:-translate-y-px hover:shadow-lg hover:shadow-violet-700/30 transition-all"
            >
              ✦ Get Started for Free
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 bg-white text-violet-700 font-semibold text-base px-6 py-3.5 rounded-xl border border-violet-300 hover:bg-violet-50 hover:border-violet-600 transition-all"
            >
              I already have an account →
            </button>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-3 mb-16">
            <div className="flex">
              {AVATAR_INITIALS.map((init, i) => (
                <div
                  key={init}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold text-white"
                  style={{
                    background: `hsl(${260 + i * 15}, 60%, ${72 - i * 4}%)`,
                    marginLeft: i === 0 ? 0 : -8,
                  }}
                >
                  {init}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex gap-0.5 mb-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-amber-400 text-sm">★</span>
                ))}
              </div>
              <div className="text-xs text-gray-400">
                <strong className="text-gray-600">4.9</strong> · Trusted by 10,000+ job seekers
              </div>
            </div>
          </div>

          {/* Dashboard preview */}
          <div
            className="bg-white border border-violet-100 rounded-2xl overflow-hidden max-w-[900px] mx-auto"
            style={{ boxShadow: "0 32px 80px #7C3AED14, 0 8px 24px #7C3AED08" }}
            role="img"
            aria-label="ResumeRx dashboard preview"
          >
            {/* Browser chrome */}
            <div className="bg-gray-50 border-b border-violet-50 px-5 py-3 flex items-center gap-2">
              {(["#FF5F56", "#FFBD2E", "#27C93F"] as const).map((c) => (
                <span key={c} className="w-2.5 h-2.5 rounded-full block" style={{ background: c }} />
              ))}
              <div className="ml-4 bg-gray-100 rounded px-4 py-1 text-xs text-gray-400 max-w-[240px] flex-1">
                resumrx.app/dashboard
              </div>
            </div>

            {/* Body */}
            <div className="flex min-h-[260px]">
              {/* Sidebar */}
              <div className="hidden sm:flex w-40 shrink-0 border-r border-gray-100 flex-col p-3 bg-[#FDFAFF]">
                <div className="text-xs font-black text-violet-700 mb-4 tracking-tight">
                  Resume<span className="text-violet-900">Rx</span>
                </div>
                {SIDEBAR_ITEMS.map((item, i) => (
                  <div
                    key={item}
                    className={`px-2.5 py-1.5 rounded-md text-xs mb-0.5 font-${i === 0 ? "semibold" : "normal"} ${
                      i === 0 ? "bg-violet-100 text-violet-700" : "text-gray-400"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* Main panel */}
              <div className="flex-1 p-6">
                <div className="text-lg font-bold text-[#0F0920] mb-1">Welcome back, Ola 👋</div>
                <div className="text-xs text-gray-400 mb-5">Let's get you hired.</div>

                {/* Mini stat cards */}
                <div className="flex gap-3 mb-5">
                  {([["3", "Resumes"], ["12", "Applications"], ["5", "Cover Letters"]] as const).map(([v, l]) => (
                    <div
                      key={l}
                      className="flex-1 bg-[#FDFAFF] border border-violet-100 rounded-xl px-3.5 py-3"
                    >
                      <div className="text-xl font-black text-violet-700 mb-0.5">{v}</div>
                      <div className="text-[11px] text-gray-400">{l}</div>
                    </div>
                  ))}
                </div>

                {/* Score bars */}
                <div className="flex gap-4 mb-4">
                  {([{ l: "Resume score", v: 82 }, { l: "Match score", v: 91 }] as const).map(({ l, v }) => (
                    <div key={l} className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-[11px] text-gray-400 uppercase tracking-widest">{l}</span>
                        <span className="text-sm font-black text-violet-700">{v}</span>
                      </div>
                      <div className="h-1.5 bg-violet-100 rounded overflow-hidden">
                        <div
                          className="h-full rounded"
                          style={{
                            width: `${v}%`,
                            background: "linear-gradient(90deg, #4C1D95, #7C3AED)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {(["Tailor Resume", "Write Cover Letter", "Skill Gap", "Interview Prep"] as const).map((t) => (
                    <div
                      key={t}
                      className="px-3 py-1.5 bg-violet-50 border border-violet-300 rounded-md text-[11px] font-semibold text-violet-700 cursor-default"
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-violet-700 py-10 px-10" aria-label="Key statistics">
        <div className="max-w-[1100px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-4xl font-black text-white mb-1 tracking-tight">{value}</div>
              <div className="text-sm text-violet-300 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        id="features"
        className="relative py-24 px-10 overflow-hidden"
        style={{ background: "linear-gradient(180deg, #fff 0%, #FDFAFF 100%)" }}
        aria-labelledby="features-heading"
      >
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px]"
          style={{ background: "radial-gradient(ellipse, #F5F3FF 0%, transparent 65%)" }}
          aria-hidden="true"
        />
        <div className="relative max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-violet-50 border border-violet-300 rounded-full px-3.5 py-1 text-[11px] font-bold text-violet-700 uppercase tracking-widest mb-5">
              What we have to offer
            </div>
            <h2
              id="features-heading"
              className="text-[clamp(2rem,3.5vw,2.8rem)] font-black tracking-[-0.04em] text-[#0F0920] mb-4 leading-[1.1]"
            >
              Our tools cover everything you need
              <br />
              to secure your next role.
            </h2>
            <p className="text-base text-gray-400 max-w-md mx-auto">
              Six tools that work together — not six separate apps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon, title, desc }) => (
              <article
                key={title}
                className="group bg-white border border-violet-100 rounded-2xl p-8 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:bg-[#FDFAFF]"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(90deg, #7C3AED, #A78BFA)" }}
                  aria-hidden="true"
                />
                <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-xl text-violet-700 mb-4">
                  {icon}
                </div>
                <h3 className="text-base font-bold text-[#0F0920] mb-2.5">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        id="how-it-works"
        className="py-24 px-10 bg-[#FDFAFF] border-t border-b border-violet-100"
        aria-labelledby="how-heading"
      >
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-violet-50 border border-violet-300 rounded-full px-3.5 py-1 text-[11px] font-bold text-violet-700 uppercase tracking-widest mb-5">
              Simple by design
            </div>
            <h2
              id="how-heading"
              className="text-[clamp(2rem,3.5vw,2.8rem)] font-black tracking-[-0.04em] text-[#0F0920] leading-[1.1]"
            >
              Your path to your dream job
              <br />
              in 4 steps.
            </h2>
          </div>

          {/* Step tabs */}
          <div className="flex justify-center gap-2 mb-14 flex-wrap">
            {STEPS.map((s, i) => (
              <button
                key={s.n}
                type="button"
                onClick={() => setActiveTab(i)}
                className={`px-5 py-2.5 rounded-full text-xs font-medium transition-all border ${
                  i === activeTab
                    ? "bg-violet-700 text-white border-violet-700 font-bold"
                    : "bg-white text-gray-400 border-violet-100 hover:text-violet-700"
                }`}
              >
                {s.n} · {s.title}
              </button>
            ))}
          </div>

          {/* Active step content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-[900px] mx-auto">
            <div>
              <div className="text-[56px] font-black text-violet-100 tracking-[-0.05em] mb-4 leading-none select-none">
                {STEPS[activeTab].n}
              </div>
              <h3 className="text-[26px] font-extrabold text-[#0F0920] mb-3.5 tracking-tight">
                {STEPS[activeTab].title}
              </h3>
              <p className="text-[15px] text-gray-400 leading-relaxed mb-7">
                {STEPS[activeTab].desc}
              </p>
              {/* Dot indicators */}
              <div className="flex gap-2">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveTab(i)}
                    className="h-2 rounded transition-all duration-300 border-none cursor-pointer p-0"
                    style={{
                      width: i === activeTab ? 24 : 8,
                      background: i === activeTab ? "#7C3AED" : "#EDE9FE",
                    }}
                    aria-label={`Step ${i + 1}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <StepMockup img={STEPS[activeTab].img} />
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section
        id="success-stories"
        className="py-24 px-10 bg-white"
        aria-labelledby="testimonials-heading"
      >
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-violet-50 border border-violet-300 rounded-full px-3.5 py-1 text-[11px] font-bold text-violet-700 uppercase tracking-widest mb-5">
              Success Stories
            </div>
            <h2
              id="testimonials-heading"
              className="text-[clamp(2rem,3.5vw,2.8rem)] font-black tracking-[-0.04em] text-[#0F0920] leading-[1.1]"
            >
              Join thousands who
              <br />
              accelerated their careers.
            </h2>
          </div>

          {/* Featured */}
          <div
            className="rounded-2xl p-12 mb-6 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
          >
            <div
              className="absolute -top-10 -right-10 w-48 h-48 rounded-full"
              style={{ background: "rgba(255,255,255,0.05)" }}
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-14 -left-5 w-40 h-40 rounded-full"
              style={{ background: "rgba(255,255,255,0.04)" }}
              aria-hidden="true"
            />
            <div className="relative">
              <div className="text-5xl text-violet-300 leading-none mb-5">"</div>
              <p className="text-xl text-white font-medium leading-relaxed mb-7 max-w-3xl">
                I'd been applying for months with no callbacks. ResumeRx tailored my CV for each
                role in under a minute. Two weeks later I had three interviews lined up — and I
                landed a role above my expected salary.
              </p>
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">
                  AO
                </div>
                <div>
                  <div className="text-white font-bold text-[15px]">Adaeze O.</div>
                  <div className="text-violet-300 text-sm">Product Manager · Lagos, Nigeria</div>
                </div>
              </div>
            </div>
          </div>

          {/* Three cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, text, initials, color }) => (
              <div
                key={name}
                className="bg-white border border-violet-100 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-0.5"
                style={{ boxShadow: "0 2px 12px #7C3AED06" }}
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3">
                  <Avatar initials={initials} color={color} />
                  <div>
                    <div className="text-sm font-bold text-[#0F0920]">{name}</div>
                    <div className="text-xs text-gray-400">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        id="faq"
        className="py-24 px-10 bg-[#FDFAFF] border-t border-violet-100"
        aria-labelledby="faq-heading"
      >
        <div className="max-w-[740px] mx-auto">
          <div className="text-center mb-14">
            <div className="inline-block bg-violet-50 border border-violet-300 rounded-full px-3.5 py-1 text-[11px] font-bold text-violet-700 uppercase tracking-widest mb-5">
              Let's answer your questions
            </div>
            <h2
              id="faq-heading"
              className="text-[clamp(2rem,3.5vw,2.6rem)] font-black tracking-[-0.04em] text-[#0F0920]"
            >
              Frequently Asked Questions
            </h2>
          </div>
          <div>
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} {...faq} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-16 px-10 bg-white" aria-labelledby="cta-heading">
        <div
          className="max-w-[1100px] mx-auto rounded-3xl py-20 px-16 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}
        >
          <div
            className="absolute -top-14 -right-14 w-56 h-56 rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full"
            style={{ background: "rgba(255,255,255,0.05)" }}
            aria-hidden="true"
          />
          <div className="relative">
            <h2
              id="cta-heading"
              className="text-[clamp(2rem,3.5vw,3rem)] font-black text-white tracking-[-0.04em] mb-4 leading-[1.1]"
            >
              Join the 10,000+ who said goodbye
              <br />
              to job rejections.
            </h2>
            <p className="text-violet-300 text-base mb-9">Free to start. No credit card required.</p>
            <button
              type="button"
              className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold text-base px-8 py-3.5 rounded-xl hover:bg-violet-50 transition-all"
            >
              Get Started for Free →
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0F0920] pt-16 pb-10 px-10 text-gray-400">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="text-[22px] font-black text-white mb-3 tracking-tight">
                Resume<span className="text-violet-400">Rx</span>
              </div>
              <p className="text-sm leading-relaxed max-w-[200px]">
                AI-powered career tools to help you land the role you deserve.
              </p>
            </div>
            {(
              [
                { heading: "Product", items: ["Resume Tailoring", "Cover Letters", "Skills Gap", "Interview Prep", "App Tracker"] },
                { heading: "Resources", items: ["Blog", "Guides", "FAQ", "Changelog"] },
                { heading: "Company", items: ["About", "Careers", "Contact"] },
                { heading: "Legal", items: ["Privacy", "Terms", "Cookies"] },
              ] as const
            ).map(({ heading, items }) => (
              <div key={heading}>
                <div className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-4">
                  {heading}
                </div>
                {items.map((item) => (
                  <div key={item} className="text-sm mb-2.5 cursor-default hover:text-gray-300 transition-colors">
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="border-t border-[#1F1035] pt-7 flex flex-wrap justify-between items-center gap-3">
            <div className="text-xs">© {currentYear} ResumeRx. Built with AI.</div>
            <div className="flex gap-5 text-xs">
              {(["Twitter", "LinkedIn", "Instagram"] as const).map((s) => (
                <span key={s} className="cursor-default hover:text-gray-300 transition-colors">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}