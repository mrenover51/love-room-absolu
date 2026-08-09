import type { PriceBreakdown } from "@/lib/booking/types";
import { formatAmount } from "@/lib/booking/pricing";
const dateLabel = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("fr-FR");
export function BookingSummary({
  checkIn,
  checkOut,
  pricing,
  compact = false,
}: {
  checkIn: string;
  checkOut: string;
  pricing: PriceBreakdown;
  compact?: boolean;
}) {
  return (
    <aside
      className={`premium-panel border border-white/10 lg:sticky lg:top-28 lg:self-start ${compact ? "p-5" : "p-6 sm:p-8"}`}
    >
      <h2 className="font-heading text-3xl">Votre séjour</h2>
      <dl className="mt-6 space-y-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-white/50">Dates</dt>
          <dd className="text-right">
            {dateLabel(checkIn)} → {dateLabel(checkOut)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/50">Durée</dt>
          <dd>
            {pricing.nights} nuit{pricing.nights > 1 ? "s" : ""}
          </dd>
        </div>
        {Boolean(pricing.discountAmount) && (
          <div className="flex justify-between text-emerald-300">
            <dt>
              Réduction {pricing.promoCode ? `(${pricing.promoCode})` : ""}
            </dt>
            <dd>−{formatAmount(pricing.discountAmount!)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-white/50">Taxes et frais</dt>
          <dd>{formatAmount(pricing.feesAmount)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/50">Nuitées</dt>
          <dd>{formatAmount(pricing.baseAmount)}</dd>
        </div>
        {pricing.extras.map((extra) => (
          <div key={extra.key} className="flex justify-between gap-4">
            <dt className="text-white/50">
              {extra.label}
              {(extra.quantity ?? 1) > 1 ? ` × ${extra.quantity}` : ""}
            </dt>
            <dd>{formatAmount(extra.amount)}</dd>
          </div>
        ))}
        <div className="flex justify-between border-t border-white/10 pt-4 text-base">
          <dt>Total</dt>
          <dd className="text-[#C9A86A]">
            {formatAmount(pricing.totalAmount)}
          </dd>
        </div>
      </dl>
      <p className="mt-6 border-l border-[#C9A86A] pl-4 text-xs leading-5 text-white/50">
        Montant recalculé côté serveur avant l’ouverture du paiement sécurisé.
      </p>
    </aside>
  );
}
