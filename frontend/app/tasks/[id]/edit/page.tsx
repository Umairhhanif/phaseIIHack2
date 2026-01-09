/**
 * Task edit page.
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

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [priority, setPriority] = useState<Priority>("medium");
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
        setPriority(task.priority || "medium");
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading task...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Edit Task</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                maxLength={200}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter task title (1-200 characters)"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                maxLength={1000}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add additional details (max 1000 characters)"
              />
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <div className="mt-1">
                <PrioritySelect
                  value={priority}
                  onChange={setPriority}
                />
              </div>
            </div>

            <TagInput
              selectedTags={selectedTags}
              onChange={setSelectedTags}
            />

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/tasks")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
