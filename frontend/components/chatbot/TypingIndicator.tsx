"use client";

import { Zap } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start animate-fade-in">
      <div
        className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          boxShadow: '0 0 15px rgba(139, 92, 246, 0.2)',
        }}
      >
        <Zap className="h-4 w-4 text-violet-400 animate-pulse" />
      </div>

      <div
        className="rounded-2xl rounded-bl-md px-5 py-4"
        style={{
          background: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div className="flex gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full animate-bounce"
            style={{
              background: '#8b5cf6',
              boxShadow: '0 0 8px #8b5cf6',
              animationDelay: '0ms',
            }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full animate-bounce"
            style={{
              background: '#a78bfa',
              boxShadow: '0 0 8px #a78bfa',
              animationDelay: '150ms',
            }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full animate-bounce"
            style={{
              background: '#c4b5fd',
              boxShadow: '0 0 8px #c4b5fd',
              animationDelay: '300ms',
            }}
          />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease-out;
        }
      `}} />
    </div>
  );
}
