import { createAdminClient } from "@/lib/supabase/admin";

const items=[
  ["Demandes",null],
  ["En attente","new"],
  ["Paiement","pending_payment"],
  ["Confirmées","confirmed"],
  ["Refusées","rejected"],
  ["Expirées","expired"],
] as const;
export async function RequestStats(){const{data}=await createAdminClient().from("reservation_requests").select("statut");return <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">{items.map(([label,status])=><article key={label} className="rounded-2xl border border-white/[.07] bg-[#121212] p-4 shadow-lg"><p className="text-[10px] uppercase tracking-[.14em] text-[#B8B2A8]">{label}</p><p className="mt-2 text-2xl font-semibold">{status?(data??[]).filter(row=>row.statut===status).length:data?.length??0}</p></article>)}</section>}
