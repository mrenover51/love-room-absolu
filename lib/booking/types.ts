export type BookingStatus =
  "pending" | "request" | "blocked" | "confirmed" | "cancelled";
export type DateRange = { start: string; end: string };
export type NightPrice = { date: string; weekday: number; amount: number };
export type ExtraSelection = { key: string; quantity: number };
export type SelectedExtra = {
  key: string;
  label: string;
  amount: number;
  quantity?: number;
};
export type PublicPricingConfig = {
  weekdayAmounts?: Record<number, number>;
  seasonalPrices?: Array<{
    startDate: string;
    endDate: string;
    amount: number;
    season?: "low" | "medium" | "high";
  }>;
  promotions?: Array<{
    startDate: string;
    endDate: string;
    discountPercent: number;
  }>;
  revenueRules?: {
    lastMinuteDays: number;
    lastMinuteDiscount: number;
    longStayNights: number;
    longStayDiscount: number;
    weekendMarkup?: number;
    holidayMarkup?: number;
    holidayEveMarkup?: number;
    holidayDates?: string[];
  };
  baseNightAmount?: number;
  fridaySupplement?: number;
  saturdaySupplement?: number;
  serviceFeeAmount?: number;
  minimumNights: number;
  maximumNights: number;
  currency: string;
  extras: Array<SelectedExtra & { description?: string; enabled?: boolean }>;
};
export type PricingBreakdown = {
  nights: number;
  nightPrices: NightPrice[];
  baseAmount: number;
  weekendSupplements: number;
  extrasAmount: number;
  feesAmount: number;
  totalAmount: number;
  discountAmount?: number;
  promoCode?: string;
  currency: string;
  extras: SelectedExtra[];
};
export type PriceBreakdown = PricingBreakdown;
export type BookingQuote = PricingBreakdown & {
  checkIn: string;
  checkOut: string;
};
export type BookingRequest = {
  id: string;
  reference: string;
  createdAt: string;
  expiresAt: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  guestCount: number;
  message?: string;
  extraKeys: string[];
  pricing: PriceBreakdown;
  fingerprint: string;
};
export type PublicBookingSummary = Pick<
  BookingRequest,
  "reference" | "checkIn" | "checkOut" | "guestCount" | "pricing"
>;
