import "server-only";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_STAY_SETTINGS, type StaySettings } from "@/lib/stay-config";

const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function parseSettings(value: unknown): StaySettings {
  if (!value || typeof value !== "object") return DEFAULT_STAY_SETTINGS;
  const row = value as Record<string, unknown>;
  return {
    checkIn: typeof row.checkIn === "string" && timePattern.test(row.checkIn) ? row.checkIn : DEFAULT_STAY_SETTINGS.checkIn,
    checkOut: typeof row.checkOut === "string" && timePattern.test(row.checkOut) ? row.checkOut : DEFAULT_STAY_SETTINGS.checkOut,
    earlyCheckInEnabled: typeof row.earlyCheckInEnabled === "boolean" ? row.earlyCheckInEnabled : false,
    lateCheckOutEnabled: typeof row.lateCheckOutEnabled === "boolean" ? row.lateCheckOutEnabled : false,
    earlyCheckInFee: typeof row.earlyCheckInFee === "number" && row.earlyCheckInFee >= 0 ? row.earlyCheckInFee : 0,
    lateCheckOutFee: typeof row.lateCheckOutFee === "number" && row.lateCheckOutFee >= 0 ? row.lateCheckOutFee : 0,
  };
}

export const getStaySettings = cache(async (): Promise<StaySettings> => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_KEY) return DEFAULT_STAY_SETTINGS;
  try {
    const { data, error } = await createAdminClient().from("settings").select("value").eq("key", "times").maybeSingle();
    if (error) throw error;
    return parseSettings(data?.value);
  } catch (error) {
    console.warn("stay_settings_fallback", { code: error instanceof Error ? error.message : "UNKNOWN" });
    return DEFAULT_STAY_SETTINGS;
  }
});
