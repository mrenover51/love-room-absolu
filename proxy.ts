import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {updateSession} from "@/lib/supabase/proxy";
const supported=["fr","en","de","nl","es","it"];
function preferredLocale(request:NextRequest){const saved=request.cookies.get("absolu-locale")?.value;if(saved&&supported.includes(saved))return saved;const requested=request.headers.get("accept-language")?.toLowerCase()??"";return supported.find(locale=>requested.split(",").some(value=>value.trim().startsWith(locale)))??"fr";}
export async function proxy(request:NextRequest){
  if(request.nextUrl.pathname.startsWith("/admin"))return updateSession(request);
  if(request.nextUrl.pathname==="/"&&!/bot|crawl|spider|google|bing/i.test(request.headers.get("user-agent")??"")){const destination=request.nextUrl.clone();destination.pathname=`/${preferredLocale(request)}`;return NextResponse.redirect(destination);}
  if(request.nextUrl.pathname==="/maintenance")return NextResponse.next();
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL??process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY??process.env.SUPABASE_SERVICE_KEY;
  if(url&&key){try{const{data}=await createClient(url,key,{auth:{persistSession:false}}).from("settings").select("value").eq("key","maintenance").maybeSingle();const value=data?.value as {enabled?:boolean}|null;if(value?.enabled)return NextResponse.rewrite(new URL("/maintenance",request.url));}catch{console.error("maintenance_state_unavailable");}}
  return NextResponse.next();
}
export const config={matcher:["/admin/:path*","/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|maintenance).*)"]};
