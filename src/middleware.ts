import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();

  // /auth/callback 放行
  if (request.nextUrl.pathname.startsWith("/auth/")) return res;

  // 检查 session cookie 是否存在（<1ms，不调 Supabase API）
  const protectedPaths = ["/dashboard", "/analysis", "/roadmap", "/learning", "/growth", "/reflection", "/profile", "/goal", "/assessment"];
  const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));

  if (isProtected) {
    const hasSession = request.cookies.get("sb-wbzrupzghjyuhelycjgr-auth-token");
    if (!hasSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
