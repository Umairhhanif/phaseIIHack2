/**
 * Sign out button with neon styling.
 */

"use client";

import { LogOut } from "lucide-react";
import { clearAuthToken } from "@/lib/api";

export default function SignOutButton() {
  const handleSignOut = () => {
    clearAuthToken();
    window.location.href = "/signin";
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 bg-slate-800/40 border border-slate-700/50 text-slate-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300 group"
    >
      <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      <span>Sign Out</span>
    </button>
  );
}
