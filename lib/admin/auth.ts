import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const requireAdmin = cache(async () => {
  const supabase = await createSupabaseServerClient();

  // Vérifie la session utilisateur
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/connexion");
  }

  // Vérifie le rôle administrateur
  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    !["admin", "owner"].includes(profile.role)
  ) {
    redirect("/admin/connexion?error=unauthorized");
  }

  return {
    user,
    role: profile.role as "admin" | "owner",
  };
});