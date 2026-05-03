"use client";

import { useEffect, useRef } from "react";
import { Conversation } from "@/lib/types";
import MessageBubble from "./MessageBubble";
import { MessageSquareText, Settings } from "lucide-react";

interface ChatWindowProps {
  conversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
  onOpenSettings: () => void;
  onDismissError: () => void;
}

export default function ChatWindow({
  conversation,
  isLoading,
  error,
  isConfigured,
  onOpenSettings,
  onDismissError,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  // Empty state - no conversation selected
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-light-input dark:bg-dark-input flex items-center justify-center">
            <MessageSquareText size={32} className="text-light-muted dark:text-dark-muted" />
          </div>
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-3">
            Welcome to Budi AI
          </h2>
          <p className="text-light-muted dark:text-dark-muted mb-6">
            Start a new conversation or select one from the sidebar. 
            {!isConfigured && " First, configure your API settings to get started."}
          </p>
          {!isConfigured && (
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-light-accent dark:bg-dark-accent text-white hover:opacity-90 transition-opacity"
            >
              <Settings size={18} />
              <span>Configure API Settings</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start justify-between gap-3">
          <div>
            <strong>Error:</strong> {error}
          </div>
          <button
            onClick={onDismissError}
            className="flex-shrink-0 text-red-500 hover:text-red-400"
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages */}
      {conversation.messages.length === 0 ? (
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">
              Start chatting
            </h3>
            <p className="text-light-muted dark:text-dark-muted text-sm">
              Type a message below to begin the conversation.
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          {conversation.messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isStreaming={
                isLoading &&
                index === conversation.messages.length - 1 &&
                message.role === "assistant"
              }
            />
          ))}
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
