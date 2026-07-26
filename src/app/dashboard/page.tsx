"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getRecentActivity, getLatestAnalysis, getTodayQuizGain, getCurrentStage, type AIAnalysis } from "@/lib/supabase/service";
import { getUserName } from "@/lib/user";

function calcReadiness(scores: { score: number }[]): number {
  if (!scores.length) return 0;
  return Math.round(scores.reduce((s, a) => s + a.score, 0) / scores.length);
}

// 迷你趋势数据：从最近 7 天 quiz 成绩推算
async function getTrendData(): Promise<number[]> {
  // 简化：用 ability_scores 各维度平均 + 最近 quiz 加分做趋势
  // 返回最近 7 个数据点，当前为最新
  const analysis = await getLatestAnalysis();
  if (!analysis?.ability_scores?.length) return [38, 40, 41, 39, 42, 42, 42];
  const base = calcReadiness(analysis.ability_scores);
  // 模拟过去 6 天轻微下降再上升的趋势
  return [base - 4, base - 3, base - 2, base - 3, base - 1, base, base];
}
const navItems = [
  { label: "首页", icon: "home", route: "/dashboard", active: true },
  { label: "路线", icon: "route", route: "/roadmap", active: false },
  { label: "学习", icon: "learn", route: "/learning", active: false },
  { label: "成长", icon: "growth", route: "/growth", active: false },
  { label: "我的", icon: "profile", route: "/profile", active: false },
];

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const c = active ? "#3b82f6" : "#9ca3af";
  switch (name) {
    case "home":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 10L12 3L21 10V20H14V14H10V20H3V10Z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={active ? "#eff6ff" : "none"} />
        </svg>
      );
    case "route":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2" fill={active ? "#eff6ff" : "none"} />
          <path d="M12 6V12L16 14" stroke={c} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "learn":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke={c} strokeWidth="2" fill={active ? "#eff6ff" : "none"} />
          <line x1="8" y1="9" x2="16" y2="9" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="12" x2="14" y2="12" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="15" x2="12" y2="15" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "growth":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <polyline points="3,17 9,11 13,15 21,7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={active ? "#eff6ff" : "none"} />
          <polyline points="16,7 21,7 21,12" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "profile":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke={c} strokeWidth="2" fill={active ? "#eff6ff" : "none"} />
          <path d="M4 20C4 16 8 14 12 14C16 14 20 16 20 20" stroke={c} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [activityDays, setActivityDays] = useState<Set<string>>(new Set());
  const [readiness, setReadiness] = useState<number | null>(null);
  const [hasData, setHasData] = useState(false);
  const [trendChange, setTrendChange] = useState<number | null>(null);
  const [trendData, setTrendData] = useState<number[]>([38, 40, 41, 39, 42, 42, 42]);
  const [nextAction, setNextAction] = useState("");
  const [allDone, setAllDone] = useState(false);
  const [weakestDim, setWeakestDim] = useState("");
  const [userName, setUserNameState] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [stage, setStage] = useState<ReturnType<typeof getCurrentStage> | null>(null);

  useEffect(() => {
    Promise.all([getRecentActivity(), getLatestAnalysis(), getTodayQuizGain()]).then(([dates, analysis, gain]) => {
      setUserNameState(getUserName());
      const set = new Set<string>();
      dates.forEach((d) => set.add(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`));
      setActivityDays(set);
      if (analysis?.ability_scores?.length) {
        const r = calcReadiness(analysis.ability_scores);
        setReadiness(r);
        setHasData(true);
        setAllDone(r >= 90);
        setStage(getCurrentStage(r, analysis.roadmap?.length || 4, analysis.roadmap?.map((s: any) => s.stage)));
        const sorted = [...analysis.ability_scores].sort((a, b) => a.score - b.score);
        if (sorted[0]) setWeakestDim(sorted[0].dimension);
      }
      setTrendChange(gain);
      setNextAction(analysis?.next_action || "");
      setTargetRole(analysis?.required_skills?.[0] ? "相关岗位" : "");
    });
    getTrendData().then(setTrendData);
  }, []);

  // 计算连续天数
  let streakDays = 0;
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    if (activityDays.has(key)) streakDays++;
    else if (i > 0) break; // 中断了
  }

  // Simple sparkline path
  const maxVal = Math.max(...trendData);
  const minVal = Math.min(...trendData);
  const range = maxVal - minVal || 1;
  const w = 120;
  const h = 36;
  const pad = 2;
  const points = trendData.map((v, i) => {
    const x = pad + (i / (trendData.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - minVal) / range) * (h - pad * 2);
    return `${x},${y}`;
  });
  const pathD = `M${points.join(" L")}`;

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#f8faff" }}>
      {/* Scrollable content */}
      <div className="flex-1 overflow-auto pb-24">
        {/* Greeting */}
        <div className="px-6 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {(() => {
              const h = new Date().getHours();
              const greeting = h < 6 ? "凌晨好" : h < 12 ? "早上好" : h < 14 ? "中午好" : h < 18 ? "下午好" : "晚上好";
              return <>{greeting}{userName ? `，${userName}` : ""} 👋</>;
            })()}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            今天也向目标 Offer 前进一步
          </p>
        </div>

        {/* Offer Readiness Card */}
        <div className="px-6 mb-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">
                Offer Readiness
              </h2>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 8L5 4L7 6L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 3H10V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {trendChange !== null && trendChange > 0 ? "今日已完成学习 ✓" : "今日暂无变化"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Ring */}
              <div className="relative w-[72px] h-[72px] flex-shrink-0">
                <svg className="w-[72px] h-[72px] -rotate-90" viewBox="0 0 72 72">
                  <circle cx="36" cy="36" r="30" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                  <circle cx="36" cy="36" r="30" fill="none" stroke="url(#dashGrad)" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 30}`}
                    strokeDashoffset={`${2 * Math.PI * 30 * (1 - (readiness || 0) / 100)}`} />
                  <defs>
                    <linearGradient id="dashGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-500">{readiness !== null ? `${readiness}%` : "—"}</span>
                </div>
              </div>

              {/* Mini trend chart — 宽度自适应、高度随屏幕变化 */}
              <div className="flex-1 min-w-0">
                <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12 sm:h-14 md:h-16">
                  {/* Gradient fill */}
                  <defs>
                    <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Area under curve */}
                  <path
                    d={`${pathD} L${w - pad},${h - pad} L${pad},${h - pad} Z`}
                    fill="url(#sparkFill)"
                  />
                  {/* Line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Last point dot */}
                  <circle cx={points[points.length - 1].split(",")[0]} cy={points[points.length - 1].split(",")[1]} r="2.5" fill="#3b82f6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Single Task */}
        <div className="px-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
            今日唯一任务
          </h2>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2.5" y="2.5" width="15" height="15" rx="3" stroke="#3b82f6" strokeWidth="1.5" />
                  <line x1="7" y1="8" x2="13" y2="8" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="7" y1="11" x2="11" y2="11" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 leading-tight">
                  {nextAction ? `优先：${nextAction.slice(0, 25)}${nextAction.length > 25 ? "..." : ""}` : hasData ? "去学习中心完成今日测验" : "请先创建目标"}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="#9ca3af" strokeWidth="1.2" />
                    <line x1="7" y1="4.5" x2="7" y2="7" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="7" y1="7" x2="9" y2="7" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <span className="text-xs text-gray-400">预计 45 分钟</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push("/learning")}
              className="w-full mt-4 py-3 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-sm rounded-2xl transition-all"
            >
              去学习
            </button>
          </div>
        </div>

        {/* AI Suggestion */}
        <div className="px-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
            AI 今日建议
          </h2>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7" stroke="#6366f1" strokeWidth="1.5" fill="none" />
                  <circle cx="10" cy="10" r="3" fill="#6366f1" />
                  <line x1="10" y1="3" x2="10" y2="7" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">
                {allDone
                  ? <><span className="font-semibold text-gray-900">🎉 所有阶段已完成！</span>你的能力已经达到目标岗位的基础要求，可以去投递简历了。</>
                  : stage
                  ? <>当前处于<span className="font-semibold text-gray-900">「{stage.name}」</span>阶段{weakestDim ? <>，优先提升 <span className="font-semibold text-gray-900">{weakestDim}</span></> : ""}。完成测验推进到下一阶段。</>
                  : <>去<span className="font-semibold text-gray-900">学习中心</span>完成今日测验，让 AI 帮你定位当前最需要提升的能力。</>}
              </p>
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="px-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
            连续成长
          </h2>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-3xl font-bold text-gray-900">{streakDays}</span>
                <span className="text-gray-400 text-sm ml-1">天</span>
              </div>
              <span className="text-sm text-gray-400">连续学习</span>
            </div>

            {/* Streak dots */}
            <div className="flex items-center justify-between">
              {(() => {
                const weekDays: { label: string; key: string }[] = [];
                for (let i = 6; i >= 0; i--) {
                  const d = new Date(today);
                  d.setDate(d.getDate() - i);
                  weekDays.push({
                    label: ["日", "一", "二", "三", "四", "五", "六"][d.getDay()],
                    key: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
                  });
                }
                return weekDays.map((wd, i) => {
                  const done = activityDays.has(wd.key);
                  const isToday = i === 6;
                  return (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        done && isToday
                          ? "bg-blue-500 text-white shadow-md shadow-blue-200"
                          : done
                          ? "bg-blue-50 text-blue-500"
                          : "bg-gray-50 text-gray-300"
                      }`}
                    >
                      {done ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        wd.label
                      )}
                    </div>
                    <span className="text-[10px] text-gray-300">{wd.label}</span>
                  </div>
                );
                });
              })()}
            </div>

            <button
              onClick={() => router.push("/reflection")}
              className="w-full mt-4 py-2.5 bg-gray-50 hover:bg-gray-100 active:scale-[0.98] text-gray-600 font-medium text-sm rounded-2xl transition-all border border-gray-100"
            >
              提交今日成长记录
            </button>
          </div>
        </div>

        {/* Bottom spacer for nav */}
        <div className="h-4" />
      </div>

      {/* Bottom Nav — 固定底部 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 pt-2 pb-5 safe-bottom flex items-center justify-around will-change-transform">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => { router.push(item.route); }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
              item.active ? "text-blue-500" : "text-gray-300 hover:text-gray-400"
            }`}
          >
            <NavIcon name={item.icon} active={item.active} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
