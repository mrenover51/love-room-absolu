import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function isAdminRequest(){const supabase=await createSupabaseServerClient(),{data:{user}}=await supabase.auth.getUser();if(!user)return false;const{data}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();return Boolean(data&&["admin","owner"].includes(data.role))}
