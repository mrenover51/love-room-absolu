"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Check, ShieldCheck, X } from "lucide-react";
import { calculatePriceFromConfig, formatAmount } from "@/lib/booking/pricing";
import type { PublicPricingConfig } from "@/lib/booking/types";
import { trackConversion } from "@/lib/analytics/conversion";

type Availability = {
  ranges?: { start: string; end: string }[];
  availableNightsNext30?: number;
};
const iso = (date: Date) => date.toISOString().slice(0, 10);
const initialDate = new Date();
const initialCheckIn = new Date(initialDate);
initialCheckIn.setDate(initialCheckIn.getDate() + 1);
const initialCheckOut = new Date(initialDate);
initialCheckOut.setDate(initialCheckOut.getDate() + 2);

export function CroLayer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [checkIn, setCheckIn] = useState(iso(initialCheckIn));
  const [checkOut, setCheckOut] = useState(iso(initialCheckOut));
  const [config, setConfig] = useState<PublicPricingConfig | null>(null);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const excluded =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/reservation") ||
    pathname === "/maintenance";

  useEffect(() => {
    if (excluded || sessionStorage.getItem("absolu-cro-popup")) return;
    let armed = false;
    const timer = window.setTimeout(() => {
      armed = true;
    }, 20_000);
    const exit = (event: MouseEvent) => {
      if (!armed || event.clientY > 8) return;
      sessionStorage.setItem("absolu-cro-popup", "shown");
      setOpen(true);
      trackConversion("cro_popup_open", {
        trigger: "exit_intent",
        path: pathname,
      });
    };
    document.addEventListener("mouseout", exit);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mouseout", exit);
    };
  }, [excluded, pathname]);

  const pricing = useMemo(() => {
    if (!config || !checkIn || !checkOut || checkOut <= checkIn) return null;
    try {
      return calculatePriceFromConfig(checkIn, checkOut, [], config);
    } catch {
      return null;
    }
  }, [checkIn, checkOut, config]);

  async function quote() {
    setLoading(true);
    setMessage("");
    trackConversion("cro_quote_requested", { path: pathname });
    try {
      const [pricingResponse, availabilityResponse] = await Promise.all([
        fetch("/api/pricing"),
        fetch(`/api/availability?from=${checkIn}&to=${checkOut}`),
      ]);
      const [pricingData, availabilityData] = await Promise.all([
        pricingResponse.json(),
        availabilityResponse.json(),
      ]);
      if (!pricingResponse.ok || !availabilityResponse.ok)
        throw new Error("Vérification momentanément indisponible.");
      setConfig(pricingData);
      setAvailability(availabilityData);
      const available = !availabilityData.ranges?.length;
      setMessage(
        available
          ? "Ces dates sont disponibles."
          : "Cette période n’est plus disponible.",
      );
      trackConversion("cro_quote_available", { available, path: pathname });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Vérification impossible.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (excluded) return null;
  const bookingHref = `/reservation?arrivee=${checkIn}&depart=${checkOut}`;
  return (
    <>
      <aside
        className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-xl items-center gap-3 rounded-full border border-[#C9A86A]/35 bg-[#0A0A0A]/95 p-2 pl-4 text-white shadow-2xl backdrop-blur-xl"
        aria-label="Réservation rapide"
      >
        <ShieldCheck
          className="hidden size-5 shrink-0 text-[#C9A86A] sm:block"
          aria-hidden="true"
        />
        <p className="min-w-0 flex-1 truncate text-xs sm:text-sm">
          <strong>Réservation directe</strong>
          <span className="hidden text-white/45 sm:inline">
            {" "}
            · prix transparent
          </span>
        </p>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            trackConversion("cro_sticky_cta_click", { path: pathname });
          }}
          className="min-h-11 rounded-full bg-[#C9A86A] px-5 text-xs font-semibold text-black sm:px-7"
        >
          Voir le prix
        </button>
      </aside>
      {open && (
        <div
          className="fixed inset-0 z-[90] grid place-items-end bg-black/70 p-3 backdrop-blur-sm sm:place-items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cro-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#111] p-6 text-white shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="float-right grid size-11 place-items-center rounded-full border border-white/10"
              aria-label="Fermer"
            >
              <X aria-hidden="true" />
            </button>
            <p className="eyebrow text-[#C9A86A]">
              Votre séjour en 30 secondes
            </p>
            <h2 id="cro-title" className="mt-3 max-w-md font-heading text-4xl">
              Vérifiez le prix et les disponibilités.
            </h2>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-white/50">
                Arrivée
                <input
                  type="date"
                  min={iso(new Date())}
                  value={checkIn}
                  onChange={(event) => {
                    setCheckIn(event.target.value);
                    setConfig(null);
                  }}
                  className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-black px-4 text-white"
                />
              </label>
              <label className="text-xs text-white/50">
                Départ
                <input
                  type="date"
                  min={checkIn}
                  value={checkOut}
                  onChange={(event) => {
                    setCheckOut(event.target.value);
                    setConfig(null);
                  }}
                  className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-black px-4 text-white"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={quote}
              disabled={loading || checkOut <= checkIn}
              className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#C9A86A]/50 disabled:opacity-40"
            >
              <CalendarDays className="size-4" />
              {loading ? "Vérification…" : "Calculer mon séjour"}
            </button>
            {message && (
              <div
                className="mt-5 rounded-2xl bg-white/[.05] p-4"
                aria-live="polite"
              >
                <p className="flex items-center gap-2 text-sm">
                  <Check className="size-4 text-[#C9A86A]" />
                  {message}
                </p>
                {pricing && !availability?.ranges?.length && (
                  <p className="mt-2 font-heading text-3xl">
                    {formatAmount(pricing.totalAmount)}
                  </p>
                )}
                {typeof availability?.availableNightsNext30 === "number" &&
                  availability.availableNightsNext30 <= 8 && (
                    <p className="mt-2 text-xs text-amber-200">
                      Calendrier réel : {availability.availableNightsNext30}{" "}
                      nuits encore ouvertes sur les 30 prochains jours.
                    </p>
                  )}
              </div>
            )}
            {pricing && !availability?.ranges?.length && (
              <Link
                href={bookingHref}
                onClick={() =>
                  trackConversion("cro_sticky_cta_click", {
                    source: "quote",
                    value: pricing.totalAmount / 100,
                  })
                }
                className="mt-4 flex min-h-13 items-center justify-center rounded-full bg-[#C9A86A] font-semibold text-black"
              >
                Continuer avec ces dates
              </Link>
            )}
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[10px] uppercase tracking-wider text-white/45">
              <span>Paiement sécurisé</span>
              <span>Annulation gratuite jusqu’à J-5</span>
              <span>Réservation directe</span>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
