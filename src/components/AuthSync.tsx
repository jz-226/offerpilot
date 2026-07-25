"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { setAuthUserId } from "@/lib/user";

export default function AuthSync() {
  useEffect(() => {
    const c = createClient();
    c.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setAuthUserId(user.id);

        // 查找旧的 guest 数据，迁移到 auth user_id
        const oldGuestId = localStorage.getItem("offerpilot_old_guest_id");
        if (oldGuestId && oldGuestId !== user.id) {
          // 迁移所有表
          const tables = ["user_goals", "user_assessment", "ai_analysis", "quiz_results", "reflections"];
          for (const table of tables) {
            await c.from(table).update({ user_id: user.id }).eq("user_id", oldGuestId);
          }
        }
        // 记录当前 ID 用于下次迁移判断
        localStorage.setItem("offerpilot_old_guest_id", user.id);
      }
    });
  }, []);
  return null;
}

