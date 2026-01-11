/**
 * Task edit page with beautiful modern UI.
 *
 * FR-012
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { tasksAPI } from "@/lib/api";
import { getUserIdFromToken, getAuthToken } from "@/lib/auth";
import type { Priority } from "@/lib/types";
import { PrioritySelect } from "@/components/PrioritySelect";
import { TagInput } from "@/components/TagInput";
import type { Tag, TagSummary } from "@/lib/types";
import { ArrowLeft, Save, X, Sparkles } from "lucide-react";

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [selectedTags, setSelectedTags] = useState<(Tag | TagSummary)[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadTask = async () => {
      try {
        const token = getAuthToken();
        const userId = getUserIdFromToken(token!);
        if (!userId) {
          router.push("/signin");
          return;
        }

        // Fetch task
        const task = await tasksAPI.get(userId, taskId);
        setFormData({
          title: task.title,
          description: task.description || "",
        });
        setPriority(task.priority || "MEDIUM");
        setSelectedTags(task.tags || []);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to load task");
        setLoading(false);
      }
    };

    loadTask();
  }, [taskId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

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
        setSaving(false);
        return;
      }

      // Update task
      await tasksAPI.update(userId, taskId, {
        title: formData.title,
        description: formData.description || null,
        priority,
        tag_ids: selectedTags.map((t) => t.id),
      });

      // Redirect to task list
      router.push("/tasks");
    } catch (err: any) {
      setError(err.message || "Failed to update task");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
        <div className="glass-card p-8 rounded-3xl">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-white font-medium">Loading task...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-400/20 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push("/tasks")}
            className="group flex items-center gap-2 text-white/90 hover:text-white transition-all duration-300 mb-6"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back to Tasks</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                Edit Task
              </h1>
              <p className="text-white/80 mt-1">Update your task details</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-3xl p-8 shadow-2xl animate-fade-in-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 backdrop-blur-sm border-2 border-red-500/30 text-red-100 px-6 py-4 rounded-2xl flex items-start gap-3 animate-shake">
                  <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {/* Title Input */}
              <div className="space-y-3">
                <label htmlFor="title" className="block text-sm font-semibold text-white/90">
                  Title <span className="text-pink-300">*</span>
                </label>
                <div className="relative group">
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    maxLength={200}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300 group-hover:border-white/30"
                    placeholder="What do you need to accomplish?"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                    {formData.title.length}/200
                  </div>
                </div>
              </div>

              {/* Description Textarea */}
              <div className="space-y-3">
                <label htmlFor="description" className="block text-sm font-semibold text-white/90">
                  Description <span className="text-white/50 font-normal">(Optional)</span>
                </label>
                <div className="relative group">
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    maxLength={1000}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300 resize-none group-hover:border-white/30"
                    placeholder="Add any additional details or notes..."
                  />
                  <div className="absolute right-4 bottom-4 text-white/40 text-sm">
                    {formData.description.length}/1000
                  </div>
                </div>
              </div>

              {/* Priority Select */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-white/90">
                  Priority Level
                </label>
                <PrioritySelect value={priority} onChange={setPriority} />
              </div>

              {/* Tag Input */}
              <TagInput selectedTags={selectedTags} onChange={setSelectedTags} />

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center justify-center gap-2">
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/tasks")}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Pro Tip */}
          <div className="mt-6 glass-card rounded-2xl p-6 animate-fade-in-up animation-delay-200">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Sparkles className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Pro Tip</h3>
                <p className="text-white/70 text-sm">
                  Use specific titles and organize with tags for better productivity.
                  Set priorities to focus on what matters most!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}} />
    </div>
  );
}
