"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { setAuthUserId } from "@/lib/user";

export default function AuthSync() {
  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) setAuthUserId(user.id);
    });
  }, []);
  return null;
}
