"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const stages = [
  {
    num: 1,
    name: "基础能力",
    status: "已完成",
    statusStyle: "bg-blue-50 text-blue-600 border-blue-100",
    dotColor: "bg-blue-500 ring-blue-100",
    lineColor: "bg-blue-500",
    skills: ["了解产品基础概念", "互联网行业认知", "用户需求分析基础"],
  },
  {
    num: 2,
    name: "产品核心能力",
    status: "进行中",
    statusStyle: "bg-indigo-50 text-indigo-600 border-indigo-100",
    dotColor: "bg-indigo-500 ring-indigo-100",
    lineColor: "bg-indigo-500",
    skills: ["需求分析", "产品设计", "PRD 撰写", "用户研究"],
  },
  {
    num: 3,
    name: "AI 技术理解",
    status: "待提升",
    statusStyle: "bg-amber-50 text-amber-600 border-amber-100",
    dotColor: "bg-amber-400 ring-amber-100",
    lineColor: "bg-amber-400",
    skills: ["理解大模型基础", "AI 产品应用场景", "AI Agent 基础知识"],
  },
  {
    num: 4,
    name: "项目实践",
    status: "待开始",
    statusStyle: "bg-gray-50 text-gray-400 border-gray-100",
    dotColor: "bg-gray-300 ring-gray-100",
    lineColor: "bg-gray-300",
    skills: ["完成真实 AI 产品项目", "积累作品案例"],
  },
  {
    num: 5,
    name: "求职准备",
    status: "待开始",
    statusStyle: "bg-gray-50 text-gray-400 border-gray-100",
    dotColor: "bg-gray-300 ring-gray-100",
    lineColor: "bg-transparent",
    skills: ["简历优化", "作品整理", "面试准备"],
  },
];

const navItems = [
  { label: "首页", icon: "home", route: "/dashboard", active: false },
  { label: "路线", icon: "route", route: "/roadmap", active: true },
  { label: "学习", icon: "learn", route: "/learning", active: false },
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

export default function RoadmapPage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);

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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI 成长路线</h1>
          <p className="text-gray-400 text-base mt-1.5 leading-relaxed">
            根据你的目标 Offer，AI 为你规划成长路径
          </p>
        </div>

        {/* Target Job Card */}
        <div className="px-6 mb-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">目标岗位</h3>
                <p className="text-lg font-semibold text-gray-900">AI 产品经理</p>
                <p className="text-xs text-gray-400 mt-0.5">上海</p>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-medium text-gray-400 mb-1">Offer Readiness</h3>
                <p className="text-2xl font-bold text-blue-500">42%</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                style={{ width: "42%" }}
              />
            </div>
          </div>
        </div>

        {/* Growth Stages Timeline */}
        <div className="px-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
            你的成长阶段
          </h2>
          <div className="relative">
            {stages.map((stage, i) => {
              const isExpanded = expanded === i;
              return (
                <div key={i} className="flex items-start gap-3.5 pb-0">
                  {/* Dot + Line */}
                  <div className="flex flex-col items-center flex-shrink-0 pt-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-full ring-4 flex-shrink-0 ${stage.dotColor}`}
                    />
                    {i < stages.length - 1 && (
                      <div className={`w-0.5 flex-1 min-h-[36px] mt-1 ${stage.lineColor}`} />
                    )}
                  </div>

                  {/* Card */}
                  <div className="flex-1 pb-3">
                    <button
                      onClick={() => setExpanded(isExpanded ? null : i)}
                      className={`w-full text-left rounded-2xl border p-4 transition-all ${stage.statusStyle}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold opacity-50">
                            {String(stage.num).padStart(2, "0")}
                          </span>
                          <h3 className="text-sm font-semibold">{stage.name}</h3>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium opacity-70">{stage.status}</span>
                          <svg
                            width="14" height="14" viewBox="0 0 14 14" fill="none"
                            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          >
                            <path d="M4 6L7 9L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>

                      {/* Expandable skills */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-black/5 space-y-1.5">
                          {stage.skills.map((skill, j) => (
                            <div key={j} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40 flex-shrink-0" />
                              <span className="text-xs opacity-80">{skill}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Suggestion */}
        <div className="px-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
            AI 建议
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
              <p className="text-sm text-gray-600 leading-relaxed flex-1">
                根据你的目标岗位，当前优先提升 <span className="font-semibold text-gray-900">AI 技术理解</span> 和 <span className="font-semibold text-gray-900">项目实践</span> 能力。
              </p>
            </div>
            <div className="bg-indigo-50 rounded-2xl px-4 py-3 flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                <circle cx="8" cy="8" r="6" stroke="#6366f1" strokeWidth="1.2" />
                <path d="M8 4V8L10.5 9.5" stroke="#6366f1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-medium text-indigo-700">
                下一步建议：完成一个 AI Agent 项目实践
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
