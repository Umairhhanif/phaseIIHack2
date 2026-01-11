"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import type { ConversationMessage } from "@/lib/types";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: ConversationMessage;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
    >
      {!isUser && (
        <div
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center mt-1"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            boxShadow: '0 0 15px rgba(139, 92, 246, 0.2)',
          }}
        >
          <Bot className="h-4 w-4 text-violet-400" />
        </div>
      )}

      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${isUser
          ? "rounded-br-md"
          : "rounded-bl-md"
          }`}
        style={isUser ? {
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3), 0 0 40px rgba(139, 92, 246, 0.1)',
        } : {
          background: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        }}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed text-white">{message.content}</p>
        ) : (
          <ReactMarkdown
            className="prose prose-sm max-w-none prose-invert"
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-slate-200">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="text-slate-300">{children}</li>,
              code: ({ children }) => (
                <code
                  className="px-1.5 py-0.5 rounded text-sm font-mono"
                  style={{
                    background: 'rgba(139, 92, 246, 0.2)',
                    color: '#c4b5fd',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                  }}
                >
                  {children}
                </code>
              ),
              strong: ({ children }) => <strong className="font-semibold text-violet-300">{children}</strong>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
        <div
          className={`text-xs mt-1.5 ${isUser ? "text-indigo-200" : "text-slate-500"}`}
        >
          <ClientDate date={message.created_at} />
        </div>
      </div>

      {isUser && (
        <div
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center mt-1"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
          }}
        >
          <User className="h-4 w-4 text-white" />
        </div>
      )}

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

function ClientDate({ date }: { date: string }) {
  const [formattedDate, setFormattedDate] = React.useState<string>("");

  React.useEffect(() => {
    setFormattedDate(
      new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, [date]);

  if (!formattedDate) return null;
  return <>{formattedDate}</>;
}
