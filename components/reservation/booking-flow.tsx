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
import type { Locale } from "@/lib/i18n/config";
import { bookingCopy } from "@/lib/i18n/booking";
export function BookingFlow({
  pricingConfig,
  bookingMode,
  locale = "fr",
}: {
  pricingConfig: PublicPricingConfig;
  bookingMode: BookingMode;
  locale?: Locale;
}) {
  const copy = bookingCopy(locale), steps = copy.steps, timelineSteps = copy.timeline;
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
    setPromoMessage(copy.promo.checking);
    const response = await fetch("/api/promo-code", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: promoInput }),
    });
    const data = await response.json();
    if (!response.ok) {
      setPromoPercent(0);
      form.setValue("promoCode", "");
      setPromoMessage(copy.promo.invalid);
      return;
    }
    setPromoPercent(data.discountPercent);
    form.setValue("promoCode", data.code);
    setPromoMessage(copy.promo.applied(data.discountPercent));
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
  }, [step, steps]);
  useEffect(() => {
    trackConversion("calendar_open");
    trackConversion("booking_started", { language: locale });
  }, [locale]);
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
        setServerError(copy.errors.dates);
        return;
      }
      try {
        const response = await fetch(
            `/api/availability?from=${values.checkIn}&to=${values.checkOut}`,
          ),
          data = await response.json();
        if (!response.ok || data.ranges?.length) {
          router.push(locale === "fr" ? "/reservation/indisponible" : `/${locale}/reservation`);
          return;
        }
        trackConversion("booking_dates_selected", {
          nights: pricing.nights,
          value: pricing.totalAmount / 100,
        });
        trackConversion("date_selected", {
          nights: pricing.nights,
          currency: "EUR",
        });
      } catch {
        setServerError(copy.errors.availability);
        return;
      }
    }
    if (step === 1) trackConversion("option_selected", { language: locale });
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
    if (bookingMode !== "manual")
      trackConversion("checkout_started", { currency: "EUR" });
    try {
      const response = await fetch(
          bookingMode === "manual"
            ? "/api/reservation-request"
            : "/api/stripe/create-checkout-session",
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ...data, locale }),
          },
        ),
        result = await response.json();
      if (!response.ok) {
        if (response.status === 409 && result.code === "DATES_UNAVAILABLE") {
          router.push(locale === "fr" ? "/reservation/indisponible" : `/${locale}/reservation`);
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
        trackConversion("booking_completed", { mode: "manual", currency: "EUR" });
        return;
      }
      if (!result.url) throw new Error(copy.errors.payment);
      trackConversion("checkout_redirect", {
        value: pricing?.totalAmount ? pricing.totalAmount / 100 : 0,
        currency: "EUR",
      });
      window.location.assign(result.url);
    } catch (error) {
      setServerError(
        error instanceof Error && locale === "fr" ? error.message : copy.errors.generic,
      );
      setLoading(false);
    }
  }
  if (requestSent)
    return (
      <section className="rounded-[1.75rem] border border-[#C9A86A]/30 bg-[#C9A86A]/10 p-8 text-center sm:p-12">
        <p className="eyebrow text-[#C9A86A]">{copy.success.eyebrow}</p>
        <h2 className="mt-4 font-heading text-4xl">
          {copy.success.title}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl leading-8 text-white/65">
          {copy.success.body}
        </p>
      </section>
    );
  return (
    <form onSubmit={form.handleSubmit(submit)} noValidate>
      <ol
        className="mb-10 grid grid-cols-5 gap-1 sm:gap-2"
        aria-label={copy.stepLabel}
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
            {copy.stepLabel} {step + 1} : {steps[step]}
          </h2>
          {step === 0 && (
            <DateRangePicker
              checkIn={values.checkIn}
              checkOut={values.checkOut}
              minimumAdvanceDays={pricingConfig.minimumAdvanceDays}
              minimumNights={pricingConfig.minimumNights}
              maximumNights={pricingConfig.maximumNights}
              locale={locale}
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
                locale={locale}
                onChange={(extraKeys) =>
                  form.setValue("extraKeys", extraKeys, {
                    shouldValidate: true,
                  })
                }
              />
              <section className="premium-panel mt-8 border border-white/10 p-5">
                <h3 className="font-heading text-2xl">{copy.promo.title}</h3>
                <div className="mt-4 flex gap-2">
                  <input
                    value={promoInput}
                    onChange={(event) =>
                      setPromoInput(event.target.value.toUpperCase())
                    }
                    maxLength={40}
                    placeholder={copy.promo.placeholder}
                    className="min-h-12 min-w-0 flex-1 border border-white/15 bg-[#121212] px-4 uppercase outline-none focus:border-[#C9A86A]"
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    className="bg-white/10 px-5 text-sm hover:bg-[#C9A86A] hover:text-black"
                  >
                    {copy.promo.apply}
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
              locale={locale}
            />
          )}
          {step === 3 && pricing && (
            <section aria-labelledby="review-title">
              <h3 id="review-title" className="font-heading text-3xl">
                {bookingMode === "manual"
                  ? copy.review.request
                  : copy.review.payment}
              </h3>
              <p className="mt-4 leading-7 text-white/60">
                {values.firstName} {values.lastName} · {copy.review.person(values.guestCount)}
                <br />
                {values.email} · {values.phone}
              </p>
              <nav
                className="mt-6 flex flex-wrap gap-4 text-sm"
                aria-label={copy.review.edit}
              >
                <button
                  type="button"
                  onClick={() => goTo(0)}
                  className="underline underline-offset-4"
                >
                  {copy.review.editDates}
                </button>
                <button
                  type="button"
                  onClick={() => goTo(1)}
                  className="underline underline-offset-4"
                >
                  {copy.review.editOptions}
                </button>
                <button
                  type="button"
                  onClick={() => goTo(2)}
                  className="underline underline-offset-4"
                >
                  {copy.review.editDetails}
                </button>
              </nav>
              <p className="mt-8 border border-[#C9A86A]/30 bg-[#C9A86A]/10 p-4 text-sm">
                {bookingMode === "manual"
                  ? copy.review.manualNote
                  : copy.review.paymentNote}
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
                {copy.back}
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
                {copy.continue}
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
                    ? copy.sending
                    : copy.preparing
                  : bookingMode === "manual"
                    ? copy.request
                    : copy.pay}
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
            locale={locale}
          />
        )}
      </div>
    </form>
  );
}
