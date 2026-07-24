"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getUserName, setAuthUserId } from "@/lib/user";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [userName, setUserNameState] = useState("");
  const [profiles, setProfiles] = useState<{ id: string; role: string; city: string; createdAt: string }[]>([]);
  const [showEmail, setShowEmail] = useState(false);

  useEffect(() => {
    const c = createClient();
    c.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setLoggedIn(true);
        setAuthUserId(user.id);
        setUserNameState(getUserName());
        localStorage.removeItem("offerpilot_profiles");

        const { data: goals } = await c.from("user_goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
        if (goals?.length) {
          setProfiles(goals.map((g) => ({ id: g.id.toString(), role: g.target_role, city: g.target_city, createdAt: g.created_at })));
        }
      }
      setChecking(false);
    });
  }, []);

  const sendCode = async () => {
    if (!email.includes("@")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setSent(true);
    } catch { setError("发送失败，请稍后重试"); }
    setLoading(false);
  };

  const verifyCode = async () => {
    if (code.length < 8) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: code }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      // 登录成功 → 同步 user_id → 跳 Welcome
      if (data.user?.id) setAuthUserId(data.user.id);
      router.push("/welcome");
    } catch { setError("验证失败，请稍后重试"); }
    setLoading(false);
  };

  const handleLogout = async () => {
    await createClient().auth.signOut();
    setLoggedIn(false);
    setShowEmail(false);
  };

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#f8faff" }}>
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  // ===== 已登录——显示档案列表 =====
  if (loggedIn && !showEmail) {
    return (
      <main className="min-h-screen flex flex-col justify-between px-6 py-10" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)" }}>
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="text-blue-500">Offer</span>
              <span className="text-gray-900">Pilot</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2">你的 AI 职业成长伙伴</p>
          </div>

          <p className="text-sm font-medium text-gray-500 text-center mb-3">
            {userName ? `${userName}，欢迎回来` : "欢迎回来"}
          </p>

          {profiles.length > 0 ? (
            <div className="space-y-2 mb-4">
              {profiles.map((p) => (
                <button key={p.id} onClick={() => router.push("/dashboard")}
                  className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left hover:border-blue-200 active:scale-[0.99] transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{p.role || "未设置岗位"}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{p.city} · {p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : ""}</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center mb-4">还没有创建任何岗位目标</p>
          )}

          <button onClick={() => router.push("/goal")}
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-lg rounded-2xl transition-all shadow-lg shadow-blue-200">
            ＋ 新增目标岗位
          </button>

          <button onClick={() => setShowEmail(true)}
            className="w-full mt-3 py-3 text-gray-300 hover:text-gray-400 text-sm transition-colors">
            使用其他账号登录
          </button>
        </div>

        <button onClick={handleLogout}
          className="text-center text-xs text-gray-300 mt-6">
          退出登录
        </button>
      </main>
    );
  }

  // ===== 未登录——邮箱输入 =====
  return (
    <main className="min-h-screen flex flex-col justify-between px-6 py-10" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)" }}>
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-blue-500">Offer</span>
            <span className="text-gray-900">Pilot</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">你的 AI 职业成长伙伴</p>
          {showEmail && <p className="text-xs text-gray-400 mt-3">使用其他邮箱登录</p>}
        </div>

        <div className="space-y-3">
          {!sent ? (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                <label className="block text-xs text-gray-400 mb-1.5">邮箱地址</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email"
                  className="w-full text-lg text-gray-900 font-medium bg-transparent placeholder:text-gray-300 focus:outline-none" />
              </div>
              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
              <button onClick={sendCode} disabled={!email.includes("@") || loading}
                className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-lg rounded-2xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50">
                {loading ? "发送中..." : "发送验证码"}
              </button>
            </>
          ) : (
            <>
              <div className="text-center mb-3">
                <div className="text-2xl mb-1">📧</div>
                <p className="text-xs text-gray-400">验证码已发送至 <span className="font-semibold text-gray-600">{email}</span></p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                <label className="block text-xs text-gray-400 mb-1.5">验证码</label>
                <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="输入验证码" type="text" autoFocus
                  className="w-full text-lg text-gray-900 font-medium bg-transparent placeholder:text-gray-300 focus:outline-none tracking-widest" />
              </div>
              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
              <button onClick={verifyCode} disabled={code.length < 8 || loading}
                className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-lg rounded-2xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50">
                {loading ? "验证中..." : "登录"}
              </button>
              <button onClick={() => { setSent(false); setCode(""); }} className="w-full mt-2 py-2 text-sm text-gray-400">
                重新发送验证码
              </button>
            </>
          )}

          <button onClick={() => router.push("/onboarding")}
            className="w-full mt-6 py-3 text-gray-300 hover:text-gray-400 text-sm transition-colors">
            跳过登录，先体验
          </button>
        </div>
      </div>

      <p className="text-center text-[10px] text-gray-300 mt-6">登录即表示同意服务条款和隐私政策</p>
    </main>
  );
}
