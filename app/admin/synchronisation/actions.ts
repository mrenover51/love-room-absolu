"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncAllCalendars } from "@/lib/calendar/sync";

export async function syncCalendarsNow(){await requireAdmin();await syncAllCalendars();await auditAdminAction("calendar.sync","calendar");revalidatePath("/admin/synchronisation");revalidatePath("/admin/calendrier")}
export async function resolveCalendarConflict(formData:FormData){await requireAdmin();const id=z.uuid().parse(formData.get("id")),note=z.string().trim().min(3).max(500).parse(formData.get("note"));const{error}=await createAdminClient().from("calendar_conflicts").update({status:"resolved",resolution_note:note,resolved_at:new Date().toISOString()}).eq("id",id).eq("status","open");if(error)throw new Error("CONFLICT_RESOLUTION_FAILED");await auditAdminAction("calendar.conflict.resolve","calendar_conflict",id);revalidatePath("/admin/synchronisation")}
