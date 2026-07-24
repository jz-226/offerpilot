import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/auth/verify-otp
 * 校验 Supabase 发的 8 位验证码
 */
export async function POST(req: Request) {
  try {
    const { email, token } = await req.json();
    if (!email || !token) {
      return NextResponse.json({ error: "参数错误" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: "email",
    });

    if (error) {
      return NextResponse.json({ error: "验证码错误或已过期" }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      user: { id: data.user?.id, email: data.user?.email },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
