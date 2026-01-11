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
  const tagColor = tag.color || "#6b7280";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-lg font-bold uppercase tracking-widest leading-none border transition-all duration-300 ${config.badge} ${className}`}
      style={{
        backgroundColor: `${tagColor}20`, // 12% opacity
        color: tagColor,
        borderColor: `${tagColor}40`, // 25% opacity
        boxShadow: `0 0 10px ${tagColor}15`,
      }}
    >
      <div
        className={`rounded-full ${config.dot}`}
        style={{ backgroundColor: tagColor, boxShadow: `0 0 8px ${tagColor}` }}
      />
      <span className="truncate max-w-[120px]">{tag.name}</span>
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-1 p-0.5 rounded-md hover:bg-white/10 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
