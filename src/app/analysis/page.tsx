"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getLatestAnalysis, type AIAnalysis } from "@/lib/supabase/service";

const defaultRoadmap = [
  { stage: "基础能力", duration: "1-2个月", goal: "掌握核心基础", active: true },
  { stage: "核心技能", duration: "2-3个月", goal: "提升专业能力", active: false },
  { stage: "项目实践", duration: "3-4个月", goal: "积累作品经验", active: false },
  { stage: "求职准备", duration: "4-5个月", goal: "准备面试材料", active: false },
];

export default function AnalysisPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true); setError(false);
    // 1. 先查是否已有分析
    const existing = await getLatestAnalysis();
    if (existing) { setAnalysis(existing); setLoading(false); return; }
    // 2. 无缓存 → 调 API 生成
    try {
      await fetch("/api/analyze", { method: "POST" });
      const result = await getLatestAnalysis();
      if (result) { setAnalysis(result); setLoading(false); return; }
    } catch {}
    setError(true); setLoading(false);
  };

  useEffect(() => { fetchAnalysis(); }, []);

  const strengths = analysis?.user_strengths || [];
  const gaps = analysis?.skill_gaps || [];
  const abilityScores = analysis?.ability_scores || [];
  const roadmap = analysis?.roadmap?.length
    ? analysis.roadmap.map((r, i) => ({ ...r, active: i === 0 }))
    : defaultRoadmap;
  const nextAction = analysis?.next_action || "";

  return (
    <main
      className="min-h-screen flex flex-col px-6 py-6"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)" }}
    >
      <div className="flex items-center mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm">返回</span>
        </button>
      </div>

      <div className="mb-5">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI 分析报告</h1>
        <p className="text-gray-400 text-base mt-1.5 leading-relaxed">基于你提供的真实背景，AI 评估你的能力现状</p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-400">AI 正在分析你的目标...</span>
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-3">⏳</div>
            <p className="text-sm text-gray-500 mb-4">AI 分析超时，请重试</p>
            <button onClick={fetchAnalysis} className="px-6 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-2xl">重新分析</button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-4 overflow-auto pb-24">

            {/* Ability Scores */}
            {abilityScores.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">能力维度评估</h2>
                <div className="space-y-4">
                  {abilityScores.map((a, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{a.dimension}</span>
                        <span className={`text-sm font-bold ${a.score >= 60 ? "text-emerald-500" : a.score >= 30 ? "text-amber-500" : "text-red-500"}`}>
                          {a.score}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                        <div
                          className={`h-full rounded-full transition-all ${
                            a.score >= 60 ? "bg-emerald-500" : a.score >= 30 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${a.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {strengths.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">当前优势</h2>
                <div className="flex flex-wrap gap-2">
                  {strengths.map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl border border-emerald-100">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Gaps */}
            {gaps.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">能力缺口</h2>
                <div className="flex flex-wrap gap-2">
                  {gaps.map((g, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Roadmap */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">为你生成的成长路线</h2>
              <div className="relative">
                {roadmap.map((phase: any, i: number) => (
                  <div key={i} className="flex items-start gap-4 pb-5 last:pb-0 relative">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${phase.active ? "bg-blue-500 border-blue-500" : "bg-white border-gray-200"}`} />
                      {i < roadmap.length - 1 && (
                        <div className={`w-0.5 h-full min-h-[28px] mt-1 ${phase.active ? "bg-blue-500" : "bg-gray-200"}`} />
                      )}
                    </div>
                    <div className="flex-1 -mt-0.5">
                      <div className="flex items-center gap-2.5 mb-0.5">
                        <h3 className={`text-base font-semibold ${phase.active ? "text-blue-500" : "text-gray-400"}`}>
                          {phase.stage}
                        </h3>
                        <span className="text-xs text-gray-300 bg-gray-50 px-2 py-0.5 rounded-lg">{phase.duration}</span>
                      </div>
                      <p className="text-xs text-gray-400">{phase.goal}{phase.reason ? ` — ${phase.reason}` : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Action */}
            {nextAction && (
              <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm shadow-indigo-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="7" stroke="#6366f1" strokeWidth="1.5" fill="none" />
                      <path d="M10 5V10L13 12" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-indigo-700 mb-1">下一步建议</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{nextAction}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fixed Bottom CTA */}
          <div className="fixed bottom-0 left-0 right-0 px-6 pt-3 pb-8 safe-bottom bg-gradient-to-t from-white via-white to-transparent">
            <div className="max-w-lg mx-auto">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-lg rounded-2xl transition-all shadow-lg shadow-blue-200"
              >
                进入首页
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
