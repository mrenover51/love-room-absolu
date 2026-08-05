"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BOOKING_CONFIG } from "@/lib/booking/constants";
import { dateRangesOverlap, nightsBetween } from "@/lib/booking/date-utils";
import type { DateRange } from "@/lib/booking/types";
import { AvailabilityLegend } from "./availability-legend";
const labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const localIso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function DateRangePicker({
  checkIn,
  checkOut,
  minimumNights,
  maximumNights,
  onChange,
}: {
  checkIn: string;
  checkOut: string;
  minimumNights: number;
  maximumNights: number;
  onChange: (start: string, end: string) => void;
}) {
  const now = new Date(),
    firstAllowedMonth = new Date(now.getFullYear(), now.getMonth(), 1),
    lastAllowedMonth = new Date(
      now.getFullYear(),
      now.getMonth() + BOOKING_CONFIG.availabilityMonths,
      1,
    );
  const [month, setMonth] = useState(firstAllowedMonth),
    [ranges, setRanges] = useState<DateRange[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    const from = localIso(new Date()),
      to = localIso(
        new Date(
          new Date().getFullYear(),
          new Date().getMonth() + BOOKING_CONFIG.availabilityMonths + 1,
          0,
        ),
      );
    fetch(`/api/availability?from=${from}&to=${to}`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => setRanges(data.ranges))
      .catch(() => setError("Les disponibilités n’ont pas pu être chargées."))
      .finally(() => setLoading(false));
  }, []);
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
          new Date(month.getFullYear(), month.getMonth(), index + 1),
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
      setError(
        `Le séjour minimum est de ${minimumNights} nuit${minimumNights > 1 ? "s" : ""}.`,
      );
      return;
    }
    if (nights > maximumNights) {
      setError(`Le séjour est limité à ${maximumNights} nuits.`);
      return;
    }
    if (
      ranges.some((range) =>
        dateRangesOverlap(checkIn, value, range.start, range.end),
      )
    ) {
      setError("Cette période contient au moins une nuit indisponible.");
      return;
    }
    onChange(checkIn, value);
  }
  const today = localIso(new Date());
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
          aria-label="Afficher le mois précédent"
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <h3
          id="calendar-title"
          className="font-heading text-2xl"
          aria-live="polite"
        >
          Choisissez vos dates
        </h3>
        <button
          type="button"
          onClick={() =>
            setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
          }
          disabled={month >= lastAllowedMonth}
          className="grid size-11 place-items-center disabled:opacity-25"
          aria-label="Afficher le mois suivant"
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
      <div className="grid gap-8 xl:grid-cols-2">
        {[month, new Date(month.getFullYear(), month.getMonth() + 1, 1)].map(
          (displayMonth, monthIndex) => (
            <div
              key={`${displayMonth.toISOString()}-${monthIndex}`}
              className={monthIndex === 1 ? "hidden xl:block" : ""}
            >
              <h4 className="mb-5 text-center font-heading text-2xl capitalize">
                {new Intl.DateTimeFormat("fr-FR", {
                  month: "long",
                  year: "numeric",
                }).format(displayMonth)}
              </h4>
              <div
                className="grid grid-cols-7 text-center"
                role="grid"
                aria-label={new Intl.DateTimeFormat("fr-FR", {
                  month: "long",
                  year: "numeric",
                }).format(displayMonth)}
              >
                {labels.map((label, keyIndex) => (
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
                        past = value < today;
                      return (
                        <button
                          role="gridcell"
                          type="button"
                          key={`${value}-${index}`}
                          onClick={() => choose(value)}
                          disabled={blocked || past || loading}
                          aria-disabled={blocked || past || loading}
                          aria-label={`${date.toLocaleDateString("fr-FR", { dateStyle: "full" })}${blocked ? ", indisponible" : selected ? ", sélectionnée" : inRange ? ", dans la plage sélectionnée" : ""}`}
                          aria-selected={selected || inRange}
                          className={`aspect-square min-h-11 border border-transparent text-sm transition-colors disabled:cursor-not-allowed ${blocked || past ? "bg-white/[.035] text-white/20" : selected ? "bg-[#C9A86A] text-black" : inRange ? "bg-[#C9A86A]/15 text-white" : "hover:border-[#C9A86A]/50"}`}
                        >
                          {date.getDate()}
                          <span className="sr-only">
                            {blocked ? " indisponible" : " disponible"}
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
        <AvailabilityLegend />
      </div>
      {checkIn && (
        <p className="mt-5 text-sm text-white/65" aria-live="polite">
          Arrivée :{" "}
          <strong>
            {new Date(`${checkIn}T12:00:00`).toLocaleDateString("fr-FR")}
          </strong>
          {checkOut && (
            <>
              {" "}
              — Départ :{" "}
              <strong>
                {new Date(`${checkOut}T12:00:00`).toLocaleDateString("fr-FR")}
              </strong>{" "}
              — {nightsBetween(checkIn, checkOut)} nuit
              {nightsBetween(checkIn, checkOut) > 1 ? "s" : ""}
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
