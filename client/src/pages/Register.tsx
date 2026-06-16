import { useState } from "react";
import { useLocation } from "wouter";
import { registerWithEmail } from "@/lib/firebase";
import { toast } from "sonner";
import { Navigation } from "@/components/nav";
import { Footer } from "@/components/footer";

// ── Types ────────────────────────────────────────────────────────────
interface RegisterForm {
  // Step 1
  fullName: string;
  email: string;
  password: string;
  confirm: string;
  // Step 2
  country: string;
  city: string;
  yearsOfExperience: string;
  targetRole: string;
}

// ── Helpers ──────────────────────────────────────────────────────────
function firebaseError(code: string): string {
  console.log("Firebase error code received:", code);

  switch (code) {
    case "auth/email-already-in-use":
      return "That email is already registered. Try logging in instead.";
    case "auth/invalid-email":
      return "That doesn't look like a valid email address.";
    case "auth/weak-password":
      return "Choose a stronger password — at least 6 characters.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    case "auth/internal-error":
      return "Internal server error. Please try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/operation-not-allowed":
      return "Email/password authentication is not enabled. Please contact support.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    default:
      return `Something went wrong. Please try again. (${code || "unknown error"})`;
  }
}

// ── Component ────────────────────────────────────────────────────────
export default function Register(): JSX.Element {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<RegisterForm>({
    fullName: "",
    email: "",
    password: "",
    confirm: "",
    country: "",
    city: "",
    yearsOfExperience: "",
    targetRole: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set =
    (k: keyof RegisterForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  // Step 1 validation
  const validateStep1 = (): boolean => {
    if (!form.fullName.trim()) {
      setError("Please enter your name.");
      return false;
    }
    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    if (form.password !== form.confirm) {
      setError("Passwords don't match.");
      return false;
    }
    return true;
  };

  // Step 2 validation
  const validateStep2 = (): boolean => {
    if (!form.country.trim()) {
      setError("Please select your country.");
      return false;
    }
    if (!form.city.trim()) {
      setError("Please enter your city.");
      return false;
    }
    if (!form.yearsOfExperience.trim()) {
      setError("Please select your years of experience.");
      return false;
    }
    if (!form.targetRole.trim()) {
      setError("Please enter the role you're applying for.");
      return false;
    }
    return true;
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");
    setStep(1);
  };

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError("");

    if (!validateStep2()) {
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting to register user:", {
        email: form.email,
        fullName: form.fullName.trim(),
        country: form.country,
        city: form.city
      });

      const user = await registerWithEmail(form.email, form.password, form.fullName.trim());

      console.log("Registration successful:", user);
      toast.success("Account created! Welcome to ResumeRx.");

      // You can save additional profile data here
      // await saveUserProfile({
      //   uid: user.uid,
      //   fullName: form.fullName.trim(),
      //   country: form.country,
      //   city: form.city,
      //   yearsOfExperience: form.yearsOfExperience,
      //   targetRole: form.targetRole,
      // });

      navigate("/dashboard");
    } catch (err: any) {
      console.error("Registration error details:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      console.error("Full error object:", JSON.stringify(err, null, 2));

      setError(firebaseError(err.code || err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#1a1033] font-sans antialiased">
      <Navigation />

      <div className="min-h-[calc(100vh-200px)] bg-[#FDFAFF] flex items-center justify-center px-4 py-12 relative overflow-hidden">
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

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${step === 1 ? 'text-violet-700' : 'text-gray-400'}`}>
                Step 1
              </span>
              <span className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-violet-700' : 'bg-gray-300'}`} />
            </div>
            <div className="flex-1 h-px bg-violet-100" />
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${step === 2 ? 'text-violet-700' : 'text-gray-400'}`}>
                Step 2
              </span>
              <span className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-violet-700' : 'bg-gray-300'}`} />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-[1.6rem] font-black tracking-tight text-[#0F0920] mb-1 leading-tight">
            {step === 1 ? "Create your account" : "Tell us about yourself"}
          </h1>
          <p className="text-sm text-gray-400 mb-7">
            {step === 1
              ? "Free forever. No credit card needed."
              : "Help us personalize your experience."}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {step === 1 ? (
              // ── STEP 1 ──
              <>
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
                    autoFocus
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
              </>
            ) : (
              // ── STEP 2 ──
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 tracking-wide">
                    Country
                  </label>
                  <select
                    value={form.country}
                    onChange={set("country")}
                    required
                    className="w-full px-3.5 py-2.5 text-sm text-[#0F0920] bg-gray-50 border border-violet-100 rounded-xl outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 appearance-none"
                  >
                    <option value="">Select your country</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Kenya">Kenya</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Egypt">Egypt</option>
                    <option value="Ghana">Ghana</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 tracking-wide">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Lagos, Nairobi, London..."
                    value={form.city}
                    onChange={set("city")}
                    required
                    autoComplete="address-level2"
                    className="w-full px-3.5 py-2.5 text-sm text-[#0F0920] bg-gray-50 border border-violet-100 rounded-xl outline-none transition-all placeholder:text-gray-300 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 tracking-wide">
                    Years of Experience
                  </label>
                  <select
                    value={form.yearsOfExperience}
                    onChange={set("yearsOfExperience")}
                    required
                    className="w-full px-3.5 py-2.5 text-sm text-[#0F0920] bg-gray-50 border border-violet-100 rounded-xl outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 appearance-none"
                  >
                    <option value="">Select experience level</option>
                    <option value="0-1">0-1 years (Entry level)</option>
                    <option value="1-3">1-3 years (Junior)</option>
                    <option value="3-5">3-5 years (Mid-level)</option>
                    <option value="5-8">5-8 years (Senior)</option>
                    <option value="8-12">8-12 years (Lead)</option>
                    <option value="12+">12+ years (Executive)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 tracking-wide">
                    Role you're applying for
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Product Manager, Software Engineer..."
                    value={form.targetRole}
                    onChange={set("targetRole")}
                    required
                    className="w-full px-3.5 py-2.5 text-sm text-[#0F0920] bg-gray-50 border border-violet-100 rounded-xl outline-none transition-all placeholder:text-gray-300 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                {error}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-1">
              {step === 2 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 bg-white text-violet-700 text-sm font-semibold rounded-xl border border-violet-300 hover:bg-violet-50 transition-all"
                >
                  ← Back
                </button>
              )}
              {step === 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-3 bg-violet-700 text-white text-sm font-bold rounded-xl hover:bg-violet-600 hover:-translate-y-px hover:shadow-lg hover:shadow-violet-700/20 transition-all"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-violet-700 text-white text-sm font-bold rounded-xl hover:bg-violet-600 hover:-translate-y-px hover:shadow-lg hover:shadow-violet-700/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? "Creating account…" : "Create account"}
                </button>
              )}
            </div>
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

      <Footer hideSocial hideLinks={false} />
    </div>
  );
}