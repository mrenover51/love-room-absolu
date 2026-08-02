import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Crown, FileText, Mail, MapPin, Phone, ReceiptText, Sparkles, WalletCards } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Reservation = { id: string; reference: string; check_in: string; check_out: string; nights: number; total: number; status: string; payment_status: string; source: string; admin_notes: string | null; created_at: string };
const euro = (cents: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);

export default async function CustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const db = createAdminClient();
  const { data: customer } = await db.from("customers").select("id,firstname,lastname,email,phone,last_reservation").eq("id", id).maybeSingle();
  if (!customer) notFound();
  const { data } = await db.from("reservations").select("id,reference,check_in,check_out,nights,total,status,payment_status,source,admin_notes,created_at").eq("guest_email", customer.email).order("check_in", { ascending: false }).limit(100);
  const stays = (data ?? []) as Reservation[];
  const paid = stays.filter((stay) => stay.payment_status === "paid");
  const total = paid.reduce((sum, stay) => sum + stay.total, 0);
  const average = paid.length ? total / paid.length : 0;
  const duration = stays.length ? stays.reduce((sum, stay) => sum + stay.nights, 0) / stays.length : 0;
  const now = new Date().toISOString().slice(0, 10);
  const next = [...stays].reverse().find((stay) => stay.check_in >= now && stay.status !== "cancelled");
  const last = stays.find((stay) => stay.check_out < now && stay.status !== "cancelled");
  return <>
    <Link href="/admin/clients" className="mb-6 inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white"><ArrowLeft className="size-4" />Retour aux clients</Link>
    <header className="relative overflow-hidden rounded-[2rem] border border-[#C9A86A]/20 bg-[radial-gradient(circle_at_top_right,rgba(201,168,106,.18),transparent_38%),#121212] p-6 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center"><div className="grid size-24 place-items-center rounded-[2rem] border border-[#C9A86A]/25 bg-[#C9A86A]/10 font-heading text-4xl text-[#E5C98E]">{customer.firstname[0]}{customer.lastname[0]}</div><div><span className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A86A]/10 px-3 py-1 text-[10px] uppercase tracking-wider text-[#E5C98E]"><Crown className="size-3" />{paid.length >= 3 ? "VIP Gold" : "Client Absolu"}</span><h1 className="mt-3 font-heading text-4xl sm:text-5xl">{customer.firstname} {customer.lastname}</h1><div className="mt-3 flex flex-wrap gap-4 text-xs text-white/45"><a href={`mailto:${customer.email}`} className="flex items-center gap-2"><Mail className="size-3.5" />{customer.email}</a><span className="flex items-center gap-2"><Phone className="size-3.5" />{customer.phone || "Non renseigné"}</span><span className="flex items-center gap-2"><MapPin className="size-3.5" />Adresse à compléter</span></div></div></div>
    </header>
    <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><Metric label="Séjours" value={String(stays.length)} /><Metric label="Total dépensé" value={euro(total)} /><Metric label="Panier moyen" value={euro(average)} /><Metric label="Durée moyenne" value={`${duration.toFixed(1)} nuits`} /><Metric label="Canal principal" value={stays[0]?.source ?? "Direct"} /></section>
    <div className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_.6fr]">
      <section className="rounded-[1.5rem] border border-white/[.08] bg-[#121212] p-5 sm:p-6"><h2 className="font-heading text-2xl">Historique complet</h2><div className="mt-5 space-y-3">{stays.length ? stays.map((stay) => <Link href={`/admin/reservations/${stay.id}`} key={stay.id} className="grid gap-3 rounded-2xl border border-white/[.06] bg-white/[.025] p-4 transition hover:border-[#C9A86A]/25 sm:grid-cols-[1fr_auto_auto]"><div><p className="text-sm text-[#E5C98E]">{stay.reference}</p><p className="mt-1 text-xs text-white/40">{new Date(stay.check_in).toLocaleDateString("fr-FR")} → {new Date(stay.check_out).toLocaleDateString("fr-FR")} · {stay.nights} nuit{stay.nights > 1 ? "s" : ""}</p></div><span className="text-xs text-white/50">{stay.source}</span><strong className="text-sm">{euro(stay.total)}</strong></Link>) : <p className="text-sm text-white/40">Aucun séjour rattaché à cette adresse email.</p>}</div></section>
      <aside className="space-y-5"><Panel title="Relation client" icon={Sparkles} items={["Préférences : à compléter", "Anniversaire : à compléter", "Avis : aucun avis importé", `Prochain séjour : ${next ? new Date(next.check_in).toLocaleDateString("fr-FR") : "aucun"}`, `Dernier séjour : ${last ? new Date(last.check_out).toLocaleDateString("fr-FR") : "aucun"}`]} /><Panel title="Dossier" icon={FileText} items={[`${stays.length} réservation(s)`, `${paid.length} paiement(s) reçu(s)`, `${paid.length} facture(s) disponible(s)`, "Documents : aucun", `Notes : ${stays.filter((stay) => stay.admin_notes).length}`]} /></aside>
    </div>
  </>;
}

function Metric({ label, value }: { label: string; value: string }) { return <article className="rounded-2xl border border-white/[.08] bg-[#121212] p-4"><p className="text-[10px] uppercase tracking-wider text-white/35">{label}</p><p className="mt-2 text-lg text-[#E5C98E]">{value}</p></article>; }
function Panel({ title, icon: Icon, items }: { title: string; icon: typeof CalendarDays; items: string[] }) { return <section className="rounded-[1.5rem] border border-white/[.08] bg-[#121212] p-5"><h2 className="flex items-center gap-2 font-heading text-xl"><Icon className="size-4 text-[#C9A86A]" />{title}</h2><ul className="mt-4 space-y-3 text-xs text-white/45">{items.map((item, index) => <li key={item} className="flex items-center gap-2">{index % 2 ? <WalletCards className="size-3.5" /> : <ReceiptText className="size-3.5" />}{item}</li>)}</ul></section>; }
