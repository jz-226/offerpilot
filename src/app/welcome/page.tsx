"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { setActiveGoalId, getProfileNickname } from "@/lib/user";

export default function WelcomePage() {
  const router = useRouter();
  const [goals, setGoals] = useState<{ id: number; role: string; city: string }[]>([]);
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const c = createClient();
    c.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/login"); return; }
      setNickname(getProfileNickname() || "User");

      const { data } = await c.from("user_goals").select("id, target_role, target_city")
        .eq("user_id", user.id).order("created_at", { ascending: false });
      setGoals((data || []).map((g: any) => ({ id: g.id, role: g.target_role || "", city: g.target_city || "" })));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center" style={{ background: "#f8faff" }}>
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </main>;
  }

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
          <h1 className="text-2xl font-bold text-gray-900">{nickname}，欢迎 👋</h1>
          <p className="text-sm text-gray-400 mt-2">
            {goals.length > 0 ? "选择要继续的目标" : "创建你的第一个目标岗位"}
          </p>
        </div>

        {goals.length > 0 ? (
          <div className="space-y-2 mb-4 text-left">
            {goals.map((g) => (
              <div key={g.id} className="relative">
                <button onClick={() => {
                    console.log("switch goal clicked", g.id, g.role);
                    alert(`正在切换到：${g.role}`);
                    setActiveGoalId(g.id);
                    window.location.href = "/dashboard";
                  }}
                  className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 pr-12 text-left hover:border-blue-200 active:scale-[0.99] transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{g.role}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{g.city}</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                </button>
                <button onClick={async (e) => {
                  e.stopPropagation();
                  if (!confirm("删除这个岗位档案？")) return;
                  const c = createClient();
                  await c.from("user_goals").delete().eq("id", g.id);
                  setGoals((prev) => prev.filter((x) => x.id !== g.id));
                }}
                  className="absolute right-3 top-3 w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3L11 11M3 11L11 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <button onClick={() => router.push("/goal")}
          className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-lg rounded-2xl transition-all shadow-lg shadow-blue-200">
          {goals.length > 0 ? "＋ 新增目标岗位" : "创建第一个目标"}
        </button>
      </div>
    </main>
  );
}
