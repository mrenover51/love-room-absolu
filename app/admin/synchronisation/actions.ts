"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncAllCalendars } from "@/lib/calendar/sync";

export async function syncCalendarsNow(){await requireAdmin();await syncAllCalendars("sync-all");await auditAdminAction("calendar.sync","calendar");revalidatePath("/admin/synchronisation");revalidatePath("/admin/calendrier")}
export async function resolveCalendarConflict(formData:FormData){await requireAdmin();const parsed=z.object({id:z.uuid(),note:z.string().trim().min(3).max(500),resolution_kind:z.enum(["resolved","technical_duplicate","channel_mirror"])}).parse(Object.fromEntries(formData));const{error}=await createAdminClient().from("calendar_conflicts").update({status:"resolved",resolution_note:parsed.note,resolution_kind:parsed.resolution_kind,resolved_at:new Date().toISOString()}).eq("id",parsed.id).eq("status","open");if(error)throw new Error("CONFLICT_RESOLUTION_FAILED");await auditAdminAction("calendar.conflict.resolve","calendar_conflict",parsed.id,{resolutionKind:parsed.resolution_kind});revalidatePath("/admin/synchronisation")}
