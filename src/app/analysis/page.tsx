"use client";

import { useRouter } from "next/navigation";

const strengths = [
  "学习能力较强",
  "有一定项目经验",
  "对 AI 行业有兴趣",
];

const gaps = [
  "产品基础知识需要加强",
  "缺少真实项目经验",
  "AI 技术理解需要提升",
];

const phases = [
  { label: "基础能力", duration: "1-2个月", active: true },
  { label: "核心技能", duration: "2-3个月", active: false },
  { label: "项目实践", duration: "3-4个月", active: false },
  { label: "求职准备", duration: "4-5个月", active: false },
];

export default function AnalysisPage() {
  const router = useRouter();

  return (
    <main
      className="min-h-screen flex flex-col px-6 py-6"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)" }}
    >
      {/* Top: Back */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12 4L6 10L12 16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm">返回</span>
        </button>
      </div>

      {/* Title */}
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          AI 分析报告
        </h1>
        <p className="text-gray-400 text-base mt-1.5 leading-relaxed">
          基于你的目标岗位，AI 分析你的成长路径
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 space-y-4 overflow-auto pb-24">
        {/* Offer Readiness Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Offer Readiness
          </h2>

          {/* Ring */}
          <div className="flex items-center gap-5 mb-4">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                {/* Background circle */}
                <circle
                  cx="48" cy="48" r="40"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                  cx="48" cy="48" r="40"
                  fill="none"
                  stroke="url(#grad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.42)}`}
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-blue-500">42%</span>
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                当前准备度：中等
              </h3>
              <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                基于当前能力和目标岗位要求，AI 分析你的成长差距。
              </p>
            </div>
          </div>
        </div>

        {/* Strengths Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            核心优势
          </h2>
          <div className="flex flex-wrap gap-2">
            {strengths.map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl border border-emerald-100"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M3 7L6 10L11 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Gaps Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            主要差距
          </h2>
          <div className="flex flex-wrap gap-2">
            {gaps.map((g, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Roadmap Timeline Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            为你生成的成长路线
          </h2>
          <div className="relative">
            {phases.map((phase, i) => (
              <div key={i} className="flex items-start gap-4 pb-5 last:pb-0 relative">
                {/* Timeline line & dot */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${
                      phase.active
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white border-gray-200"
                    }`}
                  />
                  {i < phases.length - 1 && (
                    <div
                      className={`w-0.5 h-full min-h-[28px] mt-1 ${
                        phase.active ? "bg-blue-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 -mt-0.5">
                  <div className="flex items-center gap-2.5">
                    <h3
                      className={`text-base font-semibold ${
                        phase.active ? "text-blue-500" : "text-gray-400"
                      }`}
                    >
                      {phase.label}
                    </h3>
                    <span className="text-xs text-gray-300 bg-gray-50 px-2 py-0.5 rounded-lg">
                      {phase.duration}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pt-3 pb-8 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-lg rounded-2xl transition-all shadow-lg shadow-blue-200"
          >
            进入我的成长路线
          </button>
        </div>
      </div>
    </main>
  );
}
