"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BOOKING_CONFIG } from "@/lib/booking/constants";
import { dateRangesOverlap, nightsBetween } from "@/lib/booking/date-utils";
import {
  minimumArrivalDate,
  parisTodayIso,
} from "@/lib/booking/minimum-advance-days";
import type { DateRange } from "@/lib/booking/types";
import { AvailabilityLegend } from "./availability-legend";
import type { Locale } from "@/lib/i18n/config";
import { bookingCopy, intlLocale } from "@/lib/i18n/booking";
const localIso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function DateRangePicker({
  checkIn,
  checkOut,
  minimumAdvanceDays,
  minimumNights,
  maximumNights,
  locale = "fr",
  onChange,
}: {
  checkIn: string;
  checkOut: string;
  minimumAdvanceDays: number;
  minimumNights: number;
  maximumNights: number;
  locale?: Locale;
  onChange: (start: string, end: string) => void;
}) {
  const copy = bookingCopy(locale), dateLocale = intlLocale[locale];
  const today = parisTodayIso(),
    [parisYear, parisMonth] = today.split("-").map(Number),
    firstAllowedMonth = new Date(parisYear, parisMonth - 1, 1),
    lastAllowedMonth = new Date(
      parisYear,
      parisMonth - 1 + BOOKING_CONFIG.availabilityMonths,
      1,
    );
  const [month, setMonth] = useState(firstAllowedMonth),
    [ranges, setRanges] = useState<DateRange[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    const from = parisTodayIso(),
      to = localIso(
        new Date(
          parisYear,
          parisMonth - 1 + BOOKING_CONFIG.availabilityMonths + 1,
          0,
        ),
      );
    fetch(`/api/availability?from=${from}&to=${to}`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => setRanges(data.ranges))
      .catch(() => setError(copy.calendar.loadError))
      .finally(() => setLoading(false));
  }, [copy.calendar.loadError, parisMonth, parisYear]);
  const monthDays = (displayMonth: Date) => {
    const first = new Date(
        displayMonth.getFullYear(),
        displayMonth.getMonth(),
        1,
      ),
      last = new Date(
        displayMonth.getFullYear(),
        displayMonth.getMonth() + 1,
        0,
      ),
      offset = (first.getDay() + 6) % 7;
    return [
      ...Array(offset).fill(null),
      ...Array.from(
        { length: last.getDate() },
        (_, index) =>
          new Date(
            displayMonth.getFullYear(),
            displayMonth.getMonth(),
            index + 1,
          ),
      ),
    ];
  };
  const unavailable = (date: string) =>
    ranges.some((range) => date >= range.start && date < range.end);
  function choose(value: string) {
    setError("");
    if (!checkIn || checkOut || value <= checkIn) {
      onChange(value, "");
      return;
    }
    const nights = nightsBetween(checkIn, value);
    if (nights < minimumNights) {
      setError(copy.calendar.minimum(minimumNights));
      return;
    }
    if (nights > maximumNights) {
      setError(copy.calendar.maximum(maximumNights));
      return;
    }
    if (
      ranges.some((range) =>
        dateRangesOverlap(checkIn, value, range.start, range.end),
      )
    ) {
      setError(copy.calendar.overlap);
      return;
    }
    onChange(checkIn, value);
  }
  const firstArrival = minimumArrivalDate(minimumAdvanceDays, today);
  return (
    <section aria-labelledby="calendar-title" aria-busy={loading}>
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
          }
          disabled={month <= firstAllowedMonth}
          className="grid size-11 place-items-center disabled:opacity-25"
          aria-label={copy.calendar.previous}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <h3
          id="calendar-title"
          className="font-heading text-2xl"
          aria-live="polite"
        >
          {copy.calendar.title}
        </h3>
        <button
          type="button"
          onClick={() =>
            setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
          }
          disabled={month >= lastAllowedMonth}
          className="grid size-11 place-items-center disabled:opacity-25"
          aria-label={copy.calendar.next}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
      <div className="grid items-start gap-8 md:grid-cols-2">
        {[month, new Date(month.getFullYear(), month.getMonth() + 1, 1)].map(
          (displayMonth, monthIndex) => (
            <div
              key={`${displayMonth.toISOString()}-${monthIndex}`}
              className={monthIndex === 1 ? "hidden md:block" : "min-w-0"}
            >
              <h4 className="mb-5 text-center font-heading text-2xl capitalize">
                {new Intl.DateTimeFormat(dateLocale, {
                  month: "long",
                  year: "numeric",
                }).format(displayMonth)}
              </h4>
              <div
                className="grid grid-cols-7 text-center"
                role="grid"
                aria-label={new Intl.DateTimeFormat(dateLocale, {
                  month: "long",
                  year: "numeric",
                }).format(displayMonth)}
              >
                {copy.calendar.weekdays.map((label, keyIndex) => (
                  <span
                    role="columnheader"
                    key={`${label}-${keyIndex}`}
                    className="pb-3 text-[.65rem] uppercase tracking-wider text-white/40"
                  >
                    {label}
                  </span>
                ))}
                {monthDays(displayMonth).map((date, index) =>
                  date === null ? (
                    <span key={`empty-${index}`} role="gridcell" />
                  ) : (
                    (() => {
                      const value = localIso(date),
                        blocked = unavailable(value),
                        selected = value === checkIn || value === checkOut,
                        inRange = Boolean(
                          checkIn &&
                          checkOut &&
                          value > checkIn &&
                          value < checkOut,
                        ),
                        tooSoon = value < firstArrival;
                      return (
                        <button
                          role="gridcell"
                          type="button"
                          key={`${value}-${index}`}
                          onClick={() => choose(value)}
                          disabled={blocked || tooSoon || loading}
                          aria-disabled={blocked || tooSoon || loading}
                          aria-label={`${date.toLocaleDateString(dateLocale, { dateStyle: "full" })}${blocked ? `, ${copy.calendar.unavailable}` : selected ? `, ${copy.calendar.selected}` : inRange ? `, ${copy.calendar.inRange}` : ""}`}
                          aria-selected={selected || inRange}
                          className={`min-h-11 w-full border border-transparent text-sm transition-colors disabled:cursor-not-allowed sm:aspect-square ${blocked || tooSoon ? "bg-white/[.035] text-white/20" : selected ? "bg-[#C9A86A] text-black" : inRange ? "bg-[#C9A86A]/15 text-white" : value === today ? "border-[#C9A86A]/45 text-[#E8CC91]" : "hover:border-[#C9A86A]/50"}`}
                        >
                          {date.getDate()}
                          <span className="sr-only">
                            {blocked ? ` ${copy.calendar.unavailable}` : ` ${copy.calendar.available}`}
                          </span>
                        </button>
                      );
                    })()
                  ),
                )}
              </div>
            </div>
          ),
        )}
      </div>
      <div className="mt-6">
        <AvailabilityLegend locale={locale} />
      </div>
      {checkIn && (
        <p className="mt-5 text-sm text-white/65" aria-live="polite">
          {copy.calendar.arrival} :{" "}
          <strong>
            {new Date(`${checkIn}T12:00:00`).toLocaleDateString(dateLocale)}
          </strong>
          {checkOut && (
            <>
              {" "}
              — {copy.calendar.departure} :{" "}
              <strong>
                {new Date(`${checkOut}T12:00:00`).toLocaleDateString(dateLocale)}
              </strong>{" "}
              — {copy.calendar.nights(nightsBetween(checkIn, checkOut))}
            </>
          )}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-300">
          {error}
        </p>
      )}
    </section>
  );
}
