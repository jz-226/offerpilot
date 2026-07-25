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
        // 恢复上次激活的 goal——但不要覆盖刚切换的值
        if (profile.active_goal_id && !localStorage.getItem("offerpilot_active_goal")) {
          localStorage.setItem("offerpilot_active_goal", String(profile.active_goal_id));
        }
      }
    });
  }, []);
  return null;
}
