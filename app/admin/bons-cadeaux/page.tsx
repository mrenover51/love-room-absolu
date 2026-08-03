import Link from "next/link";
import { CircleCheck, Gift, History, ScanLine, WalletCards } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { redeemGift } from "./actions";

export default async function GiftCards(){
  await requireAdmin();
  const {data,count}=await createAdminClient().from("gift_cards").select("id,reference,theme,amount,status,created_at,expires_at",{count:"exact"}).order("created_at",{ascending:false}).limit(50);
  const rows=data??[],active=rows.filter(x=>x.status==="active").length,redeemed=rows.filter(x=>x.status==="redeemed").length,revenue=rows.filter(x=>["active","redeemed"].includes(x.status)).reduce((sum,x)=>sum+x.amount,0);
  const cards:{icon:LucideIcon;label:string;value:string|number}[]=[{icon:Gift,label:"Bons créés",value:count??0},{icon:CircleCheck,label:"Actifs",value:active},{icon:ScanLine,label:"Utilisés",value:redeemed},{icon:WalletCards,label:"Valeur activée",value:`${revenue} €`}];
  return <><AdminPageHeader eyebrow="Bons cadeaux" title="Ventes, validation et utilisation" description="Suivez chaque bon depuis Stripe jusqu’à son utilisation, avec une référence unique et un historique horodaté." actions={<Link href="/bons-cadeaux" className="rounded-full border border-white/15 px-5 py-3 text-sm">Voir la boutique</Link>}/>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({icon:Icon,label,value})=><article key={label} className="rounded-[1.4rem] border border-white/[.08] bg-[#121212] p-5"><Icon className="size-5 text-[#C9A86A]"/><p className="mt-5 text-xs text-white/40">{label}</p><strong className="mt-1 block font-heading text-4xl">{value}</strong></article>)}</section>
    <form action={redeemGift} className="mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-[#C9A86A]/20 bg-[#121212] p-5 sm:flex-row"><input name="reference" required placeholder="ABS-GIFT-2026-XXXXXXXX" className="min-h-12 flex-1 rounded-xl border border-white/10 bg-black px-4 uppercase"/><button className="min-h-12 rounded-xl bg-[#C9A86A] px-6 font-semibold text-black">Valider l’utilisation</button></form>
    <section className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/[.08] bg-[#121212]"><h2 className="flex items-center gap-2 p-6 font-heading text-2xl"><History className="size-5 text-[#C9A86A]"/>Historique récent</h2><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-white/[.03] text-white/35"><tr>{["Référence","Occasion","Montant","Statut","Création","Expiration"].map(x=><th key={x} className="px-5 py-3">{x}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.id} className="border-t border-white/[.06]"><td className="px-5 py-4 text-[#C9A86A]">{row.reference}</td><td>{row.theme}</td><td>{row.amount} €</td><td>{row.status}</td><td>{new Date(row.created_at).toLocaleDateString("fr-FR")}</td><td>{row.expires_at?new Date(row.expires_at).toLocaleDateString("fr-FR"):"—"}</td></tr>)}</tbody></table>{!rows.length&&<p className="p-6 text-sm text-white/40">Aucun bon émis pour le moment.</p>}</div></section>
  </>;
}
