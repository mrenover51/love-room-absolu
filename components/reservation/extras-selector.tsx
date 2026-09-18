import type { PublicPricingConfig } from "@/lib/booking/types";
import { formatAmount, isExtraAvailable } from "@/lib/booking/pricing";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { bookingCopy, localizedExtraName } from "@/lib/i18n/booking";
import { localizedPath } from "@/lib/i18n/routing";
export function ExtrasSelector({
  selected,
  onChange,
  extras,
  checkIn,
  locale = "fr",
}: {
  selected: string[];
  onChange: (keys: string[]) => void;
  extras: PublicPricingConfig["extras"];
  checkIn: string;
  locale?: Locale;
}) {
  const copy = bookingCopy(locale).extras;
  return (
    <fieldset>
      <legend className="font-heading text-3xl">{copy.title}</legend>
      <p className="mt-2 text-sm text-white/55">
        {copy.note}
      </p>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {extras
          .filter(
            (extra) =>
              extra.enabled !== false && isExtraAvailable(extra, checkIn),
          )
          .map((extra) => (
            <label
              key={extra.key}
              data-selected={selected.includes(extra.key)}
              className={`option-card cursor-pointer border p-5 ${selected.includes(extra.key) ? "border-[#C9A86A] bg-[#C9A86A]/10" : "border-white/10 bg-[#121212]"}`}
            >
              <input
                type="checkbox"
                className="mr-3 size-5 accent-[#C9A86A]"
                checked={selected.includes(extra.key)}
                onChange={(event) =>
                  onChange(
                    event.target.checked
                      ? [...selected, extra.key]
                      : selected.filter((key) => key !== extra.key),
                  )
                }
              />
              <strong>{localizedExtraName(locale, extra.key, extra.label)}</strong>
              {extra.description && locale === "fr" && (
                <span className="mt-2 block pl-8 text-xs leading-5 text-white/50">
                  {extra.description}
                </span>
              )}
              <span className="mt-2 block pl-8 text-sm text-[#C9A86A]">
                {formatAmount(extra.amount)} {copy.billing[extra.billingType ?? "per_stay"]}
              </span>
            </label>
          ))}
      </div>
      <aside className="mt-6 rounded-2xl border border-[#C9A86A]/25 bg-[#C9A86A]/5 p-5">
        <p className="font-heading text-2xl">
          {copy.giftTitle}
        </p>
        <p className="mt-2 text-sm leading-6 text-white/50">
          {copy.giftBody}
        </p>
        <Link
          href={localizedPath(locale, "gifts")}
          className="mt-4 inline-block text-sm text-[#C9A86A] underline"
        >
          {copy.giftLink}
        </Link>
      </aside>
    </fieldset>
  );
}
