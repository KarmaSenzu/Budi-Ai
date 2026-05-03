import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, baseUrl } = body;

    if (!apiKey || !baseUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: apiKey, baseUrl" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Normalize base URL
    const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
    const endpoint = `${normalizedBaseUrl}/models`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.message || errorText;
      } catch {
        errorMessage = errorText;
      }
      return new Response(
        JSON.stringify({ error: `Failed to fetch models (${response.status}): ${errorMessage}` }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    // OpenAI-compatible format: { data: [{ id: "model-name", ... }] }
    let models: string[] = [];
    
    if (data.data && Array.isArray(data.data)) {
      models = data.data
        .map((m: any) => m.id || m.name || "")
        .filter((id: string) => id.length > 0)
        .sort((a: string, b: string) => a.localeCompare(b));
    } else if (Array.isArray(data)) {
      // Some providers return a flat array
      models = data
        .map((m: any) => (typeof m === "string" ? m : m.id || m.name || ""))
        .filter((id: string) => id.length > 0)
        .sort((a: string, b: string) => a.localeCompare(b));
    }

    return new Response(
      JSON.stringify({ models }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch models";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
