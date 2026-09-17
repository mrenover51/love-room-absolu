export const PARIS_TIME_ZONE = "Europe/Paris";
export const DEFAULT_ACCESS_LEAD_HOURS = 48;

export function parisParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PARIS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

export function addCalendarDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function wallClockValue(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return Date.UTC(year, month - 1, day, hour, minute);
}

/** Convertit une date/heure murale Europe/Paris en instant UTC réel. */
export function parisDateTimeToInstant(date: string, time: string) {
  const target = wallClockValue(date, time);
  let instant = new Date(target);
  for (let iteration = 0; iteration < 3; iteration += 1) {
    const local = parisParts(instant);
    const correction = target - wallClockValue(local.date, local.time);
    if (correction === 0) return instant;
    instant = new Date(instant.getTime() + correction);
  }
  return instant;
}

export function accessDueAt(
  checkIn: string,
  checkInTime: string,
  leadHours = DEFAULT_ACCESS_LEAD_HOURS,
) {
  return new Date(
    parisDateTimeToInstant(checkIn, checkInTime).getTime() -
      leadHours * 60 * 60 * 1000,
  );
}

export function reservationAllowsAccess(input: {
  status: string;
  paymentStatus: string;
  source: string;
}) {
  if (input.status !== "confirmed" || input.paymentStatus === "refunded")
    return false;
  return (
    input.source !== "direct" ||
    input.paymentStatus === "paid" ||
    input.paymentStatus === "partially_refunded"
  );
}

export function selectKeyboxCode(
  reservationCode: string | null | undefined,
  defaultCode: string | null | undefined,
) {
  const code = reservationCode?.trim() || defaultCode?.trim() || null;
  return { code, warning: code ? null : "KEYBOX_CODE_MISSING" } as const;
}

export function canRevealKeybox(input: {
  now: Date;
  checkIn: string;
  status: string;
  paymentStatus: string;
  source: string;
  checkInTime: string;
  leadHours?: number;
}) {
  const checkInAt = parisDateTimeToInstant(input.checkIn, input.checkInTime);
  return (
    reservationAllowsAccess(input) &&
    input.now >= accessDueAt(input.checkIn, input.checkInTime, input.leadHours) &&
    input.now < checkInAt
  );
}

export function portalExpired(
  checkOut: string,
  retentionDays: number,
  now: Date,
) {
  return parisParts(now).date > addCalendarDays(checkOut, retentionDays);
}

export type ScheduledCommunication =
  | "pre_arrival"
  | "access_48h"
  | "access_ready"
  | "checkout_reminder"
  | "post_stay_review";

export function communicationWindowOpen(input: {
  type: ScheduledCommunication;
  checkIn: string;
  checkOut: string;
  now: Date;
  checkInTime?: string;
  accessLeadHours?: number;
}) {
  const checkInTime = input.checkInTime ?? "16:00";
  if (input.type === "access_48h") {
    const checkInAt = parisDateTimeToInstant(input.checkIn, checkInTime);
    return (
      input.now >= accessDueAt(input.checkIn, checkInTime, input.accessLeadHours) &&
      input.now < checkInAt
    );
  }
  const rules = {
    pre_arrival: { date: addCalendarDays(input.checkIn, -2), time: "10:00" },
    access_ready: { date: input.checkIn, time: checkInTime },
    checkout_reminder: { date: input.checkOut, time: "08:30" },
    post_stay_review: {
      date: addCalendarDays(input.checkOut, 1),
      time: "10:00",
    },
  } as const;
  const local = parisParts(input.now);
  const due = rules[input.type];
  return local.date === due.date && local.time >= due.time;
}
