import "server-only";
import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { lookup } from "node:dns/promises";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseIcal, type CalendarSource } from "@/lib/booking/ical";

export type SyncResult={source:CalendarSource;status:"ok"|"failed"|"skipped";events:number;imported:number;updated:number;cancelled:number;conflicts:number;durationMs:number;error?:string};
const supportedSources:CalendarSource[]=["booking","airbnb"];
const MAX_ICAL_BYTES=2_000_000;
const MAX_EVENTS=500;

export function validateCalendarUrl(raw:string){
  let url:URL;
  try{url=new URL(raw)}catch{throw new Error("ICAL_URL_INVALID")}
  if(url.protocol!=="https:")throw new Error("ICAL_URL_HTTPS_REQUIRED");
  if(url.username||url.password)throw new Error("ICAL_URL_CREDENTIALS_FORBIDDEN");
  const host=url.hostname.toLowerCase();
  if(host===["local","host"].join("")||host.endsWith(".local")||host.endsWith(".internal")||isIP(host)!==0||host==="0.0.0.0")throw new Error("ICAL_URL_HOST_FORBIDDEN");
  return url.toString();
}

function privateAddress(address:string){if(address==="::1"||address.startsWith("fe80:")||address.startsWith("fc")||address.startsWith("fd"))return true;const parts=address.split(".").map(Number);if(parts.length!==4)return false;return parts[0]===10||parts[0]===127||parts[0]===0||(parts[0]===169&&parts[1]===254)||(parts[0]===172&&(parts[1]??0)>=16&&(parts[1]??0)<=31)||(parts[0]===192&&parts[1]===168)}
async function assertPublicDns(rawUrl:string){const host=new URL(rawUrl).hostname,addresses=await lookup(host,{all:true,verbatim:true});if(!addresses.length||addresses.some(item=>privateAddress(item.address)))throw new Error("ICAL_URL_DNS_FORBIDDEN")}

export async function downloadCalendar(rawUrl:string,source:CalendarSource){
  const url=validateCalendarUrl(rawUrl);await assertPublicDns(url);const response=await fetch(url,{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(10_000),headers:{accept:"text/calendar,text/plain;q=0.8","user-agent":"LoveRoomAbsolu-ChannelManager/1.0"}});
  if(!response.ok)throw new Error(`ICAL_HTTP_${response.status}`);
  const length=Number(response.headers.get("content-length")??0);if(length>MAX_ICAL_BYTES)throw new Error("ICAL_TOO_LARGE");
  const content=await response.text();if(new TextEncoder().encode(content).byteLength>MAX_ICAL_BYTES)throw new Error("ICAL_TOO_LARGE");
  if(!content.includes("BEGIN:VCALENDAR")||!content.includes("END:VCALENDAR"))throw new Error("ICAL_FORMAT_INVALID");
  const events=parseIcal(content,source);if(events.length>MAX_EVENTS)throw new Error("ICAL_TOO_MANY_EVENTS");
  return events;
}

const externalReference=(source:CalendarSource,uid:string)=>`EXT-${source.slice(0,3).toUpperCase()}-${createHash("sha256").update(uid).digest("hex").slice(0,12).toUpperCase()}`;
const overlaps=(a:{start:string;end:string},b:{start:string;end:string})=>a.start<b.end&&a.end>b.start;

async function recordNotification(kind:string,title:string,message:string){const db=createAdminClient();await db.from("notifications").insert({kind,title,message});}

export async function syncExternalCalendar(source:CalendarSource,url:string):Promise<SyncResult>{
  const started=Date.now(),db=createAdminClient();
  try{
    const incoming=await downloadCalendar(url,source),now=new Date().toISOString(),uids=incoming.map(event=>event.uid);
    const [{data:existing,error:existingError},{data:occupied,error:occupiedError}]=await Promise.all([
      db.from("reservations").select("id,ical_uid,check_in,check_out,status").eq("provider",source),
      db.from("reservations").select("id,reference,provider,check_in,check_out,status").neq("provider",source).in("status",["confirmed","pending_payment"])
    ]);
    if(existingError||occupiedError)throw new Error("ICAL_DATABASE_READ_FAILED");
    let imported=0,updated=0,conflicts=0;
    for(const event of incoming){
      const current=existing?.find(row=>row.ical_uid===event.uid);
      const conflict=(occupied??[]).find(row=>overlaps(event,{start:row.check_in,end:row.check_out}));
      const syncStatus=conflict?"conflict":"synced";
      const payload={check_in:event.start,check_out:event.end,nights:Math.max(1,Math.round((Date.parse(`${event.end}T00:00:00Z`)-Date.parse(`${event.start}T00:00:00Z`))/86_400_000)),status:event.cancelled?"cancelled":"confirmed",source,provider:source,external_id:event.uid,ical_uid:event.uid,last_sync:now,sync_status:syncStatus,updated_at:now};
      let reservationId:string;
      if(current){const{error}=await db.from("reservations").update(payload).eq("id",current.id);if(error)throw new Error("ICAL_RESERVATION_UPDATE_FAILED");reservationId=current.id;updated+=1}
      else{const{data,error}=await db.from("reservations").insert({...payload,reference:externalReference(source,event.uid),guest_first_name:source==="booking"?"Voyageur Booking":"Voyageur Airbnb",guest_last_name:"(iCal)",guest_email:`ical-${createHash("sha256").update(event.uid).digest("hex").slice(0,16)}@invalid.local`,guest_phone:"Non transmis",guest_count:2,subtotal:0,extras_total:0,taxes:0,total:0,currency:"eur",payment_status:"paid"}).select("id").single();if(error)throw new Error("ICAL_RESERVATION_INSERT_FAILED");reservationId=data.id;imported+=1;await recordNotification("calendar","Nouvelle rÃ©servation",`Nouvelle rÃ©servation ${source} importÃ©e du ${event.start} au ${event.end}.`)}
      await db.from("calendar_blocks").upsert({provider:source,external_id:event.uid,ical_uid:event.uid,start_date:event.start,end_date:event.end,summary:event.summary,status:event.cancelled?"cancelled":"confirmed",last_sync:now},{onConflict:"provider,ical_uid"});
      if(conflict&&!event.cancelled){conflicts+=1;const{data:openConflict}=await db.from("calendar_conflicts").select("id").eq("provider",source).eq("start_date",event.start).eq("end_date",event.end).eq("status","open").maybeSingle();if(!openConflict){await db.from("calendar_conflicts").insert({primary_reservation_id:conflict.id,conflicting_reservation_id:reservationId,provider:source,start_date:event.start,end_date:event.end,status:"open"});await recordNotification("warning","Conflit dÃ©tectÃ©",`${source} chevauche ${conflict.reference} du ${event.start} au ${event.end}.`)}}
    }
    let cancelled=0;for(const row of existing??[]){if(row.ical_uid&&!uids.includes(row.ical_uid)&&row.status!=="cancelled"){const{error}=await db.from("reservations").update({status:"cancelled",sync_status:"cancelled",last_sync:now,updated_at:now}).eq("id",row.id);if(!error){cancelled+=1;await db.from("calendar_blocks").update({status:"cancelled",last_sync:now}).eq("provider",source).eq("ical_uid",row.ical_uid)}}}
    const result={source,status:"ok" as const,events:incoming.length,imported,updated,cancelled,conflicts,durationMs:Date.now()-started};
    await db.from("calendar_sources").update({status:"ok",last_sync:now,last_error:null,imported_count:incoming.length,updated_at:now}).eq("provider",source);
    await db.from("sync_logs").insert({source,status:"success",events_count:incoming.length,imported_count:imported,updated_count:updated,cancelled_count:cancelled,conflict_count:conflicts,duration_ms:result.durationMs});
    await recordNotification("success","Synchronisation rÃ©ussie",`${source} : ${incoming.length} rÃ©servation(s) traitÃ©e(s).`);return result;
  }catch(error){const message=error instanceof Error?error.message:"ICAL_UNKNOWN_ERROR",durationMs=Date.now()-started;await db.from("calendar_sources").update({status:"error",last_error:message,updated_at:new Date().toISOString()}).eq("provider",source);await db.from("sync_logs").insert({source,status:"failed",events_count:0,error_code:message.slice(0,80),error_message:message.slice(0,500),duration_ms:durationMs});await recordNotification("error","Synchronisation Ã©chouÃ©e",`${source} : ${message}.`);return{source,status:"failed",events:0,imported:0,updated:0,cancelled:0,conflicts:0,durationMs,error:message}}
}

export async function syncAllCalendars(){const db=createAdminClient(),{data,error}=await db.from("calendar_sources").select("provider,import_url,enabled").in("provider",supportedSources);if(error)throw new Error("CALENDAR_SOURCES_READ_FAILED");const configured=new Map((data??[]).map(row=>[row.provider,row]));const results:SyncResult[]=[];for(const source of supportedSources){const item=configured.get(source),fallback=source==="booking"?(process.env.BOOKING_ICAL_URL??process.env.BOOKING_ICAL):(process.env.AIRBNB_ICAL_URL??process.env.AIRBNB_ICAL);const url=item?.import_url??fallback;if(!url||(Boolean(item?.import_url)&&item?.enabled===false)){results.push({source,status:"skipped",events:0,imported:0,updated:0,cancelled:0,conflicts:0,durationMs:0});continue}results.push(await syncExternalCalendar(source,url))}return results}

export async function testCalendar(source:CalendarSource,url:string){const started=Date.now(),events=await downloadCalendar(url,source);return{source,valid:true,events:events.length,durationMs:Date.now()-started,firstEvent:events[0]??null}}

