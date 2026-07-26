import { NextResponse } from "next/server";
import { chat } from "@/lib/ai/deepseek";

const QUIZ_PROMPT = `你是测验出题官。只输出 JSON，不要任何解释或推理过程。输出格式：

{"questions":[
  {"id":1,"type":"choice","difficulty":"easy","question":"题目","options":["A. 选项1","B. 选项2","C. 选项3","D. 选项4"],"answer":"B","dimension":"维度名"},
  {"id":2,"type":"judge","difficulty":"easy","question":"题目","answer":true,"dimension":"维度名"},
  {"id":3,"type":"choice","difficulty":"medium","question":"题目","options":["A. 1","B. 2","C. 3","D. 4"],"answer":"B","dimension":"维度名"},
  {"id":4,"type":"choice","difficulty":"hard","question":"题目","options":["A. 1","B. 2","C. 3","D. 4"],"answer":"B","dimension":"维度名"},
  {"id":5,"type":"judge","difficulty":"hard","question":"题目","answer":false,"dimension":"维度名"}
]}

要求：2简单1中等2较难。不要解释，直接输出 json。`;

export async function POST(req: Request) {
  const t0 = Date.now();
  try {
    const { resourceName, resourceType, targetRole, dimensions } = await req.json();
    console.log(`[Quiz] START resource="${resourceName}" role="${targetRole}" dims=[${dimensions?.join(",")}]`);

    if (!resourceName) {
      return NextResponse.json({ error: "缺少 resourceName" }, { status: 400 });
    }

    // 步骤 2: 构造 prompt
    const userPrompt = `用户正在学习：《${resourceName}》（类型：${resourceType}）
用户目标岗位：${targetRole || "未指定"}
可选的能力维度：${dimensions?.join("、") || "通用技能"}

请生成 5 道测验题（2简单 1中等 2较难），题型为单选题或判断题。输出 JSON。`;

    console.log(`[Quiz] STEP 2 prompt len=${userPrompt.length} chars`);

    // 步骤 3: 调用 DeepSeek
    const t1 = Date.now();
    console.log(`[Quiz] STEP 3 calling DeepSeek...`);
    const raw = await chat([
      { role: "system", content: QUIZ_PROMPT },
      { role: "user", content: userPrompt },
    ], { timeout: 60000, retries: 0, max_tokens: 2048 });
    const t2 = Date.now();
    console.log(`[Quiz] STEP 3 DeepSeek done in ${t2 - t1}ms, response=${raw?.length || 0} chars, first200="${raw?.slice(0, 200)}"`);

    // 步骤 4: JSON 解析
    const t3 = Date.now();
    let parsed: {
      questions: {
        id: number; type: "choice" | "judge"; difficulty: string;
        question: string; options?: string[]; answer: string | boolean; dimension: string;
      }[];
    };

    try {
      parsed = JSON.parse(raw);
      console.log(`[Quiz] STEP 4 JSON parse OK in ${Date.now() - t3}ms`);
    } catch {
      let cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      cleaned = cleaned.replace(/\n/g, " ").replace(/\r/g, "");
      cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1");
      try {
        parsed = JSON.parse(cleaned);
        console.log(`[Quiz] STEP 4 JSON parse OK after cleanup`);
      } catch (e2: any) {
        console.error(`[Quiz] PARSE FAILED raw="${raw?.slice(0, 300)}"`);
        console.error(`[Quiz] PARSE FAILED cleaned="${cleaned?.slice(0, 300)}"`);
        // 最后手段：尝试用正则提取 questions 数组
        const qMatch = raw.match(/\{[^}]*"questions"\s*:\s*\[([\s\S]*)\]\s*\}/);
        if (qMatch) {
          try {
            const fixed = '{"questions":[' + qMatch[1] + ']}';
            parsed = JSON.parse(fixed);
            console.log(`[Quiz] STEP 4 JSON parse OK via regex extraction`);
          } catch {
            throw new Error("Parse failed: " + (raw || "empty").slice(0, 150));
          }
        } else {
          throw new Error("Parse failed: " + (raw || "empty").slice(0, 150));
        }
      }
    }

    console.log(`[Quiz] DONE total=${Date.now() - t0}ms questions=${parsed.questions?.length || 0}`);
    return NextResponse.json({ questions: parsed.questions });
  } catch (err: any) {
    console.error(`[Quiz] ERROR total=${Date.now() - t0}ms msg="${err?.message}"`);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
