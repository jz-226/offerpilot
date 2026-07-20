"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const uploadOptions = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="2" width="16" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <line x1="7" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="7" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="7" y1="13" x2="11" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    label: "上传笔记",
    color: "bg-blue-50 text-blue-500 border-blue-100",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="2" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <line x1="2" y1="8" x2="20" y2="8" stroke="currentColor" strokeWidth="1" />
        <text x="7" y="16" fontSize="7" fill="currentColor" fontWeight="bold">&lt;/&gt;</text>
      </svg>
    ),
    label: "上传代码",
    color: "bg-indigo-50 text-indigo-500 border-indigo-100",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 5C4 3.5 5.5 2 7 2H15C16.5 2 18 3.5 18 5V18C18 19.5 16.5 20 15 20H7C5.5 20 4 19.5 4 18V5Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <line x1="8" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="8" y1="11" x2="12" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="16.5" cy="6.5" r="3" fill="#3b82f6" stroke="white" strokeWidth="1.5" />
        <line x1="15.5" y1="6.5" x2="17.5" y2="6.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <line x1="16.5" y1="5.5" x2="16.5" y2="7.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
    label: "上传项目文件",
    color: "bg-emerald-50 text-emerald-500 border-emerald-100",
  },
];

export default function ReflectionPage() {
  const router = useRouter();
  const [note, setNote] = useState("");

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#f8faff" }}>
      {/* Scrollable content */}
      <div className="flex-1 overflow-auto pb-24">
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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">今日成长汇报</h1>
          <p className="text-gray-400 text-base mt-1.5 leading-relaxed">
            告诉 AI 你今天完成了什么
          </p>
        </div>

        {/* Today's Task */}
        <div className="px-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
            今日任务
          </h2>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="7" stroke="#10b981" strokeWidth="1.5" />
                    <path d="M6.5 10L9 12.5L13.5 8" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    完成 SQL JOIN 基础学习
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">预计 45 分钟</p>
                </div>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 flex-shrink-0">
                已完成
              </span>
            </div>
          </div>
        </div>

        {/* Learning Summary Input */}
        <div className="px-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
            今天学到了什么？
          </h2>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例如：今天学习了 SQL JOIN，理解了多表查询逻辑..."
              rows={4}
              className="w-full text-sm text-gray-900 placeholder:text-gray-300 bg-transparent resize-none focus:outline-none leading-relaxed"
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
              <span className="text-xs text-gray-300">{note.length}/500</span>
            </div>
          </div>
        </div>

        {/* Evidence Upload */}
        <div className="px-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
            提交成长证据
          </h2>
          <div className="grid grid-cols-3 gap-2.5">
            {uploadOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => {}}
                className={`flex flex-col items-center gap-2 py-5 rounded-2xl border transition-colors active:scale-[0.97] ${opt.color}`}
              >
                {opt.icon}
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Feedback Preview */}
        <div className="px-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
            AI 成长反馈
          </h2>
          <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm shadow-indigo-50 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7" stroke="#6366f1" strokeWidth="1.5" fill="none" />
                  <circle cx="10" cy="10" r="3" fill="#6366f1" />
                  <line x1="10" y1="3" x2="10" y2="7" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">
                很好，你已经补充了数据分析能力基础。SQL JOIN 是产品数据分析的核心技能，掌握后你可以独立完成多表关联查询，这是 PM 做数据驱动决策的重要一步。
              </p>
            </div>

            {/* Ability Change */}
            <div className="flex items-center justify-between bg-indigo-50 rounded-2xl px-4 py-3">
              <span className="text-sm font-medium text-indigo-700">数据分析能力</span>
              <span className="text-sm font-bold text-indigo-600 flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 8L5 4L7 6L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 3H10V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                +5
              </span>
            </div>
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>

      {/* Fixed Bottom CTA + Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent">
        <div className="px-6 pt-3 pb-2">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-lg rounded-2xl transition-all shadow-lg shadow-blue-200"
            >
              提交成长记录
            </button>
          </div>
        </div>
        <nav className="bg-white border-t border-gray-100 px-2 pt-2 pb-5 flex items-center justify-around">
          {[
            { label: "首页", icon: "home", route: "/dashboard" },
            { label: "路线", icon: "route", route: "/roadmap" },
            { label: "学习", icon: "learn", route: "/learning" },
            { label: "成长", icon: "growth", route: "/growth" },
            { label: "我的", icon: "profile", route: "/profile" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.route)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-300 hover:text-gray-400 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                {item.icon === "home" && <path d="M3 10L12 3L21 10V20H14V14H10V20H3V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
                {item.icon === "route" && (
                  <>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </>
                )}
                {item.icon === "learn" && (
                  <>
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
                    <line x1="8" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                )}
                {item.icon === "growth" && (
                  <>
                    <polyline points="3,17 9,11 13,15 21,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="16,7 21,7 21,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </>
                )}
                {item.icon === "profile" && (
                  <>
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                    <path d="M4 20C4 16 8 14 12 14C16 14 20 16 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </>
                )}
              </svg>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </main>
  );
}
