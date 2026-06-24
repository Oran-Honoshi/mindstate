import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = [
  "/shell",
  "/lobby",
  "/stages",
  "/play",
  "/complete",
  "/profile",
  "/settings",
  "/family",
  "/daily",
  "/leaderboard",
  "/games",
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  if (session && (pathname === "/auth/signin" || pathname === "/auth/signup" || pathname === "/auth/login" || pathname === "/auth/register")) {
    return NextResponse.redirect(new URL("/shell", req.url))
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sparky|assets|icons).*)"],
}
