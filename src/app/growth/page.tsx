"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getLatestAnalysis, getRecentActivity, getTodayQuizGain } from "@/lib/supabase/service";
import { supabase } from "@/lib/supabase/client";

const navItems = [
  { label: "首页", icon: "home", route: "/dashboard", active: false },
  { label: "路线", icon: "route", route: "/roadmap", active: false },
  { label: "学习", icon: "learn", route: "/learning", active: false },
  { label: "成长", icon: "growth", route: "/growth", active: true },
  { label: "我的", icon: "profile", route: "/profile", active: false },
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

const dimColors: Record<number, string> = {
  0: "from-red-400 to-red-300",
  1: "from-amber-400 to-amber-300",
  2: "from-blue-400 to-blue-300",
  3: "from-emerald-400 to-emerald-300",
};

function dimColor(score: number): string {
  if (score < 25) return dimColors[0];
  if (score < 55) return dimColors[1];
  if (score < 80) return dimColors[2];
  return dimColors[3];
}

export default function GrowthPage() {
  const router = useRouter();
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [totalGain, setTotalGain] = useState(0);
  const [abilities, setAbilities] = useState<{ name: string; value: number }[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [nextAction, setNextAction] = useState("");
  const [weakestDim, setWeakestDim] = useState("");
  const [loading, setLoading] = useState(true);

  const handleDelete = async (record: any) => {
    if (!record.table || !record.dbId) return;
    await supabase.from(record.table).delete().eq("id", record.dbId);
    setRecords((prev) => prev.filter((r) => r.dbKey !== record.dbKey));
    setOpenMenu(null);
  };

  useEffect(() => {
    Promise.all([
      getLatestAnalysis(),
      getTodayQuizGain(),
      getRecentActivity(),
      // 总测验次数
      supabase.from("quiz_results").select("*", { count: "exact" }).eq("user_id", "test-user-001"),
      // 最近 10 条测验记录
      supabase.from("quiz_results").select("*").eq("user_id", "test-user-001").order("created_at", { ascending: false }).limit(10),
      // 反思记录
      supabase.from("reflections").select("*").eq("user_id", "test-user-001").order("created_at", { ascending: false }).limit(10),
    ]).then(([analysis, gain, dates, { count }, { data: quizData }, { data: reflectionData }]) => {
      // 能力维度
      if (analysis?.ability_scores?.length) {
        setAbilities(analysis.ability_scores.map((s) => ({ name: s.dimension, value: s.score })));
      }
      // 下一步建议
      setNextAction(analysis?.next_action || "");
      // 最弱维度
      const sorted = [...(analysis?.ability_scores || [])].sort((a, b) => a.score - b.score);
      if (sorted[0]) setWeakestDim(sorted[0].dimension);

      // 累计数据
      setTotalQuizzes(count || 0);
      setTotalGain(gain);

      // 连续天数
      let s = 0;
      const today = new Date();
      const daySet = new Set<string>();
      dates.forEach((d) => daySet.add(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`));
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const k = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        if (daySet.has(k)) s++;
        else if (i > 0) break;
      }
      setStreakDays(s);

      // 合并测验 + 反思时间线
      const timeline: any[] = [];
      if (quizData?.length) {
        quizData.forEach((r) => timeline.push({
          dbKey: `quiz_${r.id}`,
          table: "quiz_results",
          dbId: r.id,
          date: new Date(r.created_at).toISOString().slice(0, 10).replace(/-/g, "."),
          type: "quiz",
          done: `完成测验：${r.resource_name}`,
          evidence: `${r.score}/${r.total} 题正确`,
          feedback: r.score >= 4 ? "掌握程度较高" : r.score >= 2 ? "有一定理解" : "建议重新学习",
          change: Object.entries(r.dimension_scores as Record<string, number>).map(([d, v]) => `${d} +${v}`).join(" · "),
          changeColor: r.score >= 4 ? "text-emerald-600 bg-emerald-50" : r.score >= 2 ? "text-blue-600 bg-blue-50" : "text-amber-600 bg-amber-50",
          ts: new Date(r.created_at).getTime(),
        }));
      }
      if (reflectionData?.length) {
        reflectionData.forEach((r) => timeline.push({
          dbKey: `ref_${r.id}`,
          table: "reflections",
          dbId: r.id,
          date: new Date(r.created_at).toISOString().slice(0, 10).replace(/-/g, "."),
          type: "reflection",
          done: "提交成长总结",
          evidence: r.note?.slice(0, 80) + (r.note?.length > 80 ? "..." : ""),
          feedback: r.summary || "记录了今日学习心得",
          change: "",
          changeColor: "text-indigo-600 bg-indigo-50",
          ts: new Date(r.created_at).getTime(),
        }));
      }
      // 按时间倒排
      timeline.sort((a, b) => b.ts - a.ts);
      setRecords(timeline.slice(0, 15));

      setLoading(false);
    });
  }, []);

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#f8faff" }}>
      <div className="flex-1 overflow-auto pb-20">
        <div className="px-6 pt-8 pb-2">
          <div className="flex items-center mb-3">
            <button onClick={() => router.back()} className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="text-sm">返回</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">成长记录</h1>
          <p className="text-gray-400 text-base mt-1.5 leading-relaxed">AI 帮你记录每一次能力提升</p>
        </div>

        {loading ? (
          <div className="px-6 py-20 flex items-center justify-center"><div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            {/* 概览 */}
            <div className="px-6 mb-4">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center"><div className="text-2xl font-bold text-blue-500">{totalQuizzes}</div><div className="text-[11px] text-gray-400 mt-1">累计测验次数</div></div>
                  <div className="text-center"><div className="text-2xl font-bold text-emerald-500">{streakDays}</div><div className="text-[11px] text-gray-400 mt-1">连续成长天数</div></div>
                  <div className="text-center"><div className="text-2xl font-bold text-indigo-500">{totalGain}</div><div className="text-[11px] text-gray-400 mt-1">今日完成测验</div></div>
                </div>
              </div>
            </div>

            {/* 能力成长 */}
            {abilities.length > 0 && (
              <div className="px-6 mb-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">能力成长</h2>
                <p className="text-xs text-gray-300 mb-3">AI 根据你的自评 + 目标岗位要求，对每个维度的当前水平评估（0-100）</p>
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
                  {abilities.map((a) => (
                    <div key={a.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700">{a.name}</span>
                        <span className="text-sm font-semibold text-gray-900">{a.value}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${dimColor(a.value)} rounded-full transition-all`} style={{ width: `${a.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 成长轨迹 */}
            {records.length > 0 && (
              <div className="px-6 mb-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">成长轨迹</h2>
                <div className="relative">
                  {records.map((r, i) => (
                    <div key={i} className="flex items-start gap-3.5 pb-0">
                      <div className="flex flex-col items-center flex-shrink-0 pt-2">
                        <div className={`w-3 h-3 rounded-full ring-4 flex-shrink-0 ${r.type === "reflection" ? "bg-indigo-400 ring-indigo-100" : "bg-blue-500 ring-blue-100"}`} />
                        {i < records.length - 1 && <div className={`w-0.5 flex-1 min-h-[40px] mt-1 ${r.type === "reflection" ? "bg-indigo-200" : "bg-blue-200"}`} />}
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] text-gray-300 font-medium">{r.date}{r.type === "reflection" ? " · 反思" : " · 测验"}</span>
                            <div className="relative">
                              <button onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === r.dbKey ? null : r.dbKey); }}
                                className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-50 hover:text-gray-500 transition-colors">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><circle cx="3" cy="7" r="1.5" /><circle cx="7" cy="7" r="1.5" /><circle cx="11" cy="7" r="1.5" /></svg>
                              </button>
                              {openMenu === r.dbKey && (
                                <div className="absolute right-0 top-7 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 min-w-[100px]">
                                  <button onClick={() => handleDelete(r)}
                                    className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors">删除</button>
                                </div>
                              )}
                            </div>
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">{r.done}</h4>
                          <div className="flex items-center gap-1.5 mb-2.5">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="1" width="9" height="10" rx="1.5" stroke="#9ca3af" strokeWidth="1" /><line x1="4.5" y1="5" x2="7.5" y2="5" stroke="#9ca3af" strokeWidth="0.8" strokeLinecap="round" /></svg>
                            <span className="text-[11px] text-gray-400">{r.evidence}</span>
                          </div>
                          <div className={`rounded-xl px-3 py-2.5 mb-2.5 ${r.type === "reflection" ? "bg-indigo-50" : "bg-gray-50"}`}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4" stroke="#6366f1" strokeWidth="1" /><circle cx="6" cy="6" r="1.5" fill="#6366f1" /></svg>
                              <span className="text-[10px] font-medium text-indigo-500">{r.type === "reflection" ? "AI 总结" : "AI 反馈"}</span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">{r.feedback}</p>
                          </div>
                          {r.change && (
                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-xl ${r.changeColor}`}>
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 7L5 3L7 5L10 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M7 2H10V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              {r.change}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI 评价 */}
            <div className="px-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">AI 对你的评价</h2>
              <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm shadow-indigo-50 p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#6366f1" strokeWidth="1.5" fill="none" /><circle cx="10" cy="10" r="3" fill="#6366f1" /><line x1="10" y1="3" x2="10" y2="7" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1">
                    {totalQuizzes === 0
                      ? "你还没有完成任何测验，去学习中心开始你的第一次成长吧。"
                      : weakestDim
                      ? <>你已完成 <span className="font-semibold text-gray-900">{totalQuizzes}</span> 次测验，当前最需要提升的是 <span className="font-semibold text-gray-900">{weakestDim}</span>，建议优先投入时间。</>
                      : "继续保持学习节奏，你的能力正在稳步提升。"}
                  </p>
                </div>
                {nextAction && (
                  <div className="bg-indigo-50 rounded-2xl px-4 py-3 flex items-center gap-2.5">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0"><circle cx="8" cy="8" r="6" stroke="#6366f1" strokeWidth="1.2" /><path d="M8 4V8L10.5 9.5" stroke="#6366f1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span className="text-sm font-medium text-indigo-700">{nextAction}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="h-4" />
          </>
        )}
      </div>

      <nav className="bg-white border-t border-gray-100 px-2 pt-2 pb-5 flex items-center justify-around">
        {navItems.map((item) => (
          <button key={item.label} onClick={() => router.push(item.route)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${item.active ? "text-blue-500" : "text-gray-300 hover:text-gray-400"}`}>
            <NavIcon name={item.icon} active={item.active} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
