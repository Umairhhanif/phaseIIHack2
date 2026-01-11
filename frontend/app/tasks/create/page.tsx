/**
 * Task creation page with dark neon theme.
 *
 * FR-007, FR-008
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tasksAPI } from "@/lib/api";
import { getUserIdFromToken, getAuthToken } from "@/lib/auth";
import type { Priority } from "@/lib/types";
import { PrioritySelect } from "@/components/PrioritySelect";
import { TagInput } from "@/components/TagInput";
import type { Tag, TagSummary } from "@/lib/types";
import { ArrowLeft, Plus, Sparkles, Flag, Tag as TagIcon, Info } from "lucide-react";

export default function CreateTaskPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [selectedTags, setSelectedTags] = useState<(Tag | TagSummary)[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = getAuthToken();
      const userId = getUserIdFromToken(token!);
      if (!userId) {
        router.push("/signin");
        return;
      }

      // Validate title length
      if (formData.title.trim().length < 1 || formData.title.length > 200) {
        setError("Title must be between 1 and 200 characters");
        setLoading(false);
        return;
      }

      // Create task
      await tasksAPI.create(userId, {
        title: formData.title,
        description: formData.description || null,
        priority,
        tag_ids: selectedTags.map((t) => t.id),
      });

      // Redirect to task list
      router.push("/tasks");
    } catch (err: any) {
      setError(err.message || "Failed to create task");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="sticky top-0 z-50 neon-card !rounded-none !border-x-0 !border-t-0 p-4">
        <div className="max-w-4xl mx-auto px-4">
          <div
            className={`transform transition-all duration-700 ${mounted ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"}`}
          >
            <button
              onClick={() => router.push("/tasks")}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group"
            >
              <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Tasks</span>
            </button>
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)',
                }}
              >
                <Plus className="w-7 h-7 text-violet-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Create New Task
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Add a new task to your workflow
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div
          className={`transform transition-all duration-700 delay-200 ${mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
        >
          {/* Dark glass card */}
          <div className="neon-card rounded-[2rem] p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error message with animation */}
              {error && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 animate-shake">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <span className="text-red-300 font-medium">{error}</span>
                </div>
              )}

              {/* Title field */}
              <div className="space-y-2">
                <label className="label-neon flex items-center gap-2">
                  <span>Title</span>
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  onFocus={() => setFocusedField("title")}
                  onBlur={() => setFocusedField(null)}
                  className="input-neon"
                  placeholder="What do you need to accomplish?"
                  style={{
                    borderColor: focusedField === "title" ? 'rgba(139, 92, 246, 0.6)' : undefined,
                    boxShadow: focusedField === "title" ? '0 0 20px rgba(139, 92, 246, 0.2)' : undefined,
                  }}
                />
                <div className="flex justify-end mt-1 px-1">
                  <span
                    className={`text-xs transition-colors ${formData.title.length > 180 ? "text-amber-400" : "text-slate-500"}`}
                  >
                    {formData.title.length}/200
                  </span>
                </div>
              </div>

              {/* Description field */}
              <div className="space-y-2">
                <label className="label-neon flex items-center gap-2">
                  <span>Description</span>
                  <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  onFocus={() => setFocusedField("description")}
                  onBlur={() => setFocusedField(null)}
                  className="input-neon resize-none"
                  placeholder="Add more details about this task..."
                  style={{
                    borderColor: focusedField === "description" ? 'rgba(139, 92, 246, 0.6)' : undefined,
                    boxShadow: focusedField === "description" ? '0 0 20px rgba(139, 92, 246, 0.2)' : undefined,
                  }}
                />
                <div className="flex justify-end mt-1 px-1">
                  <span
                    className={`text-xs transition-colors ${formData.description.length > 900 ? "text-amber-400" : "text-slate-500"}`}
                  >
                    {formData.description.length}/1000
                  </span>
                </div>
              </div>

              {/* Priority and Tips in a grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Priority */}
                <div className="card-section">
                  <label className="label-neon flex items-center gap-2 mb-3">
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      }}
                    >
                      <Flag className="w-3.5 h-3.5 text-white" />
                    </span>
                    Priority Level
                  </label>
                  <PrioritySelect value={priority} onChange={setPriority} />
                </div>

                {/* Quick tips */}
                <div className="card-highlight">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Info className="w-3.5 h-3.5 text-cyan-400" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-cyan-300 mb-1">
                        Pro Tip
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Use specific titles and organize with tags for better
                        productivity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags section */}
              <div className="card-highlight">
                <label className="label-neon flex items-center gap-2 mb-3">
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                    }}
                  >
                    <TagIcon className="w-3.5 h-3.5 text-white" />
                  </span>
                  Tags & Categories
                </label>
                <TagInput
                  selectedTags={selectedTags}
                  onChange={setSelectedTags}
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-neon flex-1 justify-center h-14 relative overflow-hidden group"
                >
                  {/* Shimmer effect */}
                  <span
                    className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                      transform: 'translateX(-100%)',
                      animation: loading ? 'none' : 'shimmer 2s infinite',
                    }}
                  />
                  <span className="relative flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating Task...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Create Task</span>
                      </>
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/tasks")}
                  className="btn-neon-secondary px-6 py-4"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Bottom hint */}
          <p className="text-center text-slate-500 text-sm mt-6 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            Press <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono text-xs">Enter</kbd> in title to quick create
          </p>
        </div>
      </main>
    </div>
  );
}
