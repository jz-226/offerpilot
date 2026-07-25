"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { setAuthUserId } from "@/lib/user";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const c = createClient();
    c.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setAuthUserId(user.id);
        router.replace("/welcome"); // 已登录直接进
      } else {
        setChecking(false);
      }
    });
  }, []);

  const sendCode = async () => {
    if (!email.includes("@")) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
      if (data.user?.id) setAuthUserId(data.user.id);
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-blue-500">Offer</span>
            <span className="text-gray-900">Pilot</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">你的 AI 职业成长伙伴</p>
        </div>

        {!sent ? (
          <div className="space-y-3 text-left">
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
