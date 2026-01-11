/**
 * Filter bar component for filtering tasks by status, priority, and tags.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import type { Priority, TagDetail, TaskFilters } from "@/lib/types";
import { tagsAPI } from "@/lib/api";
import { getUserIdFromToken } from "@/lib/auth";
import { TagBadge } from "./TagBadge";

interface FilterBarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  className?: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Tasks" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
] as const;

const PRIORITY_OPTIONS: { value: Priority | "all"; label: string }[] = [
  { value: "all", label: "All Priorities" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

export function FilterBar({ filters, onChange, className = "" }: FilterBarProps) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<TagDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const statusRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);

  // Load tags for filtering
  useEffect(() => {
    const loadTags = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const userId = getUserIdFromToken(token!);
        if (!userId) return;

        const tags = await tagsAPI.list(userId);
        setAvailableTags(tags);
      } catch (err) {
        console.error("Failed to load tags:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTags();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (statusRef.current && !statusRef.current.contains(target)) {
        setIsStatusOpen(false);
      }
      if (priorityRef.current && !priorityRef.current.contains(target)) {
        setIsPriorityOpen(false);
      }
      if (tagsRef.current && !tagsRef.current.contains(target)) {
        setIsTagsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeFilterCount =
    (filters.status && filters.status !== "all" ? 1 : 0) +
    (filters.priority && filters.priority !== "all" ? 1 : 0) +
    (filters.tag_ids?.length || 0);

  const handleStatusChange = (status: TaskFilters["status"]) => {
    onChange({ ...filters, status });
    setIsStatusOpen(false);
  };

  const handlePriorityChange = (priority: Priority | "all") => {
    onChange({ ...filters, priority: priority === "all" ? undefined : priority });
    setIsPriorityOpen(false);
  };

  const handleToggleTag = (tagId: string) => {
    const currentTags = filters.tag_ids || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((id) => id !== tagId)
      : [...currentTags, tagId];
    onChange({ ...filters, tag_ids: newTags.length > 0 ? newTags : undefined });
  };

  const handleClearAll = () => {
    onChange({
      search: filters.search,
      status: undefined,
      priority: undefined,
      tag_ids: undefined,
    });
  };

  const getStatusLabel = () => {
    const option = STATUS_OPTIONS.find((o) => o.value === (filters.status || "all"));
    return option?.label || "All Tasks";
  };

  const getPriorityLabel = () => {
    const option = PRIORITY_OPTIONS.find(
      (o) => o.value === (filters.priority || "all")
    );
    return option?.label || "All Priorities";
  };

  const selectedTags = availableTags.filter((t) =>
    filters.tag_ids?.includes(t.id)
  );

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* Status Filter */}
      <div ref={statusRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setIsStatusOpen(!isStatusOpen);
            setIsPriorityOpen(false);
            setIsTagsOpen(false);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/50 text-slate-300 font-medium transition-all duration-300 ${filters.status && filters.status !== "all" ? '!border-indigo-500 bg-indigo-500/10 text-indigo-400' : ''
            }`}
        >
          <span>Status</span>
          <svg
            className={`w-4 h-4 transition-transform ${isStatusOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isStatusOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsStatusOpen(false)}
            />
            <div className="absolute left-0 mt-2 w-44 neon-card !rounded-2xl p-2 z-[60] animate-slide-up">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleStatusChange(option.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-left text-sm font-bold flex items-center justify-between transition-all duration-200 mb-1 last:mb-0 ${(filters.status || "all") === option.value
                      ? "bg-indigo-500/10 text-white"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    }`}
                >
                  {option.label}
                  {(filters.status || "all") === option.value && (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Priority Filter */}
      <div ref={priorityRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setIsPriorityOpen(!isPriorityOpen);
            setIsStatusOpen(false);
            setIsTagsOpen(false);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-amber-500/50 text-slate-300 font-medium transition-all duration-300 ${filters.priority && filters.priority !== "all" ? '!border-amber-500 bg-amber-500/10 text-amber-400' : ''
            }`}
        >
          <span>Priority</span>
          <svg
            className={`w-4 h-4 transition-transform ${isPriorityOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isPriorityOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsPriorityOpen(false)}
            />
            <div className="absolute left-0 mt-2 w-48 neon-card !rounded-2xl p-2 z-[60] animate-slide-up">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handlePriorityChange(option.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-left text-sm font-bold flex items-center gap-3 transition-all duration-200 mb-1 last:mb-0 ${(filters.priority || "all") === option.value
                      ? "bg-amber-500/10 text-white"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    }`}
                >
                  {option.value !== "all" && (
                    <span
                      className={`w-2 h-2 rounded-full ${option.value === "HIGH"
                        ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                        : option.value === "MEDIUM"
                          ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                          : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        }`}
                    />
                  )}
                  {option.label}
                  {(filters.priority || "all") === option.value && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Tags Filter */}
      <div ref={tagsRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setIsTagsOpen(!isTagsOpen);
            setIsStatusOpen(false);
            setIsPriorityOpen(false);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-emerald-500/50 text-slate-300 font-medium transition-all duration-300 ${filters.tag_ids && filters.tag_ids.length > 0 ? '!border-emerald-500 bg-emerald-500/10 text-emerald-400' : ''
            }`}
        >
          <span>Tags</span>
          <svg
            className={`w-4 h-4 transition-transform ${isTagsOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isTagsOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsTagsOpen(false)}
            />
            <div className="absolute left-0 mt-2 w-64 neon-card !rounded-2xl p-2 z-[60] max-h-60 overflow-auto animate-slide-up">
              {loading ? (
                <div className="px-4 py-3 text-sm text-slate-500 font-medium">Loading tags...</div>
              ) : availableTags.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500 font-medium">No tags available</div>
              ) : (
                availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleToggleTag(tag.id)}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-3 rounded-xl transition-all mb-1 last:mb-0 ${filters.tag_ids?.includes(tag.id)
                        ? "bg-slate-800"
                        : "hover:bg-slate-800/50"
                      }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${filters.tag_ids?.includes(tag.id)
                          ? "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                          : "border border-slate-600 bg-slate-800/50"
                        }`}
                    >
                      {filters.tag_ids?.includes(tag.id) && (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <TagBadge tag={tag} size="sm" />
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex items-center gap-2 ml-2">
          {selectedTags.slice(0, 3).map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              size="sm"
              removable
              onRemove={() => handleToggleTag(tag.id)}
            />
          ))}
          {selectedTags.length > 3 && (
            <span className="text-xs font-bold text-slate-500">+{selectedTags.length - 3}</span>
          )}
        </div>
      )}

      {/* Clear filters button */}
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={handleClearAll}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear ({activeFilterCount})
        </button>
      )}
    </div>
  );
}
