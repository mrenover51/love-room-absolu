import { requireAdmin } from "@/lib/admin/auth";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getReservationWorkflowSettings } from "@/lib/booking/workflow-settings";
import { saveReservationWorkflow } from "./actions";

export default async function ReservationSettings() {
  await requireAdmin();
  const settings = await getReservationWorkflowSettings();
  return (
    <>
      <AdminPageHeader
        eyebrow="Administration · Paramètres"
        title="Réservations"
        description="Choisissez le niveau de validation appliqué au parcours de réservation, sans redéploiement."
      />
      <form
        action={saveReservationWorkflow}
        className="max-w-3xl rounded-[2rem] border border-[#C9A86A]/20 bg-[#121212] p-6 shadow-2xl sm:p-8"
      >
        <fieldset>
          <legend className="font-heading text-3xl">Mode de réservation</legend>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="cursor-pointer rounded-2xl border border-white/10 bg-black/25 p-5">
              <input type="radio" name="mode" value="instant" defaultChecked={settings.mode === "instant"} className="accent-[#C9A86A]" />
              <strong className="ml-3">Réservation instantanée</strong>
              <p className="mt-3 text-sm leading-6 text-white/45">Le client accède immédiatement au paiement Stripe.</p>
            </label>
            <label className="cursor-pointer rounded-2xl border border-[#C9A86A]/25 bg-[#C9A86A]/[.06] p-5">
              <input type="radio" name="mode" value="manual" defaultChecked={settings.mode === "manual"} className="accent-[#C9A86A]" />
              <strong className="ml-3">Validation manuelle</strong>
              <p className="mt-3 text-sm leading-6 text-white/45">Le paiement est proposé uniquement après votre acceptation.</p>
            </label>
          </div>
        </fieldset>

        <section className="mt-8 border-t border-white/10 pt-8" aria-labelledby="reservation-rules-title">
          <h2 id="reservation-rules-title" className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C9A86A]">Réservations</h2>
          <label className="mt-5 block text-sm text-white/75" htmlFor="minimumAdvanceDays">Délai minimum avant arrivée</label>
          <div className="mt-2 flex items-center gap-3">
            <input id="minimumAdvanceDays" name="minimumAdvanceDays" type="number" min="0" max="30" step="1" required defaultValue={settings.minimumAdvanceDays} className="min-h-12 w-28 rounded-xl border border-white/10 bg-black/30 px-4 text-white" />
            <span className="text-sm text-white/55">jour(s)</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/45">Nombre de jours minimum entre la réservation et la date d&apos;arrivée.</p>
          <p className="mt-1 text-xs leading-5 text-white/35">0 = le jour même · 1 = à partir de demain · 2 = à partir d&apos;après-demain</p>
        </section>

        <label className="mt-7 block text-sm text-white/55">
          Délai de paiement après acceptation (heures)
          <input name="paymentExpirationHours" type="number" min="1" max="168" defaultValue={settings.paymentExpirationHours} className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white" />
        </label>
        <button className="mt-7 rounded-full bg-[#C9A86A] px-7 py-3 text-sm font-semibold text-black">Enregistrer</button>
      </form>
    </>
  );
}
