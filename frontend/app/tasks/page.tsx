/**
 * Task list page with premium UI and animations.
 *
 * FR-009, FR-010
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { tasksAPI, authAPI } from "@/lib/api";
import { getAuthToken, getUserIdFromToken } from "@/lib/auth";
import type { Task, TaskFilters, TaskSort } from "@/lib/types";
import TaskList from "@/components/TaskList";
import SignOutButton from "@/components/SignOutButton";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar } from "@/components/FilterBar";
import { SortDropdown } from "@/components/SortDropdown";
import { NoResults } from "@/components/NoResults";

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [mounted, setMounted] = useState(false);

  // Search, filter, and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<TaskFilters>({});
  const [sortBy, setSortBy] = useState<TaskSort>("created_desc");
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load user and initial tasks
  useEffect(() => {
    const initialize = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          router.push("/signin");
          return;
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
          router.push("/signin");
          return;
        }

        const user = await authAPI.me();
        setUserName(user.name);

        await reloadTasks();
      } catch (err: any) {
        setError(err.message || "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [router]); // Only run once on mount

  // Reload tasks when search, filter, or sort changes
  const reloadTasks = useCallback(async () => {
    setIsReloading(true);
    try {
      const token = getAuthToken();
      const userId = getUserIdFromToken(token!);
      if (!userId) return;

      const taskList = await tasksAPI.list(userId, filters, sortBy, 50, 0);
      // Apply client-side search if backend doesn't support it yet
      let filteredTasks = taskList.tasks;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredTasks = filteredTasks.filter(
          (t) =>
            t.title.toLowerCase().includes(query) ||
            (t.description && t.description.toLowerCase().includes(query))
        );
      }
      setTasks(filteredTasks);
    } catch (err: any) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setIsReloading(false);
    }
  }, [filters, sortBy, searchQuery]);

  useEffect(() => {
    if (mounted) {
      reloadTasks();
    }
  }, [mounted, reloadTasks]);

  // Listen for refresh events from the chatbot
  useEffect(() => {
    const handleRefresh = () => {
      console.log("Refreshing tasks due to external update...");
      reloadTasks();
    };

    window.addEventListener("tasks-updated", handleRefresh);
    return () => window.removeEventListener("tasks-updated", handleRefresh);
  }, [reloadTasks]);

  const handleToggle = async (taskId: string) => {
    try {
      const token = getAuthToken();
      const userId = getUserIdFromToken(token!);
      if (!userId) return;

      const updatedTask = await tasksAPI.toggle(userId, taskId);
      setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
    } catch (err: any) {
      alert(err.message || "Failed to toggle task");
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      const token = getAuthToken();
      const userId = getUserIdFromToken(token!);
      if (!userId) return;

      await tasksAPI.delete(userId, taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err: any) {
      alert(err.message || "Failed to delete task");
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="neon-card p-12 rounded-[2.5rem] text-center">
          <div className="w-16 h-16 mx-auto mb-6 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-300 text-xl font-medium tracking-wide">Synchronizing Tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Premium Sticky Header */}
      <header className="sticky top-0 z-50 neon-card !rounded-none !border-x-0 !border-t-0 p-4 mb-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* User Profile Section */}
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 transform hover:scale-105 transition-transform duration-300">
                <span className="text-white text-3xl font-black">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Welcome, <span className="gradient-text">{userName}</span>
                </h1>
                <p className="text-slate-400 font-medium">
                  {completedCount} / {totalCount} tasks completed
                </p>
              </div>
            </div>

            {/* Action Center */}
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <div className="w-64">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Scan tasks..."
                />
              </div>

              <FilterBar filters={filters} onChange={setFilters} />
              <SortDropdown value={sortBy} onChange={setSortBy} />

              <a
                href="/tasks/create"
                className="btn-neon !px-6 !py-4 h-14"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Task</span>
              </a>
              <SignOutButton />
            </div>
          </div>

          {/* Dynamic Progress Indicator */}
          {totalCount > 0 && (
            <div className="mt-6 h-2 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%`, boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)' }}
              />
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 pb-20">
        {error && (
          <div className="mb-8 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 animate-shake">
            <div className="flex items-center gap-3 font-semibold">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Cinematic Stats Dashboard */}
        {totalCount > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { label: 'Total Operations', value: totalCount, icon: '📋', accent: 'indigo' },
              { label: 'System Success', value: completedCount, icon: '✅', accent: 'emerald' },
              { label: 'Pending Logic', value: totalCount - completedCount, icon: '⏳', accent: 'amber' },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className="neon-card p-6 text-center group"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                <div className="text-4xl font-black mb-1 text-white tracking-tighter">
                  {stat.value}
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Task List Component */}
        <div className="relative">
          {isReloading && (
            <div className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-[2px] rounded-[2.5rem] flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          )}
          <TaskList
            tasks={tasks}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onUpdate={(updatedTask) => {
              setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
            }}
            loading={isReloading}
          />
        </div>
      </main>

      {/* Motivational System Footer */}
      <footer className="text-center pb-12 opacity-50">
        <p className="text-slate-400 font-medium tracking-tight">
          {completedCount === totalCount && totalCount > 0
            ? "✨ TARGET REACHED • SYSTEM OPTIMIZED ✨"
            : "⚡ KEEP PUSHING • CORE ACTIVE ⚡"
          }
        </p>
      </footer>
    </div>
  );
}
