import type { Locale } from "@/lib/i18n/config";
import { bookingCopy } from "@/lib/i18n/booking";

export function AvailabilityLegend({ locale = "fr" }: { locale?: Locale }) {
  const labels = bookingCopy(locale).calendar;
  return (
    <div
      className="flex flex-wrap gap-5 text-xs text-white/60"
      aria-label={labels.title}
    >
      <span className="flex items-center gap-2">
        <i className="size-3 border border-white/30" />
        {labels.available}
      </span>
      <span className="flex items-center gap-2">
        <i className="size-3 bg-[#C9A86A]" />
        {labels.selected}
      </span>
      <span className="flex items-center gap-2">
        <i className="size-3 bg-white/10" />
        {labels.unavailable}
      </span>
    </div>
  );
}
