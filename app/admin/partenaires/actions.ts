"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/lib/site-config";
const slug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const schema = z.object({
  name: z.string().trim().min(2).max(120),
  category: z.enum([
    "restaurant",
    "champagne",
    "photographe",
    "spa",
    "massage",
    "activite",
  ]),
  description: z.string().trim().min(80).max(5000),
  city: z.string().trim().min(2).max(100),
  website_url: z.url(),
  contact_email: z.email().optional().or(z.literal("")),
});
export async function createPartner(formData: FormData) {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await createAdminClient()
    .from("partners")
    .insert({
      ...parsed.data,
      contact_email: parsed.data.contact_email || null,
      slug: slug(parsed.data.name),
    });
  revalidatePath("/admin/partenaires");
}
export async function updatePartner(formData: FormData) {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  const status = z
    .enum(["prospect", "contacted", "verified", "published", "declined"])
    .safeParse(formData.get("status"));
  if (!id.success || !status.success) return;
  await createAdminClient()
    .from("partners")
    .update({
      status: status.data,
      ...(status.data === "published"
        ? { published_at: new Date().toISOString() }
        : {}),
    })
    .eq("id", id.data);
  revalidatePath("/admin/partenaires");
  revalidatePath("/partenaires");
}
export async function verifyBacklink(formData: FormData) {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  const target = z.url().safeParse(formData.get("backlink_url"));
  if (!id.success || !target.success) return;
  let verified = false;
  try {
    const response = await fetch(target.data, {
      headers: { "user-agent": "AbsoluBacklinkVerifier/1.0" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    const html = await response.text();
    verified =
      response.ok &&
      html
        .toLowerCase()
        .includes(siteConfig.url.replace(/^https?:\/\//, "").toLowerCase());
  } catch {}
  await createAdminClient()
    .from("partners")
    .update({
      backlink_url: target.data,
      reciprocal_status: verified ? "verified" : "lost",
      last_checked_at: new Date().toISOString(),
    })
    .eq("id", id.data);
  revalidatePath("/admin/partenaires");
}
