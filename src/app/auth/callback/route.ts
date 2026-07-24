import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      // 统一先进 Welcome
      const response = NextResponse.redirect(`${origin}/welcome`);
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
