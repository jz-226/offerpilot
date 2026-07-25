import { NextResponse } from "next/server";
import { getLatestGoal, getLatestAssessment } from "@/lib/supabase/service";
import { chat } from "@/lib/ai/deepseek";
import { createClient } from "@/lib/supabase/server";

// ====== 阶段 1：岗位分类 ======
const CLASSIFY_PROMPT = `你是一个岗位分类器。根据用户输入的目标岗位，判断它属于哪个类别。

类别选项：
- 产品类：产品经理、AI产品经理、产品总监等
- 技术前端类：前端工程师、Web前端、H5开发、小程序开发等
- 技术后端类：后端工程师、Java开发、Python开发、Go开发、Node.js开发等
- 设计类：UI设计师、UX设计师、交互设计师、视觉设计师等
- 数据类：数据分析师、数据工程师、数据科学家、BI分析师等
- 运营类：用户运营、内容运营、产品运营、活动运营等
- 其他

只输出 JSON：{"category": "类别名", "keywords": ["该岗位的核心关键词"]}`;

// ====== 阶段 2：能力分析 ======
const ANALYZE_PROMPT = `你是一个严格的职业能力评估分析师。

目标岗位分类：{category}
岗位核心关键词：{keywords}

用户的目标岗位是：{role}
用户的真实背景：
{profile}

评估规则：
1. 只根据用户提供的真实信息评分。用户说"无经验"就是没有，不要推测。
2. 只对"岗位相关技能"中用户实际回答过的维度进行评分。用户没有被问到的维度，不要评分也不要列出来。
3. 评分必须基于用户在该维度的回答。回答了"无经验"则对应低分(0-20)，"熟练"则对应高分(70-90)。
4. 每个评分必须带 evidence，用自然的评估语气描述，例如"该维度暂无积累"、"具备基础认知"、"经验较为丰富"。禁止使用"用户在该维度选择了..."这种机械引用，用第三人称客观评估。
5. 不预测Offer概率，不编造经历。
6. abilityScores 中只包含用户在评估表单中实际回答过的维度，最多5个。

时间线规则：
- 如果用户是大一/大二，阶段时间可以长一些（3-6个月）
- 如果用户是大三/大四，阶段要紧凑（1-3个月）
- 如果用户已经有实习/项目经验，时间可以更短
- 如果用户每天投入2小时以上，时间应适当缩短
- 用户是学生，可以给更长的学习期；用户是工作党，路线要更聚焦

城市/薪资/公司对分析的影响：
- 如果目标城市是一线城市（北上广深杭），岗位竞争激烈，评分应更严格，路线需要更紧凑
- 如果目标城市是二三线城市，竞争相对较小，但岗位数量也少，需要关注城市的产业特点
- 期望薪资反映用户对自己水平的定位。高薪（25K+）意味着用户瞄准中高级岗位，能力要求更高
- 低薪（10K以下）通常对应初级/实习岗位，重点在基础技能和项目经验
- 如果用户填写了目标公司，分析该公司的招聘偏好（大厂重算法/基础，中小厂重实战/广度）
- 城市、薪资、公司综合反映了岗位的真实竞争程度，需要在对应用户的 roadmap 中体现

输出严格 JSON（不要 markdown 包裹）：
{
  "category": "{category}",
  "abilityScores": [
    { "dimension": "能力维度", "score": 0-100, "evidence": "评分依据：用户在评估中表示..." }
  ],
  "strengths": ["基于用户真实信息的优势"],
  "gaps": ["具体的差距，指出用户缺什么"],
  "roadmap": [
    { "stage": "阶段名", "goal": "该阶段目标", "duration": "X个月", "reason": "为什么这个阶段必要" }
  ],
  "nextAction": "基于当前差距最紧迫的一件事"
}`;

export async function POST() {
  try {
    const goal = await getLatestGoal(false);
    if (!goal) {
      return NextResponse.json({ error: "No goal found" }, { status: 400 });
    }

    const assessment = await getLatestAssessment(false);

    // 构建用户背景
    const userProfile = assessment
      ? [
          `角色：${goal.target_role}`,
          `当前阶段：${assessment.stage}`,
          `项目经验：${assessment.project_experience}`,
          `每天可投入：${assessment.daily_time}`,
          `自我优势：${assessment.strengths.join("、")}`,
          `岗位相关技能：${Object.entries(assessment.skill_answers).map(([k, v]) => `${k}: ${v}`).join("、") || "未填写"}`,
          `职业动机：${assessment.motivation || "未填写"}`,
        ].join("\n")
      : `目标岗位：${goal.target_role}。用户未填写评估。`;

    // 城市 / 薪资 / 公司背景
    const context = [
      `目标城市：${goal.target_city || "未填写"}`,
      `期望薪资：${goal.salary_range || "未填写"}`,
      `目标公司：${goal.target_company || "未填写"}`,
      `入职时间：${goal.deadline || "未填写"}`,
    ].join("\n");

    // ---- 阶段 1: 分类 ----
    const classifyRaw = await chat([
      { role: "system", content: CLASSIFY_PROMPT },
      { role: "user", content: `请分类：${goal.target_role}` },
    ], { temperature: 0, max_tokens: 200 });

    let classify: { category: string; keywords: string[] };
    try {
      classify = JSON.parse(classifyRaw);
    } catch {
      const c = classifyRaw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      classify = JSON.parse(c);
    }

    // ---- 阶段 2: 分析 ----
    const analyzePrompt = ANALYZE_PROMPT
      .replace(/\{category\}/g, classify.category)
      .replace(/\{keywords\}/g, classify.keywords.join("、"))
      .replace(/\{role\}/g, goal.target_role)
      .replace(/\{profile\}/g, userProfile);

    const raw = await chat([
      { role: "system", content: analyzePrompt },
      { role: "user", content: `请严格按照规则，对"${goal.target_role}"进行评估（${classify.category}岗位）。

${context}

以上城市、薪资、公司信息虽然不是必填项，但如果用户填写了，必须纳入分析：城市影响竞争程度、薪资反映目标级别、公司暗示招聘偏好。` },
    ]);

    // 解析
    let parsed: {
      category: string;
      abilityScores: { dimension: string; score: number; evidence: string }[];
      strengths: string[];
      gaps: string[];
      roadmap: { stage: string; goal: string; duration: string; reason: string }[];
      nextAction: string;
    };
    try {
      parsed = JSON.parse(raw);
    } catch {
      let cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      cleaned = cleaned.replace(/\n/g, " ").replace(/\r/g, "");
      cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1");
      parsed = JSON.parse(cleaned);
    }

    // 保存
    const supabase = await createClient();
    const { data: saved, error } = await supabase
      .from("ai_analysis")
      .insert({
        goal_id: goal.id,
        required_skills: parsed.abilityScores?.map((a) => a.dimension) || [],
        user_strengths: parsed.strengths || [],
        skill_gaps: parsed.gaps || [],
        roadmap: parsed.roadmap || [],
        ability_scores: parsed.abilityScores || [],
        next_action: parsed.nextAction || "",
        readiness: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      ...saved,
      abilityScores: parsed.abilityScores,
      nextAction: parsed.nextAction,
    });
  } catch (err: any) {
    console.error("analyze error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}
