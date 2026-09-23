"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendGuestCommunicationTest } from "@/lib/email";
import { getGuestEmailPreviewData } from "@/lib/guest-portal/email-preview";
import { getGuestExperienceSettings } from "@/lib/guest-portal/settings";
const text=z.string().trim().max(5000),url=z.union([z.literal(""),z.url().max(2048)]),schema=z.object({address:text.min(5),phone:text.max(30),email:z.email(),checkInTime:z.string().regex(/^\d{2}:\d{2}$/),checkOutTime:z.string().regex(/^\d{2}:\d{2}$/),accessLeadHours:z.coerce.number().int().min(1).max(168),defaultKeyboxCode:text.max(32),accessInstructions:text,parkingInstructions:text,keyboxInstructions:text,wifiName:text.max(100),wifiPassword:text.max(200),checkoutInstructions:text,houseRules:text,balneoInstructions:text,saunaInstructions:text,tvInstructions:text,kitchenInstructions:text,coffeeInstructions:text,climateInstructions:text,facadeImageUrl:url,entranceImageUrl:url,keyboxImageUrl:url,googleReviewUrl:url,guestPortalRetentionDays:z.coerce.number().int().min(1).max(30)});
export async function saveGuestExperience(formData:FormData){await requireAdmin();const value={...schema.parse(Object.fromEntries(formData)),smsEnabled:false};const{error}=await createAdminClient().from("settings").upsert({key:"guest_experience",value,updated_at:new Date().toISOString()},{onConflict:"key"});if(error)throw new Error("Paramètres impossibles à enregistrer");await auditAdminAction("setting.update","setting","guest_experience",{...value,defaultKeyboxCode:value.defaultKeyboxCode?'configured':'',wifiPassword:value.wifiPassword?'configured':''});revalidatePath("/admin/parametres/experience-client")}

export type TestEmailActionState = { ok: boolean; message: string };
export async function sendGuestEmailTest(
  _state: TestEmailActionState,
  formData: FormData,
): Promise<TestEmailActionState> {
  await requireAdmin();
  const type = z.enum(["confirmation", "access_48h"]).safeParse(formData.get("type"));
  if (!type.success) return { ok: false, message: "Type d’email test invalide." };
  try {
    const settings = await getGuestExperienceSettings();
    await sendGuestCommunicationTest(getGuestEmailPreviewData(type.data, settings));
    return { ok: true, message: "Email test envoyé à love.room.absolu@gmail.com" };
  } catch {
    console.error("admin_guest_email_test_failed", { type: type.data });
    return { ok: false, message: "Impossible d’envoyer l’email test. Réessayez plus tard." };
  }
}
