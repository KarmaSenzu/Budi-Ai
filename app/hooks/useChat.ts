"use client";

import { useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message, Conversation, Settings, ChatMode, Attachment } from "@/lib/types";
import { saveConversation, getConversations, deleteConversation as deleteConv, saveConversations } from "@/lib/storage";

export interface UseChatOptions {
  // When true, the server has baked-in AI_API_KEY + AI_BASE_URL via env, so
  // we no longer require the user to have supplied them via Settings/Login.
  serverManaged?: boolean;
}

export function useChat(settings: Settings, options: UseChatOptions = {}) {
  const { serverManaged = false } = options;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load conversations from localStorage
  const loadConversations = useCallback(() => {
    const saved = getConversations();
    setConversations(saved);
    return saved;
  }, []);

  // Get active conversation
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  // Create new conversation
  const createConversation = useCallback(() => {
    const newConv: Conversation = {
      id: uuidv4(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => {
      const updated = [newConv, ...prev];
      saveConversations(updated);
      return updated;
    });
    setActiveConversationId(newConv.id);
    setError(null);
    return newConv;
  }, []);

  // Delete conversation
  const deleteConversation = useCallback(
    (id: string) => {
      deleteConv(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
    },
    [activeConversationId]
  );

  // Select conversation
  const selectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setError(null);
  }, []);

  // Stop generation
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(
    async (content: string, chatMode: ChatMode = "normal", attachments?: Attachment[]) => {
      if ((!content.trim() && (!attachments || attachments.length === 0)) || isLoading) return;
      // In server-managed mode the API key/baseUrl come from server env, so
      // we only require the user to have picked a model. In legacy mode we
      // still require all three locally.
      const haveCreds = serverManaged
        ? Boolean(settings.model)
        : Boolean(settings.apiKey && settings.baseUrl && settings.model);
      if (!haveCreds) {
        setError("Please configure your API Key and Model in Settings.");
        return;
      }

      setError(null);

      // Get or create conversation
      let convId = activeConversationId;
      let currentConversations = [...conversations];

      if (!convId) {
        const newConv: Conversation = {
          id: uuidv4(),
          title: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        convId = newConv.id;
        currentConversations = [newConv, ...currentConversations];
        setActiveConversationId(convId);
      }

      // Add user message
      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content: content.trim(),
        attachments: attachments && attachments.length > 0 ? attachments : undefined,
        timestamp: Date.now(),
      };

      // Update conversation with user message
      currentConversations = currentConversations.map((c) => {
        if (c.id === convId) {
          const updated = {
            ...c,
            messages: [...c.messages, userMessage],
            updatedAt: Date.now(),
            title: c.messages.length === 0 ? content.slice(0, 50) + (content.length > 50 ? "..." : "") : c.title,
          };
          return updated;
        }
        return c;
      });

      setConversations(currentConversations);

      // Prepare messages for API
      const conv = currentConversations.find((c) => c.id === convId)!;
      const apiMessages = [];

      // Build system prompt based on mode. The actual prepending now happens
      // in /api/chat/route.ts (the single source of truth) — we only forward
      // the assembled text via the `systemPrompt` body field below.
      let systemContent = settings.systemPrompt || "";
      if (chatMode === "thinking") {
        systemContent += "\n\nIMPORTANT: Show your reasoning process step by step. Wrap your thinking in <think>...</think> tags before giving your final answer. Think carefully and thoroughly.";
      } else if (chatMode === "deep-research") {
        systemContent += "\n\nIMPORTANT: You are in Deep Research mode. Conduct thorough, in-depth analysis. Wrap your research reasoning in <think>...</think> tags. Consider multiple perspectives, cite sources when possible, analyze pros and cons, and provide a comprehensive, well-structured response. Be extremely detailed and thorough.";
      }
      systemContent = systemContent.trim();

      apiMessages.push(
        ...conv.messages.map((m) => {
          // If message has attachments, format as multimodal content
          if (m.attachments && m.attachments.length > 0 && m.role === "user") {
            const contentParts: any[] = [];
            // Add text content first
            if (m.content) {
              contentParts.push({ type: "text", text: m.content });
            }
            // Add attachments
            for (const att of m.attachments) {
              if (att.type === "image") {
                contentParts.push({
                  type: "image_url",
                  image_url: { url: `data:${att.mimeType};base64,${att.base64}` },
                });
              } else {
                // For files, include as text content with file info
                let fileContent: string;
                if (att.extractedText) {
                  // Use extracted text for PDF/DOCX files
                  fileContent = att.extractedText;
                } else {
                  // For plain text files, decode base64
                  try {
                    fileContent = atob(att.base64);
                  } catch {
                    fileContent = "[Error: Gagal membaca konten file]";
                  }
                }
                contentParts.push({
                  type: "text",
                  text: `[File: ${att.name} (${att.mimeType}, ${(att.size / 1024).toFixed(1)}KB)]\n\nContent:\n${fileContent}`,
                });
              }
            }
            return { role: m.role, content: contentParts };
          }
          return { role: m.role, content: m.content };
        })
      );

      // Create assistant message placeholder
      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        // Capture the model that's about to generate this response so the
        // bubble can show a per-message badge. Falling back to "unknown"
        // keeps rendering safe if settings.model is somehow blank.
        model: settings.model || "unknown",
      };

      currentConversations = currentConversations.map((c) => {
        if (c.id === convId) {
          return { ...c, messages: [...c.messages, assistantMessage], updatedAt: Date.now() };
        }
        return c;
      });
      setConversations(currentConversations);

      // Send request
      setIsLoading(true);
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        // POST to our local edge proxy. The proxy forwards to the provider
        // server-side, sidestepping CORS for arbitrary base URLs (OpenAI,
        // Anthropic, OpenRouter, Groq, etc.). The API key travels in the
        // JSON body to our own origin — never as a header to a third party
        // from the browser.
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            apiKey: settings.apiKey,
            baseUrl: settings.baseUrl,
            model: settings.model,
            messages: apiMessages,
            temperature: settings.temperature,
            maxTokens: settings.maxTokens,
            chatMode,
            systemPrompt: systemContent || undefined,
            stream: true,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage: string;
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error?.message || errorJson.error || errorJson.message || errorText;
          } catch {
            errorMessage = errorText;
          }
          throw new Error(`Error (${response.status}): ${errorMessage}`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        // Read streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;

                // Update the assistant message in state
                setConversations((prev) =>
                  prev.map((c) => {
                    if (c.id === convId) {
                      const msgs = [...c.messages];
                      const lastMsg = msgs[msgs.length - 1];
                      if (lastMsg && lastMsg.role === "assistant") {
                        msgs[msgs.length - 1] = { ...lastMsg, content: fullContent };
                      }
                      return { ...c, messages: msgs, updatedAt: Date.now() };
                    }
                    return c;
                  })
                );
              }
            } catch {
              // Skip unparseable lines
            }
          }
        }

        // Save final conversation to localStorage
        setConversations((prev) => {
          const final = prev.map((c) => {
            if (c.id === convId) {
              const msgs = [...c.messages];
              const lastMsg = msgs[msgs.length - 1];
              if (lastMsg && lastMsg.role === "assistant") {
                msgs[msgs.length - 1] = { ...lastMsg, content: fullContent };
              }
              const updated = { ...c, messages: msgs, updatedAt: Date.now() };
              saveConversation(updated);
              return updated;
            }
            return c;
          });
          return final;
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          // User cancelled - save what we have
          setConversations((prev) => {
            const final = prev.map((c) => {
              if (c.id === convId) {
                saveConversation(c);
              }
              return c;
            });
            return final;
          });
        } else {
          const errorMsg = err instanceof Error ? err.message : "An error occurred";

          // Template response when model is unavailable or returns an error
          const fallbackContent = `> **Model tidak dapat digunakan**\n\nMaaf, model **\`${settings.model}\`** saat ini tidak dapat memproses permintaan Anda.\n\n**Kemungkinan penyebab:**\n- Model tidak tersedia atau sedang maintenance\n- API Key tidak memiliki akses ke model ini\n- Base URL tidak mendukung model yang dipilih\n- Kuota atau rate limit telah tercapai\n\n**Solusi:**\nSilakan pilih model lain dari daftar model yang tersedia di atas kolom chat.\n\n---\n*Error detail: ${errorMsg}*`;

          // Show the fallback message in the assistant bubble instead of removing it
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === convId) {
                const msgs = [...c.messages];
                const lastMsg = msgs[msgs.length - 1];
                if (lastMsg && lastMsg.role === "assistant" && lastMsg.id === assistantMessage.id) {
                  msgs[msgs.length - 1] = { ...lastMsg, content: fallbackContent };
                }
                const updated = { ...c, messages: msgs, updatedAt: Date.now() };
                saveConversation(updated);
                return updated;
              }
              return c;
            })
          );
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [activeConversationId, conversations, isLoading, settings, serverManaged]
  );

  // Clear all conversations
  const clearAllConversations = useCallback(() => {
    saveConversations([]);
    setConversations([]);
    setActiveConversationId(null);
  }, []);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    isLoading,
    error,
    loadConversations,
    createConversation,
    deleteConversation,
    selectConversation,
    sendMessage,
    stopGeneration,
    clearAllConversations,
    setError,
  };
}
