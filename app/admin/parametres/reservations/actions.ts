"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { createAdminClient } from "@/lib/supabase/admin";

const reservationWorkflowSchema = z.object({
  mode: z.enum(["instant", "manual"]),
  paymentExpirationHours: z.coerce.number().int().min(1).max(168),
  minimumAdvanceDays: z.coerce.number().int().min(0).max(30),
});

export async function saveReservationWorkflow(formData: FormData) {
  await requireAdmin();
  const value = reservationWorkflowSchema.parse(Object.fromEntries(formData));
  const { error } = await createAdminClient()
    .from("settings")
    .upsert(
      {
        key: "reservation_workflow",
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
  if (error) throw new Error("RESERVATION_WORKFLOW_SAVE_FAILED");
  await auditAdminAction(
    "setting.update",
    "setting",
    "reservation_workflow",
    value,
  );
  revalidatePath("/admin/parametres/reservations");
  revalidatePath("/reservation");
}
