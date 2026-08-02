"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { createAdminClient } from "@/lib/supabase/admin";
const schema=z.object({checkIn:z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),checkOut:z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),earlyCheckInFee:z.coerce.number().min(0).max(10000),lateCheckOutFee:z.coerce.number().min(0).max(10000)});
export async function saveStaySettings(formData:FormData){await requireAdmin();const parsed=schema.parse(Object.fromEntries(formData)),value={...parsed,earlyCheckInEnabled:formData.get("earlyCheckInEnabled")==="on",lateCheckOutEnabled:formData.get("lateCheckOutEnabled")==="on"};const{error}=await createAdminClient().from("settings").upsert({key:"times",value,updated_at:new Date().toISOString()},{onConflict:"key"});if(error)throw new Error("Les horaires n’ont pas pu être enregistrés.");await auditAdminAction("setting.update","setting","times",value);["/","/reservation","/contact","/faq","/conditions","/admin","/admin/parametres/horaires"].forEach(path=>revalidatePath(path))}
