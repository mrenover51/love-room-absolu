export const DEFAULT_MINIMUM_ADVANCE_DAYS = 1;
export const BOOKING_TIME_ZONE = "Europe/Paris";

export function parisTodayIso(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BOOKING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function normalizeMinimumAdvanceDays(value: unknown) {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 30
    ? value
    : DEFAULT_MINIMUM_ADVANCE_DAYS;
}

export function minimumArrivalDate(
  minimumAdvanceDays: number,
  today = parisTodayIso(),
) {
  const date = new Date(`${today}T00:00:00Z`);
  date.setUTCDate(
    date.getUTCDate() + normalizeMinimumAdvanceDays(minimumAdvanceDays),
  );
  return date.toISOString().slice(0, 10);
}

export function assertMinimumAdvanceDays(
  checkIn: string,
  minimumAdvanceDays: number,
  today?: string,
) {
  if (checkIn < minimumArrivalDate(minimumAdvanceDays, today))
    throw new Error("MINIMUM_ADVANCE_DAYS");
}
