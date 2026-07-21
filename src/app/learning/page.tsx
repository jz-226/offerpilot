"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getLatestAnalysis, getLatestGoal, saveQuizResult, canRetakeQuiz, updateAbilityScore, getCurrentStage } from "@/lib/supabase/service";

// 根据目标岗位 + 最弱维度动态生成推荐资源
function genResources(targetRole: string, weakDims: string[]) {
  const role = targetRole || "互联网岗位";
  const dim1 = weakDims[0] || "核心技能";
  const dim2 = weakDims[1] || "基础能力";

  return [
    {
      title: `${role} 入门教程`,
      source: "Bilibili",
      desc: `${dim1}方向的系统学习视频，从零到一快速掌握。`,
      reason: `提升「${dim1}」`,
      url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(role + " 入门教程")}`,
      typeColor: "bg-red-50 text-red-500",
      type: "视频学习",
    },
    {
      title: `${dim1} 系统学习`,
      source: "官方文档",
      desc: `系统学习${dim1}相关知识，建立完整理论框架。`,
      reason: `补强「${dim1}」`,
      url: `https://www.google.com/search?q=${encodeURIComponent(dim1 + " tutorial 官方文档")}`,
      typeColor: "bg-blue-50 text-blue-500",
      type: "官方文档",
    },
    {
      title: `${dim2} 实战项目`,
      source: "GitHub",
      desc: `通过真实项目练习${dim2}，积累可展示的作品。`,
      reason: `练习「${dim2}」`,
      url: `https://github.com/search?q=${encodeURIComponent(dim2 + " 项目")}&type=repositories`,
      typeColor: "bg-emerald-50 text-emerald-600",
      type: "实践项目",
    },
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

  // quiz state
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string | boolean>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; total: number; correct: number; msg: string; dimGains: Record<string, number>; totalGain: number } | null>(null);
  const [quizLocked, setQuizLocked] = useState(false);
  const [lockReason, setLockReason] = useState("");
  const [currentResource, setCurrentResource] = useState("");

  useEffect(() => {
    Promise.all([getLatestAnalysis(), getLatestGoal()]).then(([a, g]) => {
      if (g) setTargetRole(g.target_role);
      if (a?.ability_scores) {
        setDimensions(a.ability_scores.map((s) => s.dimension));
        const sorted = [...a.ability_scores].sort((a, b) => a.score - b.score);
        setWeakDims(sorted.slice(0, 2).map((s) => s.dimension));
        const r = Math.round(a.ability_scores.reduce((s, x) => s + x.score, 0) / a.ability_scores.length);
        setStageName(getCurrentStage(r, a.roadmap?.length || 4).name);
      }
    });
  }, []);

  const resources = genResources(targetRole, weakDims);
  const primaryResource = resources[0];
  const primaryDim = weakDims[0] || "核心能力";

  // 开始测验
  const startQuiz = async (resourceName: string) => {
    const { allowed, attempts, reason } = await canRetakeQuiz(resourceName);
    if (!allowed) {
      setQuizLocked(true);
      setLockReason(reason || "已用完次数，请明天再试");
      setCurrentResource(resourceName);
      return;
    }
    if (attempts >= 2) setLockReason(`已用 ${attempts}/3 次机会，本次是最后一次`);
    setQuizLocked(false);
    setCurrentResource(resourceName);
    setQuizOpen(true);
    setQuizLoading(true);
    setQuizResult(null);
    setSelectedAnswers({});
    try {
      const res = await fetch("/api/quiz", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceName, resourceType: "文档", targetRole, dimensions }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuizQuestions(data.questions);
    } catch (e: any) {
      alert("生成题目失败: " + (e?.message || "请稍后重试"));
      setQuizOpen(false);
    } finally { setQuizLoading(false); }
  };

  // 提交
  const submitQuiz = async () => {
    const correct = quizQuestions.filter((q) => {
      const sel = selectedAnswers[q.id];
      return q.type === "judge" ? sel === q.answer : String(sel) === String(q.answer);
    }).length;
    const total = quizQuestions.length;
    const pct = Math.round((correct / total) * 100);
    let points: number, msg: string;
    if (pct === 100) { points = 5; msg = "全部正确！完全掌握了！"; }
    else if (pct >= 60) { points = 3; msg = "多数正确，基本掌握，继续努力！"; }
    else if (pct > 0) { points = 1; msg = "理解还不够，建议重新学习后重试。"; }
    else { points = 0; msg = "尚未掌握，建议认真重新学习。"; }

    // 计算每个维度的加分
    const dimScores: Record<string, number> = {};
    quizQuestions.forEach((q) => {
      const sel = selectedAnswers[q.id];
      const isCorrect = q.type === "judge" ? sel === q.answer : String(sel) === String(q.answer);
      if (isCorrect && q.dimension) dimScores[q.dimension] = (dimScores[q.dimension] || 0) + 1;
    });
    const dimGains: Record<string, number> = {};
    let totalGain = 0;
    Object.entries(dimScores).forEach(([dim, count]) => {
      const gain = count * points;
      dimGains[dim] = gain;
      totalGain += gain;
    });

    setQuizResult({ score: pct, total, correct, msg, dimGains, totalGain });

    await saveQuizResult({ user_id: "test-user-001", resource_name: currentResource, score: correct, total, dimension_scores: dimScores });
    for (const [dim, pts] of Object.entries(dimScores)) await updateAbilityScore(dim, pts * points);
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
          <p className="text-gray-400 text-base mt-1.5 leading-relaxed">
            {targetRole ? `「${targetRole}」· ${stageName || "基础阶段"} · AI 推荐学习资源` : "AI 为你的目标 Offer 推荐学习资源"}
          </p>
        </div>

        {/* Primary Recommendation */}
        <div className="px-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">今日推荐</h2>
          <div className="bg-white rounded-3xl border border-blue-100 shadow-sm shadow-blue-50 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{primaryResource.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                根据你的目标岗位{targetRole ? `「${targetRole}」` : ""}，当前<span className="font-semibold text-gray-900">{primaryDim}</span>需要进一步提升。
              </p>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-xs text-gray-500">方向：</span><span className="text-xs font-semibold text-gray-900">{primaryDim}</span></div>
                <div className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#9ca3af" strokeWidth="1.2" /><line x1="7" y1="4.5" x2="7" y2="7" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" /><line x1="7" y1="7" x2="9" y2="7" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" /></svg><span className="text-xs text-gray-500">预计：</span><span className="text-xs font-semibold text-gray-900">45 分钟</span></div>
              </div>
              <button onClick={() => startQuiz(primaryResource.title)}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-sm rounded-2xl transition-all">
                开始学习
              </button>
            </div>
          </div>
        </div>

        {/* Recommended Resources */}
        <div className="px-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">推荐资源</h2>
          <div className="space-y-2.5">
            {resources.map((r, i) => (
              <button key={i} onClick={() => { if (confirm(`即将跳转到 ${r.source} 查看「${r.title}」`)) window.open(r.url, "_blank"); }}
                className="block w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left hover:border-blue-200 active:scale-[0.99] transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${r.typeColor}`}>
                    {r.type === "视频学习" ? (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" /><polygon points="8,6 8,14 14,10" fill="currentColor" /></svg>
                    ) : r.type === "官方文档" ? (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="2" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" /><line x1="7" y1="6" x2="13" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /><line x1="7" y1="9" x2="11" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 13L6 6L9 9L12 4L15 7L17 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="14" cy="4" r="1.5" fill="currentColor" /></svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 leading-tight">{r.title}</h4>
                    <span className={`inline-block text-[11px] font-medium px-1.5 py-0.5 rounded-md mt-1 ${r.typeColor}`}>{r.type}</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0"><path d="M6 3L11 8L6 13" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-2">{r.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-300">来源：{r.source}</span>
                  <span className="text-[11px] text-blue-400">{r.reason}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="h-4" />
      </div>

      {/* Quiz Modal */}
      {quizOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">{quizResult ? "测验结果" : quizLoading ? "生成题目中..." : `测验：${currentResource}`}</h3>
              <button onClick={() => setQuizOpen(false)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3L11 11M3 11L11 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto px-5 py-4">
              {quizLoading ? (
                <div className="flex flex-col items-center gap-3 py-10"><div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /><span className="text-sm text-gray-400">AI 正在生成题目...</span></div>
              ) : quizResult ? (
                <div className="py-2">
                  <div className="text-center mb-4">
                    <div className={`text-5xl font-bold mb-2 ${quizResult.score >= 80 ? "text-emerald-500" : quizResult.score >= 40 ? "text-amber-500" : "text-red-500"}`}>{quizResult.score}%</div>
                    <p className="text-sm text-gray-600">{quizResult.msg}</p>
                    <p className="text-xs text-gray-400 mt-1">正确 {quizResult.correct}/{quizResult.total} 题</p>
                  </div>

                  {/* 能力增长 */}
                  {quizResult.totalGain > 0 && (
                    <div className="bg-indigo-50 rounded-2xl p-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><polyline points="3,10 7,6 9,8 14,3" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><polyline points="10,3 14,3 14,7" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span className="text-sm font-semibold text-indigo-700">能力成长 +{quizResult.totalGain}</span>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(quizResult.dimGains).map(([dim, gain]) => (
                          <div key={dim} className="flex items-center justify-between bg-white/60 rounded-xl px-3 py-2">
                            <span className="text-xs text-gray-700">{dim}</span>
                            <span className="text-xs font-bold text-indigo-600">+{gain}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => { setQuizOpen(false); setQuizResult(null); }} className="flex-1 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-2xl">完成</button>
                    <button onClick={() => { setQuizOpen(false); setQuizResult(null); router.push("/dashboard"); }} className="flex-1 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-2xl">查看成长</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {quizQuestions.map((q) => (
                    <div key={q.id}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${q.difficulty === "easy" ? "bg-emerald-50 text-emerald-600" : q.difficulty === "medium" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>{q.difficulty === "easy" ? "简单" : q.difficulty === "medium" ? "中等" : "较难"}</span>
                        <span className="text-[10px] text-gray-300">#{q.id}</span>
                      </div>
                      <p className="text-sm text-gray-800 font-medium mb-2">{q.question}</p>
                      {q.type === "choice" && q.options ? (
                        <div className="space-y-1.5">
                          {q.options.map((opt) => {
                            const sel = String(selectedAnswers[q.id] || "") === opt.slice(0, 1);
                            return (
                              <button key={opt} onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: opt.slice(0, 1) })}
                                className={`w-full text-left px-3 py-2 text-xs rounded-xl border transition-all ${sel ? "bg-blue-50 border-blue-200 text-blue-700 font-medium" : "bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-200"}`}>{opt}</button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          {[true, false].map((v) => (
                            <button key={String(v)} onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: v })}
                              className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all ${selectedAnswers[q.id] === v ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-200"}`}>{v ? "✓ 正确" : "✗ 错误"}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {!quizLoading && !quizResult && (
              <div className="px-5 py-3 border-t border-gray-100">
                <button onClick={submitQuiz} disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-sm rounded-2xl transition-all">提交测验 ({Object.keys(selectedAnswers).length}/{quizQuestions.length})</button>
              </div>
            )}
          </div>
        </div>
      )}

      {quizLocked && (
        <div className="fixed bottom-24 left-0 right-0 flex justify-center z-40">
          <div className="bg-gray-900 text-white text-xs px-5 py-2.5 rounded-full shadow-lg">{lockReason}</div>
        </div>
      )}

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
