"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getLatestAnalysis } from "@/lib/supabase/service";
import { supabase } from "@/lib/supabase/client";
import { getUserId, getActiveGoalId } from "@/lib/user";

export default function ReflectionPage() {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [weakDim, setWeakDim] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [summary, setSummary] = useState("");
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    const goalId = getActiveGoalId();
    const goalPromise = goalId ? supabase.from("user_goals").select("target_role").eq("id", goalId).maybeSingle() : Promise.resolve(null);
    Promise.all([getLatestAnalysis(), goalPromise]).then(([a, goalData]) => {
      const g = (goalData as any)?.data || goalData;
      if (g) setTargetRole(g.target_role);
      if (a) {
        setNextAction(a.next_action || "");
        if (a.ability_scores?.length) {
          const sorted = [...a.ability_scores].sort((x, y) => x.score - y.score);
          if (sorted[0]) setWeakDim(sorted[0].dimension);
          setTaskTitle(`优先提升：${sorted[0]?.dimension || "核心能力"}`);
        }
      }
    });
  }, []);

  // AI 总结
  const handleSummarize = async () => {
    if (!note.trim() || note.length < 10) return;
    setSummarizing(true);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note, targetRole }),
      });
      const data = await res.json();
      setSummary(data.summary || data.error || "总结生成失败，请稍后重试");
    } catch {
      setSummary("总结生成失败，请稍后重试");
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#f8faff" }}>
      <div className="flex-1 overflow-auto pb-24">
        <div className="px-6 pt-8 pb-2">
          <div className="flex items-center mb-3">
            <button onClick={() => router.back()} className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm">返回</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">今日成长汇报</h1>
          <p className="text-gray-400 text-base mt-1.5 leading-relaxed">告诉 AI 你今天学到了什么</p>
        </div>

        {/* Today's Task */}
        <div className="px-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">今日任务</h2>
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
                  <h3 className="text-base font-semibold text-gray-900">{taskTitle || "优先提升核心能力"}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{targetRole ? `基于「${targetRole}」分析结果` : "基于 AI 分析结果"}</p>
                </div>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 flex-shrink-0">进行中</span>
            </div>
          </div>
        </div>

        {/* Learning Summary Input */}
        <div className="px-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">今天学到了什么？</h2>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <textarea value={note} onChange={(e) => setNote(e.target.value)}
              placeholder={`例如：今天学习了${weakDim || "核心技能"}相关内容，掌握了...`}
              rows={4}
              className="w-full text-sm text-gray-900 placeholder:text-gray-300 bg-transparent resize-none focus:outline-none leading-relaxed" />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
              <span className="text-xs text-gray-300">{note.length}/500</span>
              <button onClick={handleSummarize}
                disabled={summarizing || note.length < 10}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold rounded-xl transition-all">
                {summarizing ? "AI 总结中..." : "AI 总结"}
              </button>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        {(summary || summarizing) && (
          <div className="px-6 mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">AI 总结</h2>
            <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm shadow-indigo-50 p-5">
              {summarizing ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-400">AI 正在分析你的总结...</span>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="7" stroke="#6366f1" strokeWidth="1.5" fill="none" />
                      <circle cx="10" cy="10" r="3" fill="#6366f1" />
                      <line x1="10" y1="3" x2="10" y2="7" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1">{summary}</p>
                </div>
              )}
            </div>
            {/* 提交按钮 */}
            <button onClick={async () => {
                if (note.trim()) {
                  await supabase.from("reflections").insert({ user_id: getUserId(), goal_id: getActiveGoalId() || 0, note, summary });
                }
                router.push("/dashboard");
              }}
              className="w-full mt-3 py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-lg rounded-2xl transition-all shadow-lg shadow-blue-200">
              提交成长记录
            </button>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 pt-2 pb-5 safe-bottom flex items-center justify-around z-40">
          {[
            { label: "首页", route: "/dashboard" },
            { label: "路线", route: "/roadmap" },
            { label: "学习", route: "/learning" },
            { label: "成长", route: "/growth" },
            { label: "我的", route: "/profile" },
          ].map((item) => (
            <button key={item.label} onClick={() => router.push(item.route)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-300 hover:text-gray-400 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                {item.label === "首页" && <path d="M3 10L12 3L21 10V20H14V14H10V20H3V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
                {item.label === "路线" && <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>}
                {item.label === "学习" && <><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" /><line x1="8" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>}
                {item.label === "成长" && <><polyline points="3,17 9,11 13,15 21,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><polyline points="16,7 21,7 21,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>}
                {item.label === "我的" && <><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" /><path d="M4 20C4 16 8 14 12 14C16 14 20 16 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>}
              </svg>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
    </main>
  );
}
