/**
 * Task list component with animated sections.
 */

"use client";

import type { Task } from "@/lib/types";
import TaskItem from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  onToggle: (taskId: string) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onUpdate?: (task: Task) => void;
  loading?: boolean;
}

export default function TaskList({ tasks, onToggle, onDelete, onUpdate, loading }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="neon-card p-16 rounded-[2.5rem] text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Cinematic Empty State Icon */}
        <div className="w-32 h-32 mx-auto mb-10 rounded-[2rem] bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-6xl shadow-inner animate-float">
          <span>📝</span>
        </div>

        <h3 className="text-4xl font-black text-white mb-4 tracking-tight">
          System Clear
        </h3>
        <p className="text-slate-400 mb-10 text-lg max-w-sm mx-auto font-medium leading-relaxed">
          No tasks found in current sector. Initialize your first operation to begin.
        </p>

        <a
          href="/tasks/create"
          className="btn-neon h-14 !px-10 inline-flex"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Initialize Task</span>
        </a>
      </div>
    );
  }

  // Separate completed and active tasks
  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="space-y-12">
      {/* Active tasks */}
      {activeTasks.length > 0 && (
        <section className="animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 whitespace-nowrap flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse" />
              Active Protocol ({activeTasks.length})
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
          </div>

          <div className="space-y-4">
            {activeTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </section>
      )}

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <section className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 whitespace-nowrap flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Archives ({completedTasks.length})
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
          </div>

          <div className="space-y-4">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
