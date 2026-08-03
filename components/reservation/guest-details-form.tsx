import Link from "next/link";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { BOOKING_CONFIG } from "@/lib/booking/constants";
import type { ReservationRequestInput } from "@/lib/booking/validation";
const inputClass =
  "mt-2 min-h-13 w-full border border-[#D0AE72]/20 bg-[#17120F]/85 px-4 py-3 text-[#F7F1E8] shadow-[inset_0_1px_0_rgba(255,244,225,.035)] outline-none placeholder:text-white/30";
function fieldError(
  errors: FieldErrors<ReservationRequestInput>,
  name: keyof ReservationRequestInput,
) {
  const message = errors[name]?.message;
  return message ? (
    <span
      id={`${name}-error`}
      role="alert"
      className="mt-2 block text-xs text-red-300"
    >
      {String(message)}
    </span>
  ) : null;
}
export function GuestDetailsForm({
  register,
  errors,
}: {
  register: UseFormRegister<ReservationRequestInput>;
  errors: FieldErrors<ReservationRequestInput>;
}) {
  return (
    <fieldset>
      <legend className="font-heading text-3xl">Vos informations</legend>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="text-sm">
          Prénom *
          <input
            {...register("firstName")}
            autoComplete="given-name"
            className={inputClass}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
          />
          {fieldError(errors, "firstName")}
        </label>
        <label className="text-sm">
          Nom *
          <input
            {...register("lastName")}
            autoComplete="family-name"
            className={inputClass}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
          />
          {fieldError(errors, "lastName")}
        </label>
        <label className="text-sm">
          Email *
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            className={inputClass}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {fieldError(errors, "email")}
        </label>
        <label className="text-sm">
          Téléphone *
          <input
            {...register("phone")}
            type="tel"
            autoComplete="tel"
            className={inputClass}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
          {fieldError(errors, "phone")}
        </label>
        <label className="text-sm">
          Nombre de personnes *
          <select
            {...register("guestCount", { valueAsNumber: true })}
            className={inputClass}
          >
            {Array.from({ length: BOOKING_CONFIG.maximumGuests }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          {fieldError(errors, "guestCount")}
        </label>
        <label className="text-sm sm:col-span-2">
          Message facultatif
          <textarea
            {...register("message")}
            rows={4}
            maxLength={1500}
            className={inputClass}
          />
          {fieldError(errors, "message")}
        </label>
        <label className="sr-only" aria-hidden="true">
          Site internet
          <input {...register("website")} tabIndex={-1} autoComplete="off" />
        </label>
        <label className="flex gap-3 text-sm leading-6 sm:col-span-2">
          <input
            {...register("acceptTerms")}
            type="checkbox"
            className="mt-1 size-5 accent-[#D0AE72]"
            aria-invalid={!!errors.acceptTerms}
            aria-describedby={
              errors.acceptTerms ? "acceptTerms-error" : undefined
            }
          />
          <span>
            J’accepte les{" "}
            <Link href="/conditions" target="_blank" className="underline">
              conditions de réservation
            </Link>
            . *
          </span>
        </label>
        <div className="sm:col-span-2">{fieldError(errors, "acceptTerms")}</div>
        <label className="flex gap-3 text-sm leading-6 sm:col-span-2">
          <input
            {...register("acceptPrivacy")}
            type="checkbox"
            className="mt-1 size-5 accent-[#D0AE72]"
            aria-invalid={!!errors.acceptPrivacy}
            aria-describedby={
              errors.acceptPrivacy ? "acceptPrivacy-error" : undefined
            }
          />
          <span>
            J’accepte la{" "}
            <Link
              href="/politique-confidentialite"
              target="_blank"
              className="underline"
            >
              politique de confidentialité
            </Link>
            . *
          </span>
        </label>
        <div className="sm:col-span-2">
          {fieldError(errors, "acceptPrivacy")}
        </div>
      </div>
    </fieldset>
  );
}
