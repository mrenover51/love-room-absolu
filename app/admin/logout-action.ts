"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function logoutAdmin() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("admin_logout_failed", {
      message: error.message,
      status: error.status,
      code: error.code,
    });
    throw new Error("ADMIN_LOGOUT_FAILED");
  }
  redirect("/admin/connexion");
}
