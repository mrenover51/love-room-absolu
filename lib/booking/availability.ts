import "server-only";
import { bookingRepository } from "./repository";
import { getExternalCalendarData } from "./ical";
import { dateRangesOverlap } from "./date-utils";
import type { DateRange } from "./types";
import { SupabaseReservationRepository } from "@/lib/supabase/repositories/reservation-repository";

export { dateRangesOverlap } from "./date-utils";
export function rangesOverlap(start: string, end: string, range: DateRange) {
  return dateRangesOverlap(start, end, range.start, range.end);
}
export function mergeRanges(ranges: DateRange[]) {
  return [...ranges]
    .sort((a, b) => a.start.localeCompare(b.start))
    .reduce<DateRange[]>((result, range) => {
      const last = result.at(-1);
      if (last && range.start <= last.end)
        last.end = last.end > range.end ? last.end : range.end;
      else result.push({ ...range });
      return result;
    }, []);
}
export async function getAvailabilityData() {
  const configured = Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL) &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY),
  );
  const direct = configured
    ? await new SupabaseReservationRepository().occupiedRanges()
    : await bookingRepository.occupiedRanges();
  const external = await getExternalCalendarData();
  return {
    ranges: mergeRanges([
      ...direct,
      ...external.events.map(({ start, end }) => ({ start, end })),
    ]),
    statuses: external.statuses,
    synchronizedAt: external.synchronizedAt,
  };
}
export async function getOccupiedRanges() {
  return (await getAvailabilityData()).ranges;
}
export async function isAvailable(start: string, end: string) {
  const configured = Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL) &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY),
  );
  if (
    configured &&
    !(await new SupabaseReservationRepository().isAvailable(start, end))
  )
    return false;
  return !(await getOccupiedRanges()).some((range) =>
    dateRangesOverlap(start, end, range.start, range.end),
  );
}
