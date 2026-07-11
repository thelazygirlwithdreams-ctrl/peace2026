import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logoImg from "@/assets/logo.jpg";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

// Map username → internal Supabase email
const usernameToEmail = (u: string) =>
  `${u.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "")}@peace2026.app`;

// Strengthen the password for Supabase's rules
const derivePassword = (p: string) => `${p}#Peace2026-Admin!`;

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const email = usernameToEmail(username);
    const pwd = derivePassword(password);

    // Step 1: Try to sign in with existing credentials
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: pwd });

    if (!signInError) {
      // Signed in successfully — claim admin role if not already
      await supabase.rpc("claim_first_admin" as never);
      toast.success("Signed in successfully!");
      setLoading(false);
      navigate({ to: "/admin/dashboard" });
      return;
    }

    // Step 2: Handle sign in errors
    if (signInError) {
      const msg = signInError.message.toLowerCase();

      // Handle network errors
      if (msg.includes("failed to fetch")) {
        toast.error("Network error: Could not connect to Supabase. Please check your internet or disable adblockers.");
        setLoading(false);
        return;
      }

      // Handle invalid credentials (wrong password or user doesn't exist)
      if (msg.includes("invalid login credentials")) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password: pwd,
          options: { emailRedirectTo: `${window.location.origin}/admin/dashboard` },
        });

        // If user exists but sign up fails, it means they used the wrong password
        if (signUpError && signUpError.message.toLowerCase().includes("already registered")) {
          toast.error("Account already exists, but the password was incorrect. If locked out, delete the user in Supabase Auth dashboard.");
          setLoading(false);
          return;
        }

        if (signUpError) {
          toast.error(`Sign up failed: ${signUpError.message}`);
          setLoading(false);
          return;
        }

        // Account created — try to sign in immediately
        const { error: signIn2Error } = await supabase.auth.signInWithPassword({ email, password: pwd });
        if (!signIn2Error) {
          await supabase.rpc("claim_first_admin" as never);
          toast.success("Admin account created! Welcome.");
          setLoading(false);
          navigate({ to: "/admin/dashboard" });
          return;
        }

        toast.success("Account created! Check your email to confirm, then sign in.");
        setLoading(false);
        return;
      }

      // Any other error
      toast.error(signInError.message || "Login failed. Please try again.");
      setLoading(false);
      return;
    }
  };

  const cls =
    "w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 backdrop-blur";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      }}
    >
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <Link to="/" className="text-xs text-white/50 hover:text-amber-300 transition-colors">← Back to site</Link>

          {/* Logo + Title */}
          <div className="mt-5 flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-400/25 blur-xl scale-150" />
              <img
                src={logoImg}
                alt="ACC Logo"
                className="relative h-20 w-20 rounded-full object-contain shadow-lg"
              />
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Lock className="h-4 w-4 text-amber-400" />
                <h1 className="font-display text-xl font-bold text-white">Admin Login</h1>
              </div>
              <p className="text-xs text-white/50">PEACE 2026 — Registrations Dashboard</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-amber-300/80">
                Username
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                className={cls}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-amber-300/80">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
                className={cls}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="mt-2 w-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-5 py-3 text-sm font-bold text-gray-900 shadow-[0_4px_20px_rgba(251,191,36,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(251,191,36,0.5)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Sign in to Dashboard"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
