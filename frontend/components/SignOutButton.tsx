/**
 * Sign out button with modern styling.
 */

"use client";

import { clearAuthToken } from "@/lib/api";

export default function SignOutButton() {
  const handleSignOut = () => {
    clearAuthToken();
    window.location.href = "/signin";
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        color: 'rgba(255, 255, 255, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        e.currentTarget.style.color = '#fca5a5';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
      }}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Sign Out
    </button>
  );
}
