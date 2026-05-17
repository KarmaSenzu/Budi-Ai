// app/lib/model-categories.ts
//
// Helper untuk mengelompokkan model AI berdasarkan family/provider
// dari ID-nya (yang biasanya berupa string seperti `cc/claude-opus-4-7`,
// `gpt-4o`, `deepseek-chat`, dll).
//
// Pattern matching pakai keyword case-insensitive. Ini intentionally
// permissive — kalau model ID baru muncul yang tidak match, akan jatuh
// ke kategori "Other".

export interface ModelCategory {
  id: string;
  label: string;
  description?: string;
  // Icon emoji (frontend handle render).
  icon?: string;
  // Order untuk sort di UI.
  order: number;
}

export const MODEL_CATEGORIES: Record<string, ModelCategory> = {
  claude: {
    id: "claude",
    label: "Claude (Anthropic)",
    description: "Opus, Sonnet, Haiku",
    icon: "🟧",
    order: 1,
  },
  gpt: {
    id: "gpt",
    label: "GPT (OpenAI)",
    description: "GPT-4o, GPT-4, GPT-3.5",
    icon: "🟢",
    order: 2,
  },
  o1: {
    id: "o1",
    label: "o1 / o3 (OpenAI Reasoning)",
    description: "o1-preview, o1-mini, o3-mini",
    icon: "🧠",
    order: 3,
  },
  gemini: {
    id: "gemini",
    label: "Gemini (Google)",
    description: "Gemini 2.0, 1.5 Pro/Flash",
    icon: "🔷",
    order: 4,
  },
  deepseek: {
    id: "deepseek",
    label: "DeepSeek",
    description: "DeepSeek Chat, Coder, R1",
    icon: "🔵",
    order: 5,
  },
  llama: {
    id: "llama",
    label: "Llama (Meta)",
    description: "Llama 3.x, 4.x family",
    icon: "🟣",
    order: 6,
  },
  qwen: {
    id: "qwen",
    label: "Qwen (Alibaba)",
    description: "Qwen 2.5, 3, QwQ",
    icon: "🟡",
    order: 7,
  },
  mistral: {
    id: "mistral",
    label: "Mistral",
    description: "Mistral Large, Codestral, Mixtral",
    icon: "🟠",
    order: 8,
  },
  grok: {
    id: "grok",
    label: "Grok (xAI)",
    description: "Grok 2, Grok 3",
    icon: "⚫",
    order: 9,
  },
  cohere: {
    id: "cohere",
    label: "Cohere",
    description: "Command R, Command R+",
    icon: "🟤",
    order: 10,
  },
  perplexity: {
    id: "perplexity",
    label: "Perplexity",
    description: "Sonar, Sonar Pro",
    icon: "🟦",
    order: 11,
  },
  other: {
    id: "other",
    label: "Lainnya",
    description: "Provider lain atau model custom",
    icon: "❓",
    order: 999,
  },
};

// categorizeModel pakai keyword match terhadap model ID. Order penting:
// pattern yang lebih spesifik harus dicek dulu (mis. "o1" sebelum "gpt"
// supaya `gpt-o1` tidak salah masuk kategori `gpt`).
export function categorizeModel(modelId: string): string {
  const id = (modelId || "").toLowerCase();
  if (!id) return "other";

  // Strip prefix sebelum slash supaya keyword match tidak terganggu prefix
  // provider seperti `cc/`, `openai/`, `anthropic/`, dst.
  const slashIdx = id.indexOf("/");
  const tail = slashIdx >= 0 && slashIdx < id.length - 1 ? id.slice(slashIdx + 1) : id;

  // Reasoning models (OpenAI o-series) — cek dulu karena bisa overlap
  // dengan gpt. Match `o1`, `o3`, `o4` sebagai standalone token.
  if (/(^|[^a-z0-9])(o1|o3|o4)([-_]|$)/.test(tail)) return "o1";

  // Claude family
  if (
    tail.includes("claude") ||
    tail.includes("opus") ||
    tail.includes("sonnet") ||
    tail.includes("haiku") ||
    id.startsWith("anthropic/") ||
    id.startsWith("cc/")
  ) {
    return "claude";
  }

  // GPT family (OpenAI non-reasoning)
  if (tail.includes("gpt-") || tail.includes("gpt4") || tail.includes("gpt3")) return "gpt";
  if (tail.startsWith("gpt") || tail.startsWith("chatgpt")) return "gpt";

  // Gemini family
  if (tail.includes("gemini") || tail.includes("bard") || tail.includes("palm")) return "gemini";

  // DeepSeek family
  if (tail.includes("deepseek") || tail.startsWith("ds-")) return "deepseek";

  // Llama family
  if (tail.includes("llama") || tail.includes("meta-")) return "llama";

  // Qwen family
  if (tail.includes("qwen") || tail.includes("qwq")) return "qwen";

  // Mistral family
  if (tail.includes("mistral") || tail.includes("mixtral") || tail.includes("codestral")) return "mistral";

  // Grok family
  if (tail.includes("grok") || id.startsWith("xai/")) return "grok";

  // Cohere family
  if (tail.includes("command-r") || tail.includes("cohere") || tail.startsWith("command-")) return "cohere";

  // Perplexity family
  if (tail.includes("perplexity") || tail.includes("sonar") || tail.startsWith("pplx")) return "perplexity";

  return "other";
}

// groupModels mengelompokkan list model jadi struktur yang siap di-render.
// Output sudah ter-sort: kategori berdasarkan `order`, model dalam kategori
// alfabetis berdasarkan nama display (atau id kalau tidak ada nama).
export interface GroupedModel {
  category: ModelCategory;
  models: { id: string; displayName?: string }[];
}

export function groupModels(
  models: { id: string; displayName?: string; name?: string }[]
): GroupedModel[] {
  const grouped = new Map<string, { id: string; displayName?: string }[]>();

  for (const m of models) {
    if (!m || !m.id) continue;
    const cat = categorizeModel(m.id);
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push({
      id: m.id,
      displayName: m.displayName || m.name,
    });
  }

  // Sort tiap kategori berdasarkan skor kualitas (tinggi → rendah).
  // Tie-breaker: alfabetis ascending pada display name.
  const result: GroupedModel[] = [];
  grouped.forEach((ms, catId) => {
    const category = MODEL_CATEGORIES[catId] || MODEL_CATEGORIES.other;
    ms.sort((a: { id: string; displayName?: string }, b: { id: string; displayName?: string }) => {
      const scoreA = scoreModel(a.id);
      const scoreB = scoreModel(b.id);
      if (scoreA !== scoreB) return scoreB - scoreA;
      const aN = (a.displayName || a.id).toLowerCase();
      const bN = (b.displayName || b.id).toLowerCase();
      return aN.localeCompare(bN);
    });
    result.push({ category, models: ms });
  });

  result.sort((a, b) => a.category.order - b.category.order);
  return result;
}

// formatModelDisplayName menghapus prefix provider (mis. `cc/`, `openai/`)
// supaya nama model di UI lebih bersih. Kalau caller mau full ID, akses
// `model.id` langsung.
export function formatModelDisplayName(modelId: string): string {
  if (!modelId) return modelId;
  const slashIdx = modelId.indexOf("/");
  if (slashIdx > 0 && slashIdx < modelId.length - 1) {
    return modelId.slice(slashIdx + 1);
  }
  return modelId;
}

// ─────────────────────────────────────────────────────────────────────
// Quality Ranking
//
// Model dalam tiap family di-sort berdasarkan kualitas/kemampuan.
// Skor lebih tinggi = lebih bagus. Urutan ditentukan dengan heuristic:
// - Tier name (opus > sonnet > haiku, large > medium > small, etc.)
// - Version number (4.7 > 4.6, 3.5 > 3.0, dll)
// - Modifier (-thinking, -reasoning > biasa)
// - Recency hint (date di nama mis. "20251101")
//
// Skor 0-100. Model tidak ke-match kategori dapat skor 50 (netral).
// ─────────────────────────────────────────────────────────────────────

interface QualityHint {
  pattern: RegExp;
  base: number;
  reason?: string;
}

// Pattern urut: pertama-cocok yang berlaku. Skor base + bonus version.
const QUALITY_HINTS: QualityHint[] = [
  // ──── Claude family ────
  { pattern: /claude.*opus/i, base: 95 },
  { pattern: /claude.*sonnet/i, base: 80 },
  { pattern: /claude.*haiku/i, base: 60 },

  // ──── OpenAI o-series (reasoning) — cek dulu sebelum gpt ────
  { pattern: /^o4/i, base: 95 },
  { pattern: /^o3(-mini)?/i, base: 90 },
  { pattern: /^o1(-preview)?$/i, base: 92 },
  { pattern: /^o1-/i, base: 85 },

  // ──── OpenAI GPT ────
  { pattern: /gpt-4(\.5|o)?(-turbo)?/i, base: 88 },
  { pattern: /gpt-4-/i, base: 78 },
  { pattern: /gpt-3\.5/i, base: 50 },
  { pattern: /chatgpt/i, base: 70 },

  // ──── Gemini ────
  { pattern: /gemini-?2(\.0|\.5)?-?(pro|ultra)/i, base: 90 },
  { pattern: /gemini-?2/i, base: 85 },
  { pattern: /gemini-?1\.5-?pro/i, base: 80 },
  { pattern: /gemini-?1\.5/i, base: 70 },
  { pattern: /gemini.*flash/i, base: 65 },

  // ──── DeepSeek ────
  { pattern: /deepseek.*r1/i, base: 90 },
  { pattern: /deepseek.*v3/i, base: 85 },
  { pattern: /deepseek.*coder/i, base: 75 },
  { pattern: /deepseek/i, base: 70 },

  // ──── Llama ────
  { pattern: /llama-?4/i, base: 85 },
  { pattern: /llama-?3\.3/i, base: 80 },
  { pattern: /llama-?3\.2/i, base: 75 },
  { pattern: /llama-?3/i, base: 70 },
  { pattern: /llama-?2/i, base: 50 },

  // ──── Qwen ────
  { pattern: /qwq/i, base: 85 },
  { pattern: /qwen-?3/i, base: 85 },
  { pattern: /qwen-?2\.5/i, base: 78 },
  { pattern: /qwen-?2/i, base: 70 },

  // ──── Mistral ────
  { pattern: /mistral.*large/i, base: 82 },
  { pattern: /mixtral.*8x22b/i, base: 80 },
  { pattern: /mixtral/i, base: 70 },
  { pattern: /codestral/i, base: 75 },
  { pattern: /mistral/i, base: 65 },

  // ──── Grok ────
  { pattern: /grok-?3/i, base: 88 },
  { pattern: /grok-?2/i, base: 78 },
  { pattern: /grok/i, base: 70 },

  // ──── Cohere ────
  { pattern: /command-r-plus/i, base: 80 },
  { pattern: /command-r/i, base: 70 },

  // ──── Perplexity ────
  { pattern: /sonar.*pro/i, base: 80 },
  { pattern: /sonar/i, base: 70 },
];

// extractVersionBonus pulls version-like numbers and recency hints out
// of the ID and returns a small bonus. Example:
//   "claude-opus-4.7"        → 4.7  → +4.7
//   "claude-opus-4-7"        → 4.7  → +4.7  (treats `-` between digits
//                                            as decimal point fallback)
//   "claude-opus-4-5-20251101" → +4.5 + recency bonus
function extractVersionBonus(id: string): number {
  let bonus = 0;

  // Decimal version (X.Y) — biggest signal
  const decimal = id.match(/(\d+)\.(\d+)/);
  if (decimal) {
    bonus += parseFloat(`${decimal[1]}.${decimal[2]}`);
  } else {
    // Hyphen-separated version like "4-7" → treat as 4.7 (only 1-digit
    // after hyphen to avoid grabbing dates).
    const hyphen = id.match(/-(\d+)-(\d)(?!\d)/);
    if (hyphen) {
      bonus += parseFloat(`${hyphen[1]}.${hyphen[2]}`);
    }
  }

  // Recency: a YYYYMMDD-style date in the ID adds a tiny bonus.
  // Newer date = higher (we just use last 4 digits as a rough sort key).
  const date = id.match(/(\d{8})/);
  if (date) {
    const num = parseInt(date[1], 10);
    bonus += Math.min(num / 1e9, 1); // cap at +1
  }

  return bonus;
}

// scoreModel returns a number where higher = better quality. Always
// finite. Used to sort within a family.
export function scoreModel(modelId: string): number {
  const id = (modelId || "").toLowerCase();
  if (!id) return 0;

  // Strip provider prefix (cc/, kr/, anthropic/, dll) supaya pattern
  // match konsisten dengan ID asli (Claude bisa muncul sebagai
  // "kr/claude-opus-4.7" maupun "cc/claude-opus-4-7").
  const slashIdx = id.indexOf("/");
  const tail = slashIdx >= 0 && slashIdx < id.length - 1 ? id.slice(slashIdx + 1) : id;

  for (const hint of QUALITY_HINTS) {
    if (hint.pattern.test(tail)) {
      return hint.base + extractVersionBonus(tail);
    }
  }
  return 50; // netral
}
