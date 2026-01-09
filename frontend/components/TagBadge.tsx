/**
 * Tag badge component for displaying a single tag.
 */

"use client";

import type { Tag, TagSummary } from "@/lib/types";

interface TagBadgeProps {
  tag: Tag | TagSummary;
  size?: "sm" | "md" | "lg";
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

// Re-export for convenience
export type { TagBadgeProps };

/**
 * Get contrasting text color for a background color.
 */
function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#1f2937" : "#ffffff";
}

const SIZE_CONFIG = {
  sm: {
    badge: "px-2 py-0.5 text-xs",
    dot: "w-1.5 h-1.5",
  },
  md: {
    badge: "px-2.5 py-1 text-sm",
    dot: "w-2 h-2",
  },
  lg: {
    badge: "px-3 py-1.5 text-base",
    dot: "w-2.5 h-2.5",
  },
};

export function TagBadge({
  tag,
  size = "md",
  removable = false,
  onRemove,
  className = "",
}: TagBadgeProps) {
  const config = SIZE_CONFIG[size];
  const bgColor = tag.color || "#6b7280";
  const textColor = getContrastColor(bgColor);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.badge} ${className}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <span
        className={`rounded-full ${config.dot}`}
        style={{ backgroundColor: textColor, opacity: 0.6 }}
      />
      <span className="truncate max-w-[100px]">{tag.name}</span>
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 inline-flex items-center justify-center rounded-full hover:bg-black/20 transition-colors"
          style={{ width: "16px", height: "16px" }}
        >
          <svg
            className="w-3 h-3"
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
        </button>
      )}
    </span>
  );
}
