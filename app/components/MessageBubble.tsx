"use client";

import { Message, Attachment } from "@/lib/types";
import MarkdownRenderer from "./MarkdownRenderer";
import { User, Bot, Copy, Check, ChevronDown, ChevronRight, Brain, Search, FileText, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

// Parse thinking blocks from content
function parseThinkingContent(content: string): { thinking: string; response: string } {
  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
  if (thinkMatch) {
    const thinking = thinkMatch[1].trim();
    const response = content.replace(/<think>[\s\S]*?<\/think>/, "").trim();
    return { thinking, response };
  }

  const thinkingMatch = content.match(/<thinking>([\s\S]*?)<\/thinking>/);
  if (thinkingMatch) {
    const thinking = thinkingMatch[1].trim();
    const response = content.replace(/<thinking>[\s\S]*?<\/thinking>/, "").trim();
    return { thinking, response };
  }

  const reasoningMatch = content.match(/<reasoning>([\s\S]*?)<\/reasoning>/);
  if (reasoningMatch) {
    const thinking = reasoningMatch[1].trim();
    const response = content.replace(/<reasoning>[\s\S]*?<\/reasoning>/, "").trim();
    return { thinking, response };
  }

  if (content.startsWith("\u{1F9E0} **Thinking:**\n")) {
    const parts = content.split("\n---\n");
    if (parts.length >= 2) {
      const thinking = parts[0].replace("\u{1F9E0} **Thinking:**\n", "").trim();
      const response = parts.slice(1).join("\n---\n").trim();
      return { thinking, response };
    }
  }

  return { thinking: "", response: content };
}

// Get file type label
function getFileTypeLabel(name: string): string {
  const n = name.toLowerCase();
  if (n.endsWith(".pdf")) return "PDF";
  if (n.endsWith(".docx") || n.endsWith(".doc")) return "Word";
  if (n.endsWith(".xls") || n.endsWith(".xlsx")) return "Excel";
  if (n.endsWith(".ppt") || n.endsWith(".pptx")) return "PowerPoint";
  if (n.endsWith(".zip") || n.endsWith(".rar") || n.endsWith(".7z") || n.endsWith(".tar") || n.endsWith(".gz")) return "Archive";
  if (n.endsWith(".mp4") || n.endsWith(".mkv") || n.endsWith(".avi") || n.endsWith(".mov") || n.endsWith(".webm")) return "Video";
  if (n.endsWith(".mp3") || n.endsWith(".wav") || n.endsWith(".ogg") || n.endsWith(".flac") || n.endsWith(".aac")) return "Audio";
  if (n.endsWith(".exe") || n.endsWith(".apk") || n.endsWith(".dmg")) return "App";
  if (n.endsWith(".jpg") || n.endsWith(".jpeg") || n.endsWith(".png") || n.endsWith(".gif") || n.endsWith(".svg") || n.endsWith(".webp")) return "Image";
  return "File";
}

// Get file icon color
function getFileIconColor(name: string): string {
  const n = name.toLowerCase();
  if (n.endsWith(".pdf")) return "text-red-500";
  if (n.endsWith(".docx") || n.endsWith(".doc")) return "text-blue-500";
  if (n.endsWith(".xls") || n.endsWith(".xlsx")) return "text-green-600";
  if (n.endsWith(".ppt") || n.endsWith(".pptx")) return "text-orange-500";
  if (n.endsWith(".zip") || n.endsWith(".rar") || n.endsWith(".7z") || n.endsWith(".tar") || n.endsWith(".gz")) return "text-yellow-500";
  if (n.endsWith(".mp4") || n.endsWith(".mkv") || n.endsWith(".avi") || n.endsWith(".mov") || n.endsWith(".webm")) return "text-purple-500";
  if (n.endsWith(".mp3") || n.endsWith(".wav") || n.endsWith(".ogg") || n.endsWith(".flac") || n.endsWith(".aac")) return "text-green-500";
  if (n.endsWith(".exe") || n.endsWith(".apk") || n.endsWith(".dmg")) return "text-orange-600";
  return "text-light-accent dark:text-dark-accent";
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const isUser = message.role === "user";

  const { thinking, response } = useMemo(
    () => (isUser ? { thinking: "", response: message.content } : parseThinkingContent(message.content)),
    [message.content, isUser]
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(response || message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDeepResearch = thinking.length > 2000;

  return (
    <div className={`flex gap-4 px-4 py-5 rounded-xl mx-2 mb-2 transition-colors ${
      isUser 
        ? "bg-light-accent/5 dark:bg-dark-accent/5" 
        : "bg-light-sidebar dark:bg-dark-sidebar"
    }`}>
      <div className="flex-shrink-0">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
            isUser
              ? "bg-gradient-to-br from-light-accent to-light-accent/80 dark:from-dark-accent dark:to-dark-accent/80 text-white"
              : "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
          }`}
        >
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm mb-1.5 text-light-text dark:text-dark-text">
          {isUser ? "You" : "Assistant"}
          {isStreaming && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-emerald-500">
              <Loader2 size={12} className="animate-spin" />
              generating...
            </span>
          )}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {message.attachments.map((att) => (
              att.type === "image" ? (
                <div key={att.id} className="relative rounded-xl overflow-hidden border border-light-border dark:border-dark-border max-w-[220px] shadow-sm">
                  <img
                    src={`data:${att.mimeType};base64,${att.base64}`}
                    alt={att.name}
                    className="w-full h-auto max-h-[200px] object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/70 to-transparent text-[9px] text-white truncate">
                    {att.name}
                  </div>
                </div>
              ) : (
                <div key={att.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border hover:border-light-accent/30 dark:hover:border-dark-accent/30 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    att.name.endsWith(".pdf") ? "bg-red-500/10" :
                    (att.name.endsWith(".docx") || att.name.endsWith(".doc")) ? "bg-blue-500/10" :
                    (att.name.endsWith(".zip") || att.name.endsWith(".rar") || att.name.endsWith(".7z")) ? "bg-yellow-500/10" :
                    (att.name.endsWith(".mp4") || att.name.endsWith(".mkv") || att.name.endsWith(".avi")) ? "bg-purple-500/10" :
                    (att.name.endsWith(".mp3") || att.name.endsWith(".wav") || att.name.endsWith(".ogg")) ? "bg-green-500/10" :
                    "bg-light-accent/10 dark:bg-dark-accent/10"
                  }`}>
                    <FileText size={16} className={getFileIconColor(att.name)} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-light-text dark:text-dark-text truncate max-w-[150px]">{att.name}</p>
                    <p className="text-[10px] text-light-muted dark:text-dark-muted">
                      {formatFileSize(att.size)} &middot; {getFileTypeLabel(att.name)}
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
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover transition-colors w-full text-left"
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDeepResearch ? "bg-gradient-to-br from-blue-500 to-indigo-500" : "bg-gradient-to-br from-amber-500 to-orange-500"}`}>
                {isDeepResearch ? <Search size={12} className="text-white" /> : <Brain size={12} className="text-white" />}
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
              <div className="mt-2 px-4 py-3 rounded-xl bg-light-input/50 dark:bg-dark-input/50 border-l-2 border-amber-500 dark:border-amber-400 max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="text-xs text-light-muted dark:text-dark-muted leading-relaxed whitespace-pre-wrap">
                  {thinking}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Response */}
        <div className="text-light-text dark:text-dark-text leading-relaxed">
          {(response || message.content) ? (
            <MarkdownRenderer content={response || message.content} />
          ) : isStreaming ? (
            <div className="flex items-center gap-3 py-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full typing-dot" />
                <div className="w-2 h-2 bg-emerald-500 rounded-full typing-dot" />
                <div className="w-2 h-2 bg-emerald-500 rounded-full typing-dot" />
              </div>
              <span className="text-sm text-light-muted dark:text-dark-muted animate-pulse">
                {thinking ? "Generating response..." : "Thinking..."}
              </span>
            </div>
          ) : null}
        </div>

        {/* Actions */}
        {!isUser && (response || message.content) && !isStreaming && (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-input dark:hover:bg-dark-input transition-colors"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-500" />
                  <span className="text-emerald-500">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
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
