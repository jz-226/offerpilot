"use client";

import { useRouter } from "next/navigation";

const resources = [
  {
    type: "视频学习",
    typeIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="3" width="16" height="14" rx="3" stroke="#ef4444" strokeWidth="1.5" fill="none" />
        <polygon points="8,6 8,14 14,10" fill="#ef4444" />
      </svg>
    ),
    typeColor: "bg-red-50 text-red-500",
    title: "SQL JOIN 完全入门教程",
    source: "Bilibili",
    desc: "快速理解 SQL 多表查询和 JOIN 核心逻辑。",
    reason: "最适合当前阶段快速入门",
  },
  {
    type: "官方文档",
    typeIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="4" y="2" width="12" height="16" rx="2" stroke="#3b82f6" strokeWidth="1.5" fill="none" />
        <line x1="7" y1="6" x2="13" y2="6" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="7" y1="9" x2="11" y2="9" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="7" y1="12" x2="10" y2="12" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    typeColor: "bg-blue-50 text-blue-500",
    title: "SQL Tutorial",
    source: "官方文档",
    desc: "系统学习 SQL 基础语法和查询能力。",
    reason: "系统学习标准语法",
  },
  {
    type: "实践项目",
    typeIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 13L6 6L9 9L12 4L15 7L17 5" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="14" cy="4" r="1.5" fill="#10b981" />
      </svg>
    ),
    typeColor: "bg-emerald-50 text-emerald-600",
    title: "数据分析小项目练习",
    source: "GitHub",
    desc: "通过真实项目提升数据处理和分析能力。",
    reason: "实战巩固学习成果",
  },
];

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

export default function LearningPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#f8faff" }}>
      {/* Scrollable content */}
      <div className="flex-1 overflow-auto pb-20">
        {/* Header */}
        <div className="px-6 pt-8 pb-2">
          <div className="flex items-center mb-3">
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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">学习中心</h1>
          <p className="text-gray-400 text-base mt-1.5 leading-relaxed">
            AI 为你的目标 Offer 推荐学习资源
          </p>
        </div>

        {/* Today's Recommendation */}
        <div className="px-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
            今日推荐
          </h2>
          <div className="bg-white rounded-3xl border border-blue-100 shadow-sm shadow-blue-50 overflow-hidden">
            {/* Top gradient accent */}
            <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                SQL 数据分析基础
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                根据你的目标岗位 AI 产品经理，当前数据分析能力需要进一步提升。
              </p>

              {/* Meta row */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs text-gray-500">学习方向：</span>
                  <span className="text-xs font-semibold text-gray-900">数据分析能力</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="#9ca3af" strokeWidth="1.2" />
                    <line x1="7" y1="4.5" x2="7" y2="7" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="7" y1="7" x2="9" y2="7" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <span className="text-xs text-gray-500">预计时间：</span>
                  <span className="text-xs font-semibold text-gray-900">45 分钟</span>
                </div>
              </div>

              <button
                onClick={() => {}}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-sm rounded-2xl transition-all"
              >
                开始学习
              </button>
            </div>
          </div>
        </div>

        {/* AI Recommended Resources */}
        <div className="px-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
            推荐资源
          </h2>
          <div className="space-y-2.5">
            {resources.map((r, i) => (
              <button
                key={i}
                onClick={() => {}}
                className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left hover:border-gray-200 active:scale-[0.99] transition-all"
              >
                {/* Header row */}
                <div className="flex items-center gap-3 mb-2.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${r.typeColor}`}>
                    {r.typeIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 leading-tight">{r.title}</h4>
                    <span className={`inline-block text-[11px] font-medium px-1.5 py-0.5 rounded-md mt-1 ${r.typeColor}`}>
                      {r.type}
                    </span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                    <path d="M6 3L11 8L6 13" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-500 leading-relaxed mb-2">{r.desc}</p>

                {/* Footer row */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-300">来源：{r.source}</span>
                  <span className="text-[11px] text-blue-400">{r.reason}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Growth */}
        <div className="px-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
            本周成长
          </h2>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">3h</div>
                <div className="text-[11px] text-gray-400 mt-1">本周学习时间</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-500">5</div>
                <div className="text-[11px] text-gray-400 mt-1">完成资源</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-500">+8</div>
                <div className="text-[11px] text-gray-400 mt-1">能力增长</div>
              </div>
            </div>

            {/* Direction */}
            <div className="flex items-center justify-between bg-blue-50 rounded-2xl px-4 py-3">
              <span className="text-sm font-medium text-blue-700">成长方向</span>
              <span className="text-sm font-semibold text-blue-600">数据分析能力提升</span>
            </div>
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>

      {/* Bottom Nav */}
      <nav className="bg-white border-t border-gray-100 px-2 pt-2 pb-5 flex items-center justify-around">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => router.push(item.route)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
              item.active ? "text-blue-500" : "text-gray-300 hover:text-gray-400"
            }`}
          >
            <NavIcon name={item.icon} active={item.active} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
