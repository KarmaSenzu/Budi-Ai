import { NextRequest } from "next/server";
import { resolveAIConfig } from "@/lib/server-config";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      apiKey: userApiKey,
      baseUrl: userBaseUrl,
      model,
      temperature,
      maxTokens,
      stream,
      chatMode,
      systemPrompt,
    } = body ?? {};

    // Server-side override kalau env AI_API_KEY+AI_BASE_URL di-set,
    // kalau tidak fallback ke value yang user kirim (backward compat).
    const { apiKey, baseUrl } = resolveAIConfig({
      apiKey: userApiKey,
      baseUrl: userBaseUrl,
    });

    // Validate required fields. Surface a 400 with a clear message so the
    // browser can react without trying to parse SSE.
    if (!apiKey || !baseUrl) {
      return new Response(
        JSON.stringify({ error: "Missing apiKey or baseUrl" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!model || !messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: model, messages" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Normalize base URL (strip trailing slashes) and build the OpenAI-style
    // chat completions endpoint.
    const normalizedBaseUrl = String(baseUrl).replace(/\/+$/, "");
    const endpoint = `${normalizedBaseUrl}/chat/completions`;

    // Build the outgoing message list. If a systemPrompt is provided and the
    // first message isn't already a system message, prepend one. This keeps
    // mode-driven prompt augmentation in a single place (this route).
    let outgoingMessages = messages as Array<{ role: string; content: unknown }>;
    if (systemPrompt && typeof systemPrompt === "string" && systemPrompt.trim()) {
      const hasSystem =
        outgoingMessages.length > 0 && outgoingMessages[0]?.role === "system";
      if (!hasSystem) {
        outgoingMessages = [
          { role: "system", content: systemPrompt.trim() },
          ...outgoingMessages,
        ];
      }
    }

    // Detect file attachments (so we bump max_tokens to avoid truncating
    // long file analyses).
    const hasFileAttachments = outgoingMessages.some(
      (m: any) =>
        Array.isArray(m.content) &&
        m.content.some(
          (p: any) => p?.type === "text" && typeof p?.text === "string" && p.text.startsWith("[File:")
        )
    );
    const fileMinTokens = hasFileAttachments ? 16384 : 0;

    // Apply mode-specific settings. This route is the single source of truth
    // for chatMode behavior — the browser only forwards the user's intent.
    const requestBody: Record<string, unknown> = {
      model,
      messages: outgoingMessages,
      stream: stream ?? true,
    };

    if (chatMode === "thinking") {
      requestBody.temperature = 1;
      requestBody.max_tokens = Math.max(16384, fileMinTokens, maxTokens || 16384);
      requestBody.thinking = { type: "enabled", budget_tokens: 10000 };
      requestBody.include_reasoning = true;
    } else if (chatMode === "deep-research") {
      requestBody.temperature = 0.3;
      requestBody.max_tokens = Math.max(32768, fileMinTokens, maxTokens || 32768);
      requestBody.thinking = { type: "enabled", budget_tokens: 20000 };
      requestBody.include_reasoning = true;
    } else {
      requestBody.temperature = temperature ?? 0.7;
      requestBody.max_tokens = hasFileAttachments
        ? Math.max(fileMinTokens, maxTokens || 16384)
        : (maxTokens || 4096);
    }

    const providerResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!providerResponse.ok) {
      const errorText = await providerResponse.text();
      let errorMessage: string;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage =
          errorJson.error?.message || errorJson.error || errorJson.message || errorText;
      } catch {
        errorMessage = errorText;
      }
      return new Response(
        JSON.stringify({
          error: `Provider error (${providerResponse.status}): ${errorMessage}`,
        }),
        {
          status: providerResponse.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Stream SSE straight through to the browser. The body is already
    // `text/event-stream` from the provider; we just forward bytes so the
    // existing useChat parser keeps working unchanged.
    if (requestBody.stream) {
      if (!providerResponse.body) {
        return new Response(
          JSON.stringify({ error: "No response body from provider" }),
          { status: 502, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(providerResponse.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const data = await providerResponse.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

