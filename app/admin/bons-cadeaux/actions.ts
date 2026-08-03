"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { createAdminClient } from "@/lib/supabase/admin";
export async function redeemGift(formData:FormData){await requireAdmin();const reference=z.string().trim().toUpperCase().regex(/^ABS-GIFT-\d{4}-[A-F0-9]{8}$/).parse(formData.get("reference"));const now=new Date().toISOString(),{data,error}=await createAdminClient().from("gift_cards").update({status:"redeemed",redeemed_at:now,updated_at:now}).eq("reference",reference).eq("status","active").gt("expires_at",now).select("id").maybeSingle();if(error||!data)throw new Error("Bon introuvable, expiré ou déjà utilisé.");await auditAdminAction("gift.redeem","gift_card",data.id,{reference});revalidatePath("/admin/bons-cadeaux");}
