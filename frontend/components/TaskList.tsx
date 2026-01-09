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
      <div
        className="rounded-3xl p-12 text-center"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          animation: 'fadeInUp 0.5s ease-out forwards',
        }}
      >
        {/* Empty state illustration */}
        <div
          className="w-28 h-28 mx-auto mb-8 rounded-3xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(240, 147, 251, 0.3) 100%)',
            animation: 'float 4s ease-in-out infinite',
          }}
        >
          <span className="text-6xl">📝</span>
        </div>

        <h3 className="text-3xl font-extrabold text-white mb-3">
          No tasks yet
        </h3>
        <p className="text-white/70 mb-8 text-lg max-w-sm mx-auto">
          Start organizing your day by creating your first task!
        </p>

        <a
          href="/tasks/create"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white text-lg transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 10px 30px -5px rgba(102, 126, 234, 0.5)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 15px 40px -5px rgba(102, 126, 234, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(102, 126, 234, 0.5)';
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Create Your First Task
        </a>
      </div>
    );
  }

  // Separate completed and active tasks
  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <>
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div className="space-y-8">
        {/* Active tasks */}
        {activeTasks.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-3 text-white/80"
              style={{ animation: 'fadeInUp 0.3s ease-out forwards' }}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                  boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
              Active Tasks ({activeTasks.length})
            </h2>
            <div className="space-y-4">
              {activeTasks.map((task, index) => (
                <div
                  key={task.id}
                  style={{
                    animation: `slideInRight 0.4s ease-out ${index * 0.1}s forwards`,
                    opacity: 0,
                  }}
                >
                  <TaskItem
                    task={task}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Completed tasks */}
        {completedTasks.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-3 text-white/80"
              style={{ animation: 'fadeInUp 0.3s ease-out forwards' }}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
                }}
              />
              Completed ({completedTasks.length}) 🎉
            </h2>
            <div className="space-y-4">
              {completedTasks.map((task, index) => (
                <div
                  key={task.id}
                  style={{
                    animation: `slideInRight 0.4s ease-out ${(activeTasks.length + index) * 0.1}s forwards`,
                    opacity: 0,
                  }}
                >
                  <TaskItem
                    task={task}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
