/**
 * Sort dropdown component for sorting tasks by various criteria.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import type { TaskSort } from "@/lib/types";

interface SortDropdownProps {
  value: TaskSort;
  onChange: (sort: TaskSort) => void;
  className?: string;
}

const SORT_OPTIONS: { value: TaskSort; label: string; icon: string }[] = [
  { value: "created_desc", label: "Newest First", icon: "📅" },
  { value: "created_asc", label: "Oldest First", icon: "📆" },
  { value: "due_date_asc", label: "Due Date (Soonest)", icon: "⏰" },
  { value: "due_date_desc", label: "Due Date (Latest)", icon: "📆" },
  { value: "priority", label: "Priority (High to Low)", icon: "🔺" },
  { value: "priority_reverse", label: "Priority (Low to High)", icon: "🔻" },
  { value: "alpha", label: "Alphabetical (A-Z)", icon: "🔤" },
  { value: "alpha_reverse", label: "Alphabetical (Z-A)", icon: "🔡" },
];

export function SortDropdown({ value, onChange, className = "" }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const currentOption = SORT_OPTIONS.find((o) => o.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (sort: TaskSort) => {
    onChange(sort);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-violet-500/50 text-slate-300 font-medium transition-all duration-300 ${isOpen ? '!border-violet-500 bg-violet-500/10 text-violet-400' : ''
          }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
          />
        </svg>
        <span>{currentOption?.label || "Sort"}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 neon-card !rounded-2xl p-2 z-[60] animate-slide-up">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-4 py-2.5 rounded-xl text-left text-sm font-bold flex items-center gap-3 transition-all duration-200 mb-1 last:mb-0 ${value === option.value
                    ? "bg-violet-500/10 text-white"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
              >
                <span className="text-lg opacity-80">{option.icon}</span>
                <span>{option.label}</span>
                {value === option.value && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
