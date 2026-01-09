/**
 * Tag manager component for CRUD operations on tags.
 */

"use client";

import { useState, useEffect } from "react";
import { tagsAPI } from "@/lib/api";
import { getUserIdFromToken } from "@/lib/auth";
import type { Tag, TagDetail } from "@/lib/types";
import { TagBadge } from "./TagBadge";

interface TagManagerProps {
  className?: string;
}

const TAG_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#6b7280",
];

export function TagManager({ className = "" }: TagManagerProps) {
  const [tags, setTags] = useState<TagDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<TagDetail | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const userId = getUserIdFromToken(token!);
      if (!userId) return;

      const data = await tagsAPI.list(userId, { withCounts: true });
      setTags(data);
    } catch (err: any) {
      setError(err.message || "Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim() || newTagName.length < 1 || newTagName.length > 50) {
      setError("Tag name must be between 1 and 50 characters");
      return;
    }

    setIsCreating(true);
    setError("");
    try {
      const token = localStorage.getItem("auth_token");
      const userId = getUserIdFromToken(token!);
      if (!userId) return;

      const newTag = await tagsAPI.create(userId, {
        name: newTagName.trim(),
        color: newTagColor,
      });

      setTags([...tags, { ...newTag, task_count: 0 }]);
      setNewTagName("");
      setNewTagColor(TAG_COLORS[0]);
    } catch (err: any) {
      setError(err.message || "Failed to create tag");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateTag = async (tagId: string) => {
    if (!editingTag) return;
    if (!editingTag.name.trim() || editingTag.name.length < 1 || editingTag.name.length > 50) {
      setError("Tag name must be between 1 and 50 characters");
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const userId = getUserIdFromToken(token!);
      if (!userId) return;

      const updatedTag = await tagsAPI.update(userId, tagId, {
        name: editingTag.name,
        color: editingTag.color,
      });

      setTags(tags.map((t) => (t.id === tagId ? { ...updatedTag, task_count: t.task_count } : t)));
      setEditingTag(null);
    } catch (err: any) {
      setError(err.message || "Failed to update tag");
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm("Are you sure you want to delete this tag? It will be removed from all tasks.")) {
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const userId = getUserIdFromToken(token!);
      if (!userId) return;

      await tagsAPI.delete(userId, tagId);
      setTags(tags.filter((t) => t.id !== tagId));
    } catch (err: any) {
      setError(err.message || "Failed to delete tag");
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Tags</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Create new tag */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Create New Tag</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Tag name (1-50 characters)"
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Color:</span>
            <div className="flex gap-1">
              {TAG_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewTagColor(color)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    newTagColor === color ? "scale-125 ring-2 ring-offset-1 ring-gray-400" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleCreateTag}
            disabled={isCreating || !newTagName.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      {/* Tag list */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading tags...</div>
      ) : tags.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No tags yet. Create your first tag above!
        </div>
      ) : (
        <div className="space-y-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {editingTag?.id === tag.id ? (
                // Edit mode
                <>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editingTag.name}
                      onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={50}
                    />
                    <div className="flex gap-1">
                      {TAG_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setEditingTag({ ...editingTag, color })}
                          className={`w-5 h-5 rounded-full transition-transform ${
                            editingTag.color === color ? "scale-125 ring-1 ring-offset-1 ring-gray-400" : ""
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdateTag(tag.id)}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                    title="Save"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setEditingTag(null)}
                    className="p-1.5 text-gray-500 hover:bg-gray-200 rounded"
                    title="Cancel"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              ) : (
                // View mode
                <>
                  <TagBadge tag={tag} size="md" />
                  <span className="text-sm text-gray-500">
                    {tag.task_count ?? 0} task{(tag.task_count ?? 0) !== 1 ? "s" : ""}
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={() => setEditingTag(tag)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
