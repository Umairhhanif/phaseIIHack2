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
    <>
      <style jsx>{`
        @keyframes checkmark {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>

      <div
        className="rounded-2xl p-5 transition-all duration-300"
        style={{
          background: task.completed
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          border: isHovered
            ? '1px solid rgba(255, 255, 255, 0.4)'
            : '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: isHovered
            ? '0 20px 40px -10px rgba(0, 0, 0, 0.3)'
            : '0 8px 20px -5px rgba(0, 0, 0, 0.1)',
          transform: isHovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
          opacity: isDeleting ? 0.5 : 1,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start gap-4">
          {/* Custom checkbox */}
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className="relative flex-shrink-0 w-7 h-7 rounded-lg transition-all duration-300 flex items-center justify-center"
            style={{
              background: task.completed
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'rgba(255, 255, 255, 0.3)',
              border: task.completed
                ? 'none'
                : '2px solid rgba(255, 255, 255, 0.5)',
              boxShadow: task.completed
                ? '0 4px 15px -3px rgba(16, 185, 129, 0.5)'
                : 'none',
              cursor: isToggling ? 'wait' : 'pointer',
            }}
          >
            {task.completed && (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ animation: 'checkmark 0.3s ease-out forwards' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {isToggling && (
              <div
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                style={{ animation: 'spin 0.8s linear infinite' }}
              />
            )}
          </button>

          {/* Task content */}
          <div className="flex-1 min-w-0">
            <h3
              className="text-lg font-semibold transition-all duration-300"
              style={{
                color: task.completed ? 'rgba(255, 255, 255, 0.4)' : 'white',
                textDecoration: task.completed ? 'line-through' : 'none',
              }}
            >
              {task.title}
            </h3>
            {task.description && (
              <p
                className="mt-1.5 text-sm leading-relaxed transition-all duration-300"
                style={{
                  color: task.completed ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.7)',
                }}
              >
                {task.description}
              </p>
            )}

            {/* Meta info */}
            <div className="mt-3 flex items-center gap-4 text-xs flex-wrap">
              <span
                className="flex items-center gap-1.5 px-2 py-1 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(task.created_at)}
              </span>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  {task.tags.slice(0, 3).map((tag) => (
                    <TagBadge key={tag.id} tag={tag} size="sm" />
                  ))}
                  {task.tags.length > 3 && (
                    <span className="text-white/60">+{task.tags.length - 3}</span>
                  )}
                </div>
              )}

              {/* Priority selector */}
              {!task.completed && (
                <PrioritySelect
                  value={task.priority}
                  onChange={handlePriorityChange}
                  disabled={isUpdatingPriority}
                />
              )}

              {task.completed && (
                <span
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full"
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                  }}
                >
                  ✓ Done
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div
            className="flex items-center gap-1 transition-opacity duration-300"
            style={{ opacity: isHovered ? 1 : 0.5 }}
          >
            <a
              href={`/tasks/${task.id}/edit`}
              className="p-2.5 rounded-xl transition-all duration-200"
              style={{
                color: 'rgba(255, 255, 255, 0.6)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.3)';
                e.currentTarget.style.color = '#a5b4fc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
              }}
              title="Edit task"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </a>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2.5 rounded-xl transition-all duration-200 disabled:opacity-50"
              style={{
                color: 'rgba(255, 255, 255, 0.6)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                e.currentTarget.style.color = '#fca5a5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
              }}
              title="Delete task"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
