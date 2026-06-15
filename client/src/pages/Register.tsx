import { useState } from "react";
import { useLocation } from "wouter";
import { registerWithEmail } from "@/lib/firebase";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────
interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirm: string;
}

// ── Helpers ──────────────────────────────────────────────────────────
function firebaseError(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "That email is already registered. Try logging in instead.";
    case "auth/invalid-email":
      return "That doesn't look like a valid email address.";
    case "auth/weak-password":
      return "Choose a stronger password — at least 6 characters.";
    default:
      return "Something went wrong. Please try again.";
  }
}

// ── Component ────────────────────────────────────────────────────────
export default function Register(): JSX.Element {
  const [, navigate] = useLocation();
  const [form, setForm] = useState<RegisterForm>({
    fullName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set =
    (k: keyof RegisterForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError("");
    if (!form.fullName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(form.email, form.password, form.fullName.trim());
      toast.success("Account created! Welcome to ResumeRx.");
      navigate("/dashboard");
    } catch (err: any) {
      setError(firebaseError(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFAFF] flex items-center justify-center px-4 py-12 relative overflow-hidden font-sans antialiased">

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
          Create your account
        </h1>
        <p className="text-sm text-gray-400 mb-7">Free forever. No credit card needed.</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 tracking-wide">
              Full name
            </label>
            <input
              type="text"
              placeholder="Ola Olagunju"
              value={form.fullName}
              onChange={set("fullName")}
              required
              autoComplete="name"
              className="w-full px-3.5 py-2.5 text-sm text-[#0F0920] bg-gray-50 border border-violet-100 rounded-xl outline-none transition-all placeholder:text-gray-300 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
            />
          </div>

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
              className="w-full px-3.5 py-2.5 text-sm text-[#0F0920] bg-gray-50 border border-violet-100 rounded-xl outline-none transition-all placeholder:text-gray-300 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 tracking-wide">
              Password
            </label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={set("password")}
              required
              autoComplete="new-password"
              className="w-full px-3.5 py-2.5 text-sm text-[#0F0920] bg-gray-50 border border-violet-100 rounded-xl outline-none transition-all placeholder:text-gray-300 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 tracking-wide">
              Confirm password
            </label>
            <input
              type="password"
              placeholder="Same password again"
              value={form.confirm}
              onChange={set("confirm")}
              required
              autoComplete="new-password"
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
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        {/* Switch */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-violet-700 font-semibold hover:text-violet-900 transition-colors bg-transparent border-none cursor-pointer p-0 font-sans text-sm"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}