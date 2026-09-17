import "server-only";
import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { canRevealKeybox, portalExpired, selectKeyboxCode } from "./eligibility";
import { getGuestExperienceSettings } from "./settings";

const TOKEN=/^[0-9a-f]{64}$/;
export function createGuestPortalToken(){return randomBytes(32).toString("hex")}
export async function ensureGuestPortalToken(reservationId:string,regenerate=false){
  const db=createAdminClient();
  if(!regenerate){const {data}=await db.from("reservations").select("guest_portal_token").eq("id",reservationId).maybeSingle();if(data?.guest_portal_token)return data.guest_portal_token as string}
  for(let attempt=0;attempt<3;attempt++){const token=createGuestPortalToken();const {error}=await db.from("reservations").update({guest_portal_token:token,updated_at:new Date().toISOString()}).eq("id",reservationId);if(!error)return token;if(error.code!=="23505")throw error}
  throw new Error("GUEST_PORTAL_TOKEN_GENERATION_FAILED");
}
export async function getGuestPortal(token:string,now=new Date()){
  if(!TOKEN.test(token))return null;
  const db=createAdminClient(),settings=await getGuestExperienceSettings();
  const {data:r}=await db.from("reservations").select("reference,guest_first_name,guest_last_name,guest_phone,guest_count,check_in,check_out,nights,total,currency,status,payment_status,source,estimated_arrival_time,precheckin_completed_at,guest_rules_accepted_at,reservation_options(label,quantity,total)").eq("guest_portal_token",token).maybeSingle();
  if(!r)return null;
  const expired=portalExpired(r.check_out,settings.guestPortalRetentionDays,now);
  let keyboxCode:string|null=null;
  if(!expired&&canRevealKeybox({now,checkIn:r.check_in,status:r.status,paymentStatus:r.payment_status,source:r.source,checkInTime:settings.checkInTime,leadHours:settings.accessLeadHours})){
    const {data:sensitive}=await db.from("reservations").select("keybox_code").eq("guest_portal_token",token).maybeSingle();
    keyboxCode=selectKeyboxCode(sensitive?.keybox_code,settings.defaultKeyboxCode).code;
  }
  return {reservation:r,settings,expired,keyboxCode};
}
