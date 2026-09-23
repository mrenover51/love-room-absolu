import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { GuestEmailTestButton } from "@/components/admin/guest-email-test-button";
import { requireAdmin } from "@/lib/admin/auth";
import { getGuestExperienceSettings } from "@/lib/guest-portal/settings";
import { saveGuestExperience } from "./actions";

const field = "mt-2 min-h-12 w-full border border-white/10 bg-black/40 px-4";
const fields = [
  ["Adresse", "address", "text"], ["Téléphone", "phone", "tel"], ["Email", "email", "email"],
  ["Heure arrivée", "checkInTime", "time"], ["Heure départ", "checkOutTime", "time"],
  ["Délai d’envoi du code avant arrivée (heures)", "accessLeadHours", "number"],
  ["Code boîte à clés par défaut", "defaultKeyboxCode", "password"], ["WiFi nom", "wifiName", "text"],
  ["WiFi mot de passe", "wifiPassword", "password"], ["Lien Google Reviews", "googleReviewUrl", "url"],
  ["Conservation portail (jours)", "guestPortalRetentionDays", "number"], ["Photo façade (URL)", "facadeImageUrl", "url"],
  ["Photo entrée (URL)", "entranceImageUrl", "url"], ["Photo boîte à clés (URL)", "keyboxImageUrl", "url"],
] as const;
const areas = [
  ["Instructions accès", "accessInstructions"], ["Instructions stationnement", "parkingInstructions"],
  ["Instructions boîte à clés", "keyboxInstructions"], ["Consignes départ", "checkoutInstructions"],
  ["Règlement", "houseRules"], ["Mode d’emploi balnéo", "balneoInstructions"],
  ["Mode d’emploi sauna", "saunaInstructions"], ["Télévision / streaming", "tvInstructions"],
  ["Kitchenette", "kitchenInstructions"], ["Machine à café", "coffeeInstructions"],
  ["Chauffage / climatisation", "climateInstructions"],
] as const;

function EmailPreviews() {
  return <section className="mb-5 rounded-2xl border border-[#c9a86a]/20 bg-[#121212] p-5 sm:p-6">
    <p className="text-[.65rem] uppercase tracking-[.2em] text-[#c9a86a]">Communications</p>
    <h2 className="mt-2 font-heading text-2xl">Aperçu des emails voyageurs</h2>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">Affichage du template de production avec des données fictives. Aucun email n’est envoyé et le code d’accès affiché est uniquement un code d’aperçu.</p>
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><h3 className="font-medium text-white">Email H-48</h3><div className="mt-3 flex flex-wrap items-start gap-3"><Link href="/admin/parametres/experience-client/apercu?email=access_48h" className="rounded-full bg-[#c9a86a] px-5 py-3 text-sm font-semibold text-black">Aperçu email H-48</Link><GuestEmailTestButton type="access_48h" /></div></div>
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><h3 className="font-medium text-white">Confirmation</h3><div className="mt-3 flex flex-wrap items-start gap-3"><Link href="/admin/parametres/experience-client/apercu?email=confirmation" className="rounded-full bg-[#c9a86a] px-5 py-3 text-sm font-semibold text-black">Aperçu confirmation</Link><GuestEmailTestButton type="confirmation" /></div></div>
    </div>
  </section>;
}

export default async function GuestExperienceSettingsPage() {
  await requireAdmin();
  const s = await getGuestExperienceSettings();
  return <>
    <AdminPageHeader eyebrow="Paramètres du site" title="Expérience client / Mon séjour" description="Accès, consignes et communications voyageurs. Les champs vides ne sont pas affichés." />
    <EmailPreviews />
    <div className="mb-5 rounded-2xl border border-[#c9a86a]/20 bg-[#c9a86a]/[.05] p-4 text-sm text-[#e5c98e]">Envoi et révélation du code : {s.accessLeadHours} h avant l’arrivée, selon l’heure réelle de check-in en Europe/Paris.</div>
    <form action={saveGuestExperience} className="rounded-[2rem] border border-[#c9a86a]/20 bg-[#121212] p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">{fields.map(([label, name, type]) => <label key={name} className="text-sm text-white/60"><span className="text-white">{label}</span><input required={["address", "phone", "email", "checkInTime", "checkOutTime", "accessLeadHours", "guestPortalRetentionDays"].includes(name)} min={name === "guestPortalRetentionDays" || name === "accessLeadHours" ? 1 : undefined} max={name === "guestPortalRetentionDays" ? 30 : name === "accessLeadHours" ? 168 : undefined} className={field} name={name} type={type} defaultValue={String(s[name])} /></label>)}</div>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">{areas.map(([label, name]) => <label key={name} className="text-sm text-white/60"><span className="text-white">{label}</span><textarea className={`${field} py-3`} rows={5} name={name} defaultValue={s[name]} /></label>)}</div>
      <div className="mt-7 flex items-center justify-between gap-4 border-t border-white/10 pt-6"><p className="text-xs text-white/40">SMS préparé mais désactivé.</p><button className="min-h-12 rounded-full bg-[#c9a86a] px-7 font-semibold text-black">Enregistrer</button></div>
    </form>
  </>;
}
