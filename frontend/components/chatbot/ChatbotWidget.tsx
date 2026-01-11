"use client";

import { useState, useEffect } from "react";
import ChatButton from "./ChatButton";
import ChatPanel from "./ChatPanel";
import { getUserId } from "@/lib/auth";

/**
 * Main chatbot widget component.
 *
 * Renders a floating chat button and the chat panel when opened.
 * Handles state management for the chat interface.
 */
export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setUserId(getUserId());
  }, []);

  if (!mounted || !userId) {
    // Don't show chat during SSR or if user is not authenticated
    return null;
  }

  return (
    <>
      <ChatButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      <ChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} userId={userId} />
    </>
  );
}
