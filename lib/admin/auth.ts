import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const requireAdmin = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/connexion");
  const { data } = await supabase.from("admin_profiles").select("role").eq("user_id", user.id).single();
  if (!data || !["admin", "owner"].includes(data.role)) redirect("/admin/connexion?error=unauthorized");
  return { user, role: data.role };
});
