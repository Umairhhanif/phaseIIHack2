"use client";

import { X, Sparkles, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ConversationMessage } from "@/lib/types";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import { getToken } from "@/lib/auth";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function ChatPanel({ isOpen, onClose, userId }: ChatPanelProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleSendMessage = async (message: string) => {
    const userMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      conversation_id: conversationId || crypto.randomUUID(),
      user_id: userId,
      role: "user",
      content: message,
      tool_calls: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Not authenticated. Please sign in again.");
      }

      // Use environment variable or fallback to localhost
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const response = await fetch(
        `${apiUrl}/api/${userId}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            message,
            conversation_id: conversationId || null
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to send message";
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Update conversation ID if this is a new conversation
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      const assistantMessage: ConversationMessage = {
        id: crypto.randomUUID(),
        conversation_id: data.conversation_id || conversationId || userMessage.conversation_id,
        user_id: userId,
        role: "assistant",
        content: data.assistant_message || "Sorry, I couldn't generate a response.",
        tool_calls: data.tool_calls ? JSON.stringify(data.tool_calls) : null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // If tools were called (e.g. add_task, update_task), signal the tasks page to refresh
      if (data.tool_calls && Array.isArray(data.tool_calls) && data.tool_calls.length > 0) {
        console.log("Tool calls detected, dispatching tasks-updated event");
        window.dispatchEvent(new Event("tasks-updated"));
      }
    } catch (error) {
      console.error("Error sending message:", error);

      let errorText = "Sorry, I encountered an error. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
          errorText = "Unable to connect to the server. Please ensure the backend is running on port 8000.";
        } else if (error.message.includes("Not authenticated")) {
          errorText = "Your session has expired. Please sign in again.";
        } else {
          errorText = error.message;
        }
      }

      const errorMessage: ConversationMessage = {
        id: crypto.randomUUID(),
        conversation_id: userMessage.conversation_id,
        user_id: userId,
        role: "assistant",
        content: `❌ ${errorText}`,
        tool_calls: null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
        onClick={onClose}
      />

      {/* Chat Panel - Dark Glassmorphism */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[calc(100%-3rem)] max-w-md h-[600px] flex flex-col rounded-3xl overflow-hidden transition-all duration-500 ${mounted ? 'animate-slide-up' : 'opacity-0 translate-y-4'
          }`}
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 0 40px rgba(99, 102, 241, 0.2), 0 0 80px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {/* Neon Header */}
        <div className="relative px-6 py-5 border-b border-indigo-500/30">
          {/* Neon glow line */}
          <div
            className="absolute bottom-0 left-6 right-6 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, #818cf8, #a78bfa, #818cf8, transparent)',
              boxShadow: '0 0 10px #818cf8, 0 0 20px #a78bfa',
            }}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center relative"
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
                }}
              >
                <Zap className="h-6 w-6 text-violet-400" />
                {/* Pulse ring */}
                <span className="absolute inset-0 rounded-2xl animate-ping opacity-20 bg-violet-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  AI Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
                </h2>
                <p className="text-xs text-slate-400">Powered by AI</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/50 transition-all duration-300 group"
            >
              <X className="h-5 w-5 text-slate-400 group-hover:text-violet-400 group-hover:rotate-90 transition-all duration-300" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div
                className="w-24 h-24 rounded-3xl mb-6 flex items-center justify-center relative"
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)',
                }}
              >
                <Sparkles className="h-12 w-12 text-violet-400" />
                <span className="absolute inset-0 rounded-3xl animate-pulse bg-violet-500/10" />
              </div>
              <p className="text-xl font-bold text-white mb-2">Welcome! 👋</p>
              <p className="text-sm text-slate-400 mb-6 max-w-xs">
                I'm your AI task assistant with superpowers.
              </p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                {[
                  { icon: "⚡", text: "Add tasks", color: "from-violet-500/20 to-purple-500/20", border: "border-violet-500/30" },
                  { icon: "📊", text: "List tasks", color: "from-cyan-500/20 to-blue-500/20", border: "border-cyan-500/30" },
                  { icon: "✨", text: "Complete", color: "from-emerald-500/20 to-green-500/20", border: "border-emerald-500/30" },
                  { icon: "🔥", text: "Delete", color: "from-rose-500/20 to-pink-500/20", border: "border-rose-500/30" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl bg-gradient-to-br ${item.color} border ${item.border} backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer`}
                  >
                    <span className="text-xl mb-1 block">{item.icon}</span>
                    <span className="text-xs font-medium text-slate-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}} />
    </>
  );
}
