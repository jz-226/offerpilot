import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chat } from "@/lib/ai/deepseek";

const QUIZ_PROMPT = `你是测验出题官。只输出 JSON。
格式：{"questions":[{"id":1,"type":"choice","difficulty":"easy","question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"answer":"B","dimension":"..."},{...}]}
难度：2简单 1中等 2较难。不要解释。`;

function extractJson(raw: string): string {
  try { JSON.parse(raw); return raw; } catch {}
  let s = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const idx = s.lastIndexOf('{"questions"');
  if (idx > 0) s = s.slice(idx);
  if (!s.endsWith("}]}")) {
    let depth = 0; let lastGood = -1;
    for (let i = 0; i < s.length; i++) {
      if (s[i] === "{") depth++;
      if (s[i] === "}") { depth--; if (depth === 0) lastGood = i; }
    }
    if (lastGood > 10) s = s.slice(0, lastGood + 1) + "]}";
  }
  try { JSON.parse(s); return s; } catch {}
  throw new Error("Parse failed");
}

// GET /api/quiz/status?taskId=xxx
// 如果任务 pending，尝试执行 DeepSeek
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");
    if (!taskId) return NextResponse.json({ error: "缺少 taskId" }, { status: 400 });

    const supabase = await createClient();
    const { data: task, error } = await supabase.from("quiz_tasks").select("*").eq("id", taskId).single();
    if (error || !task) return NextResponse.json({ error: "任务不存在" }, { status: 404 });

    // 已完成的直接返回
    if (task.status === "completed") {
      return NextResponse.json({ status: "completed", questions: task.result?.questions });
    }
    // failed 也重试——每次请求是新 Serverless 函数，有新的时间配额
    if (task.status === "failed") {
      await supabase.from("quiz_tasks").update({ status: "pending" }).eq("id", taskId);
    }

    // pending → 尝试执行（Vercel 上 8 秒超时内尽力完成）
    try {
      const userPrompt = `生成5道关于${task.resource}的测验题。岗位：${task.role || "任意"}，维度：${(task.dimensions || []).join("、") || "通用"}。只输出 JSON。`;

      const raw = await chat([
        { role: "system", content: QUIZ_PROMPT },
        { role: "user", content: userPrompt },
      ], { timeout: 8000, retries: 0, max_tokens: 2048 });

      const json = extractJson(raw);
      const parsed = JSON.parse(json);

      await supabase.from("quiz_tasks").update({
        status: "completed",
        result: parsed,
        updated_at: new Date().toISOString(),
      }).eq("id", taskId);

      return NextResponse.json({ status: "completed", questions: parsed.questions });
    } catch (e: any) {
      // 超时或解析失败 → 标记 failed，前端会重试
      await supabase.from("quiz_tasks").update({
        status: "failed",
        updated_at: new Date().toISOString(),
      }).eq("id", taskId);
      return NextResponse.json({ status: "failed" });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
