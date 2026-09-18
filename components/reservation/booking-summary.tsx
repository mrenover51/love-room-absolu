import type { PriceBreakdown } from "@/lib/booking/types";
import { formatAmount } from "@/lib/booking/pricing";
import type { Locale } from "@/lib/i18n/config";
import { bookingCopy, intlLocale } from "@/lib/i18n/booking";
export function BookingSummary({
  checkIn,
  checkOut,
  pricing,
  compact = false,
  locale = "fr",
}: {
  checkIn: string;
  checkOut: string;
  pricing: PriceBreakdown;
  compact?: boolean;
  locale?: Locale;
}) {
  const copy = bookingCopy(locale).summary;
  const dateLabel = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString(intlLocale[locale]);
  return (
    <aside
      className={`premium-panel border border-white/10 lg:sticky lg:top-28 lg:self-start ${compact ? "p-5" : "p-6 sm:p-8"}`}
    >
      <h2 className="font-heading text-3xl">{copy.title}</h2>
      <dl className="mt-6 space-y-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-white/50">{copy.dates}</dt>
          <dd className="text-right">
            {dateLabel(checkIn)} → {dateLabel(checkOut)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/50">{copy.duration}</dt>
          <dd>{bookingCopy(locale).calendar.nights(pricing.nights)}</dd>
        </div>
        {Boolean(pricing.discountAmount) && (
          <div className="flex justify-between text-emerald-300">
            <dt>
              {copy.discount} {pricing.promoCode ? `(${pricing.promoCode})` : ""}
            </dt>
            <dd>−{formatAmount(pricing.discountAmount!)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-white/50">{copy.stay}</dt>
          <dd>{formatAmount(pricing.baseAmount)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/50">{copy.options}</dt>
          <dd>{formatAmount(pricing.extrasAmount)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/50">{copy.tax}</dt>
          <dd>{formatAmount(pricing.feesAmount)}</dd>
        </div>
        <div className="flex justify-between border-t border-white/10 pt-4 text-base">
          <dt>{copy.total}</dt>
          <dd className="text-[#C9A86A]">
            {formatAmount(pricing.totalAmount)}
          </dd>
        </div>
      </dl>
      <p className="mt-6 border-l border-[#C9A86A] pl-4 text-xs leading-5 text-white/50">
        {copy.serverNote}
      </p>
    </aside>
  );
}
