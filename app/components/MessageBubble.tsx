"use client";

import { Message, Attachment } from "@/lib/types";
import MarkdownRenderer from "./MarkdownRenderer";
import { User, Bot, Copy, Check, ChevronDown, ChevronRight, Brain, Search, FileText, Image as ImageIcon } from "lucide-react";
import { useState, useMemo } from "react";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

// Parse thinking blocks from content
function parseThinkingContent(content: string): { thinking: string; response: string } {
  // Pattern 1: <think>...</think> tags
  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
  if (thinkMatch) {
    const thinking = thinkMatch[1].trim();
    const response = content.replace(/<think>[\s\S]*?<\/think>/, "").trim();
    return { thinking, response };
  }

  // Pattern 2: <thinking>...</thinking> tags
  const thinkingMatch = content.match(/<thinking>([\s\S]*?)<\/thinking>/);
  if (thinkingMatch) {
    const thinking = thinkingMatch[1].trim();
    const response = content.replace(/<thinking>[\s\S]*?<\/thinking>/, "").trim();
    return { thinking, response };
  }

  // Pattern 3: <reasoning>...</reasoning> tags
  const reasoningMatch = content.match(/<reasoning>([\s\S]*?)<\/reasoning>/);
  if (reasoningMatch) {
    const thinking = reasoningMatch[1].trim();
    const response = content.replace(/<reasoning>[\s\S]*?<\/reasoning>/, "").trim();
    return { thinking, response };
  }

  // Pattern 4: Content starts with thinking indicator (for streaming)
  if (content.startsWith("🧠 **Thinking:**\n")) {
    const parts = content.split("\n---\n");
    if (parts.length >= 2) {
      const thinking = parts[0].replace("🧠 **Thinking:**\n", "").trim();
      const response = parts.slice(1).join("\n---\n").trim();
      return { thinking, response };
    }
  }

  return { thinking: "", response: content };
}

export default function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const isUser = message.role === "user";

  // Parse thinking content
  const { thinking, response } = useMemo(
    () => (isUser ? { thinking: "", response: message.content } : parseThinkingContent(message.content)),
    [message.content, isUser]
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(response || message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Detect if this is a deep research response (longer thinking)
  const isDeepResearch = thinking.length > 2000;

  return (
    <div className={`flex gap-4 px-4 py-6 fade-in ${isUser ? "" : "bg-light-sidebar dark:bg-dark-sidebar"}`}>
      <div className="flex-shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser
              ? "bg-light-accent dark:bg-dark-accent text-white"
              : "bg-emerald-600 text-white"
          }`}
        >
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm mb-1 text-light-text dark:text-dark-text">
          {isUser ? "You" : "Assistant"}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {message.attachments.map((att) => (
              att.type === "image" ? (
                <div key={att.id} className="relative rounded-lg overflow-hidden border border-light-border dark:border-dark-border max-w-[200px]">
                  <img
                    src={`data:${att.mimeType};base64,${att.base64}`}
                    alt={att.name}
                    className="w-full h-auto max-h-[200px] object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/50 text-[9px] text-white truncate">
                    {att.name}
                  </div>
                </div>
              ) : (
                <div key={att.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border">
                  <FileText size={16} className={`flex-shrink-0 ${
                    att.name.endsWith(".pdf") ? "text-red-500" :
                    (att.name.endsWith(".docx") || att.name.endsWith(".doc")) ? "text-blue-500" :
                    "text-light-accent dark:text-dark-accent"
                  }`} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-light-text dark:text-dark-text truncate">{att.name}</p>
                    <p className="text-[9px] text-light-muted dark:text-dark-muted">
                      {(att.size / 1024).toFixed(1)} KB
                      {att.name.endsWith(".pdf") && " \u00B7 PDF"}
                      {(att.name.endsWith(".docx") || att.name.endsWith(".doc")) && " \u00B7 Word"}
                    </p>
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {/* Thinking Block (collapsible) */}
        {thinking && (
          <div className="mb-3">
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover transition-colors w-full text-left"
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center ${isDeepResearch ? "bg-gradient-to-br from-blue-500 to-indigo-500" : "bg-gradient-to-br from-amber-500 to-orange-500"}`}>
                {isDeepResearch ? <Search size={11} className="text-white" /> : <Brain size={11} className="text-white" />}
              </div>
              <span className="text-xs font-medium text-light-text dark:text-dark-text flex-1">
                {isDeepResearch ? "Deep Research" : "Thinking"}
              </span>
              <span className="text-[10px] text-light-muted dark:text-dark-muted">
                {thinking.split(/\s+/).length} words
              </span>
              {showThinking ? (
                <ChevronDown size={14} className="text-light-muted dark:text-dark-muted" />
              ) : (
                <ChevronRight size={14} className="text-light-muted dark:text-dark-muted" />
              )}
            </button>

            {showThinking && (
              <div className="mt-2 px-4 py-3 rounded-lg bg-light-input/50 dark:bg-dark-input/50 border-l-2 border-amber-500 dark:border-amber-400 max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="text-xs text-light-muted dark:text-dark-muted leading-relaxed whitespace-pre-wrap">
                  {thinking}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Response */}
        <div className="text-light-text dark:text-dark-text">
          {(response || message.content) ? (
            <MarkdownRenderer content={response || message.content} />
          ) : isStreaming ? (
            <div className="flex items-center gap-2 py-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-light-muted dark:bg-dark-muted rounded-full typing-dot" />
                <div className="w-2 h-2 bg-light-muted dark:bg-dark-muted rounded-full typing-dot" />
                <div className="w-2 h-2 bg-light-muted dark:bg-dark-muted rounded-full typing-dot" />
              </div>
              <span className="text-xs text-light-muted dark:text-dark-muted animate-pulse">
                {thinking ? "Generating response..." : "Thinking..."}
              </span>
            </div>
          ) : null}
        </div>

        {/* Actions */}
        {!isUser && (response || message.content) && !isStreaming && (
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors"
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
