const DAY_MS = 86_400_000;

export function parseIsoDate(value: string) {
  return new Date(`${value}T12:00:00Z`);
}

export function toIsoDate(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function addDays(value: string, days: number) {
  const date = parseIsoDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

export function nightsBetween(checkIn: string, checkOut: string) {
  return Math.round((parseIsoDate(checkOut).getTime() - parseIsoDate(checkIn).getTime()) / DAY_MS);
}

// Les séjours sont des intervalles semi-ouverts [arrivée, départ[ : un départ
// et une nouvelle arrivée le même jour ne se chevauchent donc pas.
export function dateRangesOverlap(startA: string, endA: string, startB: string, endB: string) {
  return startA < endB && endA > startB;
}
