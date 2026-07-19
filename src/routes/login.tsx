import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
      else setChecking(false);
    });
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-orange-500/20 mx-auto mb-4">
            IJ
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Injoy <span className="text-orange-400">Admin</span>
          </h1>
          <p className="text-xs text-white/30 mt-1 font-mono uppercase tracking-widest">
            Content Manager
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/25 font-mono mb-1 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-sm text-white focus:border-orange-500/50 focus:ring-orange-500/20 focus:outline-none"
              placeholder="admin@injoy.com"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/25 font-mono mb-1 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-sm text-white focus:border-orange-500/50 focus:ring-orange-500/20 focus:outline-none"
              placeholder="••••••"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-700 disabled:text-zinc-400 text-black font-bold py-2.5 text-xs uppercase tracking-[0.3em] transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
