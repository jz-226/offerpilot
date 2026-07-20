"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const fields = [
  { label: "目标岗位", value: "AI 产品经理", placeholder: "例如：AI产品经理 / 前端工程师 / UI设计师", hasArrow: true },
  { label: "目标城市", value: "上海", hasArrow: true },
  { label: "目标公司（选填）", value: "", placeholder: "输入目标公司", hasArrow: false },
  { label: "期望入职时间", value: "2027 秋招", hasArrow: true },
  { label: "期望薪资（选填）", value: "20-30K", hasArrow: false },
];

export default function GoalPage() {
  const router = useRouter();
  const [values, setValues] = useState<string[]>(["AI 产品经理", "上海", "", "2027 秋招", "20-30K"]);

  return (
    <main
      className="h-screen flex flex-col px-6 py-6"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)" }}
    >
      {/* Top: Back */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm">返回</span>
        </button>
      </div>

      {/* Hero */}
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          创建你的目标
        </h1>
        <p className="text-gray-400 text-base mt-1.5 leading-relaxed">
          告诉我们你的目标，让 AI 为你规划成长路线
        </p>
      </div>

      {/* Form cards */}
      <div className="flex-1 space-y-2 overflow-hidden">
        {fields.map((field, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3"
          >
            <label className="block text-xs text-gray-400 mb-1">{field.label}</label>
            {field.hasArrow ? (
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-lg ${values[i] ? "text-gray-900" : "text-gray-300"} font-medium`}>
                    {values[i] || "请选择"}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 3L11 8L6 13" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {field.placeholder && (
                  <p className="text-xs text-gray-300 mt-1">{field.placeholder}</p>
                )}
              </div>
            ) : (
              <input
                value={values[i]}
                onChange={(e) => {
                  const next = [...values];
                  next[i] = e.target.value;
                  setValues(next);
                }}
                placeholder={field.placeholder}
                className="w-full text-lg text-gray-900 font-medium bg-transparent placeholder:text-gray-300 focus:outline-none"
              />
            )}
          </div>
        ))}
      </div>

      {/* CTA - fixed to bottom */}
      <div className="pt-3 pb-2">
        <button
          onClick={() => router.push("/analysis")}
          className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-lg rounded-2xl transition-all shadow-lg shadow-blue-200"
        >
          开始 AI 分析
        </button>
      </div>
    </main>
  );
}
