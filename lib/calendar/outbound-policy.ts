export type OutboundReservation = {
  id: string;
  provider: string;
  status: string;
  check_in: string;
  check_out: string;
  payment_expires_at: string | null;
};

export type OutboundBlockedDate = {
  id: string;
  source: string;
  start_date: string;
  end_date: string;
  reason: string | null;
};

export type OutboundCalendarRange = {
  id: string;
  start: string;
  end: string;
  summary: string;
  description: string;
  status: "CONFIRMED";
  kind: "direct_reservation" | "manual_block";
};

export function selectOutboundCalendarRanges(
  reservations: OutboundReservation[],
  blockedDates: OutboundBlockedDate[],
  now: Date,
): OutboundCalendarRange[] {
  const direct = reservations
    .filter(
      (row) =>
        ["site", "manual"].includes(row.provider) &&
        (row.status === "confirmed" ||
          (row.status === "pending_payment" &&
            Boolean(row.payment_expires_at) &&
            Date.parse(row.payment_expires_at as string) > now.getTime())),
    )
    .map((row) => ({
      id: `reservation-${row.id}`,
      start: row.check_in,
      end: row.check_out,
      summary: "Indisponible",
      description: "Réservation directe — Love Room Absolu",
      status: "CONFIRMED" as const,
      kind: "direct_reservation" as const,
    }));

  const manual = blockedDates
    .filter((row) => row.source === "manual")
    .map((row) => ({
      id: `blocked-${row.id}`,
      start: row.start_date,
      end: row.end_date,
      summary: "Indisponible",
      description: "Blocage manuel — Love Room Absolu",
      status: "CONFIRMED" as const,
      kind: "manual_block" as const,
    }));

  return [...direct, ...manual].sort(
    (left, right) =>
      left.start.localeCompare(right.start) || left.id.localeCompare(right.id),
  );
}
