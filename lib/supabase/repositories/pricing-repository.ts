import { BOOKING_CONFIG } from "@/lib/booking/constants";
import type { PublicPricingConfig } from "@/lib/booking/types";
import { touristTaxRateToAmount } from "@/lib/booking/tourist-tax";
import { normalizeMinimumAdvanceDays } from "@/lib/booking/minimum-advance-days";
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
        .select(
          "option_key,name,description,price,active,order,image_url,icon,billing_type,available_weekdays,max_quantity,min_lead_days",
        )
        .eq("active", true)
        .order("order"),
      db
        .from("seasonal_prices")
        .select("start_date,end_date,price,season")
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
          "taxes",
          "reservation_workflow",
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
      rawWorkflow = value("reservation_workflow"),
      minimumAdvanceDays = normalizeMinimumAdvanceDays(
        typeof rawWorkflow === "object" && rawWorkflow !== null
          ? (rawWorkflow as Record<string, unknown>).minimumAdvanceDays
          : undefined,
      ),
      rawTaxes = value("taxes"),
      touristTaxRate =
        typeof rawTaxes === "object" &&
        rawTaxes !== null &&
        "rate" in rawTaxes &&
        typeof rawTaxes.rate === "number" &&
        Number.isFinite(rawTaxes.rate) &&
        rawTaxes.rate >= 0
          ? rawTaxes.rate
          : 0,
      rawRules = value("revenue_rules"),
      revenueRules =
        typeof rawRules === "object" &&
        rawRules !== null &&
        "lastMinuteDays" in rawRules
          ? (rawRules as PublicPricingConfig["revenueRules"])
          : undefined,
      extras = (options ?? []).map((row) => ({
        key: row.option_key,
        label: row.name,
        description: row.description,
        amount: row.price,
        enabled: row.active,
        imageUrl: row.image_url ?? undefined,
        icon: row.icon ?? undefined,
        billingType: row.billing_type,
        availableWeekdays: row.available_weekdays,
        maxQuantity: row.max_quantity,
        minLeadDays: row.min_lead_days,
      }));
    return {
      touristTaxRateAmount: touristTaxRateToAmount(touristTaxRate),
      minimumAdvanceDays,
      weekdayAmounts: Object.fromEntries(
        (prices ?? []).map((row) => [row.weekday, row.price]),
      ) as Record<number, number>,
      seasonalPrices: (seasons ?? []).map((row) => ({
        startDate: row.start_date,
        endDate: row.end_date,
        amount: row.price,
        season: row.season,
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
