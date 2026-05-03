"use client";

import { useState } from "react";
import { X, Search, Check, Lock, Zap, Sparkles, Bot, Waves, Code2, Palette, Crown } from "lucide-react";

interface ModelInfo {
  id: string;
  description: string;
}

interface TierInfo {
  label: string;
  gradient: string;
  badge: string;
  abbr: string;
  locked: boolean; // locked for Kiro/CodeBudy free accounts
  models: ModelInfo[];
}

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

interface ModelCatalogProps {
  isOpen: boolean;
  onClose: () => void;
  currentModel: string;
  onModelChange: (model: string) => void;
}

export default function ModelCatalog({ isOpen, onClose, currentModel, onModelChange }: ModelCatalogProps) {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  // Filter tiers by search
  const filteredTiers = TIERS.map((tier) => ({
    ...tier,
    models: search
      ? tier.models.filter(
          (m) =>
            m.id.toLowerCase().includes(search.toLowerCase()) ||
            m.description.toLowerCase().includes(search.toLowerCase())
        )
      : tier.models,
  })).filter((tier) => tier.models.length > 0);

  const totalModels = TIERS.reduce((sum, t) => sum + t.models.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-light-text dark:text-dark-text">Available Models</h2>
              <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
                Select a model to use as your default for new conversations. Models are grouped by tier.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover text-light-muted dark:text-dark-muted transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search models..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border text-light-text dark:text-dark-text text-sm focus:outline-none focus:border-light-accent dark:focus:border-dark-accent transition-colors"
            />
          </div>

          {/* Account badge */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500" />
              <span className="text-[10px] font-medium text-light-text dark:text-dark-text">CodeBudy</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
              <span className="text-[10px] font-medium text-light-text dark:text-dark-text">Kiro</span>
            </div>
            <span className="text-[10px] text-light-muted dark:text-dark-muted">
              Access: Standard + MAX only
            </span>
          </div>
        </div>

        {/* Model List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredTiers.map((tier) => (
            <div key={tier.label}>
              {/* Tier Header */}
              <div className="sticky top-0 z-10 px-6 py-3 bg-light-sidebar dark:bg-dark-sidebar border-b border-light-border dark:border-dark-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${tier.gradient} flex items-center justify-center shadow-sm`}>
                      <span className="text-[9px] font-bold text-white">{tier.abbr}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-light-text dark:text-dark-text">{tier.label}</span>
                        {tier.locked && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-red-500/10 text-red-500">
                            <Lock size={8} />
                            Upgrade required
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-light-muted dark:text-dark-muted">{tier.models.length} models</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Models */}
              <div className={tier.locked ? "opacity-50" : ""}>
                {tier.models.map((model) => {
                  const isSelected = currentModel === model.id;
                  const canSelect = !tier.locked;

                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        if (canSelect) {
                          onModelChange(model.id);
                        }
                      }}
                      disabled={!canSelect}
                      className={`w-full text-left px-6 py-3 transition-colors flex items-center gap-4 border-b border-light-border/50 dark:border-dark-border/50 ${
                        !canSelect
                          ? "cursor-not-allowed"
                          : isSelected
                          ? "bg-light-accent/5 dark:bg-dark-accent/5"
                          : "hover:bg-light-hover dark:hover:bg-dark-hover"
                      }`}
                    >
                      {/* Model info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${isSelected ? "text-light-accent dark:text-dark-accent" : "text-light-text dark:text-dark-text"}`}>
                            {model.id}
                          </span>
                          {isSelected && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-light-accent/15 dark:bg-dark-accent/15 text-light-accent dark:text-dark-accent">
                              Active
                            </span>
                          )}
                          {tier.locked && (
                            <Lock size={10} className="text-red-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-light-muted dark:text-dark-muted mt-0.5">
                          {model.description}
                        </p>
                      </div>

                      {/* Selected check */}
                      {isSelected && canSelect && (
                        <Check size={16} className="flex-shrink-0 text-light-accent dark:text-dark-accent" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Empty state */}
          {filteredTiers.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-light-muted dark:text-dark-muted">
                No models match &quot;{search}&quot;
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-light-border dark:border-dark-border bg-light-sidebar dark:bg-dark-sidebar">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-light-muted dark:text-dark-muted">
              {totalModels} models total · <Lock size={9} className="inline" /> Locked tiers require Copilot/Wavespeed/Codex/Canva subscription
            </p>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-light-accent dark:bg-dark-accent text-white hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
