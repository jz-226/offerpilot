"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getProfiles, switchProfile, getUserName } from "@/lib/user";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [existingProfiles, setExistingProfiles] = useState(getProfiles());
  const [userName, setUserNameState] = useState("");
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    setExistingProfiles(getProfiles());
    setUserNameState(getUserName());
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const sendCode = () => {
    if (phone.length < 11) return;
    setCodeSent(true);
    setCountdown(60);
  };

  const handleLogin = () => {
    if (phone.length >= 11 && code.length >= 4) {
      router.push("/welcome");
    }
  };

  const isNewUser = existingProfiles.length === 0 || showPhone;

  return (
    <main className="min-h-screen flex flex-col justify-between px-6 py-10" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)" }}>
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-blue-500">Offer</span>
            <span className="text-gray-900">Pilot</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">你的 AI 职业成长伙伴</p>
        </div>

        {/* 老用户档案列表 */}
        {!isNewUser && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-500 text-center">
              {userName ? `${userName}，欢迎回来` : "欢迎回来"}
            </p>
            {existingProfiles.map((p) => (
              <button key={p.id}
                onClick={() => switchProfile(p.id)}
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
            <button onClick={() => router.push("/welcome")}
              className="w-full mt-2 py-3 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold rounded-2xl transition-all shadow-lg shadow-blue-200">
              ＋ 新增目标岗位
            </button>
            <button onClick={() => setShowPhone(true)}
              className="w-full py-3 text-gray-300 hover:text-gray-400 text-sm transition-colors">
              用其他账号登录
            </button>
          </div>
        )}

        {/* 新用户 / 切换账号 */}
        {isNewUser && (
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
            <button onClick={handleLogin} disabled={phone.length < 11 || code.length < 4}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-lg rounded-2xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed">
              登录
            </button>
            <button onClick={() => router.push("/welcome")}
              className="w-full mt-6 py-3 text-gray-300 hover:text-gray-400 text-sm transition-colors">
              跳过登录，先体验
            </button>
          </div>
        )}
      </div>

      <p className="text-center text-[10px] text-gray-300 mt-6">
        登录即表示同意服务条款和隐私政策
      </p>
    </main>
  );
}
