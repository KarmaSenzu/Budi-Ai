"use client";

import { useState, useEffect } from "react";
import { Settings } from "@/lib/types";
import { X, Eye, EyeOff, RotateCcw, Key, Shield } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Partial<Settings>) => void;
  onReset: () => void;
}

export default function SettingsModal({ isOpen, onClose, settings, onSave, onReset }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState<"api" | "advanced">("api");

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border">
          <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover text-light-muted dark:text-dark-muted transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-light-border dark:border-dark-border">
          <button
            onClick={() => setActiveTab("api")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "api"
                ? "text-light-accent dark:text-dark-accent border-b-2 border-light-accent dark:border-dark-accent"
                : "text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text"
            }`}
          >
            API Key
          </button>
          <button
            onClick={() => setActiveTab("advanced")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "advanced"
                ? "text-light-accent dark:text-dark-accent border-b-2 border-light-accent dark:border-dark-accent"
                : "text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text"
            }`}
          >
            Advanced
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {activeTab === "api" ? (
            <>
              {/* Info Banner */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-light-accent/5 dark:bg-dark-accent/5 border border-light-accent/20 dark:border-dark-accent/20">
                <Key size={18} className="flex-shrink-0 text-light-accent dark:text-dark-accent mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-light-text dark:text-dark-text">
                    Masukkan API Key Anda
                  </p>
                  <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
                    API Key digunakan untuk mengautentikasi permintaan Anda ke server AI. Dapatkan API Key dari admin atau dashboard akun Anda.
                  </p>
                </div>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                  API Key <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={localSettings.apiKey}
                    onChange={(e) => setLocalSettings((prev) => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="sk-..."
                    className="w-full px-3 py-2.5 pr-10 rounded-lg bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-light-accent dark:focus:border-dark-accent transition-colors font-mono text-sm"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text"
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Security Note */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-light-sidebar dark:bg-dark-sidebar">
                <Shield size={14} className="flex-shrink-0 text-emerald-500 mt-0.5" />
                <div className="text-[11px] text-light-muted dark:text-dark-muted leading-relaxed">
                  <strong className="text-light-text dark:text-dark-text">Keamanan:</strong> API Key Anda hanya disimpan di browser ini (localStorage) dan dikirim langsung ke server saat request. Tidak pernah disimpan di server kami.
                </div>
              </div>
            </>
          ) : (
            <>
              {/* System Prompt */}
              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                  System Prompt
                </label>
                <textarea
                  value={localSettings.systemPrompt}
                  onChange={(e) => setLocalSettings((prev) => ({ ...prev, systemPrompt: e.target.value }))}
                  placeholder="You are a helpful assistant."
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-lg bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-light-accent dark:focus:border-dark-accent transition-colors resize-none text-sm"
                />
                <p className="text-[10px] text-light-muted dark:text-dark-muted mt-1">
                  Instruksi dasar untuk AI. Kosongkan untuk menggunakan default.
                </p>
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                  Temperature: {localSettings.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={localSettings.temperature}
                  onChange={(e) => setLocalSettings((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-full accent-light-accent dark:accent-dark-accent"
                />
                <div className="flex justify-between text-xs text-light-muted dark:text-dark-muted mt-1">
                  <span>Precise (0)</span>
                  <span>Creative (2)</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  value={localSettings.maxTokens}
                  onChange={(e) => setLocalSettings((prev) => ({ ...prev, maxTokens: parseInt(e.target.value) || 4096 }))}
                  min={1}
                  max={128000}
                  className="w-full px-3 py-2.5 rounded-lg bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-light-accent dark:focus:border-dark-accent transition-colors"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-light-border dark:border-dark-border">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-2 text-sm text-light-muted dark:text-dark-muted hover:text-red-500 transition-colors"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-light-muted dark:text-dark-muted hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!localSettings.apiKey.trim()}
              className="px-4 py-2 rounded-lg text-sm bg-light-accent dark:bg-dark-accent text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
