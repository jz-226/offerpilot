"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getLatestAnalysis, getLatestGoal, saveQuizResult, canRetakeQuiz, updateAbilityScore, getCurrentStage } from "@/lib/supabase/service";
import { getUserId } from "@/lib/user";
import { getMilestone, getNextMilestone, getMilestoneGap } from "@/lib/milestone";

function genResources(targetRole: string, weakDims: string[], stageName: string) {
  const role = targetRole || "互联网岗位";
  const dim1 = weakDims[0] || "核心技能";
  const dim2 = weakDims[1] || "基础能力";
  if (stageName === "基础夯实" || !stageName) {
    return [
      { title: `${role} 入门教程`, source: "Bilibili", desc: `${dim1}方向零基础入门视频，快速建立认知。`, reason: `入门「${dim1}」`, url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(role + " 零基础入门教程")}`, typeColor: "bg-red-50 text-red-500", type: "视频学习" },
      { title: `${dim1} 基础概念`, source: "官方文档", desc: `系统学习${dim1}基础知识，打好地基。`, reason: `打好「${dim1}」基础`, url: `https://www.zhihu.com/search?type=content&q=${encodeURIComponent(dim1 + " 基础教程 入门")}`, typeColor: "bg-blue-50 text-blue-500", type: "官方文档" },
      { title: `${dim2} 入门练习`, source: "Gitee", desc: `通过简单练习熟悉${dim2}基本操作。`, reason: `练习「${dim2}」`, url: `https://search.gitee.com/?type=repository&q=${encodeURIComponent(dim2 + " 入门练习")}&type=repositories`, typeColor: "bg-emerald-50 text-emerald-600", type: "实践项目" },
    ];
  }
  if (stageName === "技能提升" || stageName === "核心技能") {
    return [
      { title: `${role} 进阶提升`, source: "Bilibili", desc: `${dim1}方向进阶教程，深入理解原理。`, reason: `进阶「${dim1}」`, url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(role + " 进阶教程")}`, typeColor: "bg-red-50 text-red-500", type: "视频学习" },
      { title: `${dim1} 深入学习`, source: "知乎", desc: `深入学习${dim1}核心原理与最佳实践。`, reason: `掌握「${dim1}」核心`, url: `https://www.zhihu.com/search?type=content&q=${encodeURIComponent(dim1 + " 学习")}`, typeColor: "bg-blue-50 text-blue-500", type: "技术文章" },
      { title: `${dim2} 综合练习`, source: "Gitee", desc: `通过中等难度项目提升${dim2}实战能力。`, reason: `强化「${dim2}」`, url: `https://search.gitee.com/?type=repository&q=${encodeURIComponent(dim2 + " 项目实战")}&type=repositories`, typeColor: "bg-emerald-50 text-emerald-600", type: "实践项目" },
    ];
  }
  if (stageName === "项目实战" || stageName === "专项突破") {
    return [
      { title: `${role} 项目实战`, source: "Bilibili", desc: `跟着做完整的${dim1}实战项目，积累作品。`, reason: `实战「${dim1}」`, url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(role + " 项目实战教程")}`, typeColor: "bg-red-50 text-red-500", type: "视频学习" },
      { title: `${dim1} 面试准备`, source: "牛客网/LeetCode", desc: `针对${dim1}方向的高频面试题和笔试准备。`, reason: `备战「${dim1}」面试`, url: `https://www.zhihu.com/search?type=content&q=${encodeURIComponent(dim1 + " 面试题")}`, typeColor: "bg-blue-50 text-blue-500", type: "面试题库" },
      { title: `${dim2} 作品集项目`, source: "Gitee", desc: `可放入作品集的${dim2}项目，展示你的能力。`, reason: `打造「${dim2}」作品`, url: `https://search.gitee.com/?type=repository&q=${encodeURIComponent(dim2 + " 作品集 展示")}&type=repositories`, typeColor: "bg-emerald-50 text-emerald-600", type: "作品项目" },
    ];
  }
  return [
    { title: `${role} 面试突击`, source: "Bilibili", desc: `${dim1}方向高频面试题精讲，查漏补缺。`, reason: `面试「${dim1}」`, url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(role + " 面试突击")}`, typeColor: "bg-red-50 text-red-500", type: "视频学习" },
    { title: `${dim1} 简历优化`, source: "知乎/小红书", desc: `针对${role}岗位的简历优化和面试话术。`, reason: `准备「${dim1}」面试`, url: `https://www.zhihu.com/search?type=content&q=${encodeURIComponent(role + " 简历 面试经验")}`, typeColor: "bg-blue-50 text-blue-500", type: "求职攻略" },
    { title: `${dim2} 真题模拟`, source: "牛客网", desc: `${role}真实面经和笔试真题练习。`, reason: `模拟「${dim2}」`, url: `https://www.zhihu.com/search?type=content&q=${encodeURIComponent(role + " 面经 真题")}`, typeColor: "bg-emerald-50 text-emerald-600", type: "真题练习" },
  ];
}

const navItems = [
  { label: "首页", icon: "home", route: "/dashboard", active: false },
  { label: "路线", icon: "route", route: "/roadmap", active: false },
  { label: "学习", icon: "learn", route: "/learning", active: true },
  { label: "成长", icon: "growth", route: "/growth", active: false },
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

type Question = { id: number; type: "choice" | "judge"; difficulty: string; question: string; options?: string[]; answer: string | boolean; dimension: string };

export default function LearningPage() {
  const router = useRouter();
  const [targetRole, setTargetRole] = useState("");
  const [weakDims, setWeakDims] = useState<string[]>([]);
  const [dimensions, setDimensions] = useState<string[]>([]);
  const [stageName, setStageName] = useState("");
  const [hasData, setHasData] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string | boolean>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; total: number; correct: number; msg: string; dimGains: Record<string, number>; totalGain: number } | null>(null);
  const [quizLocked, setQuizLocked] = useState(false);
  const [lockReason, setLockReason] = useState("");
  const [currentResource, setCurrentResource] = useState("");
  const [primaryAttempts, setPrimaryAttempts] = useState(0);
  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [explainLoading, setExplainLoading] = useState(false);
  const [scoreSnapshot, setScoreSnapshot] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.all([getLatestAnalysis(), getLatestGoal()]).then(([a, g]) => {
      if (g) setTargetRole(g.target_role);
      if (a?.ability_scores?.length) {
        setHasData(true);
        setDimensions(a.ability_scores.map((s) => s.dimension));
        const sorted = [...a.ability_scores].sort((a, b) => a.score - b.score);
        setWeakDims(sorted.slice(0, 2).map((s) => s.dimension));
        const r = Math.round(a.ability_scores.reduce((s, x) => s + x.score, 0) / a.ability_scores.length);
        setStageName(getCurrentStage(r, a.roadmap?.length || 4).name);
      }
    });
  }, []);

  const resources = genResources(targetRole, weakDims, stageName);
  const primaryResource = resources[0];
  const primaryDim = weakDims[0] || "核心能力";

  // AI 分析错题
  const explainWrong = async () => {
    setExplainLoading(true);
    const newExplanations: Record<number, string> = {};
    for (const q of quizQuestions) {
      const sel = selectedAnswers[q.id];
      const isCorrect = q.type === "judge" ? sel === q.answer : String(sel) === String(q.answer);
      if (isCorrect) continue;
      try {
        const res = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            note: `题目：${q.question}\n我的答案：${q.type === "judge" ? (sel === true ? "正确" : "错误") : q.options?.find((o) => o.startsWith(String(sel))) || String(sel)}\n正确答案：${q.type === "judge" ? (q.answer ? "正确" : "错误") : q.options?.find((o) => o.startsWith(String(q.answer))) || String(q.answer)}\n请用一句话解释为什么正确答案是对的。`,
            targetRole,
          }),
        });
        const data = await res.json();
        newExplanations[q.id] = data.summary || "暂无分析";
      } catch {
        newExplanations[q.id] = "分析失败";
      }
    }
    setExplanations((prev) => ({ ...prev, ...newExplanations }));
    setExplainLoading(false);
  };

  // 查今日测验次数
  useEffect(() => {
    if (!primaryResource?.title) return;
    canRetakeQuiz(primaryResource.title).then(({ attempts }) => setPrimaryAttempts(attempts));
  }, [primaryResource?.title]);

  const startQuiz = async (resourceName: string) => {
    const { attempts } = await canRetakeQuiz(resourceName);
    if (attempts >= 3) setLockReason(`已做 ${attempts} 次，建议换个资源学学`);
    // 记录测前分数
    const a = await getLatestAnalysis();
    const snap: Record<string, number> = {};
    (a?.ability_scores || []).forEach((s) => { snap[s.dimension] = s.score; });
    setScoreSnapshot(snap);

    setQuizLocked(false); setCurrentResource(resourceName); setQuizOpen(true); setQuizLoading(true); setQuizResult(null); setSelectedAnswers({});
    try {
      const res = await fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resourceName, resourceType: "文档", targetRole, dimensions }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuizQuestions(data.questions);
    } catch (e: any) { alert("生成题目失败: " + (e?.message || "请稍后重试")); setQuizOpen(false); }
    finally { setQuizLoading(false); }
  };

  const submitQuiz = async () => {
    const correct = quizQuestions.filter((q) => { const sel = selectedAnswers[q.id]; return q.type === "judge" ? sel === q.answer : String(sel) === String(q.answer); }).length;
    const total = quizQuestions.length;
    const pct = Math.round((correct / total) * 100);
    // 根据正确率 + 第几次做来算分
    let base: number, msg: string;
    if (pct >= 80) { base = 5; msg = "优秀！掌握了！"; }
    else if (pct >= 60) { base = 3; msg = "基本掌握，继续努力！"; }
    else if (pct > 0) { base = 1; msg = "还需多练，建议重做。"; }
    else { base = 0; msg = "没答对，重新学习再来。"; }
    const { attempts } = await canRetakeQuiz(currentResource);
    const att = attempts || 1;
    const points = Math.max(0, base - (att - 1));
    const dimScores: Record<string, number> = {};
    quizQuestions.forEach((q) => { const sel = selectedAnswers[q.id]; const isCorrect = q.type === "judge" ? sel === q.answer : String(sel) === String(q.answer); if (isCorrect && q.dimension) dimScores[q.dimension] = (dimScores[q.dimension] || 0) + 1; });
    const dimGains: Record<string, number> = {}; let totalGain = 0;
    Object.entries(dimScores).forEach(([dim, count]) => { const gain = count * points; dimGains[dim] = gain; totalGain += gain; });
    setQuizResult({ score: pct, total, correct, msg, dimGains, totalGain });
    await saveQuizResult({ user_id: getUserId(), resource_name: currentResource, score: correct, total, dimension_scores: dimScores });
    for (const [dim, pts] of Object.entries(dimScores)) await updateAbilityScore(dim, pts * points);
    // 刷新剩余次数
    canRetakeQuiz(primaryResource.title).then(({ attempts }) => setPrimaryAttempts(attempts));
  };

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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">学习中心</h1>
          <p className="text-gray-400 text-base mt-1.5 leading-relaxed">{targetRole ? `「${targetRole}」· ${stageName || "基础阶段"} · AI 推荐学习资源` : "AI 为你的目标 Offer 推荐学习资源"}</p>
        </div>

        {!hasData ? (
          <div className="px-6 mb-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#3b82f6" strokeWidth="1.5" /><path d="M10 6V10L13 12" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">暂无学习推荐</h3>
              <p className="text-sm text-gray-400 mb-4">请先创建目标并完成 AI 分析，AI 将为你推荐专属学习资源</p>
              <button onClick={() => router.push("/goal")} className="px-6 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-2xl">去创建目标</button>
            </div>
          </div>
        ) : (
          <>
            <div className="px-6 mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">今日推荐</h2>
              <div className="bg-white rounded-3xl border border-blue-100 shadow-sm shadow-blue-50 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{primaryResource.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">根据你的目标岗位{targetRole ? `「${targetRole}」` : ""}，当前<span className="font-semibold text-gray-900">{primaryDim}</span>需要进一步提升。</p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-xs text-gray-500">方向：</span><span className="text-xs font-semibold text-gray-900">{primaryDim}</span></div>
                    <div className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#9ca3af" strokeWidth="1.2" /><line x1="7" y1="4.5" x2="7" y2="7" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" /><line x1="7" y1="7" x2="9" y2="7" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" /></svg><span className="text-xs text-gray-500">预计：</span><span className="text-xs font-semibold text-gray-900">45 分钟</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startQuiz(primaryResource.title)} className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-sm rounded-2xl transition-all">开始测验</button>
                    <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-lg whitespace-nowrap">{primaryAttempts > 0 ? `今日已测 ${primaryAttempts} 次` : "首次测验满分 +5"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">推荐资源</h2>
              <div className="space-y-2.5">
                {resources.map((r, i) => (
                  <button key={i} onClick={() => { if (confirm(`即将跳转到 ${r.source} 查看「${r.title}」`)) window.open(r.url, "_blank"); }} className="block w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left hover:border-blue-200 active:scale-[0.99] transition-all cursor-pointer">
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${r.typeColor}`}>
                        {r.type === "视频学习" ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" /><polygon points="8,6 8,14 14,10" fill="currentColor" /></svg>
                          : r.type === "官方文档" || r.type === "技术文章" || r.type === "面试题库" || r.type === "求职攻略" || r.type === "真题练习" ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="2" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" /><line x1="7" y1="6" x2="13" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /><line x1="7" y1="9" x2="11" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                          : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 13L6 6L9 9L12 4L15 7L17 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="14" cy="4" r="1.5" fill="currentColor" /></svg>}
                      </div>
                      <div className="flex-1 min-w-0"><h4 className="text-sm font-semibold text-gray-900 leading-tight">{r.title}</h4><span className={`inline-block text-[11px] font-medium px-1.5 py-0.5 rounded-md mt-1 ${r.typeColor}`}>{r.type}</span></div>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0"><path d="M6 3L11 8L6 13" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-2">{r.desc}</p>
                    <div className="flex items-center justify-between"><span className="text-[11px] text-gray-300">来源：{r.source}</span><span className="text-[11px] text-blue-400">{r.reason}</span></div>
                  </button>
                ))}
              </div>
            </div>
            <div className="h-4" />
          </>
        )}
      </div>

      {quizOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl safe-bottom" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">{quizResult ? "测验结果" : quizLoading ? "生成题目中..." : `测验：${currentResource}`}</h3>
              <button onClick={() => setQuizOpen(false)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3L11 11M3 11L11 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
            </div>
            <div className="flex-1 overflow-auto px-5 py-4">
              {quizLoading ? (
                <div className="flex flex-col items-center gap-3 py-10"><div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /><span className="text-sm text-gray-400">AI 正在生成题目...</span></div>
              ) : quizResult ? (
                <div className="py-2">
                  {/* 里程成就 */}
                  {Object.entries(quizResult.dimGains).length > 0 && (() => {
                    const changes: { dim: string; before: number; after: number; oldMs: ReturnType<typeof getMilestone>; newMs: ReturnType<typeof getMilestone> }[] = [];
                    Object.entries(quizResult.dimGains).forEach(([dim, gain]) => {
                      const before = scoreSnapshot[dim] || 0;
                      const after = before + gain;
                      changes.push({ dim, before, after, oldMs: getMilestone(before), newMs: getMilestone(after) });
                    });
                    const upgrades = changes.filter((c) => c.newMs.level > c.oldMs.level);
                    return (
                      <>
                        {upgrades.length > 0 && (
                          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-4 mb-3 text-center">
                            <div className="text-2xl mb-1">🎉</div>
                            {upgrades.map((c) => (
                              <p key={c.dim} className="text-sm font-semibold text-amber-800">
                                {c.dim} {c.oldMs.icon} → {c.newMs.icon}「{c.newMs.name}」解锁！
                              </p>
                            ))}
                            <p className="text-xs text-amber-600 mt-1">你刚获得了新认证！</p>
                          </div>
                        )}
                        {upgrades.length === 0 && quizResult.score >= 80 && (
                          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-3 mb-3 text-center">
                            <div className="text-lg mb-1">👏</div>
                            <p className="text-xs text-emerald-700 font-medium">全部正确！这些能力又扎实了一步</p>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  <div className="text-center mb-3"><div className={`text-4xl font-bold mb-1 ${quizResult.score >= 80 ? "text-emerald-500" : quizResult.score >= 40 ? "text-amber-500" : "text-red-500"}`}>{quizResult.score}%</div><p className="text-sm text-gray-600">{quizResult.msg}</p><p className="text-xs text-gray-400 mt-0.5">正确 {quizResult.correct}/{quizResult.total} 题</p></div>

                  {quizResult.totalGain > 0 && (
                    <div className="bg-indigo-50 rounded-2xl p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><polyline points="3,10 7,6 9,8 14,3" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg><span className="text-xs font-semibold text-indigo-700">能力成长 +{quizResult.totalGain}</span></div>
                      {Object.entries(quizResult.dimGains).map(([dim, gain]) => {
                        const before = scoreSnapshot[dim] || 0;
                        const after = before + gain;
                        const ms = getMilestone(after);
                        const next = getNextMilestone(after);
                        return (
                          <div key={dim} className="bg-white/60 rounded-lg px-2.5 py-1.5 mb-1 last:mb-0">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-gray-700">{dim} {ms.icon}</span>
                              <span className="text-[11px] font-bold text-indigo-600">{before} → {after}</span>
                            </div>
                            {next && <p className="text-[9px] text-gray-400 mt-0.5">距「{next.icon} {next.name}」还差 {next.min - after} 分</p>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 每道题的正误 */}
                  <div className="space-y-2.5 mb-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">答题详情</p>
                      {quizQuestions.some((q) => { const s = selectedAnswers[q.id]; const c = q.type === "judge" ? s === q.answer : String(s) === String(q.answer); return !c && !explanations[q.id]; }) && (
                        <button onClick={explainWrong} disabled={explainLoading} className="text-[10px] text-indigo-500 font-medium hover:text-indigo-600 disabled:text-gray-300">
                          {explainLoading ? "分析中..." : "AI 分析错题"}
                        </button>
                      )}
                    </div>
                    {quizQuestions.map((q) => {
                      const sel = selectedAnswers[q.id];
                      const isCorrect = q.type === "judge" ? sel === q.answer : String(sel) === String(q.answer);
                      const userOpt = q.type === "choice" && q.options ? q.options.find((o) => o.startsWith(String(sel))) : null;
                      const correctOpt = q.type === "choice" && q.options ? q.options.find((o) => o.startsWith(String(q.answer))) : null;
                      return (
                        <div key={q.id} className={`rounded-xl p-3 border ${isCorrect ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
                          <div className="flex items-start gap-2">
                            <span className={`text-sm flex-shrink-0 mt-0.5 ${isCorrect ? "text-emerald-500" : "text-red-500"}`}>{isCorrect ? "✓" : "✗"}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-800 leading-relaxed mb-1.5">{q.question}</p>
                              <div className="text-[11px] space-y-0.5">
                                <p className={isCorrect ? "text-emerald-600" : "text-red-600"}>
                                  你的答案：{q.type === "judge" ? (sel === true ? "正确" : sel === false ? "错误" : "未作答") : (userOpt || String(sel || "未作答"))}
                                </p>
                                {!isCorrect && (
                                  <p className="text-emerald-600 font-medium">
                                    正确答案：{q.type === "judge" ? (q.answer === true ? "正确" : "错误") : (correctOpt || String(q.answer))}
                                  </p>
                                )}
                                {explanations[q.id] && (
                                  <p className="text-[10px] text-indigo-500 mt-1 pt-1 border-t border-current/10">{explanations[q.id]}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2"><button onClick={() => { setQuizOpen(false); setQuizResult(null); }} className="flex-1 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-2xl">完成</button><button onClick={() => { setQuizOpen(false); setQuizResult(null); router.push("/growth"); }} className="flex-1 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-2xl">查看成长</button></div>
                </div>
              ) : (
                <div className="space-y-5">
                  {quizQuestions.map((q) => (
                    <div key={q.id}>
                      <div className="flex items-center gap-2 mb-2"><span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${q.difficulty === "easy" ? "bg-emerald-50 text-emerald-600" : q.difficulty === "medium" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>{q.difficulty === "easy" ? "简单" : q.difficulty === "medium" ? "中等" : "较难"}</span><span className="text-[10px] text-gray-300">#{q.id}</span></div>
                      <p className="text-sm text-gray-800 font-medium mb-2">{q.question}</p>
                      {q.type === "choice" && q.options ? (
                        <div className="space-y-1.5">{q.options.map((opt) => { const sel = String(selectedAnswers[q.id] || "") === opt.slice(0, 1); return (<button key={opt} onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: opt.slice(0, 1) })} className={`w-full text-left px-3 py-2 text-xs rounded-xl border transition-all ${sel ? "bg-blue-50 border-blue-200 text-blue-700 font-medium" : "bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-200"}`}>{opt}</button>); })}</div>
                      ) : (
                        <div className="flex gap-3">{[true, false].map((v) => (<button key={String(v)} onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: v })} className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all ${selectedAnswers[q.id] === v ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-200"}`}>{v ? "✓ 正确" : "✗ 错误"}</button>))}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {!quizLoading && !quizResult && (
              <div className="px-5 py-3 border-t border-gray-100"><button onClick={submitQuiz} disabled={Object.keys(selectedAnswers).length < quizQuestions.length} className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-sm rounded-2xl transition-all">提交测验 ({Object.keys(selectedAnswers).length}/{quizQuestions.length})</button></div>
            )}
          </div>
        </div>
      )}

      {quizLocked && (<div className="fixed bottom-24 left-0 right-0 flex justify-center z-40"><div className="bg-gray-900 text-white text-xs px-5 py-2.5 rounded-full shadow-lg">{lockReason}</div></div>)}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 pt-2 pb-5 safe-bottom flex items-center justify-around z-40">
        {navItems.map((item) => (<button key={item.label} onClick={() => { window.location.href = item.route; }} className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${item.active ? "text-blue-500" : "text-gray-300 hover:text-gray-400"}`}><NavIcon name={item.icon} active={item.active} /><span className="text-[10px] font-medium">{item.label}</span></button>))}
      </nav>
    </main>
  );
}
