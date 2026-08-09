import { BOOKING_CONFIG } from "./constants";
import { addDays, nightsBetween } from "./date-utils";
import { parseIsoDate } from "./date-utils";
import { calculateBookingTotal, calculateTouristTax } from "./tourist-tax";
import type {
  ExtraBillingType,
  PriceBreakdown,
  PublicExtra,
  PublicPricingConfig,
} from "./types";

export { nightsBetween } from "./date-utils";

export const defaultPricingConfig: PublicPricingConfig = {
  touristTaxRateAmount: 0,
  minimumNights: BOOKING_CONFIG.minimumNights,
  maximumNights: BOOKING_CONFIG.maximumNights,
  currency: BOOKING_CONFIG.currency,
  extras: BOOKING_CONFIG.extras
    .filter((extra) => extra.enabled)
    .map((extra) => ({ ...extra })),
};

export function calculateStayPrice(
  checkIn: string,
  checkOut: string,
  extraKeys: string[] = [],
): PriceBreakdown {
  const nights = nightsBetween(checkIn, checkOut);
  if (
    nights < BOOKING_CONFIG.minimumNights ||
    nights > BOOKING_CONFIG.maximumNights
  )
    throw new Error("INVALID_STAY_LENGTH");
  const nightPrices = Array.from({ length: nights }, (_, index) => {
    const date = addDays(checkIn, index);
    const weekday = parseIsoDate(date).getUTCDay();
    return { date, weekday, amount: BOOKING_CONFIG.weekdayAmounts[weekday] };
  });
  const extras = [...new Set(extraKeys)].map((key) => {
    const extra = BOOKING_CONFIG.extras.find(
      (item) => item.key === key && item.enabled,
    );
    if (!extra) throw new Error("INVALID_EXTRA");
    return {
      key: extra.key,
      label: extra.label,
      amount: extra.amount,
      quantity: 1,
    };
  });
  const baseAmount = nightPrices.reduce((sum, night) => sum + night.amount, 0);
  const extrasAmount = extras.reduce((sum, extra) => sum + extra.amount, 0);
  return {
    nights,
    nightPrices,
    baseAmount,
    weekendSupplements: 0,
    extrasAmount,
    feesAmount: 0,
    totalAmount: baseAmount + extrasAmount,
    currency: BOOKING_CONFIG.currency,
    extras,
  };
}

export function calculatePriceFromConfig(
  checkIn: string,
  checkOut: string,
  extraKeys: string[],
  config: PublicPricingConfig = defaultPricingConfig,
  promoPercent = 0,
  promoCode?: string,
  guestCount = 1,
): PriceBreakdown {
  const nights = nightsBetween(checkIn, checkOut);
  if (nights < config.minimumNights || nights > config.maximumNights)
    throw new Error("INVALID_STAY_LENGTH");
  const rules = config.revenueRules,
    daysBefore = Math.max(
      0,
      Math.ceil((Date.parse(`${checkIn}T12:00:00Z`) - Date.now()) / 86400000),
    );
  const automaticDiscount = Math.max(
    rules && daysBefore <= rules.lastMinuteDays ? rules.lastMinuteDiscount : 0,
    rules && nights >= rules.longStayNights ? rules.longStayDiscount : 0,
  );
  const holidayDates = new Set(rules?.holidayDates ?? []);
  const nightPrices = Array.from({ length: nights }, (_, index) => {
    const date = addDays(checkIn, index),
      weekday = parseIsoDate(date).getUTCDay();
    const seasonal = config.seasonalPrices
      ?.filter((item) => item.startDate <= date && item.endDate > date)
      .at(-1);
    const amount =
      seasonal?.amount ??
      config.weekdayAmounts?.[weekday] ??
      BOOKING_CONFIG.weekdayAmounts[weekday];
    if (!Number.isInteger(amount)) throw new Error("PRICING_INCOMPLETE");
    const holiday = holidayDates.has(date),
      eve = holidayDates.has(addDays(date, 1)),
      weekend = weekday === 5 || weekday === 6;
    const specialMarkup = holiday
      ? (rules?.holidayMarkup ?? 0)
      : eve
        ? (rules?.holidayEveMarkup ?? 0)
        : weekend
          ? (rules?.weekendMarkup ?? 0)
          : 0;
    const promotion =
        config.promotions
          ?.filter((item) => item.startDate <= date && item.endDate > date)
          .reduce((max, item) => Math.max(max, item.discountPercent), 0) ?? 0,
      discount = Math.max(automaticDiscount, promotion),
      adjustedAmount = Math.round((amount * (100 + specialMarkup)) / 100);
    return {
      date,
      weekday,
      amount: Math.round((adjustedAmount * (100 - discount)) / 100),
    };
  });
  const extras = [...new Set(extraKeys)].map((key) => {
    const extra = config.extras.find(
      (item) => item.key === key && item.enabled !== false,
    );
    if (!extra || !isExtraAvailable(extra, checkIn))
      throw new Error("INVALID_EXTRA");
    const quantity = extraQuantity(
      extra.billingType ?? "per_stay",
      nights,
      guestCount,
    );
    return {
      key: extra.key,
      label: extra.label,
      amount: extra.amount * quantity,
      quantity,
    };
  });
  const undiscountedBase = nightPrices.reduce(
      (sum, night) => sum + night.amount,
      0,
    ),
    discountAmount = Math.round(
      (undiscountedBase * Math.min(80, Math.max(0, promoPercent))) / 100,
    ),
    baseAmount = undiscountedBase - discountAmount,
    extrasAmount = extras.reduce((sum, extra) => sum + extra.amount, 0),
    feesAmount = calculateTouristTax(
      config.touristTaxRateAmount,
      nights,
      guestCount,
    );
  return {
    nights,
    nightPrices,
    baseAmount,
    weekendSupplements: 0,
    extrasAmount,
    feesAmount,
    totalAmount: calculateBookingTotal(baseAmount, extrasAmount, feesAmount),
    currency: config.currency,
    extras,
    discountAmount,
    promoCode,
  };
}

function extraQuantity(
  billingType: ExtraBillingType,
  nights: number,
  guestCount: number,
) {
  const guests = Math.max(1, guestCount);
  if (billingType === "per_night") return nights;
  if (billingType === "per_person") return guests;
  if (billingType === "per_person_per_night") return guests * nights;
  return 1;
}

export function isExtraAvailable(extra: PublicExtra, checkIn: string) {
  if (!checkIn) return true;
  const weekday = parseIsoDate(checkIn).getUTCDay();
  if (
    extra.availableWeekdays?.length &&
    !extra.availableWeekdays.includes(weekday)
  )
    return false;
  const leadDays = Math.floor(
    (Date.parse(`${checkIn}T00:00:00Z`) -
      Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`)) /
      86_400_000,
  );
  return leadDays >= (extra.minLeadDays ?? 0);
}
export const calculatePrice = calculateStayPrice;
export function formatAmount(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: BOOKING_CONFIG.currency,
  }).format(amount / 100);
}
