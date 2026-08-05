import { Bell, CakeSlice, CalendarCheck, CircleCheck, CircleX, KeyRound, Mail, Megaphone, MessageSquareHeart, RefreshCcw, Send, Sparkles } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { resendReservationEmail } from "./actions";

const automations = [
  { label: "Confirmation réservation", timing: "Immédiat", icon: CalendarCheck, active: true },
  { label: "Paiement reçu", timing: "Immédiat", icon: CircleCheck, active: true },
  { label: "Paiement refusé", timing: "Immédiat", icon: CircleX, active: true },
  { label: "Check-in demain", timing: "J−1 · 10:00", icon: Bell, active: false },
  { label: "Code d’accès", timing: "Jour J · 14:00", icon: KeyRound, active: false },
  { label: "Check-out demain", timing: "J−1 · 18:00", icon: RefreshCcw, active: false },
  { label: "Demande d’avis", timing: "J+1 · 10:30", icon: MessageSquareHeart, active: false },
  { label: "Relance", timing: "Panier + 2 h", icon: Send, active: false },
  { label: "Anniversaire", timing: "Jour J · 09:00", icon: CakeSlice, active: false },
  { label: "Promotion", timing: "À la demande", icon: Sparkles, active: false },
  { label: "Newsletter", timing: "Planifiée", icon: Megaphone, active: false },
] as const;

export default async function Notifications() {
  await requireAdmin();
  const db = createAdminClient();
  const [{ data: notifications }, { data: emails }] = await Promise.all([db.from("notifications").select("id,title,message,created_at").order("created_at", { ascending: false }).limit(100), db.from("email_logs").select("id,template,status,created_at,delivered_at,opened_at,replied_at,last_event_at,error_code").order("created_at", { ascending: false }).limit(100)]);
  return <>
    <AdminPageHeader eyebrow="Automatisations" title="Scénarios & emails" description="Orchestrez chaque moment clé du parcours client. Les scénarios transactionnels actifs utilisent Resend." />
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{automations.map((automation, keyIndex) => <article key={`${automation.label}-${keyIndex}`} className="rounded-[1.35rem] border border-white/[.08] bg-[#121212] p-4"><div className="flex items-start justify-between"><span className="grid size-9 place-items-center rounded-xl bg-[#C9A86A]/10"><automation.icon className="size-4 text-[#C9A86A]" /></span><span className={`rounded-full px-2 py-1 text-[9px] ${automation.active ? "bg-emerald-400/10 text-emerald-300" : "bg-white/5 text-white/30"}`}>{automation.active ? "Actif" : "À configurer"}</span></div><h2 className="mt-4 text-sm">{automation.label}</h2><p className="mt-1 text-[10px] text-white/35">{automation.timing}</p></article>)}</section>
    <form action={resendReservationEmail} className="my-6 flex max-w-xl gap-3 rounded-2xl border border-white/10 bg-[#121212] p-4"><label className="sr-only" htmlFor="reference">Référence</label><input id="reference" name="reference" required placeholder="ABS-2026-XXXXXX" className="min-h-11 flex-1 rounded-xl bg-black px-3" /><button className="rounded-xl bg-[#C9A86A] px-4 text-sm text-black">Renvoyer</button></form>
    <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]"><section className="rounded-[1.5rem] border border-white/10 bg-[#121212] p-6"><h2 className="font-heading text-2xl">Événements</h2><div className="mt-4 space-y-3">{notifications?.length ? notifications.map((notification) => <article key={notification.id} className="rounded-xl bg-white/[.03] p-4"><strong className="text-sm">{notification.title}</strong><p className="mt-1 text-xs leading-5 text-white/50">{notification.message}</p><time className="mt-2 block text-[10px] text-white/30">{new Date(notification.created_at).toLocaleString("fr-FR")}</time></article>) : <Empty />}</div></section><section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#121212]"><div className="flex items-center gap-3 p-6"><Mail className="size-5 text-[#C9A86A]" /><div><h2 className="font-heading text-2xl">Timeline des emails</h2><p className="text-[10px] text-white/35">Envoi, livraison, ouverture, réponse et erreur Resend</p></div></div><div className="divide-y divide-white/[.06]">{emails?.length ? emails.map((email) => <div key={email.id} className="grid gap-3 px-6 py-4 text-xs sm:grid-cols-[1fr_1.4fr_auto]"><div><span>{email.template}</span><time className="mt-1 block text-[10px] text-white/35">Envoyé · {new Date(email.created_at).toLocaleString("fr-FR")}</time></div><div className="flex flex-wrap gap-2 text-[10px]"><span className="rounded-full bg-emerald-400/10 px-2 py-1 text-emerald-300">Envoi</span>{email.delivered_at&&<span className="rounded-full bg-emerald-400/10 px-2 py-1 text-emerald-300">Livré</span>}{email.opened_at&&<span className="rounded-full bg-blue-400/10 px-2 py-1 text-blue-300">Ouvert</span>}{email.replied_at&&<span className="rounded-full bg-violet-400/10 px-2 py-1 text-violet-300">Réponse</span>}{email.error_code&&<span className="rounded-full bg-rose-400/10 px-2 py-1 text-rose-300">Erreur · {email.error_code}</span>}</div><span className={email.status==="failed"||email.status==="bounced"?"text-rose-300":"text-emerald-300"}>{email.status}</span></div>) : <div className="p-6"><Empty /></div>}</div></section></div>
  </>;
}
function Empty() { return <p className="text-sm text-white/40">Aucune activité enregistrée pour le moment.</p>; }
