"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CleanPage() {
  const router = useRouter();
  const [done, setDone] = useState(false);

  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
    // 清所有 cookie
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    setDone(true);
    setTimeout(() => router.push("/login"), 1500);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "#f8faff" }}>
      <div className="text-center">
        <div className="text-3xl mb-3">{done ? "🧹" : "⏳"}</div>
        <p className="text-gray-600">{done ? "已清空，跳转登录页..." : "清理中..."}</p>
      </div>
    </main>
  );
}
