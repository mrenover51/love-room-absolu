import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAdminEnv } from "@/lib/env";

export function createAdminClient() {
  const env = requireSupabaseAdminEnv();
  return createClient(env.url, env.key, { auth: { persistSession: false, autoRefreshToken: false } });
}
