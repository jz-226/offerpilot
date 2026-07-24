"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { setUserName, getUserName } from "@/lib/user";
import { createClient } from "@/lib/supabase/client";

export default function WelcomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [existingName, setExistingName] = useState("");
  const [goals, setGoals] = useState<{ id: number; role: string; city: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const n = getUserName();
    setExistingName(n);
    if (n) setName(n);

    // 查已有目标
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) {
        createClient().from("user_goals").select("id, target_role, target_city").eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .then(({ data }) => { setGoals(data || []); setLoading(false); });
      } else {
        setLoading(false);
      }
    });
  }, []);

  const handleNext = () => {
    if (name.trim()) setUserName(name.trim());
    router.push("/goal");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#f8faff" }}>
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  // ===== 已有名字 + 已有目标 → 选目标 =====
  if (existingName && goals.length > 0) {
    return (
      <main className="min-h-screen flex flex-col justify-center px-6" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)" }}>
        <div className="max-w-sm mx-auto w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-200">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="14" r="7" stroke="white" strokeWidth="2.5"/>
                <path d="M8 34c0-6 5-9 12-9s12 3 12 9" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">欢迎回来，{existingName}</h1>
            <p className="text-sm text-gray-400 mt-2">选择你要继续的目标</p>
          </div>

          <div className="space-y-2 mb-4 text-left">
            {goals.map((g) => (
              <button key={g.id} onClick={() => router.push("/dashboard")}
                className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left hover:border-blue-200 active:scale-[0.99] transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{g.role}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{g.city}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </button>
            ))}
          </div>

          <button onClick={() => router.push("/goal")}
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-lg rounded-2xl transition-all shadow-lg shadow-blue-200">
            ＋ 新增目标岗位
          </button>
        </div>
      </main>
    );
  }

  // ===== 首次登录 → 填名字 =====
  return (
    <main className="min-h-screen flex flex-col justify-center px-6" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)" }}>
      <div className="max-w-sm mx-auto w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-200">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="14" r="7" stroke="white" strokeWidth="2.5"/>
              <path d="M8 34c0-6 5-9 12-9s12 3 12 9" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">怎么称呼你？</h1>
          <p className="text-sm text-gray-400 mt-2">让 AI 更好地陪伴你的成长</p>
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="输入你的名字"
          autoFocus
          className="w-full text-center text-2xl text-gray-900 font-medium bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 placeholder:text-gray-300 focus:outline-none focus:border-blue-200 transition-all"
        />

        <button onClick={handleNext}
          className="w-full mt-4 py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-lg rounded-2xl transition-all shadow-lg shadow-blue-200">
          开始使用
        </button>
      </div>
    </main>
  );
}
