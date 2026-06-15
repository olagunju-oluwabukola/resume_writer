import { useState } from "react";
import { useLocation } from "wouter";
import { registerWithEmail } from "@/lib/firebase";
import { toast } from "sonner";

export default function Register() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.fullName.trim()) { setError("Please enter your name."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    try {
      await registerWithEmail(form.email, form.password, form.fullName.trim());
      toast.success("Account created! Welcome to ResumeRx.");
      navigate("/dashboard");
    } catch (err: any) {
      const msg = firebaseError(err.code);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-root">
      <div className="auth-glow" aria-hidden />
      <div className="auth-card">
        <button className="auth-back" onClick={() => navigate("/")}>← Back</button>

        <div className="auth-logo">
          Resume<span className="auth-logo__rx">Rx</span>
        </div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Free forever. No credit card needed.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Full name</label>
            <input
              className="auth-input"
              type="text"
              placeholder="Ola Olagunju"
              value={form.fullName}
              onChange={set("fullName")}
              required
              autoComplete="name"
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={set("email")}
              required
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={set("password")}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Confirm password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="Same password again"
              value={form.confirm}
              onChange={set("confirm")}
              required
              autoComplete="new-password"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <button className="auth-link" onClick={() => navigate("/login")}>
            Log in
          </button>
        </p>
      </div>
      <style>{authStyles}</style>
    </div>
  );
}

function firebaseError(code: string): string {
  switch (code) {
    case "auth/email-already-in-use": return "That email is already registered. Try logging in instead.";
    case "auth/invalid-email": return "That doesn't look like a valid email address.";
    case "auth/weak-password": return "Choose a stronger password — at least 6 characters.";
    default: return "Something went wrong. Please try again.";
  }
}

const authStyles = `
  .auth-root {
    min-height: 100vh;
    background: #0a0812;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    position: relative;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  .auth-glow {
    position: fixed;
    top: 0; left: 50%;
    transform: translateX(-50%);
    width: 600px; height: 400px;
    background: radial-gradient(ellipse at center, rgba(107,70,193,0.2) 0%, transparent 70%);
    pointer-events: none;
  }
  .auth-card {
    background: rgba(15, 10, 30, 0.9);
    border: 1px solid rgba(107, 70, 193, 0.25);
    border-radius: 1rem;
    padding: 2.5rem 2rem;
    width: 100%;
    max-width: 420px;
    position: relative;
    z-index: 1;
    box-shadow: 0 24px 60px rgba(0,0,0,0.4);
  }
  .auth-back {
    background: none;
    border: none;
    color: #7a6e90;
    font-size: 0.8rem;
    cursor: pointer;
    padding: 0;
    margin-bottom: 1.5rem;
    transition: color 0.2s;
  }
  .auth-back:hover { color: #c4b5fd; }
  .auth-logo {
    font-size: 1.25rem;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.03em;
    margin-bottom: 1.25rem;
  }
  .auth-logo__rx { color: #8B5CF6; }
  .auth-title {
    font-size: 1.6rem;
    font-weight: 800;
    color: #fff;
    margin: 0 0 0.375rem;
    letter-spacing: -0.025em;
  }
  .auth-sub {
    font-size: 0.875rem;
    color: #7a6e90;
    margin: 0 0 1.75rem;
  }
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .auth-field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }
  .auth-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #a89bc4;
    letter-spacing: 0.02em;
  }
  .auth-input {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0.5rem;
    padding: 0.65rem 0.875rem;
    font-size: 0.9rem;
    color: #e8e0f5;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    width: 100%;
    box-sizing: border-box;
    font-family: inherit;
  }
  .auth-input::placeholder { color: #4a4060; }
  .auth-input:focus {
    border-color: rgba(107, 70, 193, 0.6);
    background: rgba(107, 70, 193, 0.06);
  }
  .auth-error {
    font-size: 0.8rem;
    color: #f87171;
    background: rgba(248, 113, 113, 0.08);
    border: 1px solid rgba(248, 113, 113, 0.2);
    border-radius: 0.375rem;
    padding: 0.5rem 0.75rem;
  }
  .auth-submit {
    background: #6B46C1;
    color: #fff;
    border: none;
    border-radius: 0.5rem;
    padding: 0.75rem;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 0.375rem;
    transition: background 0.2s, transform 0.15s;
    font-family: inherit;
  }
  .auth-submit:hover:not(:disabled) { background: #7c3aed; transform: translateY(-1px); }
  .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  .auth-switch {
    text-align: center;
    font-size: 0.85rem;
    color: #7a6e90;
    margin: 1.25rem 0 0;
  }
  .auth-link {
    background: none;
    border: none;
    color: #8B5CF6;
    font-size: inherit;
    cursor: pointer;
    padding: 0;
    font-weight: 600;
    transition: color 0.2s;
  }
  .auth-link:hover { color: #c4b5fd; }
`;
