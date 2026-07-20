"use client";

import { useRouter } from "next/navigation";

const abilities = [
  { name: "产品能力", value: 70, color: "from-blue-500 to-blue-400" },
  { name: "AI 技术理解", value: 45, color: "from-indigo-500 to-indigo-400" },
  { name: "数据分析", value: 55, color: "from-emerald-500 to-emerald-400" },
];

const records = [
  {
    date: "2026.07.20",
    done: "完成 SQL JOIN 基础学习",
    evidence: "学习笔记",
    feedback: "你已经掌握基础数据查询逻辑，数据分析能力有所提升。",
    change: { label: "数据分析能力", value: "+5", color: "text-emerald-600 bg-emerald-50" },
  },
  {
    date: "2026.07.18",
    done: "学习 AI Agent 基础知识",
    evidence: "学习总结",
    feedback: "你开始建立 AI 产品设计思维。",
    change: { label: "AI 技术理解", value: "+3", color: "text-indigo-600 bg-indigo-50" },
  },
  {
    date: "2026.07.15",
    done: "完成用户需求分析练习",
    evidence: "产品文档",
    feedback: "产品分析能力提升。",
    change: { label: "产品能力", value: "+4", color: "text-blue-600 bg-blue-50" },
  },
];

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

export default function GrowthPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">成长记录</h1>
          <p className="text-gray-400 text-base mt-1.5 leading-relaxed">
            AI 帮你记录每一次能力提升
          </p>
        </div>

        {/* Growth Overview */}
        <div className="px-6 mb-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">12</div>
                <div className="text-[11px] text-gray-400 mt-1">累计成长次数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-500">7</div>
                <div className="text-[11px] text-gray-400 mt-1">连续成长天数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-500">+15</div>
                <div className="text-[11px] text-gray-400 mt-1">能力提升总分</div>
              </div>
            </div>
          </div>
        </div>

        {/* Ability Growth */}
        <div className="px-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
            能力成长
          </h2>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
            {abilities.map((a) => (
              <div key={a.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{a.name}</span>
                  <span className="text-sm font-semibold text-gray-900">{a.value}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${a.color} rounded-full transition-all`}
                    style={{ width: `${a.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Timeline */}
        <div className="px-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
            成长轨迹
          </h2>
          <div className="relative">
            {records.map((r, i) => (
              <div key={i} className="flex items-start gap-3.5 pb-0">
                {/* Dot + Line */}
                <div className="flex flex-col items-center flex-shrink-0 pt-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-100 flex-shrink-0" />
                  {i < records.length - 1 && (
                    <div className="w-0.5 flex-1 min-h-[40px] mt-1 bg-blue-200" />
                  )}
                </div>

                {/* Card */}
                <div className="flex-1 pb-3">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    {/* Date */}
                    <span className="text-[11px] text-gray-300 font-medium mb-2 inline-block">
                      {r.date}
                    </span>

                    {/* Done + Evidence */}
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">{r.done}</h4>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <rect x="1.5" y="1" width="9" height="10" rx="1.5" stroke="#9ca3af" strokeWidth="1" />
                        <line x1="4.5" y1="5" x2="7.5" y2="5" stroke="#9ca3af" strokeWidth="0.8" strokeLinecap="round" />
                      </svg>
                      <span className="text-[11px] text-gray-400">提交证据：{r.evidence}</span>
                    </div>

                    {/* AI Feedback */}
                    <div className="bg-gray-50 rounded-xl px-3 py-2.5 mb-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="4" stroke="#6366f1" strokeWidth="1" />
                          <circle cx="6" cy="6" r="1.5" fill="#6366f1" />
                        </svg>
                        <span className="text-[10px] font-medium text-indigo-500">AI 反馈</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{r.feedback}</p>
                    </div>

                    {/* Ability Change */}
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-xl ${r.change.color}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 7L5 3L7 5L10 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M7 2H10V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {r.change.label} {r.change.value}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Summary */}
        <div className="px-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
            AI 对你的评价
          </h2>
          <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm shadow-indigo-50 p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7" stroke="#6366f1" strokeWidth="1.5" fill="none" />
                  <circle cx="10" cy="10" r="3" fill="#6366f1" />
                  <line x1="10" y1="3" x2="10" y2="7" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 leading-relaxed">
                  你正在从产品基础能力，逐渐向 AI 产品经理能力发展。
                </p>
              </div>
            </div>
            <div className="bg-indigo-50 rounded-2xl px-4 py-3 flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                <circle cx="8" cy="8" r="6" stroke="#6366f1" strokeWidth="1.2" />
                <path d="M8 4V8L10.5 9.5" stroke="#6366f1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-medium text-indigo-700">
                下一阶段建议：加强 AI Agent 项目实践
              </span>
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
