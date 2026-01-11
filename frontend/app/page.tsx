/**
 * Landing page - redirects authenticated users to /tasks, unauthenticated to /signin.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, isTokenExpired } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = getAuthToken();

    if (token && !isTokenExpired(token)) {
      // Authenticated user - redirect to tasks
      router.push("/tasks");
    } else {
      // Unauthenticated user - redirect to signin
      router.push("/signin");
    }
  }, [router, mounted]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className={`neon-card p-12 rounded-[2.5rem] text-center transition-all duration-700 ${mounted ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-8'}`}>
        {/* Animated neon spinner */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{
              background: 'conic-gradient(from 0deg, transparent, #6366f1, #8b5cf6, transparent)',
              filter: 'blur(4px)',
            }}
          />
          <div className="absolute inset-[3px] rounded-full bg-slate-900" />
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-violet-500 animate-spin"
            style={{ animationDuration: '1s' }}
          />
          {/* Center glow dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-violet-400 animate-pulse shadow-[0_0_20px_rgba(139,92,246,0.8)]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
          Initializing<span className="text-gradient">...</span>
        </h1>
        <p className="text-slate-400 font-medium">
          Redirecting you to your workspace
        </p>

        {/* Decorative elements */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
