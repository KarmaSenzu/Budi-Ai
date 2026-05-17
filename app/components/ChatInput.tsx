"use client";

import { useState, useRef, useEffect, useMemo, KeyboardEvent } from "react";
import { Send, Square, ChevronDown, Check, Brain, Search, ImagePlus, Paperclip, X, FileText, Zap } from "lucide-react";
import { ChatMode, Attachment } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import mammoth from "mammoth";
import {
  groupModels,
  formatModelDisplayName,
  categorizeModel,
  MODEL_CATEGORIES,
} from "@/lib/model-categories";

// ─── Component ────────────────────────────────────────────────────

interface ChatInputProps {
  onSend: (message: string, chatMode?: ChatMode, attachments?: Attachment[]) => void;
  onStop: () => void;
  isLoading: boolean;
  disabled?: boolean;
  currentModel: string;
  onModelChange: (model: string) => void;
  fetchedModels?: string[];
}

export default function ChatInput({
  onSend,
  onStop,
  isLoading,
  disabled,
  currentModel,
  onModelChange,
  fetchedModels = [],
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("normal");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modelSearch, setModelSearch] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelPickerRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [input]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Close model picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modelPickerRef.current && !modelPickerRef.current.contains(e.target as Node)) {
        setShowModelPicker(false);
        setModelSearch("");
      }
    };
    if (showModelPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showModelPicker]);

  const handleSubmit = () => {
    if ((!input.trim() && attachments.length === 0) || isLoading || disabled) return;
    onSend(input, chatMode, attachments.length > 0 ? attachments : undefined);
    setInput("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // Extract text from PDF file (dynamic import to avoid SSR issues)
  const extractPdfText = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const textParts: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        if (pageText.trim()) {
          textParts.push(`--- Page ${i} ---\n${pageText}`);
        }
      }
      return textParts.join("\n\n");
    } catch (err) {
      console.error("Error extracting PDF text:", err);
      return "[Error: Gagal membaca konten PDF]";
    }
  };

  // Extract text from DOCX file
  const extractDocxText = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (err) {
      console.error("Error extracting DOCX text:", err);
      return "[Error: Gagal membaca konten DOCX]";
    }
  };

  // Handle file/image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
    const files = e.target.files;
    if (!files) return;

    const textExtensions = [".txt", ".md", ".csv", ".json", ".xml", ".html", ".css", ".js", ".ts", ".py", ".java", ".c", ".cpp", ".rtf", ".log", ".yml", ".yaml", ".toml", ".ini", ".cfg", ".sh", ".bat"];

    Array.from(files).forEach(async (file) => {
      // Max 20MB for all files
      const maxSize = 20 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`File "${file.name}" terlalu besar. Maksimal 20MB.`);
        return;
      }

      let extractedText: string | undefined;
      const fileName = file.name.toLowerCase();

      // Extract text from PDF files
      if (fileName.endsWith(".pdf")) {
        const arrayBuffer = await file.arrayBuffer();
        extractedText = await extractPdfText(arrayBuffer);
      }
      // Extract text from DOCX files
      else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
        const arrayBuffer = await file.arrayBuffer();
        extractedText = await extractDocxText(arrayBuffer);
      }
      // Read plain text files directly
      else if (textExtensions.some(ext => fileName.endsWith(ext))) {
        const text = await file.text();
        extractedText = text;
      }

      // Determine mime type
      let mimeType = file.type;
      if (!mimeType) {
        if (fileName.endsWith(".pdf")) mimeType = "application/pdf";
        else if (fileName.endsWith(".docx")) mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        else if (fileName.endsWith(".doc")) mimeType = "application/msword";
        else if (fileName.endsWith(".zip")) mimeType = "application/zip";
        else if (fileName.endsWith(".rar")) mimeType = "application/x-rar-compressed";
        else if (fileName.endsWith(".7z")) mimeType = "application/x-7z-compressed";
        else if (fileName.endsWith(".mp4")) mimeType = "video/mp4";
        else if (fileName.endsWith(".mp3")) mimeType = "audio/mpeg";
        else if (fileName.endsWith(".exe")) mimeType = "application/x-msdownload";
        else if (fileName.endsWith(".apk")) mimeType = "application/vnd.android.package-archive";
        else mimeType = "application/octet-stream";
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        const newAttachment: Attachment = {
          id: uuidv4(),
          type,
          name: file.name,
          mimeType,
          base64,
          size: file.size,
          extractedText,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Current model display info
  const currentDisplay = currentModel ? formatModelDisplayName(currentModel) : "Select model";
  const currentCategory = currentModel ? MODEL_CATEGORIES[categorizeModel(currentModel)] : null;

  // Filter fetched models by search (matches both raw ID and display name)
  const filteredModels = useMemo(() => {
    if (!modelSearch.trim()) return fetchedModels;
    const q = modelSearch.toLowerCase();
    return fetchedModels.filter((id) => {
      const display = formatModelDisplayName(id).toLowerCase();
      return id.toLowerCase().includes(q) || display.includes(q);
    });
  }, [fetchedModels, modelSearch]);

  // Grouped models — only computed when not searching
  const groupedModels = useMemo(() => {
    if (modelSearch.trim()) return null;
    return groupModels(
      fetchedModels.map((id) => ({ id, displayName: formatModelDisplayName(id) }))
    );
  }, [fetchedModels, modelSearch]);

  // Helper to render a single model row (DRY for both flat & grouped views)
  const renderModelButton = (modelId: string, displayName?: string) => {
    const isSelected = currentModel === modelId;
    const display = displayName ?? formatModelDisplayName(modelId);
    return (
      <button
        key={modelId}
        onClick={() => {
          onModelChange(modelId);
          setShowModelPicker(false);
          setModelSearch("");
        }}
        className={`w-full text-left px-4 py-2 transition-colors flex items-center gap-3 ${
          isSelected
            ? "bg-light-accent/10 dark:bg-dark-accent/10"
            : "hover:bg-light-hover dark:hover:bg-dark-hover"
        }`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium truncate ${isSelected ? "text-light-accent dark:text-dark-accent" : "text-light-text dark:text-dark-text"}`}>
              {display}
            </span>
            {isSelected && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-light-accent/20 dark:bg-dark-accent/20 text-light-accent dark:text-dark-accent font-semibold flex-shrink-0">
                Active
              </span>
            )}
          </div>
          <p className="text-[10px] text-light-muted dark:text-dark-muted mt-0.5 truncate font-mono">
            {modelId}
          </p>
        </div>
        {isSelected && (
          <Check size={14} className="flex-shrink-0 text-light-accent dark:text-dark-accent" />
        )}
      </button>
    );
  };

  return (
    <div className="border-t border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg p-4">
      <div className="max-w-3xl mx-auto">
        {/* Model Selector */}
        <div className="relative mb-2" ref={modelPickerRef}>
          <button
            onClick={() => setShowModelPicker(!showModelPicker)}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-hover dark:hover:bg-dark-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentCategory?.icon && (
              <span className="flex-shrink-0 leading-none" aria-hidden="true">
                {currentCategory.icon}
              </span>
            )}
            <span className="max-w-[220px] truncate">{currentDisplay}</span>
            <ChevronDown size={12} className={`text-light-muted dark:text-dark-muted transition-transform ${showModelPicker ? "rotate-180" : ""}`} />
          </button>

          {/* Model Picker Dropdown */}
          {showModelPicker && (
            <div className="absolute bottom-full left-0 mb-2 w-[420px] max-w-[calc(100vw-2rem)] max-h-[480px] bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col">
              {/* Header */}
              <div className="px-4 py-3 border-b border-light-border dark:border-dark-border">
                <p className="text-sm font-semibold text-light-text dark:text-dark-text">Available Models</p>
                <p className="text-[11px] text-light-muted dark:text-dark-muted mt-0.5">
                  Dikelompokkan per family, urut dari kualitas tertinggi.
                </p>
              </div>

              {/* Search */}
              {fetchedModels.length > 0 && (
                <div className="p-2 border-b border-light-border dark:border-dark-border">
                  <input
                    type="text"
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    placeholder="Search models..."
                    autoFocus
                    className="w-full px-3 py-2 rounded-lg bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border text-light-text dark:text-dark-text text-xs focus:outline-none focus:border-light-accent dark:focus:border-dark-accent"
                  />
                </div>
              )}

              {/* Model List */}
              <div className="overflow-y-auto custom-scrollbar flex-1">
                {fetchedModels.length === 0 ? (
                  <div className="p-6 text-center text-xs text-light-muted dark:text-dark-muted">
                    No models available. Connect to a provider in Settings.
                  </div>
                ) : modelSearch && filteredModels.length === 0 ? (
                  <div className="p-6 text-center text-xs text-light-muted dark:text-dark-muted">
                    No models match &quot;{modelSearch}&quot;
                  </div>
                ) : modelSearch ? (
                  // Search mode: flat list
                  filteredModels.map((modelId) => renderModelButton(modelId))
                ) : (
                  // Grouped mode: section per family, sorted by quality
                  groupedModels?.map((group) => (
                    <div
                      key={group.category.id}
                      className="border-b border-light-border/50 dark:border-dark-border/50 last:border-b-0"
                    >
                      {/* Sticky category header */}
                      <div className="sticky top-0 z-10 px-4 py-1.5 bg-light-bg/95 dark:bg-dark-bg/95 backdrop-blur-sm border-b border-light-border/30 dark:border-dark-border/30 flex items-center gap-2">
                        {group.category.icon && (
                          <span className="text-sm leading-none" aria-hidden="true">
                            {group.category.icon}
                          </span>
                        )}
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-light-text dark:text-dark-text">
                          {group.category.label}
                        </span>
                        <span className="text-[10px] text-light-muted dark:text-dark-muted">
                          ({group.models.length})
                        </span>
                        {group.category.description && (
                          <span className="hidden sm:inline text-[10px] text-light-muted/70 dark:text-dark-muted/70 truncate ml-auto">
                            {group.category.description}
                          </span>
                        )}
                      </div>
                      {/* Model items */}
                      {group.models.map((m) => renderModelButton(m.id, m.displayName))}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="relative bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border rounded-2xl focus-within:border-light-accent dark:focus-within:border-dark-accent transition-colors">
          {/* Mode Toggle - inside input box, top */}
          <div className="flex items-center gap-1 px-3 pt-2.5 pb-1">
            {([
              { mode: "normal" as ChatMode, label: "Normal", icon: <Zap size={11} /> },
              { mode: "thinking" as ChatMode, label: "Thinking", icon: <Brain size={11} /> },
              { mode: "deep-research" as ChatMode, label: "Deep Research", icon: <Search size={11} /> },
            ]).map((item) => (
              <button
                key={item.mode}
                onClick={() => setChatMode(item.mode)}
                disabled={disabled}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                  chatMode === item.mode
                    ? item.mode === "thinking"
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      : item.mode === "deep-research"
                      ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                      : "bg-light-accent/15 text-light-accent dark:text-dark-accent"
                    : "text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-hover dark:hover:bg-dark-hover"
                } disabled:opacity-40`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Attachment Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pt-2">
              {attachments.map((att) => (
                <div key={att.id} className="relative group">
                  {att.type === "image" ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-light-border dark:border-dark-border">
                      <img src={`data:${att.mimeType};base64,${att.base64}`} alt={att.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border">
                      <FileText size={12} className={
                        att.name.endsWith(".pdf") ? "text-red-500" :
                        (att.name.endsWith(".docx") || att.name.endsWith(".doc")) ? "text-blue-500" :
                        (att.name.endsWith(".zip") || att.name.endsWith(".rar") || att.name.endsWith(".7z")) ? "text-yellow-500" :
                        (att.name.endsWith(".mp4") || att.name.endsWith(".mkv") || att.name.endsWith(".avi") || att.name.endsWith(".mov")) ? "text-purple-500" :
                        (att.name.endsWith(".mp3") || att.name.endsWith(".wav") || att.name.endsWith(".ogg") || att.name.endsWith(".flac")) ? "text-green-500" :
                        (att.name.endsWith(".exe") || att.name.endsWith(".apk")) ? "text-orange-500" :
                        "text-light-accent dark:text-dark-accent"
                      } />
                      <span className="text-[10px] text-light-text dark:text-dark-text max-w-[80px] truncate">{att.name}</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Textarea + Upload + Send */}
          <div className="flex items-end gap-2 px-4 pb-3 pt-1">
            {/* Upload Buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={disabled}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-hover dark:hover:bg-dark-hover transition-colors disabled:opacity-30"
                title="Upload gambar"
              >
                <ImagePlus size={16} />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-hover dark:hover:bg-dark-hover transition-colors disabled:opacity-30"
                title="Upload file"
              >
                <Paperclip size={16} />
              </button>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e, "image")}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.csv,.json,.xml,.html,.css,.js,.ts,.py,.java,.c,.cpp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.rtf,.odt,.jpg,.jpeg,.png,.gif,.bmp,.svg,.webp,.mp4,.mkv,.avi,.mov,.wmv,.flv,.webm,.mp3,.wav,.ogg,.flac,.aac,.wma,.zip,.rar,.7z,.tar,.gz,.bz2,.exe,.apk,.dmg,.iso,.bin"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e, "file")}
            />

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                disabled
                  ? "Configure your API settings first..."
                  : chatMode === "thinking"
                  ? "Ask something... AI will show its reasoning process"
                  : chatMode === "deep-research"
                  ? "Ask something... AI will conduct in-depth research"
                  : "Type your message..."
              }
              disabled={disabled}
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-light-text dark:text-dark-text placeholder-light-muted dark:placeholder-dark-muted max-h-[200px] disabled:opacity-50"
            />
            {isLoading ? (
              <button
                onClick={onStop}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                title="Stop generating"
              >
                <Square size={16} fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={(!input.trim() && attachments.length === 0) || disabled}
                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity ${
                  chatMode === "thinking"
                    ? "bg-amber-500"
                    : chatMode === "deep-research"
                    ? "bg-blue-500"
                    : "bg-light-accent dark:bg-dark-accent"
                }`}
                title="Send message"
              >
                <Send size={16} />
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-center mt-2 text-light-muted dark:text-dark-muted">
          Press Enter to send, Shift+Enter for new line
          {chatMode !== "normal" && (
            <span className={`ml-1 font-medium ${chatMode === "thinking" ? "text-amber-500" : "text-blue-500"}`}>
              · {chatMode === "thinking" ? "Thinking mode" : "Deep Research mode"}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
