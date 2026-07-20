"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const abilities = [
  { name: "产品能力", value: 70, color: "from-blue-500 to-blue-400" },
  { name: "AI 技术理解", value: 45, color: "from-indigo-500 to-indigo-400" },
  { name: "数据分析", value: 50, color: "from-emerald-500 to-emerald-400" },
  { name: "项目实践", value: 30, color: "from-amber-500 to-amber-400" },
];

const records = [
  {
    title: "完成 SQL JOIN 学习",
    time: "2026-07-21",
    feedback: "数据分析能力提升",
    detail: "掌握了 INNER JOIN、LEFT JOIN、RIGHT JOIN 的核心语法和多表关联查询逻辑，能够独立完成简单数据分析任务。",
  },
  {
    title: "学习 AI Agent 基础",
    time: "2026-07-20",
    feedback: "AI 产品理解增强",
    detail: "理解了 AI Agent 的 Observe-Think-Act 闭环架构，学习了 Prompt 分层设计和 Workflow 编排的基本概念。",
  },
];

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

export default function ProfilePage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#f8faff" }}>
      {/* Scrollable content */}
      <div className="flex-1 overflow-auto pb-20">
        {/* Header + Avatar */}
        <div className="px-6 pt-8 pb-2">
          <div className="flex items-center mb-5">
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

          {/* Avatar + Name */}
          <div className="flex items-center gap-4 mb-1">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2" />
                <path d="M4 20C4 16 8 14 12 14C16 14 20 16 20 20" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">姜同学</h1>
              <p className="text-sm text-gray-400">AI 产品经理</p>
            </div>
          </div>
        </div>

        {/* My Goal */}
        <div className="px-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
            我的目标
          </h2>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">目标岗位</p>
                <p className="text-sm font-semibold text-gray-900">AI 产品经理</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">目标城市</p>
                <p className="text-sm font-semibold text-gray-900">上海</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">目标入职时间</p>
                <p className="text-sm font-semibold text-gray-900">2027 年春招</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">目标公司</p>
                <p className="text-sm font-semibold text-gray-900">互联网 AI 公司</p>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Overview */}
        <div className="px-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
            成长概览
          </h2>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">42%</div>
              <div className="text-[11px] text-gray-400 mt-1 leading-tight">Offer{"\n"}Readiness</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-emerald-500">7</div>
              <div className="text-[11px] text-gray-400 mt-1 leading-tight">连续成长{"\n"}天数</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-indigo-500">18h</div>
              <div className="text-[11px] text-gray-400 mt-1 leading-tight">累计学习{"\n"}时长</div>
            </div>
          </div>
        </div>

        {/* Ability Growth */}
        <div className="px-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
            能力变化
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

        {/* Recent Growth Records */}
        <div className="px-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
            最近成长记录
          </h2>
          <div className="space-y-2.5">
            {records.map((r, i) => {
              const isExpanded = expanded === i;
              return (
                <button
                  key={i}
                  onClick={() => setExpanded(isExpanded ? null : i)}
                  className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-sm font-semibold text-gray-900">{r.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-300">{r.time}</span>
                      <svg
                        width="14" height="14" viewBox="0 0 14 14" fill="none"
                        className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      >
                        <path d="M4 6L7 9L10 6" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  {/* AI Feedback tag */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="4" stroke="#818cf8" strokeWidth="1" />
                      <circle cx="6" cy="6" r="1.5" fill="#818cf8" />
                    </svg>
                    <span className="text-[11px] text-indigo-500 font-medium">{r.feedback}</span>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="mt-2 pt-2.5 border-t border-gray-50">
                      <p className="text-xs text-gray-500 leading-relaxed">{r.detail}</p>
                    </div>
                  )}
                </button>
              );
            })}
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
