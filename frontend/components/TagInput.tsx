/**
 * Tag input component with autocomplete for selecting tags - Beautiful enhanced version.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import type { Tag, TagDetail, TagSummary } from "@/lib/types";
import { tagsAPI } from "@/lib/api";
import { getUserIdFromToken } from "@/lib/auth";
import { TagBadge } from "./TagBadge";

interface TagInputProps {
  selectedTags: (Tag | TagSummary)[];
  onChange: (tags: (Tag | TagSummary)[]) => void;
  className?: string;
}

const TAG_COLORS = [
  { color: "#ef4444", name: "Red" },
  { color: "#f97316", name: "Orange" },
  { color: "#f59e0b", name: "Amber" },
  { color: "#eab308", name: "Yellow" },
  { color: "#84cc16", name: "Lime" },
  { color: "#22c55e", name: "Green" },
  { color: "#14b8a6", name: "Teal" },
  { color: "#06b6d4", name: "Cyan" },
  { color: "#3b82f6", name: "Blue" },
  { color: "#8b5cf6", name: "Purple" },
  { color: "#ec4899", name: "Pink" },
];

export function TagInput({
  selectedTags,
  onChange,
  className = "",
}: TagInputProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<TagDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].color);
  const [isCreating, setIsCreating] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load user tags for autocomplete
  useEffect(() => {
    const loadTags = async () => {
      if (!isOpen || query.length < 1) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("auth_token");
        const userId = getUserIdFromToken(token!);
        if (!userId) return;

        const tags = await tagsAPI.list(userId, { search: query });
        // Filter out already selected tags
        const unselected = tags.filter(
          (t) => !selectedTags.some((st) => st.id === t.id)
        );
        setSuggestions(unselected.slice(5));
      } catch (err) {
        console.error("Failed to load tags:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTags();
  }, [query, isOpen, selectedTags]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTag = (tag: TagDetail) => {
    const tagObj: Tag = {
      id: tag.id,
      user_id: tag.user_id,
      name: tag.name,
      color: tag.color,
      created_at: tag.created_at,
    };
    onChange([...selectedTags, tagObj]);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemoveTag = (tagId: string) => {
    onChange(selectedTags.filter((t) => t.id !== tagId));
  };

  const handleCreateTag = async () => {
    if (!query.trim() || query.length < 1 || query.length > 50) return;

    setIsCreating(true);
    try {
      const token = localStorage.getItem("auth_token");
      const userId = getUserIdFromToken(token!);
      if (!userId) return;

      const newTag = await tagsAPI.create(userId, {
        name: query.trim(),
        color: newTagColor,
      });

      // Only add if not already present
      if (!selectedTags.some((t) => t.id === newTag.id)) {
        onChange([...selectedTags, newTag]);
      }
      setQuery("");
      setIsOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to create tag");
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();
      // Check if exact match exists in suggestions
      const exactMatch = suggestions.find(
        (s) => s.name.toLowerCase() === query.toLowerCase()
      );
      if (exactMatch) {
        handleSelectTag(exactMatch);
      } else {
        handleCreateTag();
      }
    } else if (e.key === "Backspace" && !query && selectedTags.length > 0) {
      handleRemoveTag(selectedTags[selectedTags.length - 1].id);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (s) => !selectedTags.some((st) => st.id === s.id)
  );

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Selected tags & input container */}
      <div
        className="flex flex-wrap gap-2 p-3 rounded-xl min-h-[56px] transition-all duration-300"
        style={{
          background: "white",
          border: isFocused ? "2px solid #a855f7" : "2px solid #e5e7eb",
          boxShadow: isFocused
            ? "0 0 0 4px rgba(168, 85, 247, 0.1)"
            : "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        {/* Selected tags with animation */}
        {selectedTags.map((tag, index) => (
          <div
            key={tag.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <TagBadge
              tag={tag}
              size="sm"
              removable
              onRemove={() => handleRemoveTag(tag.id)}
            />
          </div>
        ))}

        {/* Input */}
        <div className="flex-1 min-w-[150px] flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              setIsOpen(true);
              setIsFocused(true);
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedTags.length === 0 ? "Type to add or create tags..." : "Add more..."
            }
            className="flex-1 outline-none text-sm bg-transparent min-w-[100px] placeholder-gray-400"
          />
        </div>
      </div>

      {/* Color picker row */}
      <div className="flex items-center gap-3 mt-3 px-1">
        <span className="text-xs font-medium text-gray-500">New tag color:</span>
        <div className="flex gap-1.5">
          {TAG_COLORS.map(({ color, name }) => (
            <button
              key={color}
              type="button"
              onClick={() => setNewTagColor(color)}
              title={name}
              className="relative w-6 h-6 rounded-full transition-all duration-200 hover:scale-110"
              style={{
                backgroundColor: color,
                boxShadow:
                  newTagColor === color
                    ? `0 0 0 2px white, 0 0 0 4px ${color}`
                    : "0 2px 4px rgba(0,0,0,0.1)",
                transform: newTagColor === color ? "scale(1.15)" : "scale(1)",
              }}
            >
              {newTagColor === color && (
                <svg
                  className="absolute inset-0 m-auto w-3 h-3 text-white"
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
            </button>
          ))}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (query.trim() || filteredSuggestions.length > 0) && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-20 max-h-60 overflow-auto"
            style={{
              animation: "slideDown 0.2s ease-out",
            }}
          >
            {/* Create new tag option */}
            {query.trim() && query.length >= 1 && query.length <= 50 && (
              <button
                type="button"
                onClick={handleCreateTag}
                disabled={isCreating}
                className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-gray-50 transition-all duration-200 group"
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                  style={{ backgroundColor: newTagColor }}
                >
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </span>
                <span>
                  <span className="text-gray-600">Create </span>
                  <span
                    className="font-semibold"
                    style={{
                      background: `linear-gradient(135deg, ${newTagColor} 0%, ${newTagColor}dd 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    "{query.trim()}"
                  </span>
                </span>
                <kbd className="ml-auto px-2 py-0.5 text-xs bg-gray-100 rounded text-gray-500">
                  Enter
                </kbd>
              </button>
            )}

            {/* Divider */}
            {query.trim() && filteredSuggestions.length > 0 && (
              <div className="border-t border-gray-100 my-1" />
            )}

            {/* Matching tags */}
            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Searching tags...
              </div>
            ) : filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((tag, index) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleSelectTag(tag)}
                  className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-gray-50 transition-all duration-200"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <TagBadge tag={tag} size="sm" />
                  {tag.task_count !== undefined && tag.task_count > 0 && (
                    <span className="text-xs text-gray-400 ml-auto px-2 py-0.5 bg-gray-100 rounded-full">
                      {tag.task_count} task{tag.task_count !== 1 ? "s" : ""}
                    </span>
                  )}
                </button>
              ))
            ) : query.trim() ? null : (
              <div className="px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Type to search or create a new tag
              </div>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
