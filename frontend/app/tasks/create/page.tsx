/**
 * Task creation page.
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 animated-bg" />

      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
            top: "-10%",
            right: "-10%",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-72 h-72 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
            bottom: "10%",
            left: "-5%",
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute w-48 h-48 rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)",
            top: "40%",
            right: "20%",
            animation: "float 7s ease-in-out infinite 1s",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div
            className={`transform transition-all duration-700 ${mounted ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"}`}
          >
            <button
              onClick={() => router.push("/tasks")}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4 group"
            >
              <svg
                className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="text-sm font-medium">Back to Tasks</span>
            </button>
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                <svg
                  className="w-7 h-7 text-white"
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
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Create New Task
                </h1>
                <p className="text-white/70 text-sm mt-1">
                  Add a new task to your workflow
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <div
          className={`transform transition-all duration-700 delay-200 ${mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
        >
          {/* Glass card */}
          <div
            className="rounded-3xl p-8 shadow-2xl"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error message with animation */}
              {error && (
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl animate-fade-in-up"
                  style={{
                    background:
                      "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                    border: "1px solid #fca5a5",
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-red-600"
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
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
              )}

              {/* Title field with floating label effect */}
              <div className="relative">
                <label
                  htmlFor="title"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${focusedField === "title" || formData.title
                    ? "-top-2.5 text-xs font-semibold px-2 bg-white rounded"
                    : "top-4 text-base"
                    }`}
                  style={{
                    color:
                      focusedField === "title"
                        ? "#7c3aed"
                        : formData.title
                          ? "#6b7280"
                          : "#9ca3af",
                  }}
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  maxLength={200}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  onFocus={() => setFocusedField("title")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-4 py-4 rounded-xl text-gray-800 transition-all duration-300 outline-none"
                  style={{
                    border:
                      focusedField === "title"
                        ? "2px solid #7c3aed"
                        : "2px solid #e5e7eb",
                    boxShadow:
                      focusedField === "title"
                        ? "0 0 0 4px rgba(124, 58, 237, 0.1)"
                        : "none",
                  }}
                />
                <div className="flex justify-between mt-2 px-1">
                  <span className="text-xs text-gray-400">
                    What do you need to accomplish?
                  </span>
                  <span
                    className={`text-xs transition-colors ${formData.title.length > 180 ? "text-amber-500" : "text-gray-400"}`}
                  >
                    {formData.title.length}/200
                  </span>
                </div>
              </div>

              {/* Description field */}
              <div className="relative">
                <label
                  htmlFor="description"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${focusedField === "description" || formData.description
                    ? "-top-2.5 text-xs font-semibold px-2 bg-white rounded"
                    : "top-4 text-base"
                    }`}
                  style={{
                    color:
                      focusedField === "description"
                        ? "#7c3aed"
                        : formData.description
                          ? "#6b7280"
                          : "#9ca3af",
                  }}
                >
                  Description{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  maxLength={1000}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  onFocus={() => setFocusedField("description")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-4 py-4 rounded-xl text-gray-800 transition-all duration-300 outline-none resize-none"
                  style={{
                    border:
                      focusedField === "description"
                        ? "2px solid #7c3aed"
                        : "2px solid #e5e7eb",
                    boxShadow:
                      focusedField === "description"
                        ? "0 0 0 4px rgba(124, 58, 237, 0.1)"
                        : "none",
                  }}
                />
                <div className="flex justify-end mt-2 px-1">
                  <span
                    className={`text-xs transition-colors ${formData.description.length > 900 ? "text-amber-500" : "text-gray-400"}`}
                  >
                    {formData.description.length}/1000
                  </span>
                </div>
              </div>

              {/* Priority and Tags in a grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Priority */}
                <div
                  className="p-4 rounded-xl transition-all duration-300"
                  style={{
                    background:
                      "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      }}
                    >
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                        />
                      </svg>
                    </span>
                    Priority Level
                  </label>
                  <PrioritySelect value={priority} onChange={setPriority} />
                </div>

                {/* Quick tips */}
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3.5 h-3.5 text-blue-600"
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
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-blue-800 mb-1">
                        Pro Tip
                      </p>
                      <p className="text-xs text-blue-700/80 leading-relaxed">
                        Use specific titles and organize with tags for better
                        productivity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags section with enhanced styling */}
              <div
                className="p-5 rounded-xl transition-all duration-300"
                style={{
                  background:
                    "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
                  border: "1px solid #e9d5ff",
                }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                    }}
                  >
                    <svg
                      className="w-3.5 h-3.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
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
                  className="flex-1 relative group overflow-hidden px-6 py-4 rounded-xl text-white font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:transform-none disabled:cursor-not-allowed"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 10px 30px -10px rgba(102, 126, 234, 0.5)",
                  }}
                >
                  {/* Shimmer effect */}
                  <span
                    className="absolute inset-0 w-full h-full"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                      transform: "translateX(-100%)",
                      animation: loading ? "none" : "shimmer 2s infinite",
                    }}
                  />
                  <span className="relative flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
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
                        Creating Task...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
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
                        Create Task
                      </>
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/tasks")}
                  className="px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: "white",
                    border: "2px solid #e5e7eb",
                    color: "#6b7280",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#d1d5db";
                    e.currentTarget.style.background = "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.background = "white";
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Bottom decorative text */}
          <p className="text-center text-white/50 text-sm mt-6">
            Press <kbd className="px-2 py-1 bg-white/10 rounded text-white/70">Enter</kbd> in title to quick create
          </p>
        </div>
      </main>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
