import { NextResponse } from "next/server";
import { z } from "zod";
import { rejectCrossSite } from "@/lib/security/request";
import { conciergeAnswer } from "@/lib/assistant/concierge";
import { createAdminClient } from "@/lib/supabase/admin";
const schema=z.object({query:z.string().trim().min(2).max(500),sessionId:z.uuid(),context:z.object({occasion:z.enum(["anniversaire","saint-valentin","demande-en-mariage","lune-de-miel"]).optional(),checkIn:z.iso.date().optional(),checkOut:z.iso.date().optional(),preferences:z.array(z.string().max(60)).max(10).optional()}).optional()});
const attempts=new Map<string,number[]>();
export async function POST(request:Request){
  if(rejectCrossSite(request))return NextResponse.json({error:"Origine refusée."},{status:403});
  const ip=request.headers.get("x-forwarded-for")?.split(",")[0]??"local",now=Date.now(),recent=(attempts.get(ip)??[]).filter(time=>now-time<60000);if(recent.length>=20)return NextResponse.json({error:"Trop de demandes."},{status:429});attempts.set(ip,[...recent,now]);
  const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Question invalide."},{status:400});
  try{const result=await conciergeAnswer(parsed.data.query,parsed.data.context);try{const db=createAdminClient();await db.from("concierge_sessions").upsert({id:parsed.data.sessionId,occasion:result.occasion??null,preferences:{items:parsed.data.context?.preferences??[]},last_seen_at:new Date().toISOString()},{onConflict:"id"});await db.from("concierge_messages").insert([{session_id:parsed.data.sessionId,role:"user",content:parsed.data.query,intent:result.intent},{session_id:parsed.data.sessionId,role:"assistant",content:result.answer,intent:result.intent}]);}catch{console.error("concierge_memory_unavailable");}return NextResponse.json(result,{headers:{"cache-control":"no-store"}});}catch(error){console.error("concierge_failed",{code:error instanceof Error?error.message.slice(0,80):"UNKNOWN"});return NextResponse.json({error:"Le concierge est temporairement indisponible."},{status:503});}
}
export async function GET(request:Request){const id=z.uuid().safeParse(new URL(request.url).searchParams.get("session"));if(!id.success)return NextResponse.json({messages:[]});try{const{data}=await createAdminClient().from("concierge_messages").select("id,role,content,created_at").eq("session_id",id.data).order("created_at").limit(30);return NextResponse.json({messages:data??[]},{headers:{"cache-control":"private, no-store"}})}catch{return NextResponse.json({messages:[]})}}
