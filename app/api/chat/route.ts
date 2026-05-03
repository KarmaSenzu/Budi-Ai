import { NextRequest } from "next/server";

export const runtime = "edge";

// Internal AI server URL - configured via environment variable
// In production: set ENOWX_API_URL in your .env.local
// Default: proxies to localhost enowxai server
const AI_SERVER_URL = process.env.ENOWX_API_URL || "http://localhost:1430/v1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, apiKey, model, temperature, maxTokens, stream, chatMode } = body;

    // Validate required fields
    if (!apiKey || !model || !messages) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: apiKey, model, messages" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const endpoint = `${AI_SERVER_URL}/chat/completions`;

    // Build the request body
    const requestBody: Record<string, unknown> = {
      model,
      messages,
      stream: stream ?? true,
    };

    // Apply mode-specific settings
    if (chatMode === "thinking") {
      requestBody.temperature = 1;
      requestBody.max_tokens = maxTokens ?? 16384;
      requestBody.thinking = { type: "enabled", budget_tokens: 10000 };
      requestBody.include_reasoning = true;
    } else if (chatMode === "deep-research") {
      requestBody.temperature = 0.3;
      requestBody.max_tokens = maxTokens ?? 32768;
      requestBody.thinking = { type: "enabled", budget_tokens: 20000 };
      requestBody.include_reasoning = true;
    } else {
      requestBody.temperature = temperature ?? 0.7;
      requestBody.max_tokens = maxTokens ?? 4096;
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
        errorMessage = errorJson.error?.message || errorJson.message || errorText;
      } catch {
        errorMessage = errorText;
      }
      return new Response(
        JSON.stringify({ error: `Provider error (${providerResponse.status}): ${errorMessage}` }),
        { status: providerResponse.status, headers: { "Content-Type": "application/json" } }
      );
    }

    if (stream) {
      if (!providerResponse.body) {
        return new Response(
          JSON.stringify({ error: "No response body from provider" }),
          { status: 502, headers: { "Content-Type": "application/json" } }
        );
      }

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const transformStream = new TransformStream({
        async transform(chunk, controller) {
          const text = decoder.decode(chunk, { stream: true });
          controller.enqueue(encoder.encode(text));
        },
      });

      providerResponse.body.pipeTo(transformStream.writable);

      return new Response(transformStream.readable, {
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
