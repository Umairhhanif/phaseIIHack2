/**
 * Tag input component with autocomplete - Dark neon theme.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Search, Info } from "lucide-react";
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
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[9].color); // Purple default
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
        setSuggestions(unselected.slice(0, 5));
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
          background: 'rgba(0, 0, 0, 0.2)',
          border: isFocused ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid rgba(99, 102, 241, 0.2)',
          boxShadow: isFocused
            ? '0 0 20px rgba(139, 92, 246, 0.2)'
            : 'none',
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
            className="flex-1 outline-none text-sm bg-transparent min-w-[100px] text-white placeholder-slate-500"
          />
        </div>
      </div>

      {/* Color picker row */}
      <div className="flex items-center gap-3 mt-3 px-1">
        <span className="text-xs font-medium text-slate-500">New tag color:</span>
        <div className="flex gap-1.5">
          {TAG_COLORS.map(({ color, name }) => (
            <button
              key={color}
              type="button"
              onClick={() => setNewTagColor(color)}
              title={name}
              className="relative w-5 h-5 rounded-full transition-all duration-200 hover:scale-110"
              style={{
                backgroundColor: color,
                boxShadow:
                  newTagColor === color
                    ? `0 0 0 2px #1e293b, 0 0 0 3px ${color}, 0 0 15px ${color}`
                    : `0 0 8px ${color}40`,
                transform: newTagColor === color ? "scale(1.2)" : "scale(1)",
              }}
            >
              {newTagColor === color && (
                <svg
                  className="absolute inset-0 m-auto w-2.5 h-2.5 text-white"
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
          <div className="absolute left-0 right-0 mt-2 neon-card !rounded-2xl py-2 z-20 max-h-60 overflow-auto animate-slide-up">
            {/* Create new tag option */}
            {query.trim() && query.length >= 1 && query.length <= 50 && (
              <button
                type="button"
                onClick={handleCreateTag}
                disabled={isCreating}
                className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-slate-800/50 transition-all duration-200 group"
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                  style={{
                    backgroundColor: newTagColor,
                    boxShadow: `0 0 10px ${newTagColor}60`
                  }}
                >
                  <Plus className="w-3 h-3 text-white" />
                </span>
                <span>
                  <span className="text-slate-400">Create </span>
                  <span
                    className="font-semibold"
                    style={{ color: newTagColor }}
                  >
                    "{query.trim()}"
                  </span>
                </span>
                <kbd className="ml-auto px-2 py-0.5 text-xs bg-slate-800 border border-slate-700 rounded text-slate-400">
                  Enter
                </kbd>
              </button>
            )}

            {/* Divider */}
            {query.trim() && filteredSuggestions.length > 0 && (
              <div className="border-t border-slate-700/50 my-1" />
            )}

            {/* Matching tags */}
            {loading ? (
              <div className="px-4 py-3 text-sm text-slate-500 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-700 border-t-violet-500 rounded-full animate-spin" />
                Searching tags...
              </div>
            ) : filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((tag, index) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleSelectTag(tag)}
                  className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-slate-800/50 transition-all duration-200"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <TagBadge tag={tag} size="sm" />
                  {tag.task_count !== undefined && tag.task_count > 0 && (
                    <span className="text-xs text-slate-500 ml-auto px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-full">
                      {tag.task_count} task{tag.task_count !== 1 ? "s" : ""}
                    </span>
                  )}
                </button>
              ))
            ) : query.trim() ? null : (
              <div className="px-4 py-3 text-sm text-slate-500 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Type to search or create a new tag
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
