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
    <>
      <style jsx global>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(-45deg, #f093fb, #764ba2, #667eea, #5ee7df, #f093fb)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
        }}
      >
        {/* Animated floating orbs */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '400px',
            height: '400px',
            top: '-100px',
            left: '-100px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '300px',
            height: '300px',
            bottom: '-50px',
            right: '-50px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)',
            animation: 'float 10s ease-in-out infinite reverse',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '200px',
            height: '200px',
            top: '30%',
            right: '20%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)',
            animation: 'pulse-slow 6s ease-in-out infinite',
          }}
        />

        {/* Main card with glassmorphism */}
        <div
          className="relative w-full max-w-md"
          style={{
            animation: mounted ? 'fadeInUp 0.6s ease-out forwards' : 'none',
          }}
        >
          <div
            className="rounded-3xl p-8 md:p-10"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.1) inset',
            }}
          >
            {/* Logo/Icon */}
            <div className="flex justify-center mb-8">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #764ba2 50%, #667eea 100%)',
                  boxShadow: '0 20px 40px -10px rgba(240, 147, 251, 0.5)',
                }}
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1
                className="text-4xl font-extrabold mb-3"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Create Account
              </h1>
              <p className="text-white/80 text-lg">
                Start your productivity journey
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(254,202,202,0.9) 0%, rgba(252,165,165,0.9) 100%)',
                    border: '1px solid rgba(248,113,113,0.5)',
                  }}
                >
                  <svg className="w-5 h-5 text-red-700 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-800 font-medium">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Name field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-white/90 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-800 placeholder-gray-400 transition-all duration-300 outline-none"
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '2px solid transparent',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      onFocus={(e) => {
                        e.target.style.border = '2px solid #f093fb';
                        e.target.style.boxShadow = '0 0 0 4px rgba(240, 147, 251, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.border = '2px solid transparent';
                        e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      }}
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-white/90 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-800 placeholder-gray-400 transition-all duration-300 outline-none"
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '2px solid transparent',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      onFocus={(e) => {
                        e.target.style.border = '2px solid #f093fb';
                        e.target.style.boxShadow = '0 0 0 4px rgba(240, 147, 251, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.border = '2px solid transparent';
                        e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      }}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-white/90 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-800 placeholder-gray-400 transition-all duration-300 outline-none"
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '2px solid transparent',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      onFocus={(e) => {
                        e.target.style.border = '2px solid #f093fb';
                        e.target.style.boxShadow = '0 0 0 4px rgba(240, 147, 251, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.border = '2px solid transparent';
                        e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      }}
                      placeholder="Min 8 characters"
                      minLength={8}
                    />
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl font-bold text-lg text-white relative overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-6"
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #764ba2 50%, #667eea 100%)',
                  backgroundSize: '200% 200%',
                  boxShadow: '0 10px 30px -5px rgba(240, 147, 251, 0.5)',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 15px 40px -5px rgba(240, 147, 251, 0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(240, 147, 251, 0.5)';
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div
                        className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
                        style={{ animation: 'spin 0.8s linear infinite' }}
                      />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-white/80">
                Already have an account?{" "}
                <a
                  href="/signin"
                  className="font-bold text-white hover:text-cyan-200 transition-colors underline underline-offset-2"
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>

          {/* Bottom tagline */}
          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm font-medium tracking-wide">
              🚀 Free Forever • No Credit Card Required 🚀
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
