"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setUserName } from "@/lib/user";

export default function WelcomePage() {
  const router = useRouter();
  const [name, setName] = useState("");

  const handleNext = () => {
    if (name.trim()) setUserName(name.trim());
    router.push("/onboarding");
  };

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

        <button
          onClick={handleNext}
          className="w-full mt-4 py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-lg rounded-2xl transition-all shadow-lg shadow-blue-200"
        >
          开始使用
        </button>

        <button
          onClick={() => router.push("/onboarding")}
          className="w-full mt-3 py-3 text-gray-300 hover:text-gray-400 text-sm transition-colors"
        >
          跳过，先体验
        </button>
      </div>
    </main>
  );
}
