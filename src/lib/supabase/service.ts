import { createClient } from "./client";
import { getUserId } from "@/lib/user";

const supabase = typeof window !== "undefined" ? createClient() : createClient(); // always use browser client

// ---- 用户目标 ----

export interface UserGoal {
  id?: number;
  user_id: string;
  target_role: string;
  target_city: string;
  target_company: string;
  deadline: string;
  salary_range: string;
  created_at?: string;
}

export async function createUserGoal(goal: Omit<UserGoal, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("user_goals")
    .insert({ ...goal, user_id: getUserId() })
    .select()
    .single();

  if (error) throw error;
  return data as UserGoal;
}

export async function getLatestGoal(withUser: boolean = true) {
  let query = supabase.from("user_goals").select("*");
  if (withUser) query = query.eq("user_id", getUserId());
  const { data, error } = await query.order("created_at", { ascending: false }).limit(1).single();
  if (error) return null;
  return data as UserGoal;
}

// ---- 成长路线 ----

export interface RoadmapStage {
  id?: number;
  goal_id: number;
  stage: number;
  title: string;
  description: string;
  status: string;
  created_at?: string;
}

export async function createRoadmapStages(goalId: number, stages: Omit<RoadmapStage, "id" | "goal_id" | "created_at">[]) {
  const rows = stages.map((s) => ({ ...s, goal_id: goalId }));
  const { data, error } = await supabase
    .from("roadmap")
    .insert(rows)
    .select();

  if (error) throw error;
  return data as RoadmapStage[];
}

// ---- 学习记录 ----

export interface LearningRecord {
  id?: number;
  user_id: string;
  resource_name: string;
  resource_type: string;
  completed: boolean;
  created_at?: string;
}

export async function addLearningRecord(record: Omit<LearningRecord, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("learning_records")
    .insert({ ...record, user_id: getUserId() })
    .select()
    .single();

  if (error) throw error;
  return data as LearningRecord;
}

export async function getLearningRecords() {
  const { data, error } = await supabase
    .from("learning_records")
    .select("*")
    .eq("user_id", getUserId())
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as LearningRecord[];
}

// ---- 成长证据 ----

export interface Evidence {
  id?: number;
  user_id: string;
  type: string;
  content: string;
  created_at?: string;
}

export async function addEvidence(evidence: Omit<Evidence, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("evidence")
    .insert({ ...evidence, user_id: getUserId() })
    .select()
    .single();

  if (error) throw error;
  return data as Evidence;
}

// ---- AI 分析 ----

export interface AIAnalysis {
  id?: number;
  goal_id: number;
  required_skills: string[];
  user_strengths: string[];
  skill_gaps: string[];
  roadmap: { stage: string; goal: string; duration: string; reason?: string }[];
  ability_scores: { dimension: string; score: number; evidence: string }[];
  next_action: string;
  readiness: number;
  created_at?: string;
}

export async function saveAnalysis(analysis: Omit<AIAnalysis, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("ai_analysis")
    .insert(analysis)
    .select()
    .single();

  if (error) throw error;
  return data as AIAnalysis;
}

export async function getLatestAnalysis() {
  // 先找最新目标
  const goal = await getLatestGoal();
  if (!goal) return null;

  // 再找该目标关联的分析
  const { data, error } = await supabase
    .from("ai_analysis")
    .select("*")
    .eq("goal_id", goal.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data as AIAnalysis;
}

// ---- 用户评估 ----

export interface UserAssessment {
  id?: number;
  user_id: string;
  stage: string;
  project_experience: string;
  daily_time: string;
  skill_answers: Record<string, string>;
  strengths: string[];
  motivation: string;
  created_at?: string;
}

export async function saveAssessment(assessment: Omit<UserAssessment, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("user_assessment")
    .insert(assessment)
    .select()
    .single();

  if (error) throw error;
  return data as UserAssessment;
}

// ---- 测验 ----

export interface QuizResult {
  id?: number;
  user_id: string;
  resource_name: string;
  score: number;
  total: number;
  dimension_scores: Record<string, number>;
  created_at?: string;
}

export async function saveQuizResult(result: Omit<QuizResult, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("quiz_results")
    .insert(result)
    .select()
    .single();
  if (error) throw error;
  return data as QuizResult;
}

// 返回今日该资源已做次数
export async function canRetakeQuiz(resourceName: string): Promise<{ attempts: number }> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("quiz_results")
    .select("*", { count: "exact", head: true })
    .eq("resource_name", resourceName)
    .eq("user_id", getUserId())
    .gte("created_at", since);
  return { attempts: count || 0 };
}

// 更新 ai_analysis 中的 ability_scores（加分）
export async function updateAbilityScore(dimension: string, points: number) {
  const analysis = await getLatestAnalysis();
  if (!analysis) return;

  const scores = [...(analysis.ability_scores || [])];
  const idx = scores.findIndex((s) => s.dimension === dimension);

  if (idx >= 0) {
    scores[idx] = { ...scores[idx], score: Math.min(100, scores[idx].score + points) };
  } else {
    scores.push({ dimension, score: points, evidence: "测验加分" });
  }

  await supabase
    .from("ai_analysis")
    .update({ ability_scores: scores })
    .eq("id", analysis.id);
}

// ---- 阶段计算 ----

export function getCurrentStage(readiness: number, totalStages: number = 4, stageNames?: string[]): {
  index: number;
  name: string;
  threshold: number;
  progress: number;
} {
  const perStage = 90 / totalStages;
  const idx = Math.min(Math.floor(readiness / perStage), totalStages - 1);
  const threshold = Math.round(perStage);
  const stageStart = Math.round(idx * perStage);
  const progress = Math.min(100, Math.round(((readiness - stageStart) / perStage) * 100));

  // 用 AI 生成的阶段名，回退到默认名
  const defaults = totalStages === 5
    ? ["基础夯实", "核心技能", "专项突破", "项目实战", "求职冲刺"]
    : ["基础夯实", "技能提升", "项目实战", "求职冲刺"];
  const name = stageNames?.[idx] || defaults[idx] || `阶段${idx + 1}`;

  return { index: idx, name, threshold, progress };
}

// ---- 打卡 + 趋势 ----

export async function getRecentActivity(): Promise<Date[]> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("quiz_results")
    .select("created_at")
    .eq("user_id", getUserId())
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  const days = new Set<string>();
  data.forEach((r) => {
    const d = new Date(r.created_at);
    days.add(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
  });
  return Array.from(days).map((s) => new Date(s));
}

// 检查今天是否做过测验
export async function getTodayQuizGain(): Promise<number> {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("quiz_results")
    .select("*", { count: "exact", head: true })
    .eq("user_id", getUserId())
    .gte("created_at", since.toISOString());
  return count || 0;
}

export async function getLatestAssessment(withUser: boolean = true) {
  let query = supabase.from("user_assessment").select("*");
  if (withUser) query = query.eq("user_id", getUserId());
  const { data, error } = await query.order("created_at", { ascending: false }).limit(1).single();
  if (error) return null;
  return data as UserAssessment;
}
