import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return request.nextUrl.pathname === "/admin/connexion" ? NextResponse.next() : NextResponse.redirect(new URL("/admin/connexion?error=not-configured", request.url));
  }
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => request.cookies.getAll(), setAll: (items) => { items.forEach(({ name, value }) => request.cookies.set(name, value)); response = NextResponse.next({ request }); items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); } },
  });
  const { data } = await supabase.auth.getClaims();
  if (request.nextUrl.pathname.startsWith("/admin") && request.nextUrl.pathname !== "/admin/connexion" && !data?.claims) return NextResponse.redirect(new URL("/admin/connexion", request.url));
  return response;
}
