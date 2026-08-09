"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { createAdminClient } from "@/lib/supabase/admin";
export async function updateCustomerProfile(formData: FormData) {
  await requireAdmin();
  const input = z
    .object({
      id: z.uuid(),
      origin: z.enum(["site", "booking", "airbnb", "manual"]),
      city: z.string().trim().max(100).optional(),
      country: z.string().trim().max(100).optional(),
      private_notes: z.string().trim().max(5000).optional(),
      is_returning: z.coerce.boolean().default(false),
      birthday: z.union([z.iso.date(), z.literal("")]).optional(),
      loyalty_tier: z.enum(["member", "privilege", "signature"]),
      loyalty_points: z.coerce.number().int().min(0).max(1000000),
    })
    .parse(Object.fromEntries(formData));
  const { error } = await createAdminClient()
    .from("customers")
    .update({
      origin: input.origin,
      city: input.city || null,
      country: input.country || null,
      private_notes: input.private_notes || null,
      is_returning: input.is_returning,
      birthday: input.birthday || null,
      loyalty_tier: input.loyalty_tier,
      loyalty_points: input.loyalty_points,
    })
    .eq("id", input.id);
  if (error) throw new Error("CUSTOMER_UPDATE_FAILED");
  await auditAdminAction("customer.update", "customer", input.id);
  revalidatePath(`/admin/clients/${input.id}`);
}
