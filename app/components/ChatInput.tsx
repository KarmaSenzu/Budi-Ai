"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Square, ChevronDown, Zap, Sparkles, Bot, Waves, Code2, Palette, Check, Lock, Brain, Search, ImagePlus, Paperclip, X, FileText } from "lucide-react";
import { ChatMode, Attachment } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

// ─── Model & Tier Types ───────────────────────────────────────────

interface ModelInfo {
  id: string;
  description: string;
}

interface TierInfo {
  label: string;
  gradient: string;
  badge: string;
  abbr: string;
  locked: boolean;
  models: ModelInfo[];
}

// ─── Full Model Catalog (129 models, 6 tiers) ────────────────────

const TIERS: TierInfo[] = [
  {
    label: "Standard",
    gradient: "from-emerald-500 to-teal-500",
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    abbr: "ST",
    locked: false,
    models: [
      { id: "auto", description: "AI model" },
      { id: "claude-sonnet-4.5", description: "Best balance of speed and intelligence" },
      { id: "claude-sonnet-4", description: "Fast and intelligent" },
      { id: "claude-haiku-4.5", description: "Fastest, lightweight tasks" },
      { id: "deepseek-3.2", description: "DeepSeek, open-weight model" },
      { id: "minimax-m2.5", description: "AI model" },
      { id: "minimax-m2.1", description: "AI model" },
      { id: "glm-5", description: "GLM series by Zhipu" },
      { id: "qwen3-coder-next", description: "AI model" },
    ],
  },
  {
    label: "MAX",
    gradient: "from-amber-500 to-orange-500",
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    abbr: "MX",
    locked: false,
    models: [
      { id: "enowx-default", description: "enowxlabs default model" },
      { id: "gemini-3.1-pro", description: "Latest Gemini Pro" },
      { id: "gemini-3.1-flash-lite", description: "Gemini 3.x series" },
      { id: "gemini-3.0-flash", description: "Gemini 3.x series" },
      { id: "gemini-2.5-pro", description: "Gemini Pro, strong reasoning" },
      { id: "gemini-2.5-flash", description: "Gemini Flash, fast responses" },
      { id: "gpt-5.4", description: "Latest GPT, most capable" },
      { id: "gpt-5.2", description: "Balanced GPT model" },
      { id: "gpt-5.3-codex", description: "Code-optimized GPT" },
      { id: "gpt-5.2-codex", description: "Balanced GPT model" },
      { id: "gpt-5.1", description: "Efficient GPT model" },
      { id: "gpt-5.1-codex", description: "Efficient GPT model" },
      { id: "gpt-5.1-codex-max", description: "Efficient GPT model" },
      { id: "gpt-5.1-codex-mini", description: "Efficient GPT model" },
      { id: "deepseek-v3-2-volc", description: "DeepSeek, open-weight model" },
      { id: "claude-opus-4.6", description: "Most capable, complex reasoning" },
      { id: "kimi-k2.5", description: "Kimi by Moonshot AI" },
    ],
  },
  {
    label: "Copilot",
    gradient: "from-blue-500 to-indigo-500",
    badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    abbr: "CP",
    locked: true,
    models: [
      { id: "cp-gpt-4o", description: "AI model" },
      { id: "cp-gpt-4o-mini", description: "AI model" },
      { id: "cp-gpt-5.4", description: "Latest GPT, most capable" },
      { id: "cp-gpt-5.4-mini", description: "Latest GPT, most capable" },
      { id: "cp-claude-sonnet-4", description: "Fast and intelligent" },
      { id: "cp-claude-sonnet-4.5", description: "Best balance of speed and intelligence" },
      { id: "cp-claude-sonnet-4.6", description: "Fast and intelligent" },
      { id: "cp-claude-opus-4.6", description: "Most capable, complex reasoning" },
      { id: "cp-claude-opus-4.7", description: "Most capable, complex reasoning" },
      { id: "cp-gemini-2.5-pro", description: "Gemini Pro, strong reasoning" },
      { id: "cp-gemini-3-flash", description: "Gemini 3.x series" },
    ],
  },
  {
    label: "Wavespeed",
    gradient: "from-purple-500 to-pink-500",
    badge: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    abbr: "WS",
    locked: true,
    models: [
      { id: "ws-claude-opus-4.7", description: "Most capable, complex reasoning" },
      { id: "ws-claude-opus-4.6", description: "Most capable, complex reasoning" },
      { id: "ws-claude-opus-4.5", description: "Most capable, complex reasoning" },
      { id: "ws-claude-opus-4", description: "Most capable, complex reasoning" },
      { id: "ws-claude-sonnet-4.6", description: "Fast and intelligent" },
      { id: "ws-claude-sonnet-4.5", description: "Best balance of speed and intelligence" },
      { id: "ws-claude-sonnet-4", description: "Fast and intelligent" },
      { id: "ws-claude-3.7-sonnet", description: "AI model" },
      { id: "ws-claude-haiku-4.5", description: "Fastest, lightweight tasks" },
      { id: "ws-gpt-5.4-pro", description: "Latest GPT, most capable" },
      { id: "ws-gpt-5.4", description: "Latest GPT, most capable" },
      { id: "ws-gpt-5.2-pro", description: "Balanced GPT model" },
      { id: "ws-gpt-5.2", description: "Balanced GPT model" },
      { id: "ws-gpt-5", description: "AI model" },
      { id: "ws-gpt-5-mini", description: "AI model" },
      { id: "ws-gpt-4o", description: "AI model" },
      { id: "ws-o3", description: "AI model" },
      { id: "ws-o3-deep-research", description: "AI model" },
      { id: "ws-o4-mini", description: "AI model" },
      { id: "ws-o1-pro", description: "AI model" },
      { id: "ws-gemini-3.1-pro", description: "Latest Gemini Pro" },
      { id: "ws-gemini-3-pro", description: "Gemini 3.x series" },
      { id: "ws-gemini-2.5-pro", description: "Gemini Pro, strong reasoning" },
      { id: "ws-gemini-2.5-flash", description: "Gemini Flash, fast responses" },
      { id: "ws-grok-4", description: "AI model" },
      { id: "ws-grok-4-fast", description: "AI model" },
      { id: "ws-grok-4.1-fast", description: "AI model" },
      { id: "ws-grok-3", description: "AI model" },
      { id: "ws-deepseek-v3.2", description: "DeepSeek, open-weight model" },
      { id: "ws-deepseek-r1", description: "DeepSeek, open-weight model" },
      { id: "ws-deepseek-chat", description: "DeepSeek, open-weight model" },
      { id: "ws-qwen3-max-thinking", description: "AI model" },
      { id: "ws-qwen3-max", description: "AI model" },
      { id: "ws-qwen3-coder", description: "AI model" },
      { id: "ws-qwen3-235b", description: "AI model" },
      { id: "ws-kimi-k2.5", description: "Kimi by Moonshot AI" },
      { id: "ws-kimi-k2", description: "Kimi by Moonshot AI" },
      { id: "ws-mistral-large", description: "AI model" },
      { id: "ws-mistral-medium-3.1", description: "AI model" },
      { id: "ws-command-a", description: "AI model" },
      { id: "ws-llama-4-maverick", description: "AI model" },
      { id: "ws-llama-4-scout", description: "AI model" },
      { id: "ws-minimax-m2.7", description: "AI model" },
      { id: "ws-glm-5.1", description: "GLM series by Zhipu" },
      { id: "ws-glm-5", description: "GLM series by Zhipu" },
      { id: "ws-mimo-v2-pro", description: "AI model" },
      { id: "ws-mimo-v2-omni", description: "AI model" },
      { id: "ws-mimo-v2-flash", description: "AI model" },
      { id: "ws-gpt-image-2", description: "AI model" },
      { id: "ws-gpt-image-1.5", description: "AI model" },
      { id: "ws-gpt-image-1", description: "AI model" },
      { id: "ws-dall-e-3", description: "AI model" },
      { id: "ws-imagen4-ultra", description: "AI model" },
      { id: "ws-imagen4", description: "AI model" },
      { id: "ws-imagen4-fast", description: "AI model" },
      { id: "ws-gemini-3-pro-image", description: "Gemini 3.x series" },
      { id: "ws-grok-imagine", description: "AI model" },
      { id: "ws-grok-2-image", description: "AI model" },
      { id: "ws-flux-2-max", description: "AI model" },
      { id: "ws-flux-2-pro", description: "AI model" },
      { id: "ws-flux-2-dev", description: "AI model" },
      { id: "ws-flux-kontext-pro", description: "AI model" },
      { id: "ws-flux-schnell", description: "AI model" },
      { id: "ws-midjourney", description: "AI model" },
      { id: "ws-ideogram-v3", description: "AI model" },
      { id: "ws-recraft-v4", description: "AI model" },
      { id: "ws-seedream-v5", description: "AI model" },
      { id: "ws-luma-photon", description: "AI model" },
      { id: "ws-kling-image-o3", description: "AI model" },
      { id: "ws-sora-2", description: "AI model" },
      { id: "ws-sora", description: "AI model" },
      { id: "ws-veo3.1", description: "AI model" },
      { id: "ws-veo3.1-fast", description: "AI model" },
      { id: "ws-veo3.1-lite", description: "AI model" },
      { id: "ws-grok-imagine-video", description: "AI model" },
      { id: "ws-gen4-aleph", description: "AI model" },
      { id: "ws-gen4-turbo", description: "AI model" },
      { id: "ws-kling-v3-pro", description: "AI model" },
      { id: "ws-kling-v3-std", description: "AI model" },
      { id: "ws-kling-video-o3", description: "AI model" },
      { id: "ws-pika-v2.2", description: "AI model" },
      { id: "ws-luma-ray-2", description: "AI model" },
      { id: "ws-hailuo-2.3", description: "AI model" },
      { id: "ws-seedance-2", description: "AI model" },
      { id: "ws-vidu-q3", description: "AI model" },
      { id: "ws-wan-2.7", description: "AI model" },
    ],
  },
  {
    label: "Codex",
    gradient: "from-cyan-500 to-blue-500",
    badge: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
    abbr: "CX",
    locked: true,
    models: [
      { id: "codex-gpt-5.5", description: "AI model" },
      { id: "codex-gpt-5.4", description: "Latest GPT, most capable" },
      { id: "codex-gpt-5.3", description: "Code-optimized GPT" },
      { id: "codex-gpt-5.2", description: "Balanced GPT model" },
      { id: "codex-gpt-5.1", description: "Efficient GPT model" },
    ],
  },
  {
    label: "Canva",
    gradient: "from-pink-500 to-rose-500",
    badge: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
    abbr: "CV",
    locked: true,
    models: [
      { id: "canva-image", description: "AI model" },
    ],
  },
];

// Helper: find which tier a model belongs to
function findModelTier(modelId: string): { tier: TierInfo; model: ModelInfo } | null {
  for (const tier of TIERS) {
    const model = tier.models.find((m) => m.id === modelId);
    if (model) return { tier, model };
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────

interface ChatInputProps {
  onSend: (message: string, chatMode?: ChatMode, attachments?: Attachment[]) => void;
  onStop: () => void;
  isLoading: boolean;
  disabled?: boolean;
  currentModel: string;
  onModelChange: (model: string) => void;
}

export default function ChatInput({
  onSend,
  onStop,
  isLoading,
  disabled,
  currentModel,
  onModelChange,
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

  // Handle file/image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Limit: 10MB for images, 5MB for files
      const maxSize = type === "image" ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`File "${file.name}" terlalu besar. Maksimal ${type === "image" ? "10MB" : "5MB"}.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        const newAttachment: Attachment = {
          id: uuidv4(),
          type,
          name: file.name,
          mimeType: file.type,
          base64,
          size: file.size,
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
  const currentInfo = findModelTier(currentModel);
  const currentDisplayName = currentModel || "Select model";

  // Filter tiers by search
  const filteredTiers = TIERS.map((tier) => ({
    ...tier,
    models: modelSearch
      ? tier.models.filter(
          (m) =>
            m.id.toLowerCase().includes(modelSearch.toLowerCase()) ||
            m.description.toLowerCase().includes(modelSearch.toLowerCase())
        )
      : tier.models,
  })).filter((tier) => tier.models.length > 0);

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
            {currentInfo && (
              <span className={`w-4 h-4 rounded flex items-center justify-center bg-gradient-to-br ${currentInfo.tier.gradient}`}>
                <span className="text-[7px] font-bold text-white">{currentInfo.tier.abbr}</span>
              </span>
            )}
            <span className="max-w-[200px] truncate">{currentDisplayName}</span>
            {currentInfo && (
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${currentInfo.tier.badge}`}>
                {currentInfo.tier.label}
              </span>
            )}
            <ChevronDown size={12} className={`text-light-muted dark:text-dark-muted transition-transform ${showModelPicker ? "rotate-180" : ""}`} />
          </button>

          {/* Model Picker Dropdown */}
          {showModelPicker && (
            <div className="absolute bottom-full left-0 mb-2 w-[380px] max-h-[480px] bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col">
              {/* Header */}
              <div className="px-4 py-3 border-b border-light-border dark:border-dark-border">
                <p className="text-sm font-semibold text-light-text dark:text-dark-text">Available Models</p>
                <p className="text-[11px] text-light-muted dark:text-dark-muted mt-0.5">
                  Select a model to use as your default for new conversations. Models are grouped by tier.
                </p>
              </div>

              {/* Search */}
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

              {/* Model List */}
              <div className="overflow-y-auto custom-scrollbar flex-1">
                {filteredTiers.map((tier) => (
                  <div key={tier.label}>
                    {/* Tier Header */}
                    <div className="sticky top-0 z-10 px-3 py-2 bg-light-sidebar dark:bg-dark-sidebar border-b border-light-border dark:border-dark-border">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${tier.gradient} flex items-center justify-center shadow-sm`}>
                          <span className="text-[8px] font-bold text-white">{tier.abbr}</span>
                        </div>
                        <span className="text-xs font-semibold text-light-text dark:text-dark-text">{tier.label}</span>
                        <span className="text-[10px] text-light-muted dark:text-dark-muted">{tier.models.length} models</span>
                        {tier.locked && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-semibold bg-red-500/10 text-red-500">
                            <Lock size={7} />
                            Locked
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Models in this tier */}
                    <div className={tier.locked ? "opacity-40" : ""}>
                    {tier.models.map((model) => {
                      const isSelected = currentModel === model.id;
                      const canSelect = !tier.locked;
                      return (
                        <button
                          key={model.id}
                          onClick={() => {
                            if (!canSelect) return;
                            onModelChange(model.id);
                            setShowModelPicker(false);
                            setModelSearch("");
                          }}
                          disabled={!canSelect}
                          className={`w-full text-left px-4 py-2.5 transition-colors flex items-center gap-3 ${
                            !canSelect
                              ? "cursor-not-allowed"
                              : isSelected
                              ? "bg-light-accent/10 dark:bg-dark-accent/10"
                              : "hover:bg-light-hover dark:hover:bg-dark-hover"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium ${isSelected ? "text-light-accent dark:text-dark-accent" : "text-light-text dark:text-dark-text"}`}>
                                {model.id}
                              </span>
                              {isSelected && canSelect && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-light-accent/20 dark:bg-dark-accent/20 text-light-accent dark:text-dark-accent font-semibold">
                                  Active
                                </span>
                              )}
                              {tier.locked && (
                                <Lock size={8} className="text-red-400" />
                              )}
                            </div>
                            <p className="text-[10px] text-light-muted dark:text-dark-muted mt-0.5 truncate">
                              {model.description}
                            </p>
                          </div>
                          {isSelected && canSelect && (
                            <Check size={14} className="flex-shrink-0 text-light-accent dark:text-dark-accent" />
                          )}
                        </button>
                      );
                    })}
                    </div>
                  </div>
                ))}

                {/* Empty state */}
                {filteredTiers.length === 0 && (
                  <div className="p-6 text-center text-xs text-light-muted dark:text-dark-muted">
                    No models match &quot;{modelSearch}&quot;
                  </div>
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
                      <FileText size={12} className="text-light-accent dark:text-dark-accent" />
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
              accept=".txt,.md,.csv,.json,.xml,.html,.css,.js,.ts,.py,.java,.c,.cpp,.pdf"
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
