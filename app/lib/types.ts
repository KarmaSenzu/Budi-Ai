export interface Settings {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface Attachment {
  id: string;
  type: "image" | "file";
  name: string;
  mimeType: string;
  base64: string;
  size: number;
  extractedText?: string; // For PDF/DOCX files - extracted text content
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: Attachment[];
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatRequest {
  messages: { role: string; content: string }[];
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  stream: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  apiKey: "",
  baseUrl: "",
  model: "auto",
  temperature: 0.7,
  maxTokens: 4096,
  systemPrompt: "You are a helpful assistant.",
};

export const PRESET_PROVIDERS = [
  { name: "OpenAI", baseUrl: "https://api.openai.com/v1", models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"] },
  { name: "Anthropic (via OpenAI-compatible)", baseUrl: "https://api.anthropic.com/v1", models: ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"] },
  { name: "Groq", baseUrl: "https://api.groq.com/openai/v1", models: ["llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"] },
  { name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", models: ["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "google/gemini-pro-1.5"] },
  { name: "Together AI", baseUrl: "https://api.together.xyz/v1", models: ["meta-llama/Llama-3-70b-chat-hf", "mistralai/Mixtral-8x7B-Instruct-v0.1"] },
  { name: "Custom", baseUrl: "", models: [] },
];

// Image Generation Types
export interface ImageSettings {
  model: string;
  size: string;
  quality: string;
  style: string;
  n: number;
}

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  model: string;
  size: string;
  quality: string;
  style: string;
  n: number;
  apiKey: string;
  baseUrl: string;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  negativePrompt?: string;
  url?: string;
  b64Data?: string;
  model: string;
  size: string;
  timestamp: number;
}

export const DEFAULT_IMAGE_SETTINGS: ImageSettings = {
  model: "gpt-image-1",
  size: "1024x1024",
  quality: "standard",
  style: "natural",
  n: 1,
};

export const IMAGE_SIZES = [
  { label: "1:1", value: "1024x1024", description: "Square" },
  { label: "16:9", value: "1792x1024", description: "Landscape" },
  { label: "9:16", value: "1024x1792", description: "Portrait" },
  { label: "4:3", value: "1536x1024", description: "Standard" },
  { label: "3:4", value: "1024x1536", description: "Tall" },
];

export const IMAGE_QUALITIES = ["standard", "hd"];
export const IMAGE_STYLES = ["natural", "vivid"];

export const MODEL_TIERS = {
  standard: {
    label: "Standard",
    description: "Chat & text generation models",
  },
  image: {
    label: "Image Generator",
    description: "Image generation models",
  },
};

export const IMAGE_MODELS = [
  "gpt-image-1",
  "dall-e-3",
  "dall-e-2",
];

// Thinking/Research Mode Types
export type ChatMode = "normal" | "thinking" | "deep-research";

export interface ThinkingBlock {
  type: "thinking";
  content: string;
}

export const CHAT_MODES = [
  { id: "normal" as ChatMode, label: "Normal", description: "Standard response", icon: "zap" },
  { id: "thinking" as ChatMode, label: "Thinking", description: "Shows reasoning process", icon: "brain" },
  { id: "deep-research" as ChatMode, label: "Deep Research", description: "In-depth analysis & research", icon: "search" },
];
