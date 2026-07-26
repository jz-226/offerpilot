import { NextResponse } from "next/server";
import { chat } from "@/lib/ai/deepseek";

const QUIZ_PROMPT = `你是一个技术测验出题官。根据用户正在学习的内容，生成 5 道测验题。

难度分布：2 道简单、1 道中等、2 道较难。
题型：单选题或判断题。

输出严格 JSON：
{
  "questions": [
    {
      "id": 1,
      "type": "choice",
      "difficulty": "easy",
      "question": "题目内容",
      "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
      "answer": "B",
      "dimension": "关联的能力维度名称"
    },
    {
      "id": 2,
      "type": "judge",
      "difficulty": "easy",
      "question": "题目内容",
      "answer": true,
      "dimension": "关联的能力维度名称"
    }
  ]
}

要求：
- 题目必须跟用户正在学的具体内容直接相关，不能是泛泛的入门题
- 选项之间的错误选项要有迷惑性
- 判断题的 answer 是 true 或 false
- 每道题绑定一个能力维度 dimension，从用户的目标岗位能力维度中选择
- 里面必须包含 json 这个单词`;

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
    ], { timeout: 15000, retries: 1, max_tokens: 1024 });
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
        console.log(`[Quiz] STEP 4 JSON parse OK after cleanup in ${Date.now() - t3}ms`);
      } catch (e: any) {
        console.error(`[Quiz] STEP 4 JSON parse FAILED raw="${raw?.slice(0, 500)}"`);
        throw new Error("AI 返回格式异常，请重试");
      }
    }

    console.log(`[Quiz] DONE total=${Date.now() - t0}ms questions=${parsed.questions?.length || 0}`);
    return NextResponse.json({ questions: parsed.questions });
  } catch (err: any) {
    console.error(`[Quiz] ERROR total=${Date.now() - t0}ms msg="${err?.message}"`);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
