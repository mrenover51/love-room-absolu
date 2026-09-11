"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { createAdminClient } from "@/lib/supabase/admin";
const text=z.string().trim().max(5000),url=z.union([z.literal(""),z.url().max(2048)]),schema=z.object({address:text.min(5),phone:text.max(30),email:z.email(),checkInTime:z.string().regex(/^\d{2}:\d{2}$/),checkOutTime:z.string().regex(/^\d{2}:\d{2}$/),keyboxRevealTime:z.string().regex(/^\d{2}:\d{2}$/),defaultKeyboxCode:text.max(32),accessInstructions:text,parkingInstructions:text,keyboxInstructions:text,wifiName:text.max(100),wifiPassword:text.max(200),checkoutInstructions:text,houseRules:text,balneoInstructions:text,saunaInstructions:text,tvInstructions:text,kitchenInstructions:text,coffeeInstructions:text,climateInstructions:text,facadeImageUrl:url,entranceImageUrl:url,keyboxImageUrl:url,googleReviewUrl:url,guestPortalRetentionDays:z.coerce.number().int().min(1).max(30)});
export async function saveGuestExperience(formData:FormData){await requireAdmin();const value={...schema.parse(Object.fromEntries(formData)),smsEnabled:false};const{error}=await createAdminClient().from("settings").upsert({key:"guest_experience",value,updated_at:new Date().toISOString()},{onConflict:"key"});if(error)throw new Error("Paramètres impossibles à enregistrer");await auditAdminAction("setting.update","setting","guest_experience",{...value,defaultKeyboxCode:value.defaultKeyboxCode?'configured':'',wifiPassword:value.wifiPassword?'configured':''});revalidatePath("/admin/parametres/experience-client")}

