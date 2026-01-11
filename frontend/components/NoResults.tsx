/**
 * No results empty state component with dark neon theme.
 */

"use client";

import { Search, X } from "lucide-react";

interface NoResultsProps {
  title?: string;
  message?: string;
  searchQuery?: string;
  onClear?: () => void;
}

export function NoResults({
  title = "No tasks found",
  message = "Try adjusting your search or filters",
  searchQuery,
  onClear,
}: NoResultsProps) {
  return (
    <div className="neon-card rounded-[2rem] p-12 text-center">
      {/* Empty state illustration */}
      <div
        className="w-28 h-28 mx-auto mb-8 rounded-3xl flex items-center justify-center relative"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)',
        }}
      >
        <Search className="w-12 h-12 text-violet-400" />
        <span className="absolute inset-0 rounded-3xl animate-pulse bg-violet-500/10" />
      </div>

      <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
        {title}
      </h3>
      <p className="text-slate-400 mb-8 text-lg max-w-sm mx-auto">
        {searchQuery
          ? `No tasks match "${searchQuery}"`
          : message}
      </p>

      {onClear && (
        <button
          onClick={onClear}
          className="btn-neon inline-flex items-center gap-3 !px-8 !py-4 !text-lg"
        >
          <X className="w-5 h-5" />
          Clear Filters
        </button>
      )}
    </div>
  );
}
