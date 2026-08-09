export const DEFAULT_MINIMUM_ADVANCE_DAYS = 1;

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
  today = new Date().toISOString().slice(0, 10),
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
