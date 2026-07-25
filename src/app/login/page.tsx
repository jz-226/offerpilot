"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { setAuthUserId, addSavedAccount, getSavedAccounts, removeSavedAccount, getUserName } from "@/lib/user";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const [savedAccounts, setSavedAccounts] = useState(getSavedAccounts());

  useEffect(() => {
    const c = createClient();
    c.auth.getUser().then(({ data: { user } }) => {
      if (user) setAuthUserId(user.id);
      setChecking(false);
      // 不再自动跳转——让用户看到账号列表和登录选项
    });
  }, []);

  const sendCode = async (targetEmail?: string) => {
    const e = targetEmail || email;
    if (!e.includes("@")) return;
    setEmail(e);
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e }),
      });
      const data = await res.json();
      if (data.error) setError(data.error); else setSent(true);
    } catch { setError("发送失败"); }
    setLoading(false);
  };

  const verifyCode = async () => {
    if (code.length < 8) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: code }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      if (data.user?.id) {
        setAuthUserId(data.user.id);
        addSavedAccount(email, getUserName() || email.split("@")[0]);
      }
      router.push("/welcome");
    } catch { setError("验证失败"); }
    setLoading(false);
  };

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#f8faff" }}>
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col justify-center px-6" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)" }}>
      <div className="max-w-sm mx-auto w-full text-center">
        <div className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-blue-500">Offer</span>
            <span className="text-gray-900">Pilot</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">你的 AI 职业成长伙伴</p>
        </div>

        {/* 记忆账号 */}
        {savedAccounts.length > 0 && !sent && (
          <div className="mb-5 text-left">
            <p className="text-xs text-gray-400 mb-2">登录过的账号</p>
            <div className="space-y-2">
              {savedAccounts.map((a) => (
                <div key={a.email} className="flex items-center bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button onClick={() => sendCode(a.email)}
                    className="flex-1 flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-500">
                      {(a.name || a.email)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{a.email}</p>
                      <p className="text-xs text-gray-400">{a.name || "未命名"}</p>
                    </div>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); removeSavedAccount(a.email); setSavedAccounts(getSavedAccounts()); }}
                    className="px-3 py-3 text-gray-300 hover:text-red-400 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3L11 11M3 11L11 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-300 mt-3">或使用其他邮箱登录</p>
          </div>
        )}

        {!sent ? (
          <div className="space-y-3 text-left">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
              <label className="block text-xs text-gray-400 mb-1.5">邮箱地址</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email"
                className="w-full text-lg text-gray-900 font-medium bg-transparent placeholder:text-gray-300 focus:outline-none" />
            </div>
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            <button onClick={() => sendCode()} disabled={!email.includes("@") || loading}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-lg rounded-2xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50">
              {loading ? "发送中..." : "发送验证码"}
            </button>
          </div>
        ) : (
          <div className="space-y-3 text-left">
            <div className="text-center mb-2">
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
            <button onClick={() => { setSent(false); setCode(""); }}
              className="w-full py-2 text-sm text-gray-400 text-center">
              重新发送
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
