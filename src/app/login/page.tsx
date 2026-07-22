"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const sendCode = () => {
    if (phone.length < 11) return;
    setCodeSent(true);
    setCountdown(60);
    // MVP: 不接真实短信，模拟发送
  };

  const handleLogin = () => {
    if (phone.length >= 11 && code.length >= 4) {
      router.push("/welcome");
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-between px-6 py-10" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)" }}>
      {/* Top */}
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-blue-500">Offer</span>
            <span className="text-gray-900">Pilot</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">你的 AI 职业成长伙伴</p>
        </div>

        {/* Phone login */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                placeholder="输入手机号"
                type="tel"
                className="flex-1 text-lg text-gray-900 font-medium bg-transparent placeholder:text-gray-300 focus:outline-none px-5 py-4"
              />
              <div className="w-px h-8 bg-gray-100" />
              <button
                onClick={sendCode}
                disabled={phone.length < 11 || countdown > 0}
                className="px-4 py-4 text-sm font-medium text-blue-500 disabled:text-gray-300 whitespace-nowrap transition-all"
              >
                {countdown > 0 ? `${countdown}s` : codeSent ? "重新发送" : "获取验证码"}
              </button>
            </div>
            {codeSent && (
              <>
                <div className="h-px bg-gray-50" />
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="输入验证码"
                  type="text"
                  className="w-full text-lg text-gray-900 font-medium bg-transparent placeholder:text-gray-300 focus:outline-none px-5 py-4"
                />
              </>
            )}
          </div>

          <button
            onClick={handleLogin}
            disabled={phone.length < 11 || code.length < 4}
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-lg rounded-2xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            登录
          </button>
        </div>

        {/* Skip */}
        <button
          onClick={() => router.push("/welcome")}
          className="w-full mt-6 py-3 text-gray-300 hover:text-gray-400 text-sm transition-colors"
        >
          跳过登录，先体验
        </button>
      </div>

      {/* Bottom */}
      <p className="text-center text-[10px] text-gray-300 mt-6">
        登录即表示同意服务条款和隐私政策
      </p>
    </main>
  );
}
