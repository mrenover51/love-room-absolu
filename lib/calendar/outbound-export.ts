import "server-only";
import { generateIcal } from "@/lib/booking/ical";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  selectOutboundCalendarRanges,
  type OutboundBlockedDate,
  type OutboundReservation,
} from "@/lib/calendar/outbound-policy";

export async function createOutboundCalendarResponse() {
  const db = createAdminClient();
  const now = new Date();
  const [{ data: reservations, error: reservationError }, { data: blocks, error: blockError }] =
    await Promise.all([
      db
        .from("reservations")
        .select(
          "id,provider,status,check_in,check_out,payment_expires_at",
        )
        .in("provider", ["site", "manual"])
        .or(
          `status.eq.confirmed,and(status.eq.pending_payment,payment_expires_at.gt.${now.toISOString()})`,
        ),
      db
        .from("blocked_dates")
        .select("id,source,start_date,end_date,reason")
        .eq("source", "manual"),
    ]);

  if (reservationError || blockError)
    return new Response("Export temporairement indisponible", { status: 503 });

  const ranges = selectOutboundCalendarRanges(
    (reservations ?? []) as OutboundReservation[],
    (blocks ?? []) as OutboundBlockedDate[],
    now,
  );
  const calendar = generateIcal(ranges);
  const manualCount = ranges.filter(
    (range) => range.kind === "manual_block",
  ).length;
  const directCount = ranges.length - manualCount;

  return new Response(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition":
        "attachment; filename=love-room-absolu.ics",
      "Cache-Control": "no-store, max-age=0",
      "X-Calendar-Events": String(ranges.length),
      "X-Calendar-Direct": String(directCount),
      "X-Calendar-Manual-Blocks": String(manualCount),
      "X-Generated-At": now.toISOString(),
    },
  });
}
