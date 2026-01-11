/**
 * User signin page with premium UI.
 *
 * FR-004, FR-005
 */

"use client";

import { useState, useEffect } from "react";
import { authAPI, setAuthToken } from "@/lib/api";

export default function SigninPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.signin(formData);
      setAuthToken(response.token);
      window.location.href = "/tasks";
    } catch (err: any) {
      const errorMessage = err?.message || err?.toString() || "Sign in failed";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Cinematic content container */}
      <div
        className={`relative w-full max-w-md transition-all duration-700 ${mounted ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-8'}`}
      >
        <div className="neon-card rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-violet-500/10 blur-3xl" />

          {/* Header section */}
          <div className="text-center mb-10">
            <div className="inline-flex p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-6 group">
              <svg className="w-10 h-10 text-violet-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-3 gradient-text">
              Welcome Back
            </h1>
            <p className="text-slate-400 text-lg">
              Sign in to continue your journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-neon"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-neon"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-neon w-full justify-center h-14 mt-4"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-slate-400">
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              className="text-violet-400 font-bold hover:text-violet-300 hover:underline underline-offset-4 transition-all"
            >
              Create one
            </a>
          </p>
        </div>

        <p className="mt-8 text-center text-slate-500 text-sm font-medium tracking-widest uppercase">
          ✨ Secure • Private • Beautiful ✨
        </p>
      </div>
    </div>
  );
}
