const API_URL = process.env.NEXT_PUBLIC_OPENROUTER_API_URL;
const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

function getApiKey() {
  if (typeof window === "undefined") return DEFAULT_API_KEY;
  const customKey = localStorage.getItem("openrouter-api-key");
  return customKey || DEFAULT_API_KEY;
}

export async function sendMessage(messages, model, params = {}) {
  const API_KEY = getApiKey();

  if (!API_KEY) {
    throw new Error(
      "No API key configured. Please add your API key in settings.",
    );
  }
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
    body: JSON.stringify({
      model,
      messages,
      ...params,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message;
}

export function exportChat(messages) {
  return JSON.stringify(messages, null, 2);
}

export function exportConfig(model, params) {
  return JSON.stringify({ model, params }, null, 2);
}
