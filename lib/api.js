const API_URL = process.env.NEXT_PUBLIC_OPENROUTER_API_URL;
const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

function getApiKey() {
  if (typeof window === "undefined") return DEFAULT_API_KEY;
  const customKey = localStorage.getItem("openrouter-api-key");
  return customKey || DEFAULT_API_KEY;
}

// Build request body with optional structured output
function buildRequestBody(model, messages, params) {
  console.log(
    "[buildRequestBody] params received:",
    JSON.stringify(params, null, 2),
  );

  const body = {
    model,
    messages,
    ...params,
  };

  // Add structured output if enabled (from SettingsDialog format)
  // NOTE: Structured output requires stream: false
  if (
    params.structured_output &&
    params.structured_output.enabled &&
    params.structured_output.schema
  ) {
    console.log(
      "[buildRequestBody] Structured output detected, adding response_format (snake_case)",
    );

    // OpenRouter API uses snake_case
    body.response_format = {
      type: "json_schema",
      json_schema: {
        name: "schema",
        strict: true,
        schema: params.structured_output.schema,
      },
    };
    // Remove structured_output from params to avoid conflicts
    delete body.structured_output;
    // Force stream to false for structured output
    body.stream = false;

    console.log(
      "[buildRequestBody] Body with response_format:",
      JSON.stringify(body, null, 2),
    );
  }
  // Handle legacy response_format format
  else if (
    params.response_format &&
    params.response_format.type === "json_schema"
  ) {
    body.response_format = {
      type: "json_schema",
      json_schema: {
        name: params.response_format.json_schema?.name || "schema",
        strict: params.response_format.json_schema?.strict ?? true,
        schema: params.response_format.json_schema?.schema,
      },
    };
    // Force stream to false for structured output
    body.stream = false;
  } else {
    console.log("[buildRequestBody] No structured output, using stream: true");
  }

  console.log("[buildRequestBody] Final body:", JSON.stringify(body, null, 2));
  return body;
}

// Non-streaming version
export async function sendMessage(messages, model, params = {}) {
  const API_KEY = getApiKey();

  if (!API_KEY) {
    throw new Error(
      "No API key configured. Please add your API key in settings.",
    );
  }

  const body = buildRequestBody(model, messages, params);

  console.log(
    "[sendMessage] Sending request to:",
    `${API_URL}/chat/completions`,
  );

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(`${API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost:3000",
        "X-Title": "OpenRouter Playground",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("[sendMessage] Error response:", error);
      throw new Error(error.error?.message || `Error: ${response.status}`);
    }

    const data = await response.json();
    console.log(
      "[sendMessage] Success response:",
      JSON.stringify(data, null, 2),
    );

    // Handle both content and reasoning fields (some models put structured output in reasoning)
    const message = data.choices[0].message;
    const content = message.content || message.reasoning || "";

    console.log("[sendMessage] Extracted content:", content);
    return { ...message, content };
  } catch (err) {
    console.error("[sendMessage] Exception:", err.message);
    if (err.name === "AbortError") {
      throw new Error(
        "Request timed out. The model may not support structured output.",
      );
    }
    throw err;
  }
}

// Streaming version - calls onChunk for each piece of content
export async function sendMessageStream(messages, model, params = {}, onChunk) {
  const API_KEY = getApiKey();

  if (!API_KEY) {
    throw new Error(
      "No API key configured. Please add your API key in settings.",
    );
  }

  const body = buildRequestBody(model, messages, { ...params, stream: true });

  const response = await fetch(`${API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer":
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000",
      "X-Title": "OpenRouter Playground",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Error: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let content = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:")) continue;

      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          content += delta;
          onChunk(content);
        }
      } catch (e) {
        // Ignore parse errors for incomplete chunks
      }
    }
  }

  return content;
}

export function exportChat(messages) {
  return JSON.stringify(messages, null, 2);
}

export function exportConfig(model, params) {
  return JSON.stringify({ model, params }, null, 2);
}
