/**
 * Priority selector dropdown component with beautiful animations.
 */

"use client";

import { useState } from "react";
import type { Priority } from "@/lib/types";

interface PrioritySelectProps {
  value: Priority | null;
  onChange: (priority: Priority) => void;
  disabled?: boolean;
  className?: string;
}

const PRIORITY_CONFIG: Record<
  string,
  { label: string; textClass: string; glowClass: string; icon: string }
> = {
  HIGH: {
    label: "Critical",
    textClass: "text-red-400",
    glowClass: "shadow-[0_0_12px_rgba(239,68,68,0.4)] bg-red-500",
    icon: "🔥",
  },
  MEDIUM: {
    label: "Standard",
    textClass: "text-amber-400",
    glowClass: "shadow-[0_0_12px_rgba(245,158,11,0.4)] bg-amber-500",
    icon: "⚡",
  },
  LOW: {
    label: "Backlog",
    textClass: "text-emerald-400",
    glowClass: "shadow-[0_0_12px_rgba(16,185,129,0.4)] bg-emerald-500",
    icon: "🌿",
  },
};

// Normalize priority to uppercase
const normalizePriority = (p: Priority | null): string => {
  if (!p) return "MEDIUM";
  return p.toUpperCase();
};

export function PrioritySelect({
  value,
  onChange,
  disabled = false,
  className = "",
}: PrioritySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredPriority, setHoveredPriority] = useState<string | null>(null);

  const currentPriority = normalizePriority(value);
  const config = PRIORITY_CONFIG[currentPriority] || PRIORITY_CONFIG.MEDIUM;

  const priorities: Priority[] = ["HIGH", "MEDIUM", "LOW"];

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-300 group disabled:opacity-50`}
      >
        <div className={`w-2 h-2 rounded-full ${config.glowClass}`} />
        <span className={`text-xs font-black uppercase tracking-widest ${config.textClass}`}>
          {currentPriority}
        </span>
        {!disabled && (
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-300 text-slate-500 group-hover:text-indigo-400 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </button>

      {/* Premium Neon Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute left-0 mt-3 w-44 neon-card !rounded-2xl p-2 z-[70] animate-slide-up"
          >
            {priorities.map((priority) => {
              const pConfig = PRIORITY_CONFIG[priority];
              const isSelected = priority === currentPriority;

              return (
                <button
                  key={priority}
                  type="button"
                  onClick={() => {
                    onChange(priority);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all duration-200 mb-1 last:mb-0 ${isSelected
                    ? 'bg-indigo-500/10 text-white'
                    : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                    }`}
                >
                  <div className={`w-2 h-2 rounded-full ${pConfig.glowClass}`} />
                  {priority}
                  {isSelected && (
                    <div className="ml-auto w-1 h-4 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
