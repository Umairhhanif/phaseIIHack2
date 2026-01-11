"use client";

import { Send, Sparkles } from "lucide-react";
import { useState, useRef, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="p-4 border-t border-indigo-500/20"
      style={{
        background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
      }}
    >
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type your message..."
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-all duration-300 disabled:opacity-50"
            style={{
              minHeight: "52px",
              maxHeight: "120px",
              background: 'rgba(30, 41, 59, 0.6)',
              border: isFocused
                ? '1px solid rgba(139, 92, 246, 0.6)'
                : '1px solid rgba(99, 102, 241, 0.2)',
              boxShadow: isFocused
                ? '0 0 20px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
                : 'inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          />
          {disabled && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="relative h-12 w-12 shrink-0 rounded-xl text-white transition-all duration-300 hover:scale-110 disabled:opacity-40 disabled:scale-100 focus:outline-none overflow-hidden group"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 0 25px rgba(139, 92, 246, 0.4), 0 4px 15px rgba(99, 102, 241, 0.3)',
          }}
          aria-label="Send message"
        >
          {/* Neon glow on hover */}
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
            }}
          />
          <Send className="h-5 w-5 relative z-10 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
      <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
        <Sparkles className="h-3 w-3 text-violet-400" />
        <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400 font-mono text-xs">Enter</kbd>
        <span className="text-slate-600">to send</span>
        <span className="mx-1 text-slate-700">•</span>
        <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400 font-mono text-xs">Shift+Enter</kbd>
        <span className="text-slate-600">new line</span>
      </p>
    </div>
  );
}
