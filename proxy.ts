import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {updateSession} from "@/lib/supabase/proxy";
import {isLocale} from "@/lib/i18n/config";
import {routeForLocalizedSection} from "@/lib/i18n/routing";
export async function proxy(request:NextRequest){
  if(request.nextUrl.pathname.startsWith("/admin"))return updateSession(request);
  if(request.nextUrl.pathname==="/maintenance")return NextResponse.next();
  const segments=request.nextUrl.pathname.split("/").filter(Boolean),localizedLocale=segments[0];
  if(isLocale(localizedLocale)){
    const valid=segments.length===1||(segments.length===2&&(segments[1]==="recherche"||segments[1]==="reservation"||Boolean(routeForLocalizedSection(localizedLocale,segments[1]))))||(segments.length===3&&segments[1]==="reservation"&&segments[2]==="succes");
    if(!valid)return NextResponse.rewrite(new URL("/_not-found",request.url),{status:404,headers:{"x-robots-tag":"noindex, nofollow"}});
  }
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL??process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY??process.env.SUPABASE_SERVICE_KEY;
  if(url&&key){try{const{data}=await createClient(url,key,{auth:{persistSession:false}}).from("settings").select("value").eq("key","maintenance").maybeSingle();const value=data?.value as {enabled?:boolean}|null;if(value?.enabled)return NextResponse.rewrite(new URL("/maintenance",request.url));}catch{console.error("maintenance_state_unavailable");}}
  const requestHeaders=new Headers(request.headers);
  const segment=request.nextUrl.pathname.split("/")[1];
  requestHeaders.set("x-absolu-locale",isLocale(segment)?segment:"fr");
  return NextResponse.next({request:{headers:requestHeaders}});
}
export const config={matcher:["/admin/:path*","/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|maintenance).*)"]};
