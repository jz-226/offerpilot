const DEEPSEEK_BASE = "https://api.deepseek.com/v1";

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function _call(messages: DeepSeekMessage[], options?: { temperature?: number; max_tokens?: number; json?: boolean }) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

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
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("DeepSeek returned empty response");
    return content as string;
  } finally {
    clearTimeout(timeout);
  }
}

// 公共接口：最多重试 2 次（共 3 次尝试）
export async function chat(messages: DeepSeekMessage[], options?: { temperature?: number; max_tokens?: number; json?: boolean }) {
  let lastError: Error | null = null;
  for (let i = 0; i < 3; i++) {
    try {
      return await _call(messages, options);
    } catch (err: any) {
      lastError = err;
      if (i < 2) await new Promise((r) => setTimeout(r, 1000)); // 等 1 秒再试
    }
  }
  throw lastError || new Error("DeepSeek call failed after 3 attempts");
}
