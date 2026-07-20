"use client";

import { useRouter } from "next/navigation";

const cards = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="8" r="4" stroke="#3b82f6" strokeWidth="2" fill="#eff6ff"/>
        <rect x="8" y="15" width="12" height="8" rx="3" stroke="#3b82f6" strokeWidth="2" fill="#eff6ff"/>
        <line x1="11" y1="18" x2="17" y2="18" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="11" y1="21" x2="15" y2="21" stroke="#bfdbfe" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "AI 智能分析",
    desc: "洞察你的能力与岗位差距",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="#3b82f6" strokeWidth="2" fill="#eff6ff"/>
        <circle cx="14" cy="14" r="4" fill="#3b82f6"/>
        <line x1="14" y1="4" x2="14" y2="10" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: "每日唯一任务",
    desc: "聚焦最重要的一件事",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="5" width="20" height="14" rx="3" stroke="#3b82f6" strokeWidth="2" fill="#eff6ff"/>
        <line x1="8" y1="10" x2="20" y2="10" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="8" y1="13" x2="18" y2="13" stroke="#bfdbfe" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="8" y1="16" x2="16" y2="16" stroke="#bfdbfe" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "AI成长资源推荐",
    desc: "根据目标岗位推荐学习和实践资源",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="3" width="20" height="22" rx="3" stroke="#3b82f6" strokeWidth="2" fill="#eff6ff"/>
        <polyline points="8,14 12,18 20,10" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    title: "成长可视化",
    desc: "记录每一次进步，离目标更近",
  },
];

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <main
      className="h-screen flex flex-col px-6 py-8"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)" }}
    >
      {/* Top: Skip */}
      <div className="flex justify-end">
        <button
          onClick={() => router.push("/goal")}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          跳过
        </button>
      </div>

      {/* Hero */}
      <div className="mt-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          你的成长，由 AI 陪伴
        </h1>
        <p className="text-gray-400 text-base mt-2 leading-relaxed">
          智能分析你的能力，定制专属成长路线
        </p>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2.5 overflow-hidden">
        {cards.map((card, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="flex-shrink-0 mt-0.5">{card.icon}</div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{card.title}</h3>
              <p className="text-gray-400 text-xs mt-0.5">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="pt-4">
        {/* CTA */}
        <button
          onClick={() => router.push("/goal")}
          className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-lg rounded-2xl transition-all shadow-lg shadow-blue-200"
        >
          下一步
        </button>
      </div>
    </main>
  );
}
