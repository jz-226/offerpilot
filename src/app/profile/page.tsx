"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getLatestAnalysis, getLatestGoal, getRecentActivity, getTodayQuizGain } from "@/lib/supabase/service";
import { supabase } from "@/lib/supabase/client";
import { getUserId, getProfiles, switchProfile, createNewProfile, getUserName } from "@/lib/user";
import { getMilestone, getNextMilestone } from "@/lib/milestone";

const navItems = [
  { label: "首页", icon: "home", route: "/dashboard", active: false },
  { label: "路线", icon: "route", route: "/roadmap", active: false },
  { label: "学习", icon: "learn", route: "/learning", active: false },
  { label: "成长", icon: "growth", route: "/growth", active: false },
  { label: "我的", icon: "profile", route: "/profile", active: true },
];

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const c = active ? "#3b82f6" : "#9ca3af";
  switch (name) {
    case "home": return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 10L12 3L21 10V20H14V14H10V20H3V10Z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={active ? "#eff6ff" : "none"} /></svg>);
    case "route": return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2" fill={active ? "#eff6ff" : "none"} /><path d="M12 6V12L16 14" stroke={c} strokeWidth="2" strokeLinecap="round" /></svg>);
    case "learn": return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke={c} strokeWidth="2" fill={active ? "#eff6ff" : "none"} /><line x1="8" y1="9" x2="16" y2="9" stroke={c} strokeWidth="1.5" strokeLinecap="round" /><line x1="8" y1="12" x2="14" y2="12" stroke={c} strokeWidth="1.5" strokeLinecap="round" /></svg>);
    case "growth": return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><polyline points="3,17 9,11 13,15 21,7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={active ? "#eff6ff" : "none"} /><polyline points="16,7 21,7 21,12" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
    case "profile": return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={c} strokeWidth="2" fill={active ? "#eff6ff" : "none"} /><path d="M4 20C4 16 8 14 12 14C16 14 20 16 20 20" stroke={c} strokeWidth="2" strokeLinecap="round" /></svg>);
    default: return null;
  }
}

function calcReadiness(scores: { score: number }[]): number {
  if (!scores.length) return 0;
  return Math.round(scores.reduce((s, a) => s + a.score, 0) / scores.length);
}

function dimColor(score: number): string {
  if (score < 25) return "from-red-400 to-red-300";
  if (score < 55) return "from-amber-400 to-amber-300";
  if (score < 80) return "from-blue-400 to-blue-300";
  return "from-emerald-400 to-emerald-300";
}

export default function ProfilePage() {
  const router = useRouter();
  const [hasData, setHasData] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [targetCity, setTargetCity] = useState("");
  const [deadline, setDeadline] = useState("");
  const [readiness, setReadiness] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [abilities, setAbilities] = useState<{ name: string; value: number }[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [profiles, setProfiles] = useState(getProfiles());
  const uid = getUserId();

  useEffect(() => {
    Promise.all([
      getLatestAnalysis(),
      getLatestGoal(),
      getRecentActivity(),
      getTodayQuizGain(),
      supabase.from("quiz_results").select("*", { count: "exact", head: true }).eq("user_id", uid),
      supabase.from("quiz_results").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(5),
      supabase.from("reflections").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(5),
    ]).then(([analysis, goal, dates, _gain, { count }, { data: quizData }, { data: reflData }]) => {
      if (goal) { setTargetRole(goal.target_role); setTargetCity(goal.target_city); setDeadline(goal.deadline); }
      if (analysis?.ability_scores?.length) {
        setHasData(true);
        setReadiness(calcReadiness(analysis.ability_scores));
        setAbilities(analysis.ability_scores.map((s) => ({ name: s.dimension, value: s.score })));
      }
      // 连续天数
      const daySet = new Set(dates.map((d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`));
      let s = 0; const today = new Date();
      for (let i = 0; i < 30; i++) { const d = new Date(today); d.setDate(d.getDate() - i); if (daySet.has(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`)) s++; else if (i > 0) break; }
      setStreakDays(s);
      setTotalQuizzes(count || 0);

      // 最近记录
      const timeline: any[] = [];
      (quizData || []).forEach((q) => timeline.push({ type: "quiz", title: `完成测验：${q.resource_name}`, time: new Date(q.created_at).toISOString().slice(0, 10), feedback: q.score >= 4 ? "掌握程度较高" : q.score >= 2 ? "有一定理解" : "建议重新学习", detail: `${q.score}/${q.total} 题正确`, ts: new Date(q.created_at).getTime() }));
      (reflData || []).forEach((r) => timeline.push({ type: "reflection", title: "提交成长总结", time: new Date(r.created_at).toISOString().slice(0, 10), feedback: r.summary || "记录了今日心得", detail: r.note?.slice(0, 100) || "", ts: new Date(r.created_at).getTime() }));
      timeline.sort((a, b) => b.ts - a.ts);
      setRecords(timeline.slice(0, 10));
    });
  }, []);

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#f8faff" }}>
      <div className="flex-1 overflow-auto pb-20">
        <div className="px-6 pt-8 pb-2">
          <div className="flex items-center mb-5">
            <button onClick={() => router.back()} className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="text-sm">返回</span>
            </button>
          </div>
          <div className="flex items-center gap-4 mb-1">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2" /><path d="M4 20C4 16 8 14 12 14C16 14 20 16 20 20" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <div><h1 className="text-xl font-bold text-gray-900">{getUserName() || "未设置姓名"}</h1><p className="text-sm text-gray-400">{targetRole || "未设置目标"}</p></div>
          </div>
        </div>

        {/* 档案切换器 */}
        <div className="px-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">我的岗位档案</h2>
          <div className="space-y-2">
            {profiles.map((p) => {
              const isActive = p.id === uid;
              return (
                <button key={p.id}
                  onClick={() => { if (!isActive) switchProfile(p.id); }}
                  className={`w-full text-left bg-white rounded-2xl border p-4 transition-all ${isActive ? "border-blue-200 shadow-sm shadow-blue-50" : "border-gray-100 hover:border-gray-200"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{p.role || "未设置"}</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">{p.city || "未填城市"} · {p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : ""}</p>
                    </div>
                    {isActive && <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">当前</span>}
                  </div>
                </button>
              );
            })}
          </div>
          <button onClick={() => {
            if (confirm("确定要新增一个岗位档案吗？当前档案会保留，可以随时切换回来。")) {
              createNewProfile();
              router.push("/goal");
            }
          }}
            className="w-full mt-2 py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 text-sm font-medium rounded-2xl border border-dashed border-gray-200 transition-all">
            ＋ 新增岗位
          </button>
        </div>

        {!hasData ? (
          <div className="px-6 mb-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#3b82f6" strokeWidth="1.5" /><path d="M10 6V10L13 12" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">还没有成长数据</h3>
              <p className="text-sm text-gray-400 mb-4">请先创建目标并完成 AI 分析</p>
              <button onClick={() => router.push("/goal")} className="px-6 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-2xl">去创建目标</button>
            </div>
          </div>
        ) : (
          <>
            {/* 我的目标 */}
            <div className="px-6 mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">我的目标</h2>
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div><p className="text-xs text-gray-400 mb-0.5">目标岗位</p><p className="text-sm font-semibold text-gray-900">{targetRole || "—"}</p></div>
                  <div><p className="text-xs text-gray-400 mb-0.5">目标城市</p><p className="text-sm font-semibold text-gray-900">{targetCity || "—"}</p></div>
                  <div><p className="text-xs text-gray-400 mb-0.5">入职时间</p><p className="text-sm font-semibold text-gray-900">{deadline || "—"}</p></div>
                  <div><p className="text-xs text-gray-400 mb-0.5">目标公司</p><p className="text-sm font-semibold text-gray-900">互联网 AI 公司</p></div>
                </div>
              </div>
            </div>

            {/* 成长概览 */}
            <div className="px-6 mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">成长概览</h2>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                  <div className="text-2xl font-bold text-blue-500">{readiness}%</div>
                  <div className="text-[11px] text-gray-400 mt-1 leading-tight">综合准备度</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-500">{streakDays}</div>
                  <div className="text-[11px] text-gray-400 mt-1 leading-tight">连续成长天数</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-500">{totalQuizzes}</div>
                  <div className="text-[11px] text-gray-400 mt-1 leading-tight">累计测验</div>
                </div>
              </div>
            </div>

            {/* 能力变化 */}
            {abilities.length > 0 && (
              <div className="px-6 mb-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">能力变化</h2>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3 text-[10px] text-gray-300">
                  <span>🌱 入门</span><span>🌿 基础</span><span>🪴 独立</span><span>🌳 熟练</span><span>🏆 精通</span>
                </div>
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
                  {abilities.map((a) => {
                    const ms = getMilestone(a.value);
                    const next = getNextMilestone(a.value);
                    return (
                    <div key={a.name}>
                      <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-gray-700">{a.name} {ms.icon}</span><span className="text-xs text-gray-400">{ms.name} · {a.value}</span></div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-0.5"><div className={`h-full bg-gradient-to-r ${dimColor(a.value)} rounded-full transition-all`} style={{ width: `${a.value}%` }} /></div>
                      {next && <p className="text-[10px] text-gray-300 mb-1">距「{next.icon} {next.name}」还差 {next.min - a.value} 分</p>}
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 最近成长记录 */}
            {records.length > 0 && (
              <div className="px-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">最近成长记录</h2>
                <div className="space-y-2.5">
                  {records.map((r, i) => {
                    const isExpanded = expanded === i;
                    return (
                      <button key={i} onClick={() => setExpanded(isExpanded ? null : i)} className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left transition-all">
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="text-sm font-semibold text-gray-900">{r.title}</h4>
                          <div className="flex items-center gap-2"><span className="text-[11px] text-gray-300">{r.time}</span><svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}><path d="M4 6L7 9L10 6" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                        </div>
                        <div className="flex items-center gap-1.5 mb-2"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4" stroke="#818cf8" strokeWidth="1" /><circle cx="6" cy="6" r="1.5" fill="#818cf8" /></svg><span className="text-[11px] text-indigo-500 font-medium">{r.type === "quiz" ? "测验" : "反思"}</span></div>
                        {isExpanded && <div className="mt-2 pt-2.5 border-t border-gray-50"><p className="text-xs text-gray-500 leading-relaxed">{r.detail}</p></div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="h-4" />
          </>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 pt-2 pb-5 safe-bottom flex items-center justify-around z-40">
        {navItems.map((item) => (<button key={item.label} onClick={() => router.push(item.route)} className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${item.active ? "text-blue-500" : "text-gray-300 hover:text-gray-400"}`}><NavIcon name={item.icon} active={item.active} /><span className="text-[10px] font-medium">{item.label}</span></button>))}
      </nav>
    </main>
  );
}
