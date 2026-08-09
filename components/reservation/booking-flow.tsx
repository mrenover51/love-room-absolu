"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  reservationRequestSchema,
  type ReservationRequestInput,
} from "@/lib/booking/validation";
import {
  calculatePriceFromConfig,
  isExtraAvailable,
} from "@/lib/booking/pricing";
import type { PublicPricingConfig } from "@/lib/booking/types";
import { DateRangePicker } from "./date-range-picker";
import { ExtrasSelector } from "./extras-selector";
import { GuestDetailsForm } from "./guest-details-form";
import { BookingSummary } from "./booking-summary";
import { trackConversion } from "@/lib/analytics/conversion";
import type { BookingMode } from "@/lib/booking/workflow-settings";

const steps = ["Dates", "Options", "Informations", "Confirmation"];
const timelineSteps = [
  "Dates",
  "Informations",
  "Options",
  "Paiement",
  "Confirmation",
];
export function BookingFlow({
  pricingConfig,
  bookingMode,
}: {
  pricingConfig: PublicPricingConfig;
  bookingMode: BookingMode;
}) {
  const router = useRouter(),
    searchParams = useSearchParams(),
    headingRef = useRef<HTMLHeadingElement>(null),
    [step, setStep] = useState(0),
    [serverError, setServerError] = useState(""),
    [loading, setLoading] = useState(false),
    [promoInput, setPromoInput] = useState(""),
    [promoPercent, setPromoPercent] = useState(0),
    [promoMessage, setPromoMessage] = useState(""),
    [requestSent, setRequestSent] = useState(false);
  const form = useForm<ReservationRequestInput>({
    resolver: zodResolver(reservationRequestSchema),
    defaultValues: {
      checkIn: searchParams.get("arrivee") ?? "",
      checkOut: searchParams.get("depart") ?? "",
      extraKeys: [],
      promoCode: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      guestCount: 2,
      message: "",
      acceptTerms: false,
      acceptPrivacy: false,
      website: "",
    },
  });
  // eslint-disable-next-line react-hooks/incompatible-library -- Le récapitulatif doit refléter chaque modification du formulaire.
  const values = form.watch();
  const pricing = useMemo(() => {
    try {
      return values.checkIn && values.checkOut
        ? calculatePriceFromConfig(
            values.checkIn,
            values.checkOut,
            values.extraKeys ?? [],
            pricingConfig,
            promoPercent,
            values.promoCode,
            values.guestCount,
          )
        : null;
    } catch {
      return null;
    }
  }, [
    values.checkIn,
    values.checkOut,
    values.extraKeys,
    values.promoCode,
    values.guestCount,
    pricingConfig,
    promoPercent,
  ]);
  async function applyPromo() {
    setPromoMessage("Vérification…");
    const response = await fetch("/api/promo-code", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: promoInput }),
    });
    const data = await response.json();
    if (!response.ok) {
      setPromoPercent(0);
      form.setValue("promoCode", "");
      setPromoMessage(data.error ?? "Code invalide.");
      return;
    }
    setPromoPercent(data.discountPercent);
    form.setValue("promoCode", data.code);
    setPromoMessage(
      `Code appliqué : −${data.discountPercent} % sur les nuitées.`,
    );
    trackConversion("booking_promo_applied", {
      discount_percent: data.discountPercent,
    });
  }
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    trackConversion("booking_step_view", {
      step: step + 1,
      label: steps[step],
    });
  }, [step]);
  function goTo(nextStep: number) {
    setServerError("");
    setStep(nextStep);
    requestAnimationFrame(() =>
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      }),
    );
  }
  async function next() {
    setServerError("");
    if (step === 0) {
      if (!values.checkIn || !values.checkOut || !pricing) {
        setServerError("Sélectionnez une arrivée et un départ valides.");
        return;
      }
      try {
        const response = await fetch(
            `/api/availability?from=${values.checkIn}&to=${values.checkOut}`,
          ),
          data = await response.json();
        if (!response.ok || data.ranges?.length) {
          router.push("/reservation/indisponible");
          return;
        }
        trackConversion("booking_dates_selected", {
          nights: pricing.nights,
          value: pricing.totalAmount / 100,
        });
      } catch {
        setServerError(
          "Les disponibilités ne peuvent pas être vérifiées pour le moment.",
        );
        return;
      }
    }
    if (
      step === 2 &&
      !(await form.trigger([
        "firstName",
        "lastName",
        "email",
        "phone",
        "guestCount",
        "acceptTerms",
        "acceptPrivacy",
      ]))
    )
      return;
    goTo(Math.min(3, step + 1));
  }
  async function submit(data: ReservationRequestInput) {
    if (loading) return;
    setLoading(true);
    setServerError("");
    trackConversion(
      bookingMode === "manual" ? "booking_request_started" : "begin_checkout",
      {
        value: pricing?.totalAmount ? pricing.totalAmount / 100 : 0,
        currency: "EUR",
      },
    );
    try {
      const response = await fetch(
          bookingMode === "manual"
            ? "/api/reservation-request"
            : "/api/stripe/create-checkout-session",
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(data),
          },
        ),
        result = await response.json();
      if (!response.ok) {
        if (response.status === 409 && result.code === "DATES_UNAVAILABLE") {
          router.push("/reservation/indisponible");
          return;
        }
        throw new Error(result.error);
      }
      if (bookingMode === "manual") {
        setRequestSent(true);
        trackConversion("booking_request_submitted", {
          value: pricing?.totalAmount ? pricing.totalAmount / 100 : 0,
          currency: "EUR",
        });
        return;
      }
      if (!result.url) throw new Error("Le paiement n’a pas pu être ouvert.");
      trackConversion("checkout_redirect", {
        value: pricing?.totalAmount ? pricing.totalAmount / 100 : 0,
        currency: "EUR",
      });
      window.location.assign(result.url);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Une erreur est survenue.",
      );
      setLoading(false);
    }
  }
  if (requestSent)
    return (
      <section className="rounded-[1.75rem] border border-[#C9A86A]/30 bg-[#C9A86A]/10 p-8 text-center sm:p-12">
        <p className="eyebrow text-[#C9A86A]">Demande reçue</p>
        <h2 className="mt-4 font-heading text-4xl">
          Votre parenthèse est entre de bonnes mains.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl leading-8 text-white/65">
          Nous vérifions personnellement la disponibilité de la suite. Vous
          recevrez notre réponse par email avant toute demande de paiement.
        </p>
      </section>
    );
  return (
    <form onSubmit={form.handleSubmit(submit)} noValidate>
      <ol
        className="mb-10 grid grid-cols-5 gap-1 sm:gap-2"
        aria-label="Étapes de réservation"
      >
        {timelineSteps.map((label, index) => (
          <li
            key={`${label}-${index}`}
            aria-current={index === step ? "step" : undefined}
            className={`border-t pt-3 text-center text-[.52rem] uppercase tracking-wider transition-colors duration-500 sm:text-[.68rem] ${index <= (step === 1 ? 2 : step === 2 ? 1 : step) ? "border-[#C9A86A] text-[#D8C8B6]" : "border-white/10 text-white/30"}`}
          >
            <span className="mx-auto mb-1 grid size-5 place-items-center rounded-full border border-current text-[9px]">
              {index + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>
      <div className="-mt-5 mb-8 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#C9A86A] transition-[width] duration-700"
          style={{ width: `${((step + 1) / 5) * 100}%` }}
        />
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="premium-panel min-w-0 border border-white/10 p-5 sm:p-8">
          <h2 ref={headingRef} tabIndex={-1} className="sr-only">
            Étape {step + 1} : {steps[step]}
          </h2>
          {step === 0 && (
            <DateRangePicker
              checkIn={values.checkIn}
              checkOut={values.checkOut}
              minimumAdvanceDays={pricingConfig.minimumAdvanceDays}
              minimumNights={pricingConfig.minimumNights}
              maximumNights={pricingConfig.maximumNights}
              onChange={(checkIn, checkOut) => {
                form.setValue("checkIn", checkIn, { shouldValidate: true });
                form.setValue("checkOut", checkOut, { shouldValidate: true });
                form.setValue(
                  "extraKeys",
                  (values.extraKeys ?? []).filter((key) => {
                    const extra = pricingConfig.extras.find(
                      (item) => item.key === key,
                    );
                    return Boolean(extra && isExtraAvailable(extra, checkIn));
                  }),
                );
              }}
            />
          )}
          {step === 1 && (
            <>
              <ExtrasSelector
                selected={values.extraKeys ?? []}
                extras={pricingConfig.extras}
                checkIn={values.checkIn}
                onChange={(extraKeys) =>
                  form.setValue("extraKeys", extraKeys, {
                    shouldValidate: true,
                  })
                }
              />
              <section className="premium-panel mt-8 border border-white/10 p-5">
                <h3 className="font-heading text-2xl">Code promotionnel</h3>
                <div className="mt-4 flex gap-2">
                  <input
                    value={promoInput}
                    onChange={(event) =>
                      setPromoInput(event.target.value.toUpperCase())
                    }
                    maxLength={40}
                    placeholder="Votre code"
                    className="min-h-12 min-w-0 flex-1 border border-white/15 bg-[#121212] px-4 uppercase outline-none focus:border-[#C9A86A]"
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    className="bg-white/10 px-5 text-sm hover:bg-[#C9A86A] hover:text-black"
                  >
                    Appliquer
                  </button>
                </div>
                {promoMessage && (
                  <p className="mt-3 text-xs text-white/55" aria-live="polite">
                    {promoMessage}
                  </p>
                )}
              </section>
            </>
          )}
          {step === 2 && (
            <GuestDetailsForm
              register={form.register}
              errors={form.formState.errors}
            />
          )}
          {step === 3 && pricing && (
            <section aria-labelledby="review-title">
              <h3 id="review-title" className="font-heading text-3xl">
                {bookingMode === "manual"
                  ? "Vérifiez votre demande"
                  : "Vérifiez avant paiement"}
              </h3>
              <p className="mt-4 leading-7 text-white/60">
                {values.firstName} {values.lastName} · {values.guestCount}{" "}
                personne{values.guestCount > 1 ? "s" : ""}
                <br />
                {values.email} · {values.phone}
              </p>
              <nav
                className="mt-6 flex flex-wrap gap-4 text-sm"
                aria-label="Modifier la réservation"
              >
                <button
                  type="button"
                  onClick={() => goTo(0)}
                  className="underline underline-offset-4"
                >
                  Modifier les dates
                </button>
                <button
                  type="button"
                  onClick={() => goTo(1)}
                  className="underline underline-offset-4"
                >
                  Modifier les options
                </button>
                <button
                  type="button"
                  onClick={() => goTo(2)}
                  className="underline underline-offset-4"
                >
                  Modifier les coordonnées
                </button>
              </nav>
              <p className="mt-8 border border-[#C9A86A]/30 bg-[#C9A86A]/10 p-4 text-sm">
                {bookingMode === "manual"
                  ? "Les dates et le montant seront revérifiés côté serveur. Aucun paiement ne sera demandé avant la validation de votre séjour."
                  : "Les dates et le montant seront revérifiés côté serveur avant l’ouverture du paiement sécurisé Stripe."}
              </p>
            </section>
          )}
          <div aria-live="assertive">
            {serverError && (
              <p
                role="alert"
                className="mt-6 border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200"
              >
                {serverError}
              </p>
            )}
          </div>
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                className="premium-action min-h-12 border border-white/20 px-6 text-sm"
              >
                Retour
              </button>
            ) : (
              <span />
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={next}
                disabled={step === 0 && !pricing}
                className="premium-action min-h-12 bg-[#C9A86A] px-6 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continuer
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !pricing}
                aria-busy={loading}
                className="premium-action min-h-12 bg-[#C9A86A] px-6 text-sm font-semibold text-black disabled:opacity-50"
              >
                {loading
                  ? bookingMode === "manual"
                    ? "Envoi de la demande…"
                    : "Préparation du paiement…"
                  : bookingMode === "manual"
                    ? "Demander cette parenthèse"
                    : "Payer et réserver"}
              </button>
            )}
          </div>
        </div>
        {pricing && (
          <BookingSummary
            checkIn={values.checkIn}
            checkOut={values.checkOut}
            pricing={pricing}
            compact
          />
        )}
      </div>
    </form>
  );
}
