"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { setAuthUser, setProfileNickname } from "@/lib/user";

function randomNickname() {
  return "User_" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export default function AuthSync() {
  useEffect(() => {
    // 缓存：同一次会话内不重复查 Supabase
    if (sessionStorage.getItem("auth_synced")) return;
    const c = createClient();
    c.auth.getUser().then(async ({ data: { user } }) => {
      if (user) sessionStorage.setItem("auth_synced", "1");
      if (!user) return;
      setAuthUser(user.id, user.email);

      // 检查/创建 user_profile
      const { data: profile } = await c.from("user_profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (!profile) {
        const nick = randomNickname();
        await c.from("user_profiles").insert({ user_id: user.id, nickname: nick });
        setProfileNickname(nick);
        if (user.email) { const { addSavedAccount } = await import("@/lib/user"); addSavedAccount(user.email, nick); }
      } else {
        const nick = profile.nickname || "User";
        setProfileNickname(nick);
        if (user.email) { const { addSavedAccount } = await import("@/lib/user"); addSavedAccount(user.email, nick); }
        // 同步更新记忆账号列表中的昵称
        if (nick !== "User" && user.email) {
          const { addSavedAccount } = await import("@/lib/user");
          addSavedAccount(user.email, nick);
        }

        // 如果没有选中任何目标
        if (!localStorage.getItem("offerpilot_active_goal")) {
          const { data: goals, count } = await c.from("user_goals").select("id", { count: "exact" }).eq("user_id", user.id);
          if (!goals?.length) return; // 无目标，等用户创建
          // 自动激活第一个目标（无选择时）
          localStorage.setItem("offerpilot_active_goal", String(goals[0].id));
        }
      }
    });
  }, []);
  return null;
}
