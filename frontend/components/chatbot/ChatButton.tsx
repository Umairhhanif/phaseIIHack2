"use client";

import { MessageCircle, X, Zap } from "lucide-react";

interface ChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export default function ChatButton({ onClick, isOpen }: ChatButtonProps) {
  return (
    <>
      <button
        onClick={onClick}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-2xl text-white transition-all duration-300 hover:scale-110 focus:outline-none group overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          boxShadow: '0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(99, 102, 241, 0.3), 0 8px 25px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {/* Animated glow background */}
        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
          }}
        />

        {/* Rotating glow ring */}
        {!isOpen && (
          <span
            className="absolute inset-[-4px] rounded-2xl animate-spin-slow opacity-60"
            style={{
              background: 'conic-gradient(from 0deg, transparent, #8b5cf6, transparent, #6366f1, transparent)',
              filter: 'blur(8px)',
            }}
          />
        )}

        {/* Icon */}
        <div className="relative z-10 transition-transform duration-300">
          {isOpen ? (
            <X className="h-7 w-7 group-hover:rotate-90 transition-transform duration-300" />
          ) : (
            <Zap className="h-7 w-7 group-hover:scale-110 transition-transform" />
          )}
        </div>

        {/* Pulse rings */}
        {!isOpen && (
          <>
            <span
              className="absolute inset-0 rounded-2xl animate-ping opacity-30"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              }}
            />
          </>
        )}

        {/* Notification dot with glow */}
        {!isOpen && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center animate-pulse"
            style={{
              background: '#10b981',
              boxShadow: '0 0 15px #10b981, 0 0 30px rgba(16, 185, 129, 0.5)',
              border: '2px solid rgba(15, 23, 42, 0.8)',
            }}
          >
            <span className="w-2 h-2 bg-white rounded-full" />
          </span>
        )}
      </button>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
      `}} />
    </>
  );
}
