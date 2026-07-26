const DEEPSEEK_BASE = "https://api.deepseek.com/v1";

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOptions {
  temperature?: number;
  max_tokens?: number;
  json?: boolean;
  timeout?: number;   // 单次超时 ms，默认 30s
  retries?: number;   // 额外重试次数，默认 2（共 3 次）
}

async function _call(messages: DeepSeekMessage[], options?: ChatOptions) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY not configured");

  const timeoutMs = options?.timeout ?? 30000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-v4-pro",
        messages,
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.max_tokens ?? 2048,
        ...(options?.json === true ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`DeepSeek API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    console.log(`[DeepSeek] raw response keys: ${Object.keys(data).join(",")}`);
    if (data?.choices?.[0]) {
      console.log(`[DeepSeek] choice keys: ${Object.keys(data.choices[0]).join(",")}`);
      console.log(`[DeepSeek] message type: ${typeof data.choices[0].message}, has content: ${!!data.choices[0].message?.content}, has reasoning: ${!!data.choices[0].message?.reasoning_content}`);
    }
    const content = data?.choices?.[0]?.message?.content;
    // DeepSeek V4 有时把回复放在 reasoning_content
    if (!content) {
      const reasoning = data?.choices?.[0]?.message?.reasoning_content;
      if (reasoning) return reasoning;
      console.error("[DeepSeek] raw data:", JSON.stringify(data).slice(0, 300));
      throw new Error("DeepSeek returned empty response");
    }
    return content as string;
  } finally {
    clearTimeout(timeout);
  }
}

export async function chat(messages: DeepSeekMessage[], options?: ChatOptions) {
  const retries = options?.retries ?? 2;
  let lastError: Error | null = null;
  for (let i = 0; i <= retries; i++) {
    try {
      return await _call(messages, options);
    } catch (err: any) {
      lastError = err;
      if (i < retries) await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw lastError || new Error("DeepSeek call failed");
}
