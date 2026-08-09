import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_MINIMUM_ADVANCE_DAYS,
  normalizeMinimumAdvanceDays,
} from "./minimum-advance-days";

export type BookingMode = "instant" | "manual";
export type ReservationWorkflowSettings = {
  mode: BookingMode;
  paymentExpirationHours: number;
  minimumAdvanceDays: number;
};
const defaults: ReservationWorkflowSettings = {
  mode: "manual",
  paymentExpirationHours: 24,
  minimumAdvanceDays: DEFAULT_MINIMUM_ADVANCE_DAYS,
};

export async function getReservationWorkflowSettings(): Promise<ReservationWorkflowSettings> {
  const { data, error } = await createAdminClient().from("settings").select("value").eq("key", "reservation_workflow").maybeSingle();
  if (error) throw new Error("RESERVATION_WORKFLOW_READ_FAILED");
  const value = data?.value;
  if (!value || typeof value !== "object") return defaults;
  const raw = value as Record<string, unknown>;
  return {
    mode: raw.mode === "instant" ? "instant" : "manual",
    paymentExpirationHours: typeof raw.paymentExpirationHours === "number" && raw.paymentExpirationHours >= 1 && raw.paymentExpirationHours <= 168 ? raw.paymentExpirationHours : defaults.paymentExpirationHours,
    minimumAdvanceDays: normalizeMinimumAdvanceDays(raw.minimumAdvanceDays),
  };
}
