import { NextResponse } from "next/server";
import { z } from "zod";
import { getAvailabilityData } from "@/lib/booking/availability";
import { BOOKING_CONFIG } from "@/lib/booking/constants";

const querySchema = z.object({ from: z.iso.date(), to: z.iso.date() });
export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({ from: url.searchParams.get("from"), to: url.searchParams.get("to") });
  if (!parsed.success || parsed.data.to <= parsed.data.from) return NextResponse.json({ error: "Période invalide." }, { status: 400 });
  const availability = await getAvailabilityData();
  const blockedDates = availability.ranges.filter((range) => range.start < parsed.data.to && range.end > parsed.data.from).map((range) => ({ ...range, label: "Indisponible" }));
  const externalCalendarWarning = Object.values(availability.statuses).includes("error");
  return NextResponse.json({ blockedDates, ranges: blockedDates.map(({ start, end }) => ({ start, end })), minimumNights: BOOKING_CONFIG.minimumNights, maximumNights: BOOKING_CONFIG.maximumNights, lastSynchronization: availability.synchronizedAt, externalCalendarWarning }, { headers: { "cache-control": "private, max-age=60" } });
}
