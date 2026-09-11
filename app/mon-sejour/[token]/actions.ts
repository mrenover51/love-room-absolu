"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
const schema=z.object({token:z.string().regex(/^[0-9a-f]{64}$/),firstName:z.string().trim().min(1).max(100),lastName:z.string().trim().min(1).max(100),phone:z.string().trim().min(6).max(30),guestCount:z.coerce.number().int().min(1).max(2),estimatedArrivalTime:z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),rulesAccepted:z.literal("on")});
export async function completePrecheckin(formData:FormData){
  const input=schema.parse(Object.fromEntries(formData)),db=createAdminClient(),now=new Date().toISOString();
  const {data,error}=await db.from("reservations").update({guest_first_name:input.firstName,guest_last_name:input.lastName,guest_phone:input.phone,guest_count:input.guestCount,estimated_arrival_time:input.estimatedArrivalTime,precheckin_completed_at:now,guest_rules_accepted_at:now,updated_at:now}).eq("guest_portal_token",input.token).eq("status","confirmed").select("reference").maybeSingle();
  if(error||!data)throw new Error("Le pré-check-in n’a pas pu être enregistré.");
  revalidatePath(`/mon-sejour/${input.token}`);
}

