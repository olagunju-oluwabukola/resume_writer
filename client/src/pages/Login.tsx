import { useState } from "react";
import { useLocation } from "wouter";
import { loginWithEmail } from "@/lib/firebase";
import { toast } from "sonner";
import { Navigation } from "@/components/nav";
import { Footer } from "@/components/footer";

// ── Types ────────────────────────────────────────────────────────────
interface LoginForm {
  email: string;
  password: string;
}

// ── Helpers ──────────────────────────────────────────────────────────
function firebaseError(code: string): string {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email or password is incorrect.";
    case "auth/invalid-email":
      return "That doesn't look like a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

// ── Component ────────────────────────────────────────────────────────
export default function Login(): JSX.Element {
  const [, navigate] = useLocation();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set =
    (k: keyof LoginForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithEmail(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      setError(firebaseError(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#1a1033] font-sans antialiased">
      <Navigation />

      <div className="min-h-[calc(100vh-200px)] bg-[#FDFAFF] flex items-center justify-center px-4 py-16  md:py-28 relative overflow-hidden">
        {/* Background blobs */}
        <div
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px]"
          style={{ background: "radial-gradient(ellipse at 50% 30%, #EDE9FE 0%, transparent 65%)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 w-80 h-80"
          style={{ background: "radial-gradient(circle, #F5F3FF 0%, transparent 70%)" }}
          aria-hidden="true"
        />

        {/* Card */}
        <div className="relative z-10 w-full max-w-[420px] bg-white border border-violet-100 rounded-2xl px-8 py-10 shadow-[0_24px_60px_#7C3AED0D]">

          {/* Back */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-violet-700 transition-colors mb-6 bg-transparent border-none cursor-pointer p-0 font-sans"
          >
            ← Back to home
          </button>

          {/* Logo */}
          <div className="text-xl font-black tracking-tight text-[#0F0920] mb-5">
            Resume<span className="text-violet-700">Rx</span>
          </div>

          {/* Heading */}
          <h1 className="text-[1.6rem] font-black tracking-tight text-[#0F0920] mb-1 leading-tight">
            Welcome back
          </h1>
          <p className="text-sm text-gray-400 mb-7">Log in to your ResumeRx account.</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 tracking-wide">
                Email
              </label>
              <input
                type="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={set("email")}
                required
                autoComplete="email"
                autoFocus
                className="w-full px-3.5 py-2.5 text-sm text-[#0F0920] bg-gray-50 border border-violet-100 rounded-xl outline-none transition-all placeholder:text-gray-300 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-500 tracking-wide">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-violet-600 hover:text-violet-800 transition-colors bg-transparent border-none cursor-pointer p-0 font-sans"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={set("password")}
                required
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 text-sm text-[#0F0920] bg-gray-50 border border-violet-100 rounded-xl outline-none transition-all placeholder:text-gray-300 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {error && (
              <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-3 bg-violet-700 text-white text-sm font-bold rounded-xl hover:bg-violet-600 hover:-translate-y-px hover:shadow-lg hover:shadow-violet-700/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-violet-50" />
            <span className="text-xs text-gray-300 font-medium">or</span>
            <div className="flex-1 h-px bg-violet-50" />
          </div>

          {/* Switch */}
          <p className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-violet-700 font-semibold hover:text-violet-900 transition-colors bg-transparent border-none cursor-pointer p-0 font-sans text-sm"
            >
              Create one free
            </button>
          </p>
        </div>
      </div>

      <Footer hideSocial hideLinks={false} />
    </div>
  );
}