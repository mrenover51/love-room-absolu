import { BOOKING_CONFIG } from "@/lib/booking/constants";
import type { PublicPricingConfig } from "@/lib/booking/types";
import { DEFAULT_STAY_SETTINGS, type StaySettings } from "@/lib/stay-config";
import { createAdminClient } from "@/lib/supabase/admin";
export class SupabasePricingRepository {
  async validatePromoCode(code: string) {
    const now = new Date().toISOString();
    const { data, error } = await createAdminClient()
      .from("promo_codes")
      .select("code,discount_percent,max_uses,uses,starts_at,ends_at,active")
      .eq("code", code.trim().toUpperCase())
      .eq("active", true)
      .maybeSingle();
    if (error) throw new Error("PROMO_READ_FAILED");
    if (
      !data ||
      (data.starts_at && data.starts_at > now) ||
      (data.ends_at && data.ends_at < now) ||
      (data.max_uses !== null && data.uses >= data.max_uses)
    )
      return null;
    return { code: data.code, discountPercent: data.discount_percent };
  }
  async getConfig(): Promise<PublicPricingConfig> {
    const db = createAdminClient();
    const [
      { data: prices, error: pe },
      { data: options, error: oe },
      { data: seasons, error: se },
      { data: promotions, error: pre },
      { data: settings, error: ste },
    ] = await Promise.all([
      db.from("pricing").select("weekday,price"),
      db
        .from("options")
        .select("option_key,name,description,price,active,order")
        .eq("active", true)
        .order("order"),
      db
        .from("seasonal_prices")
        .select("start_date,end_date,price")
        .eq("active", true)
        .order("start_date"),
      db
        .from("promotions")
        .select("start_date,end_date,discount_percent")
        .eq("active", true),
      db
        .from("settings")
        .select("key,value")
        .in("key", [
          "minimum_nights",
          "maximum_nights",
          "revenue_rules",
          "times",
        ]),
    ]);
    if (pe || oe || se || pre || ste) throw new Error("PRICING_READ_FAILED");
    const value = (key: string) =>
        settings?.find((item) => item.key === key)?.value,
      rule = (key: string, fallback: number) => {
        const item = value(key);
        return typeof item === "object" &&
          item !== null &&
          "value" in item &&
          typeof item.value === "number"
          ? item.value
          : fallback;
      },
      rawRules = value("revenue_rules"),
      revenueRules =
        typeof rawRules === "object" &&
        rawRules !== null &&
        "lastMinuteDays" in rawRules
          ? (rawRules as PublicPricingConfig["revenueRules"])
          : undefined,
      rawTimes = value("times"),
      times =
        typeof rawTimes === "object" && rawTimes !== null
          ? (rawTimes as Partial<StaySettings>)
          : DEFAULT_STAY_SETTINGS;
    const extras = (options ?? [])
      .filter(
        (row) =>
          (row.option_key !== "early-checkin" &&
            row.option_key !== "late-checkout") ||
          (row.option_key === "early-checkin"
            ? times.earlyCheckInEnabled
            : times.lateCheckOutEnabled),
      )
      .map((row) => ({
        key: row.option_key,
        label: row.name,
        description: row.description,
        amount:
          row.option_key === "early-checkin"
            ? Math.round((times.earlyCheckInFee ?? 0) * 100)
            : row.option_key === "late-checkout"
              ? Math.round((times.lateCheckOutFee ?? 0) * 100)
              : row.price,
        enabled: row.active,
      }));
    return {
      weekdayAmounts: Object.fromEntries(
        (prices ?? []).map((row) => [row.weekday, row.price]),
      ) as Record<number, number>,
      seasonalPrices: (seasons ?? []).map((row) => ({
        startDate: row.start_date,
        endDate: row.end_date,
        amount: row.price,
      })),
      promotions: (promotions ?? []).map((row) => ({
        startDate: row.start_date,
        endDate: row.end_date,
        discountPercent: row.discount_percent,
      })),
      revenueRules,
      extras,
      currency: BOOKING_CONFIG.currency,
      minimumNights: rule("minimum_nights", BOOKING_CONFIG.minimumNights),
      maximumNights: rule("maximum_nights", BOOKING_CONFIG.maximumNights),
    };
  }
}
