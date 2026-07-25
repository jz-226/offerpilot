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

        // 如果没有选中任何目标，自动选第一个
        if (!localStorage.getItem("offerpilot_active_goal")) {
          const { data: goals } = await c.from("user_goals").select("id").eq("user_id", user.id).order("created_at", { ascending: true }).limit(1);
          if (goals?.length) {
            localStorage.setItem("offerpilot_active_goal", String(goals[0].id));
          }
        }
      }
    });
  }, []);
  return null;
}
