"use client";

import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-8 py-14"
      style={{
        background: "linear-gradient(180deg, #f0f4ff 0%, #e8eeff 30%, #fafbff 60%, #ffffff 100%)",
      }}
    >
      {/* Top: Logo */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        {/* Logo Area */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-blue-500">Offer</span>
            <span className="text-gray-900">Pilot</span>
          </h1>
        </div>

        {/* AI Robot Illustration Placeholder */}
        <div className="w-56 h-56 mb-8 relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/10 via-indigo-300/10 to-purple-400/10" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-400/20 via-indigo-400/15 to-purple-400/20 flex items-center justify-center">
            {/* Minimal robot face */}
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              {/* Head */}
              <rect x="16" y="16" width="48" height="42" rx="12" stroke="#6366f1" strokeWidth="2.5" fill="white" fillOpacity="0.6"/>
              {/* Eyes */}
              <circle cx="33" cy="36" r="4" fill="#6366f1"/>
              <circle cx="47" cy="36" r="4" fill="#6366f1"/>
              {/* Mouth */}
              <rect x="30" y="46" width="20" height="4" rx="2" fill="#818cf8"/>
              {/* Antenna */}
              <line x1="40" y1="16" x2="40" y2="6" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="40" cy="5" r="3" fill="#818cf8"/>
            </svg>
          </div>
          {/* Orbiting dots */}
          <div className="absolute top-2 right-4 w-3 h-3 rounded-full bg-blue-400/40 animate-pulse" />
          <div className="absolute bottom-8 left-2 w-2 h-2 rounded-full bg-indigo-400/30 animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute top-10 right-8 w-2.5 h-2.5 rounded-full bg-purple-400/30 animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-3 tracking-tight">
          你的 AI 职业成长伙伴
        </h2>

        {/* Subtitle */}
        <p className="text-gray-500 text-center text-sm leading-relaxed max-w-xs">
          从目标岗位出发，找到每天最重要的一步，<br />持续成长直到 Offer
        </p>
      </div>

      {/* Bottom: CTA */}
      <div className="w-full max-w-sm">
        <button
          onClick={() => router.push("/onboarding")}
          className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-lg rounded-2xl transition-all shadow-lg shadow-blue-200"
        >
          开始创建目标
        </button>
      </div>
    </main>
  );
}
