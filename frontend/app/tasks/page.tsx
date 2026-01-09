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
      <>
        <style jsx global>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.98); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div
          className="min-h-screen flex items-center justify-center"
          style={{
            background: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #5ee7df)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 15s ease infinite',
          }}
        >
          <div
            className="text-center p-10 rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-white/30 border-t-white"
              style={{ animation: 'spin 1s linear infinite' }}
            />
            <p className="text-white text-xl font-semibold">Loading your tasks...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        className="min-h-screen relative overflow-hidden"
        style={{
          background: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #5ee7df, #667eea)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 20s ease infinite',
        }}
      >
        {/* Animated background orbs */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '500px',
            height: '500px',
            top: '-150px',
            right: '-150px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '400px',
            height: '400px',
            bottom: '-100px',
            left: '-100px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
            animation: 'float 10s ease-in-out infinite reverse',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '300px',
            height: '300px',
            top: '50%',
            left: '30%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)',
            animation: 'pulse-slow 8s ease-in-out infinite',
          }}
        />

        {/* Header */}
        <header
          className="sticky top-0 z-50"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              style={{
                animation: mounted ? 'fadeInUp 0.5s ease-out forwards' : 'none',
              }}
            >
              {/* Left side - User info */}
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                    boxShadow: '0 10px 30px -5px rgba(102, 126, 234, 0.5)',
                    animation: mounted ? 'bounceIn 0.6s ease-out forwards' : 'none',
                  }}
                >
                  <span className="text-white text-2xl font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Welcome back, <span className="text-pink-200">{userName}</span> ✨
                  </h1>
                  <p className="text-sm text-white/70">
                    {completedCount} of {totalCount} tasks completed
                  </p>
                </div>
              </div>

              {/* Right side - Actions and Search/Filter/Sort */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Search bar */}
                <div className="w-48">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search..."
                  />
                </div>

                {/* Filter bar */}
                <FilterBar
                  filters={filters}
                  onChange={setFilters}
                />

                {/* Sort dropdown */}
                <SortDropdown
                  value={sortBy}
                  onChange={setSortBy}
                />

                {/* New task button */}
                <a
                  href="/tasks/create"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 8px 25px -5px rgba(16, 185, 129, 0.5)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 12px 35px -5px rgba(16, 185, 129, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(16, 185, 129, 0.5)';
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  New Task
                </a>
                <SignOutButton />
              </div>
            </div>

            {/* Progress bar */}
            {totalCount > 0 && (
              <div
                className="mt-4 overflow-hidden rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  height: '8px',
                }}
              >
                <div
                  className="h-full rounded-full relative overflow-hidden"
                  style={{
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #5ee7df 100%)',
                    transition: 'width 1s ease-out',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s linear infinite',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-5xl mx-auto px-4 py-8 relative z-10">
          {error && (
            <div
              className="mb-6 p-4 rounded-xl flex items-center gap-3"
              style={{
                background: 'rgba(254, 202, 202, 0.9)',
                border: '1px solid rgba(248, 113, 113, 0.5)',
                animation: 'fadeInUp 0.3s ease-out',
              }}
            >
              <svg className="w-5 h-5 text-red-700 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          )}

          {/* Stats cards */}
          {totalCount > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Total Tasks', value: totalCount, color: '#667eea', emoji: '📋' },
                { label: 'Completed', value: completedCount, color: '#10b981', emoji: '✅' },
                { label: 'Remaining', value: totalCount - completedCount, color: '#f59e0b', emoji: '⏳' },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="rounded-2xl p-5 text-center cursor-default transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`,
                    opacity: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="text-3xl mb-2">{stat.emoji}</div>
                  <div
                    className="text-4xl font-extrabold mb-1"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-white/70 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
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
        </main>

        {/* Motivational footer */}
        <footer className="text-center py-8">
          <p className="text-white/60 text-sm font-medium">
            {completedCount === totalCount && totalCount > 0
              ? "🎉 Amazing! All tasks completed! 🎉"
              : "💪 Keep going, you're doing great! 💪"
            }
          </p>
        </footer>
      </div>
    </>
  );
}
