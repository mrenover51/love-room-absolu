import Image from "next/image";
import Link from "next/link";
import { Crown, Mail, MapPin, Search, UserRound } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

type Customer = { id: string; firstname: string; lastname: string; email: string; phone: string | null; last_reservation: string | null };

export default async function Clients({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const { q = "" } = await searchParams;
  const safe = q.replaceAll(/[,%()]/g, "");
  let query = createAdminClient().from("customers").select("id,firstname,lastname,email,phone,last_reservation").order("last_reservation", { ascending: false }).limit(100);
  if (safe) query = query.or(`firstname.ilike.%${safe}%,lastname.ilike.%${safe}%,email.ilike.%${safe}%`);
  const { data } = await query;
  const customers = (data ?? []) as Customer[];

  return <>
    <AdminPageHeader eyebrow="CRM premium" title="Clients" description="Une vision relationnelle complète, du premier contact à la fidélisation." actions={<a href="/api/admin/export?type=clients" className="rounded-full border border-white/15 px-5 py-3 text-sm transition hover:border-[#C9A86A]/50">Exporter CSV</a>} />
    <section className="mb-6 grid gap-3 sm:grid-cols-3">
      <Metric label="Clients" value={String(customers.length)} />
      <Metric label="Clients avec séjour" value={String(customers.filter((customer) => customer.last_reservation).length)} />
      <Metric label="Profils joignables" value={`${customers.length ? Math.round(customers.filter((customer) => customer.email || customer.phone).length / customers.length * 100) : 0}%`} />
    </section>
    <form className="relative mb-6 max-w-xl">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" aria-hidden="true" />
      <label className="sr-only" htmlFor="q">Rechercher un client</label>
      <input id="q" name="q" defaultValue={q} placeholder="Nom, email ou téléphone…" className="min-h-12 w-full rounded-2xl border border-white/10 bg-[#121212] pl-11 pr-4" />
    </form>
    {customers.length ? <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{customers.map((customer, index) => <Link href={`/admin/clients/${customer.id}`} key={customer.id} className="group rounded-[1.5rem] border border-white/[.08] bg-gradient-to-br from-white/[.045] to-transparent p-5 transition hover:-translate-y-0.5 hover:border-[#C9A86A]/35">
      <div className="flex items-start gap-4"><div className="relative size-14 overflow-hidden rounded-2xl bg-[#C9A86A]/10"><Image src={`/icons/icon-192.svg`} alt="" fill sizes="56px" className="p-3 opacity-70" /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="truncate font-heading text-xl">{customer.firstname} {customer.lastname}</h2>{index < 3 && <Crown className="size-3.5 text-[#C9A86A]" aria-label="Client fidèle" />}</div><p className="mt-1 truncate text-xs text-white/40">{customer.email}</p></div></div>
      <div className="mt-5 grid gap-2 text-xs text-white/50"><span className="flex items-center gap-2"><Mail className="size-3.5" />{customer.email}</span><span className="flex items-center gap-2"><UserRound className="size-3.5" />{customer.phone || "Téléphone non renseigné"}</span><span className="flex items-center gap-2"><MapPin className="size-3.5" />Dernier séjour : {customer.last_reservation ? new Date(customer.last_reservation).toLocaleDateString("fr-FR") : "—"}</span></div>
    </Link>)}</div> : <div className="rounded-[1.5rem] border border-dashed border-white/10 p-12 text-center text-sm text-white/40">Aucun client ne correspond à cette recherche.</div>}
  </>;
}

function Metric({ label, value }: { label: string; value: string }) { return <article className="rounded-2xl border border-white/[.08] bg-[#121212] p-5"><p className="text-[10px] uppercase tracking-[.18em] text-white/35">{label}</p><p className="mt-2 font-heading text-3xl text-[#C9A86A]">{value}</p></article>; }
