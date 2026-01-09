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
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
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
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Status Filter */}
      <div ref={statusRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setIsStatusOpen(!isStatusOpen);
            setIsPriorityOpen(false);
            setIsTagsOpen(false);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
          {filters.status && filters.status !== "all" && (
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </button>

        {isStatusOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsStatusOpen(false)}
            />
            <div className="absolute left-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleStatusChange(option.value)}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    (filters.status || "all") === option.value
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {option.label}
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
          {filters.priority && filters.priority !== "all" && (
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </button>

        {isPriorityOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsPriorityOpen(false)}
            />
            <div className="absolute left-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handlePriorityChange(option.value)}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                    (filters.priority || "all") === option.value
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {option.value !== "all" && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        option.value === "high"
                          ? "bg-red-500"
                          : option.value === "medium"
                          ? "bg-amber-500"
                          : "bg-green-500"
                      }`}
                    />
                  )}
                  {option.label}
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
          {filters.tag_ids && filters.tag_ids.length > 0 && (
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </button>

        {isTagsOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsTagsOpen(false)}
            />
            <div className="absolute left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 max-h-60 overflow-auto">
              {loading ? (
                <div className="px-4 py-2 text-sm text-gray-500">Loading tags...</div>
              ) : availableTags.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500">No tags available</div>
              ) : (
                availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleToggleTag(tag.id)}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                      filters.tag_ids?.includes(tag.id)
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        filters.tag_ids?.includes(tag.id)
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {filters.tag_ids?.includes(tag.id) && (
                        <svg
                          className="w-3 h-3 text-white"
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
        <div className="flex items-center gap-1 ml-2">
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
            <span className="text-sm text-gray-500">+{selectedTags.length - 3}</span>
          )}
        </div>
      )}

      {/* Clear filters button */}
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={handleClearAll}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
