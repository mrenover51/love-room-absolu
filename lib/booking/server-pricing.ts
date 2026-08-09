import "server-only";
import { BOOKING_CONFIG, reservationHoldMinutes } from "./constants";
import { getStaySettings } from "@/lib/stay-settings";
import { SupabasePricingRepository } from "@/lib/supabase/repositories/pricing-repository";
import { ReservationService } from "@/lib/supabase/services/reservation-service";
export async function getPublicPricingConfig() {
  const times = await getStaySettings(),
    fallback = {
      ...BOOKING_CONFIG,
      touristTaxRateAmount: 0,
      extras: BOOKING_CONFIG.extras
        .filter(
          (item) =>
            item.enabled &&
            (item.key !== "early-checkin" || times.earlyCheckInEnabled) &&
            (item.key !== "late-checkout" || times.lateCheckOutEnabled),
        )
        .map((item) => ({
          ...item,
          amount:
            item.key === "early-checkin"
              ? Math.round(times.earlyCheckInFee * 100)
              : item.key === "late-checkout"
                ? Math.round(times.lateCheckOutFee * 100)
                : item.amount,
        })),
    };
  if (
    !process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_SERVICE_KEY
  )
    return fallback;
  try {
    return await new SupabasePricingRepository().getConfig();
  } catch (error) {
    console.warn("public_pricing_fallback", {
      code: error instanceof Error ? error.message : "UNKNOWN",
    });
    return fallback;
  }
}
export async function calculateServerPrice(
  checkIn: string,
  checkOut: string,
  extraKeys: string[],
) {
  return new ReservationService().calculatePrice(checkIn, checkOut, extraKeys);
}
export async function pendingExpirationMinutes() {
  return reservationHoldMinutes();
}
