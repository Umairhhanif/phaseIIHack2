/**
 * User signup page with premium UI.
 *
 * FR-001, FR-002, FR-003
 */

"use client";

import { useState, useEffect } from "react";
import { authAPI, setAuthToken } from "@/lib/api";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        setError("Name is required");
        setLoading(false);
        return;
      }

      if (!isValidEmail(formData.email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        setLoading(false);
        return;
      }

      const response = await authAPI.signup(formData);
      setAuthToken(response.token);
      window.location.href = "/tasks";
    } catch (err: any) {
      let errorMessage = err?.message || err?.toString() || "Signup failed";

      if (err?.details?.validation_errors) {
        const validationMsgs = err.details.validation_errors.map(
          (ve: any) => `${ve.field}: ${ve.message}`
        );
        errorMessage = validationMsgs.join(". ");
      }

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
        <div className="neon-card rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden ring-1 ring-white/10 shadow-2xl bg-slate-900/90 backdrop-blur-3xl">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[64px]" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/10 blur-[64px]" />

          {/* Header section */}
          <div className="text-center mb-10">
            <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6 group shadow-lg shadow-indigo-500/10">
              <svg className="w-10 h-10 text-indigo-400 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-3 text-white drop-shadow-lg">
              Create Account
            </h1>
            <p className="text-slate-400 text-lg font-medium">
              Start your productivity journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm font-semibold animate-shake shadow-lg shadow-red-500/10">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2 group">
                <label className="text-sm font-bold text-slate-300 ml-1 group-focus-within:text-indigo-400 transition-colors">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-neon bg-slate-950/50 border-slate-700/50 focus:bg-slate-900/80 hover:border-slate-600 text-base"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2 group">
                <label className="text-sm font-bold text-slate-300 ml-1 group-focus-within:text-indigo-400 transition-colors">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-neon bg-slate-950/50 border-slate-700/50 focus:bg-slate-900/80 hover:border-slate-600 text-base"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2 group">
                <label className="text-sm font-bold text-slate-300 ml-1 group-focus-within:text-indigo-400 transition-colors">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-neon bg-slate-950/50 border-slate-700/50 focus:bg-slate-900/80 hover:border-slate-600 text-base"
                  placeholder="••••••••"
                  minLength={8}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-neon w-full justify-center h-14 mt-6 text-base font-bold tracking-wide shadow-lg shadow-indigo-500/25"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-slate-400 font-medium">
            Already have an account?{" "}
            <a
              href="/signin"
              className="text-indigo-400 font-bold hover:text-indigo-300 hover:underline underline-offset-4 transition-all"
            >
              Sign in
            </a>
          </p>
        </div>

        <p className="mt-8 text-center text-slate-500 text-xs font-bold tracking-[0.2em] uppercase opacity-60">
          🚀 Free Forever • No Credit Card
        </p>
      </div>
    </div>
  );
}
