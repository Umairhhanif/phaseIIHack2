/**
 * No results empty state component for search/filter scenarios.
 */

"use client";

interface NoResultsProps {
  title?: string;
  message?: string;
  searchQuery?: string;
  onClear?: () => void;
}

export function NoResults({
  title = "No tasks found",
  message = "Try adjusting your search or filters",
  searchQuery,
  onClear,
}: NoResultsProps) {
  return (
    <div
      className="rounded-3xl p-12 text-center"
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      {/* Empty state illustration */}
      <div
        className="w-28 h-28 mx-auto mb-8 rounded-3xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(240, 147, 251, 0.3) 100%)',
        }}
      >
        <span className="text-6xl">🔍</span>
      </div>

      <h3 className="text-3xl font-extrabold text-white mb-3">
        {title}
      </h3>
      <p className="text-white/70 mb-8 text-lg max-w-sm mx-auto">
        {searchQuery
          ? `No tasks match "${searchQuery}"`
          : message}
      </p>

      {onClear && (
        <button
          onClick={onClear}
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear Filters
        </button>
      )}
    </div>
  );
}
