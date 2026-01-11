/**
 * Individual task item with premium styling and animations.
 */

"use client";

import { useState } from "react";
import type { Task, Priority } from "@/lib/types";
import { tasksAPI } from "@/lib/api";
import { getUserIdFromToken } from "@/lib/auth";
import { PrioritySelect } from "./PrioritySelect";
import { TagBadge } from "./TagBadge";

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onUpdate?: (task: Task) => void;
}

export default function TaskItem({ task, onToggle, onDelete, onUpdate }: TaskItemProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    await onToggle(task.id);
    setIsToggling(false);
  };

  const handleDelete = async () => {
    console.log('[DEBUG] Delete button clicked for task:', task.id);
    const confirmed = confirm("Are you sure you want to delete this task?");
    console.log('[DEBUG] User confirmation:', confirmed);

    if (confirmed) {
      console.log('[DEBUG] Starting delete operation...');
      setIsDeleting(true);
      try {
        await onDelete(task.id);
        console.log('[DEBUG] Delete completed successfully');
      } catch (error) {
        console.error('[DEBUG] Delete failed:', error);
        alert(`Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsDeleting(false);
      }
    } else {
      console.log('[DEBUG] User canceled deletion');
    }
  };

  const handlePriorityChange = async (priority: Priority) => {
    setIsUpdatingPriority(true);
    try {
      const token = localStorage.getItem("auth_token");
      const userId = getUserIdFromToken(token!);
      if (!userId) return;

      const updatedTask = await tasksAPI.updatePriority(userId, task.id, priority);
      onUpdate?.(updatedTask);
    } catch (err: any) {
      alert(err.message || "Failed to update priority");
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div
      className={`neon-card group p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-glow-strong ${task.completed ? 'opacity-70 bg-slate-900/20' : ''
        } ${isDeleting ? 'scale-95 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-5">
        {/* Custom Neon Checkbox */}
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={`relative flex-shrink-0 w-8 h-8 rounded-xl transition-all duration-300 flex items-center justify-center border-2 ${task.completed
            ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            : 'bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800'
            }`}
        >
          {task.completed ? (
            <svg
              className="w-5 h-5 text-emerald-400 animate-pulse-neon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <div className="w-2 h-2 rounded-full bg-slate-600 transition-all group-hover:bg-indigo-400/50" />
          )}

          {isToggling && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-xl">
              <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          )}
        </button>

        {/* Task Content Area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <h3
              className={`text-xl font-bold tracking-tight transition-all duration-300 ${task.completed ? 'text-slate-500 line-through' : 'text-slate-100'
                }`}
            >
              {task.title}
            </h3>

            {/* Quick Priority Indicator */}
            {!task.completed && (
              <div className={`w-2 h-2 rounded-full mt-2.5 shadow-[0_0_8px_currentColor] ${task.priority === 'HIGH' ? 'text-red-500 bg-red-500' :
                task.priority === 'MEDIUM' ? 'text-amber-500 bg-amber-500' :
                  'text-indigo-500 bg-indigo-500'
                }`} />
            )}
          </div>

          {task.description && (
            <p
              className={`mt-2 text-base leading-relaxed transition-all duration-300 ${task.completed ? 'text-slate-600' : 'text-slate-400'
                }`}
            >
              {task.description}
            </p>
          )}

          {/* Intelligent Meta Row */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(task.created_at)}
            </div>

            {/* Neon Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-2">
                {task.tags.slice(0, 3).map((tag) => (
                  <TagBadge key={tag.id} tag={tag} size="sm" />
                ))}
              </div>
            )}

            {/* Interactive Selectors */}
            {!task.completed && (
              <div className="flex items-center gap-3">
                <div className="h-4 w-px bg-slate-700/50" />
                <PrioritySelect
                  value={task.priority}
                  onChange={handlePriorityChange}
                  disabled={isUpdatingPriority}
                />
              </div>
            )}

            {task.completed && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider animate-pulse-neon">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Verified Complete
              </div>
            )}
          </div>
        </div>

        {/* Action Orbital */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
          <a
            href={`/tasks/${task.id}/edit`}
            className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all duration-200"
            title="Update Protocol"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </a>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-red-400 hover:border-red-500/50 transition-all duration-200"
            title="Purge Task"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
