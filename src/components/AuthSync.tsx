"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { setAuthUser, setProfileNickname } from "@/lib/user";

function randomNickname() {
  return "User_" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export default function AuthSync() {
  useEffect(() => {
    const c = createClient();
    c.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setAuthUser(user.id, user.email);

      // 检查/创建 user_profile
      const { data: profile } = await c.from("user_profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (!profile) {
        const nick = randomNickname();
        await c.from("user_profiles").insert({ user_id: user.id, nickname: nick });
        setProfileNickname(nick);
      } else {
        setProfileNickname(profile.nickname || "User");

        // 如果没有选中任何目标
        if (!localStorage.getItem("offerpilot_active_goal")) {
          const { data: goals, count } = await c.from("user_goals").select("id", { count: "exact" }).eq("user_id", user.id);
          if (!goals?.length) return; // 无目标，等用户创建
          if (count === 1) {
            // 只有一个目标 → 自动激活
            localStorage.setItem("offerpilot_active_goal", String(goals[0].id));
          }
          // 多个目标 → 不静默选择，用户到 Welcome 选
        }
      }
    });
  }, []);
  return null;
}
