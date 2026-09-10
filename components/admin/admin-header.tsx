import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { logoutAdmin } from "@/app/admin/logout-action";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AdminHeader() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090909]/90 px-5 py-4 backdrop-blur-xl"><div className="flex items-center justify-between gap-4"><div><Link href="/admin" className="font-heading text-2xl tracking-[.18em]">ABSOLU</Link><span className="ml-3 hidden text-[.65rem] uppercase tracking-widest text-[#C9A86A] sm:inline">Gestion</span></div><div className="flex items-center gap-2 sm:gap-3">{user&&<><span className="hidden max-w-52 truncate text-xs text-white/40 md:block">{user.email}</span><form action={logoutAdmin}><LogoutButton/></form></>}<Link href="/" target="_blank" className="flex min-h-10 items-center gap-2 rounded-full border border-white/10 px-4 text-xs text-white/60 hover:text-white"><span className="hidden sm:inline">Voir le site</span><ExternalLink className="size-3" aria-hidden="true"/></Link></div></div></header>;
}
