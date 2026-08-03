"use server";
import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { createAdminClient } from "@/lib/supabase/admin";
export async function planSeoCorrection(formData:FormData){await requireAdmin();const input=z.object({route:z.string().startsWith("/").max(500),type:z.string().max(80),note:z.string().max(500)}).parse(Object.fromEntries(formData)),key=createHash("sha256").update(`${input.route}:${input.type}`).digest("hex");await createAdminClient().from("seo_corrections").upsert({issue_key:key,route:input.route,issue_type:input.type,status:"planned",note:input.note,updated_at:new Date().toISOString()},{onConflict:"issue_key"});await auditAdminAction("seo.correction.plan","seo_issue",key,{route:input.route,type:input.type});revalidatePath("/admin/performance");}
