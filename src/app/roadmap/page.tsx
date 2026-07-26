"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getLatestAnalysis, type AIAnalysis } from "@/lib/supabase/service";
import { getActiveGoalId } from "@/lib/user";
import { supabase } from "@/lib/supabase/client";

const navItems = [
  { label: "首页", icon: "home", route: "/dashboard", active: false },
  { label: "路线", icon: "route", route: "/roadmap", active: true },
  { label: "学习", icon: "learn", route: "/learning", active: false },
  { label: "成长", icon: "growth", route: "/growth", active: false },
  { label: "我的", icon: "profile", route: "/profile", active: false },
];

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const c = active ? "#3b82f6" : "#9ca3af";
  switch (name) {
    case "home":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 10L12 3L21 10V20H14V14H10V20H3V10Z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={active ? "#eff6ff" : "none"} />
        </svg>
      );
    case "route":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2" fill={active ? "#eff6ff" : "none"} />
          <path d="M12 6V12L16 14" stroke={c} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "learn":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke={c} strokeWidth="2" fill={active ? "#eff6ff" : "none"} />
          <line x1="8" y1="9" x2="16" y2="9" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="12" x2="14" y2="12" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="15" x2="12" y2="15" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "growth":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <polyline points="3,17 9,11 13,15 21,7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={active ? "#eff6ff" : "none"} />
          <polyline points="16,7 21,7 21,12" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "profile":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke={c} strokeWidth="2" fill={active ? "#eff6ff" : "none"} />
          <path d="M4 20C4 16 8 14 12 14C16 14 20 16 20 20" stroke={c} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

// 从能力评分计算综合 readiness（取平均值）
function calcReadiness(scores: { score: number }[]): number {
  if (!scores.length) return 0;
  return Math.round(scores.reduce((s, a) => s + a.score, 0) / scores.length);
}

// 根据 ready 判断阶段状态
function stageStyle(i: number, total: number, readiness: number) {
  const perStage = 90 / total; // 90 分封顶，每阶段占 90/N
  const threshold = Math.round((i + 1) * perStage);

  if (readiness >= threshold) {
    // 已完成
    return { status: "已完成", statusStyle: "bg-blue-50 text-blue-600 border-blue-100", dotColor: "bg-blue-500 ring-blue-100", lineColor: "bg-blue-500" };
  }
  if (i === 0 || readiness >= Math.round(i * perStage)) {
    // 当前阶段
    return { status: "进行中", statusStyle: "bg-indigo-50 text-indigo-600 border-indigo-100", dotColor: "bg-indigo-500 ring-indigo-100", lineColor: "bg-indigo-500" };
  }
  // 未开始
  return { status: "待开始", statusStyle: "bg-gray-50 text-gray-400 border-gray-100", dotColor: "bg-gray-300 ring-gray-100", lineColor: i < total - 1 ? "bg-gray-300" : "bg-transparent" };
}

// 解析 duration 文字（如"1-2个月"→1.5, "3个月"→3）
function parseMonths(d: string): number {
  const nums = d.match(/(\d+)/g);
  if (!nums) return 1;
  return nums.length === 2 ? (Number(nums[0]) + Number(nums[1])) / 2 : Number(nums[0]);
}
// 格式化月份
function formatMonths(m: number): string {
  if (m < 1) return `${Math.round(m * 4)}周`;
  if (m >= 12) return `${Math.round(m / 12 * 10) / 10}年`;
  return `${Math.round(m * 10) / 10}个月`;
}

const timePresets = [1, 3, 6, 9, 12];

export default function RoadmapPage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [goal, setGoal] = useState<{ target_role: string; target_city: string; deadline: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalMonths, setTotalMonths] = useState<number>(6);
  const [userTime, setUserTime] = useState<number>(6);

  useEffect(() => {
    const goalId = getActiveGoalId();
    const goalPromise = goalId ? supabase.from("user_goals").select("*").eq("id", goalId).maybeSingle() : Promise.resolve(null);
    Promise.all([getLatestAnalysis(), goalPromise]).then(([a, goalData]) => {
      setAnalysis(a);
      const g = (goalData as any)?.data || goalData;
      if (g) setGoal({ target_role: g.target_role, target_city: g.target_city, deadline: g.deadline });
      // 计算 AI 原始路线总月数
      if (a?.roadmap?.length) {
        const origTotal = a.roadmap.reduce((s, p) => s + parseMonths(p.duration), 0);
        setTotalMonths(Math.round(origTotal) || 6);
        setUserTime(Math.round(origTotal) || 6);
      }
      setLoading(false);
    });
  }, []);

  const roadmap = analysis?.roadmap || [];
  const nextAction = analysis?.next_action || "";
  const readiness = calcReadiness(analysis?.ability_scores || []);

  // 时间缩放
  const scale = totalMonths > 0 ? userTime / totalMonths : 1;
  const scaledRoadmap = roadmap.map((p) => ({
    ...p,
    duration: formatMonths(parseMonths(p.duration) * scale),
  }));

  // 从能力评分中找最低的 2 个作为"当前优先提升"
  const sortedScores = [...(analysis?.ability_scores || [])].sort((a, b) => a.score - b.score);
  const topGaps = sortedScores.slice(0, 2).map((a) => a.dimension);

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#f8faff" }}>
      <div className="flex-1 overflow-auto pb-20">
        {/* Header */}
        <div className="px-6 pt-8 pb-2">
          <div className="flex items-center mb-3">
            <button onClick={() => router.back()} className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm">返回</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI 成长路线</h1>
          <p className="text-gray-400 text-base mt-1.5 leading-relaxed">
            根据你的目标 Offer，AI 为你规划成长路径
          </p>
        </div>

        {loading ? (
          <div className="px-6 py-20 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-400">加载中...</span>
            </div>
          </div>
        ) : !goal || !roadmap.length ? (
          <div className="px-6 py-20 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7" stroke="#3b82f6" strokeWidth="1.5" />
                  <path d="M10 6V10L13 12" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">暂无成长路线</h3>
              <p className="text-sm text-gray-400 mb-4">请先完成目标创建和能力评估</p>
              <button onClick={() => router.push("/goal")} className="px-6 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-2xl transition-all">
                去创建目标
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Target Job Card */}
            <div className="px-6 mb-4">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">目标岗位</h3>
                    <p className="text-lg font-semibold text-gray-900">{goal.target_role}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{goal.target_city} · {goal.deadline}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-medium text-gray-400 mb-1">综合准备度</h3>
                    <p className="text-2xl font-bold text-blue-500">{readiness}%</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all" style={{ width: `${readiness}%` }} />
                </div>
              </div>
            </div>

            {/* Timeframe Selector */}
            <div className="px-6 mb-4">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-900">可用时间</span>
                  <span className="text-xs text-gray-400">AI 原规划 {totalMonths} 个月，你可自定义</span>
                </div>
                <div className="flex gap-2 mb-3">
                  {timePresets.map((m) => (
                    <button key={m} onClick={() => setUserTime(m)}
                      className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all ${userTime === m ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-gray-50 text-gray-500 border-gray-100"}`}>
                      {m}个月
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <input type="range" min={1} max={18} value={userTime} onChange={(e) => setUserTime(Number(e.target.value))}
                    className="flex-1 accent-blue-500" />
                  <span className="text-sm font-bold text-blue-500 w-14 text-right">{userTime}个月</span>
                </div>
              </div>
            </div>

            {/* Growth Stages Timeline */}
            <div className="px-6 mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">你的成长阶段</h2>
              <div className="relative">
                {scaledRoadmap.map((phase: any, i: number) => {
                  const s = stageStyle(i, scaledRoadmap.length, readiness);
                  const isExpanded = expanded === i;
                  return (
                    <div key={i} className="flex items-start gap-3.5 pb-0">
                      <div className="flex flex-col items-center flex-shrink-0 pt-2">
                        <div className={`w-3.5 h-3.5 rounded-full ring-4 flex-shrink-0 ${s.dotColor}`} />
                        {i < scaledRoadmap.length - 1 && <div className={`w-0.5 flex-1 min-h-[36px] mt-1 ${s.lineColor}`} />}
                      </div>
                      <div className="flex-1 pb-3">
                        <button onClick={() => setExpanded(isExpanded ? null : i)} className={`w-full text-left rounded-2xl border p-4 transition-all ${s.statusStyle}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs font-bold opacity-50">{String(i + 1).padStart(2, "0")}</span>
                              <h3 className="text-sm font-semibold">{phase.stage}</h3>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-medium opacity-70">{phase.duration}</span>
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                                <path d="M4 6L7 9L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-black/5 space-y-1.5">
                              <div className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40 flex-shrink-0 mt-1.5" />
                                <span className="text-xs opacity-80">{phase.goal}</span>
                              </div>
                              {phase.reason && (
                                <div className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-20 flex-shrink-0 mt-1.5" />
                                  <span className="text-xs opacity-60">{phase.reason}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Suggestion */}
            <div className="px-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">AI 建议</h2>
              <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm shadow-indigo-50 p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="7" stroke="#6366f1" strokeWidth="1.5" fill="none" />
                      <circle cx="10" cy="10" r="3" fill="#6366f1" />
                      <line x1="10" y1="3" x2="10" y2="7" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1">
                    {topGaps.length === 2
                      ? <>根据你的能力评估，当前优先提升 <span className="font-semibold text-gray-900">{topGaps[0]}</span> 和 <span className="font-semibold text-gray-900">{topGaps[1]}</span> 能力。</>
                      : <>根据你的目标岗位 <span className="font-semibold text-gray-900">{goal.target_role}</span>，建议你从基础阶段开始逐步积累核心能力。</>}
                  </p>
                </div>
                {nextAction && (
                  <div className="bg-indigo-50 rounded-2xl px-4 py-3 flex items-center gap-2.5">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                      <circle cx="8" cy="8" r="6" stroke="#6366f1" strokeWidth="1.2" />
                      <path d="M8 4V8L10.5 9.5" stroke="#6366f1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-sm font-medium text-indigo-700">{nextAction}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="h-4" />
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 pt-2 pb-5 safe-bottom flex items-center justify-around z-40 will-change-transform">
        {navItems.map((item) => (
          <button key={item.label} onClick={() => { window.location.href = item.route; }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${item.active ? "text-blue-500" : "text-gray-300 hover:text-gray-400"}`}>
            <NavIcon name={item.icon} active={item.active} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
