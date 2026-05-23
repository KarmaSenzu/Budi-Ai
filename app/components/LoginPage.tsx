"use client";

import { useState } from "react";
import { Key, ShoppingCart, ExternalLink, Eye, EyeOff, ArrowRight, Shield, Zap, MessageSquare, BarChart3, HelpCircle, CheckCircle2, Info, ChevronDown } from "lucide-react";

interface LoginPageProps {
  onLogin: (apiKey: string, baseUrl: string) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export default function LoginPage({ onLogin, theme, onToggleTheme }: LoginPageProps) {
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"cara" | "info">("cara");

  const validate = (): string | null => {
    const trimmedKey = apiKey.trim();
    const trimmedUrl = baseUrl.trim();

    if (!trimmedKey) {
      return "Masukkan API Key Anda.";
    }

    // Reject license/activation-code shape so users don't paste the wrong thing
    if (/^[A-Z]+-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/i.test(trimmedKey)) {
      return "Itu sepertinya kode aktivasi/lisensi, bukan API Key. Tukarkan terlebih dahulu untuk mendapatkan API Key.";
    }

    // Provider-agnostic minimum length check; the actual validity is verified
    // by the connection itself (e.g. /models call) once the user submits.
    if (trimmedKey.length < 8) {
      return "API Key terlalu pendek.";
    }

    if (!trimmedUrl) {
      return "Masukkan Base URL provider Anda.";
    }

    // Validate URL format
    if (!/^https?:\/\/.+/i.test(trimmedUrl)) {
      return "Format Base URL tidak valid. Harus diawali dengan http:// atau https://";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setIsLoading(true);
    setTimeout(() => {
      onLogin(apiKey.trim(), baseUrl.trim().replace(/\/+$/, ""));
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-light-border dark:border-dark-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <span className="text-sm font-bold text-white">B</span>
          </div>
          <span className="text-lg font-bold text-light-text dark:text-dark-text">dmrxai</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggleTheme} className="p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover text-light-muted dark:text-dark-muted transition-colors text-sm">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left - Info */}
          <div className="space-y-5 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar pr-2">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-light-text dark:text-dark-text mb-3">
                Selamat Datang di{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">dmrxai</span>
              </h1>
              <p className="text-light-muted dark:text-dark-muted text-sm leading-relaxed">
                Platform AI chat yang powerful dengan berbagai model AI. Bisa digunakan dari device mana pun — cukup masukkan API Key Anda untuk mulai.
              </p>
            </div>

            {/* Alert - Gratis */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <Zap size={18} className="flex-shrink-0 text-emerald-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">dmrxai Gratis untuk Digunakan!</p>
                <p className="text-xs text-light-muted dark:text-dark-muted mt-1 leading-relaxed">
                  Anda bisa menggunakan dmrxai secara <strong className="text-light-text dark:text-dark-text">gratis</strong>. Semua model AI tersedia tanpa biaya, Anda hanya perlu memiliki akun untuk mengakses model AI yang diinginkan.
                </p>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-1 p-1 rounded-lg bg-light-input dark:bg-dark-input">
              <button
                onClick={() => setActiveTab("cara")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "cara"
                    ? "bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text shadow-sm"
                    : "text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text"
                }`}
              >
                <HelpCircle size={12} />
                <span>Cara Menggunakan</span>
              </button>
              <button
                onClick={() => setActiveTab("info")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "info"
                    ? "bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text shadow-sm"
                    : "text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text"
                }`}
              >
                <Info size={12} />
                <span>Informasi</span>
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "cara" ? (
              <div className="space-y-3">
                <div className="flex gap-3 p-3 rounded-xl bg-light-sidebar dark:bg-dark-sidebar border border-light-border dark:border-dark-border">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-light-text dark:text-dark-text">Dapatkan API Key</p>
                    <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                      Dapatkan API Key dari provider AI yang Anda gunakan (OpenAI, Anthropic, OpenRouter, Groq, atau provider OpenAI-compatible lainnya).
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 rounded-xl bg-light-sidebar dark:bg-dark-sidebar border border-light-border dark:border-dark-border">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-light-text dark:text-dark-text">Cek Token & API Key</p>
                    <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                      Anda bisa mengecek token dan API Key Anda melalui <a href="http://localhost:1431/" target="_blank" rel="noopener noreferrer" className="text-light-accent dark:text-dark-accent hover:underline font-medium">halaman dashboard</a> yang dikonfigurasi oleh deployment Anda.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 rounded-xl bg-light-sidebar dark:bg-dark-sidebar border border-light-border dark:border-dark-border">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-light-text dark:text-dark-text">Masuk & Mulai Gunakan AI</p>
                    <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                      Paste API Key Anda di kolom login, klik Masuk, dan Anda bisa langsung menggunakan semua model AI yang tersedia.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-light-sidebar dark:bg-dark-sidebar border border-light-border dark:border-dark-border">
                  <div className="flex items-start gap-2.5">
                    <MessageSquare size={14} className="flex-shrink-0 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-light-text dark:text-dark-text">Akses dari Device Mana Pun</p>
                      <p className="text-[11px] text-light-muted dark:text-dark-muted mt-0.5 leading-relaxed">
                        Website ini dibuat agar siapa pun bisa menggunakan AI tanpa kesulitan. Bisa diakses dari HP, tablet, laptop, maupun desktop — cukup buka browser dan masukkan API Key Anda.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-light-sidebar dark:bg-dark-sidebar border border-light-border dark:border-dark-border">
                  <div className="flex items-start gap-2.5">
                    <Shield size={14} className="flex-shrink-0 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-light-text dark:text-dark-text">Privasi & Keamanan Data Anda</p>
                      <p className="text-[11px] text-light-muted dark:text-dark-muted mt-0.5 leading-relaxed">
                        Kami <strong className="text-light-text dark:text-dark-text">tidak dapat membaca API Key</strong> maupun percakapan Anda. Kami hanya menyediakan wadah/platform untuk Anda menggunakan AI. Semua riwayat chat tersimpan di localStorage browser Anda sendiri — kami tidak memiliki akses apa pun ke data Anda.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-light-sidebar dark:bg-dark-sidebar border border-light-border dark:border-dark-border">
                  <div className="flex items-start gap-2.5">
                    <Key size={14} className="flex-shrink-0 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-light-text dark:text-dark-text">Fungsi API Key</p>
                      <p className="text-[11px] text-light-muted dark:text-dark-muted mt-0.5 leading-relaxed">
                        API Key berfungsi sebagai <strong className="text-light-text dark:text-dark-text">identitas Anda</strong> dalam menggunakan model AI. Semua penggunaan token dan percakapan akan tercatat di akun Anda sendiri melalui dashboard provider Anda sendiri — bukan di server kami.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-light-sidebar dark:bg-dark-sidebar border border-light-border dark:border-dark-border">
                  <div className="flex items-start gap-2.5">
                    <ShoppingCart size={14} className="flex-shrink-0 text-purple-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-light-text dark:text-dark-text">Kenapa Perlu Membeli Akun?</p>
                      <p className="text-[11px] text-light-muted dark:text-dark-muted mt-0.5 leading-relaxed">
                        Setiap penggunaan model AI membutuhkan akun yang terdaftar. Akun diperlukan untuk mengatur kuota, melacak penggunaan, dan memastikan setiap pengguna mendapatkan akses yang adil ke semua model AI yang tersedia.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Feature badges */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-light-sidebar dark:bg-dark-sidebar border border-light-border dark:border-dark-border">
                <MessageSquare size={12} className="text-emerald-500" />
                <span className="text-[10px] text-light-text dark:text-dark-text">Chat AI Multi-Model</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-light-sidebar dark:bg-dark-sidebar border border-light-border dark:border-dark-border">
                <Zap size={12} className="text-amber-500" />
                <span className="text-[10px] text-light-text dark:text-dark-text">Thinking & Research</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-light-sidebar dark:bg-dark-sidebar border border-light-border dark:border-dark-border">
                <Shield size={12} className="text-blue-500" />
                <span className="text-[10px] text-light-text dark:text-dark-text">Data Aman & Privat</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-light-sidebar dark:bg-dark-sidebar border border-light-border dark:border-dark-border">
                <BarChart3 size={12} className="text-purple-500" />
                <span className="text-[10px] text-light-text dark:text-dark-text">Dashboard Token</span>
              </div>
            </div>
          </div>

          {/* Right - Login Form */}
          <div className="flex flex-col justify-center">
            <div className="bg-light-sidebar dark:bg-dark-sidebar border border-light-border dark:border-dark-border rounded-2xl p-6 lg:p-8 space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Key size={24} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Masuk ke dmrxai</h2>
                <p className="text-xs text-light-muted dark:text-dark-muted mt-1">Masukkan API Key Anda untuk berinteraksi dengan model AI</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Base URL</label>
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => { setBaseUrl(e.target.value); setError(""); }}
                    placeholder="https://api.openai.com/v1"
                    className="w-full px-4 py-3 rounded-xl bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-light-accent dark:focus:border-dark-accent transition-colors font-mono text-sm"
                  />
                  <p className="text-[10px] text-light-muted dark:text-dark-muted mt-1">URL endpoint provider Anda (contoh: https://api.openai.com/v1, https://openrouter.ai/api/v1, http://your-vps-ip:1430/v1)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">API Key</label>
                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => { setApiKey(e.target.value); setError(""); }}
                      placeholder="sk-... / enx-... / your provider key"
                      className="w-full px-4 py-3 pr-10 rounded-xl bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-light-accent dark:focus:border-dark-accent transition-colors font-mono text-sm"
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text">
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !apiKey.trim() || !baseUrl.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Masuk</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-light-border dark:border-dark-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-light-sidebar dark:bg-dark-sidebar text-light-muted dark:text-dark-muted">atau</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <a href="http://localhost:1431/" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover transition-colors">
                  <div className="flex items-center gap-2.5">
                    <BarChart3 size={16} className="text-purple-500" />
                    <div>
                      <p className="text-sm font-medium text-light-text dark:text-dark-text">Login Cek Token & Cek API Key</p>
                      <p className="text-[10px] text-light-muted dark:text-dark-muted">Dashboard</p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-light-muted dark:text-dark-muted" />
                </a>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <CheckCircle2 size={14} className="flex-shrink-0 text-emerald-500 mt-0.5" />
                <p className="text-[10px] text-light-muted dark:text-dark-muted leading-relaxed">
                  <strong className="text-light-text dark:text-dark-text">Info:</strong> dmrxai gratis untuk digunakan. Anda hanya membutuhkan API Key dari provider AI untuk mengakses model AI. Hubungi provider AI Anda untuk dukungan lebih lanjut.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-6 py-4 border-t border-light-border dark:border-dark-border text-center">
        <p className="text-[11px] text-light-muted dark:text-dark-muted">© 2026 dmrxai</p>
      </footer>
    </div>
  );
}
