"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { setAuthUser } from "@/lib/user";

export default function AuthSync() {
  useEffect(() => {
    const c = createClient();
    c.auth.getUser().then(({ data: { user } }) => {
      if (user) setAuthUser(user.id, user.email);
    });
  }, []);
  return null;
}

