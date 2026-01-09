/**
 * Priority selector dropdown component with beautiful animations.
 */

"use client";

import { useState } from "react";
import type { Priority } from "@/lib/types";

interface PrioritySelectProps {
  value: Priority | null;
  onChange: (priority: Priority) => void;
  disabled?: boolean;
  className?: string;
}

const PRIORITY_CONFIG: Record<
  string,
  { label: string; gradient: string; bgColor: string; icon: string }
> = {
  HIGH: {
    label: "High",
    gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    bgColor: "rgba(239, 68, 68, 0.1)",
    icon: "🔥",
  },
  MEDIUM: {
    label: "Medium",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    bgColor: "rgba(245, 158, 11, 0.1)",
    icon: "⚡",
  },
  LOW: {
    label: "Low",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    bgColor: "rgba(16, 185, 129, 0.1)",
    icon: "🌿",
  },
};

// Normalize priority to uppercase
const normalizePriority = (p: Priority | null): string => {
  if (!p) return "MEDIUM";
  return p.toUpperCase();
};

export function PrioritySelect({
  value,
  onChange,
  disabled = false,
  className = "",
}: PrioritySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredPriority, setHoveredPriority] = useState<string | null>(null);

  const currentPriority = normalizePriority(value);
  const config = PRIORITY_CONFIG[currentPriority] || PRIORITY_CONFIG.MEDIUM;

  const priorities: Priority[] = ["HIGH", "MEDIUM", "LOW"];

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
        style={{
          background: config.gradient,
          border: "none",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{config.icon}</span>
          <div
            className="w-3 h-3 rounded-full bg-white/30"
          />
          <span className="text-white font-semibold drop-shadow-sm">
            {config.label} Priority
          </span>
        </div>
        {!disabled && (
          <svg
            className={`w-5 h-5 transition-transform duration-300 text-white ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-20 overflow-hidden"
            style={{
              animation: "slideDown 0.2s ease-out",
            }}
          >
            {priorities.map((priority, index) => {
              const pConfig = PRIORITY_CONFIG[priority];
              const isSelected = priority === currentPriority;
              const isHovered = hoveredPriority === priority;

              return (
                <button
                  key={priority}
                  type="button"
                  onClick={() => {
                    onChange(priority);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setHoveredPriority(priority)}
                  onMouseLeave={() => setHoveredPriority(null)}
                  className="w-full px-4 py-3 text-left text-sm transition-all duration-200 flex items-center gap-3 relative overflow-hidden"
                  style={{
                    background: isSelected
                      ? pConfig.bgColor
                      : isHovered
                        ? "rgba(0,0,0,0.02)"
                        : "transparent",
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Selection indicator */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-200"
                    style={{
                      background: isSelected ? pConfig.gradient : "transparent",
                      transform: isSelected ? "scaleY(1)" : "scaleY(0)",
                    }}
                  />

                  <span className="text-lg">{pConfig.icon}</span>
                  <div
                    className="w-3 h-3 rounded-full shadow-sm transition-transform duration-200"
                    style={{
                      background: pConfig.gradient,
                      transform: isHovered || isSelected ? "scale(1.2)" : "scale(1)",
                    }}
                  />
                  <span
                    className="font-medium"
                    style={{
                      background: pConfig.gradient,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {pConfig.label}
                  </span>

                  {/* Checkmark for selected */}
                  {isSelected && (
                    <svg
                      className="w-5 h-5 ml-auto animate-fade-in-up"
                      style={{
                        color:
                          priority === "HIGH"
                            ? "#ef4444"
                            : priority === "LOW"
                              ? "#10b981"
                              : "#f59e0b",
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
