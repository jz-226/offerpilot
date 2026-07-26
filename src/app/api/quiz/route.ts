import { NextResponse } from "next/server";
import { chat } from "@/lib/ai/deepseek";

const QUIZ_PROMPT = `你是测验出题官。只输出 JSON。
格式：{"questions":[{"id":1,"type":"choice","difficulty":"easy","question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"answer":"B","dimension":"..."},{...}]}
难度：2简单 1中等 2较难。不要解释。`;

function extractJson(raw: string): string {
  // 1. 直接解析
  try { JSON.parse(raw); return raw; } catch {}

  // 2. 去 markdown
  let s = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  // 3. 从最后出现的 questions 开始截取（V4 推理内容在前）
  const idx = s.lastIndexOf('{"questions"');
  if (idx > 0) s = s.slice(idx);

  // 4. 如果 JSON 被截断，尝试补全
  if (!s.endsWith("}]}")) {
    // 找到最后一个完整的对象
    let depth = 0; let lastGood = -1;
    for (let i = 0; i < s.length; i++) {
      if (s[i] === "{") depth++;
      if (s[i] === "}") { depth--; if (depth === 0) lastGood = i; }
    }
    if (lastGood > 10) s = s.slice(0, lastGood + 1) + "]}";
  }

  try { JSON.parse(s); return s; } catch {}
  throw new Error("Parse failed: " + raw.slice(0, 200));
}

export async function POST(req: Request) {
  try {
    const { resourceName, resourceType, targetRole, dimensions } = await req.json();
    if (!resourceName) return NextResponse.json({ error: "缺少 resourceName" }, { status: 400 });

    const userPrompt = `生成5道关于${resourceName}的测验题。岗位：${targetRole || "任意"}，维度：${dimensions?.join("、") || "通用"}。只输出 JSON。`;

    const raw = await chat([
      { role: "system", content: QUIZ_PROMPT },
      { role: "user", content: userPrompt },
    ], { timeout: 60000, retries: 0, max_tokens: 2048 });

    const json = extractJson(raw);
    const parsed = JSON.parse(json);

    return NextResponse.json({ questions: parsed.questions });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "生成失败" }, { status: 500 });
  }
}
