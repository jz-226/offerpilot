"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TestDonePage() {
  const router = useRouter();
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const uid = localStorage.getItem("offerpilot_user_id") || "test";
      const res = await fetch("/api/test-reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid }) });
      if (res.ok) setDone(true);
    })();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "#f8faff" }}>
      <div className="text-center px-6">
        <div className="text-4xl mb-4">{done ? "🎉" : "⏳"}</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{done ? "已全部设为 100%！" : "写入中..."}</h1>
        <p className="text-sm text-gray-400 mb-6">{done ? "现在去看看 Dashboard、Roadmap、Growth 吧" : "正在插入满分数据..."}</p>
        {done && (
          <div className="flex flex-col gap-2">
            <button onClick={() => router.push("/dashboard")} className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-2xl">看 Dashboard</button>
            <button onClick={() => router.push("/roadmap")} className="px-8 py-3 bg-indigo-500 text-white font-semibold rounded-2xl">看 Roadmap</button>
            <button onClick={() => router.push("/growth")} className="px-8 py-3 bg-emerald-500 text-white font-semibold rounded-2xl">看 Growth</button>
            <p className="text-xs text-gray-300 mt-4">不影响你原来的数据，创建新目标就会覆盖</p>
          </div>
        )}
      </div>
    </main>
  );
}
