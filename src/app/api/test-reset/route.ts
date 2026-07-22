import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(req: Request) {
  try {
    const { uid } = await req.json();

    // 1. 建一个满分 goal
    const { data: goal } = await supabase.from("user_goals").insert({
      user_id: uid || "test",
      target_role: "AI 产品经理",
      target_city: "上海",
      deadline: "2027 春招",
      salary_range: "20-30K",
    }).select().single();

    if (!goal) throw new Error("Goal insert failed");

    // 2. 建满分 analysis
    await supabase.from("ai_analysis").insert({
      goal_id: goal.id,
      required_skills: ["PRD 撰写", "用户研究", "AI 技术认知", "产品落地", "数据分析"],
      user_strengths: ["学习能力强", "项目经验丰富", "面试准备充分"],
      skill_gaps: [],
      roadmap: [
        { stage: "基础夯实期", goal: "掌握产品核心方法", duration: "1个月", reason: "打好地基" },
        { stage: "项目实战期", goal: "完成真实AI产品项目", duration: "2个月", reason: "积累经验" },
        { stage: "实习冲刺期", goal: "准备简历和面试", duration: "1个月", reason: "冲刺Offer" },
      ],
      ability_scores: [
        { dimension: "PRD 撰写", score: 100 },
        { dimension: "用户研究", score: 100 },
        { dimension: "AI 技术认知", score: 100 },
        { dimension: "产品落地", score: 100 },
        { dimension: "数据分析", score: 100 },
      ],
      next_action: "你的能力已经全面达到目标岗位要求！开始投递简历吧 🎉",
      readiness: 100,
    });

    // 3. 建几条满分测验记录
    for (let i = 0; i < 5; i++) {
      await supabase.from("quiz_results").insert({
        user_id: uid || "test",
        resource_name: `技能提升测验 #${i + 1}`,
        score: 5,
        total: 5,
        dimension_scores: { "PRD 撰写": 2, "用户研究": 1, "AI 技术认知": 1, "产品落地": 1 },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
