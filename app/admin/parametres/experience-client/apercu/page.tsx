import { render } from "@react-email/components";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  GuestCommunicationEmail,
  guestCommunicationSubjects,
} from "@/emails/templates/guest-communication";
import { requireAdmin } from "@/lib/admin/auth";
import { getGuestEmailPreviewData, type GuestEmailPreviewType } from "@/lib/guest-portal/email-preview";
import { getGuestExperienceSettings } from "@/lib/guest-portal/settings";

export default async function GuestEmailPreviewPage({ searchParams }: {
  searchParams: Promise<{ email?: string | string[] }>;
}) {
  await requireAdmin();
  const requestedType = (await searchParams).email;
  const type: GuestEmailPreviewType = requestedType === "confirmation" ? "confirmation" : "access_48h";
  const settings = await getGuestExperienceSettings();
  const data = getGuestEmailPreviewData(type, settings);
  const html = await render(<GuestCommunicationEmail {...data} />);

  return <>
    <AdminPageHeader
      eyebrow="Aperçu sans envoi"
      title={type === "access_48h" ? "Email H-48" : "Email de confirmation"}
      description="Template réel de production rendu avec des données explicitement fictives. Les liens sont désactivés dans cet aperçu."
      actions={<Link href="/admin/parametres/experience-client" className="rounded-full border border-white/15 px-5 py-3 text-sm">Retour aux paramètres</Link>}
    />
    <section className="mb-5 rounded-2xl border border-[#c9a86a]/20 bg-[#c9a86a]/[.05] p-5">
      <p className="text-xs uppercase tracking-[.18em] text-[#c9a86a]">Objet de l’email</p>
      <p className="mt-2 text-lg text-white">{guestCommunicationSubjects[type]}</p>
      <p className="mt-3 text-xs leading-5 text-white/45">Données fictives : Camille Martin · ABS-APERÇU · code d’aperçu 1234 pour l’email H-48. Aucun appel Resend, aucun envoi et aucune écriture en base.</p>
    </section>
    <nav className="mb-5 flex flex-wrap gap-3" aria-label="Choisir l’email à prévisualiser">
      <Link href="?email=access_48h" aria-current={type === "access_48h" ? "page" : undefined} className={`rounded-full px-5 py-3 text-sm ${type === "access_48h" ? "bg-[#c9a86a] font-semibold text-black" : "border border-white/15 text-white"}`}>Email H-48</Link>
      <Link href="?email=confirmation" aria-current={type === "confirmation" ? "page" : undefined} className={`rounded-full px-5 py-3 text-sm ${type === "confirmation" ? "bg-[#c9a86a] font-semibold text-black" : "border border-white/15 text-white"}`}>Confirmation</Link>
    </nav>
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white">
      <iframe title={`Aperçu de l’email ${type}`} srcDoc={html} sandbox="" className="pointer-events-none h-[1000px] w-full" />
    </div>
  </>;
}
