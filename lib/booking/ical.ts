import "server-only";
import ICAL from "ical.js";
import type { DateRange } from "./types";
import { getCalendarSourceDefinitions } from "@/lib/calendar/sources";

export type CalendarSource = "booking" | "airbnb";
export type ExternalCalendarEvent = DateRange & {
  uid: string;
  source: CalendarSource;
  summary: string;
  description: string;
  cancelled: boolean;
};
export type CalendarSyncStatus = "ok" | "not_configured" | "error";
type CachedCalendar = { expiresAt: number; events: ExternalCalendarEvent[] };
const cache = new Map<CalendarSource, CachedCalendar>();
const CACHE_MS = 15 * 60_000;

function calendarDate(value: ICAL.Time) {
  return `${String(value.year).padStart(4, "0")}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`;
}

export function parseIcal(
  content: string,
  source: CalendarSource = "booking",
): ExternalCalendarEvent[] {
  const root = new ICAL.Component(ICAL.parse(content));
  const events = root.getAllSubcomponents("vevent").map((component) => {
    try {
      const event = new ICAL.Event(component);
      if (!event.uid?.trim()) throw new Error("ICAL_EVENT_UID_MISSING");
      if (!event.startDate || !event.endDate)
        throw new Error("ICAL_EVENT_DATES_MISSING");
      const start = calendarDate(event.startDate);
      const end = calendarDate(event.endDate);
      if (end <= start) throw new Error("ICAL_EVENT_DATES_INVALID");
      const status = component.getFirstPropertyValue("status");
      return {
        start,
        end,
        uid: event.uid.trim(),
        source,
        summary: event.summary || "Indisponible",
        description: event.description || "",
        cancelled:
          typeof status === "string" && status.toUpperCase() === "CANCELLED",
      };
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("ICAL_EVENT_"))
        throw error;
      throw new Error("ICAL_EVENT_INVALID");
    }
  });
  const unique = new Map<string, ExternalCalendarEvent>();
  for (const event of events) {
    const key = `${event.source}:${event.uid}`;
    const previous = unique.get(key);
    if (
      previous &&
      (previous.start !== event.start ||
        previous.end !== event.end ||
        previous.cancelled !== event.cancelled)
    )
      throw new Error("ICAL_EVENT_UID_DUPLICATE");
    unique.set(key, event);
  }
  return [...unique.values()];
}

async function fetchCalendar(source: CalendarSource, url: string) {
  const previous = cache.get(source);
  if (previous && previous.expiresAt > Date.now())
    return { events: previous.events, status: "ok" as const };
  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
      headers: { accept: "text/calendar" },
    });
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    const events = parseIcal(await response.text(), source);
    cache.set(source, { expiresAt: Date.now() + CACHE_MS, events });
    return { events, status: "ok" as const };
  } catch (error) {
    console.warn("ical_sync_failed", {
      source,
      code: error instanceof Error ? error.message.slice(0, 40) : "UNKNOWN",
    });
    return { events: previous?.events ?? [], status: "error" as const };
  }
}

export async function getExternalCalendarData() {
  const definitions = await getCalendarSourceDefinitions();
  const results = await Promise.all(
    definitions.map(async ({ source, url }) =>
      url
        ? fetchCalendar(source, url)
        : { events: [], status: "not_configured" as const },
    ),
  );
  const events = [
    ...new Map(
      results
        .flatMap((result) => result.events)
        .map((event) => [
          `${event.source}:${event.start}:${event.end}:${event.uid}`,
          event,
        ]),
    ).values(),
  ];
  return {
    events,
    statuses: { booking: results[0].status, airbnb: results[1].status },
    synchronizedAt: new Date().toISOString(),
  };
}

export async function getExternalOccupiedRanges() {
  return (await getExternalCalendarData()).events.map(({ start, end }) => ({
    start,
    end,
  }));
}

function escapeIcal(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;")
    .replaceAll("\n", "\\n");
}
export function generateIcal(
  ranges: Array<
    DateRange & {
      id: string;
      summary?: string;
      description?: string;
      status?: string;
    }
  >,
) {
  const stamp = new Date()
    .toISOString()
    .replaceAll(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Love Room Absolu//Channel Manager//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...ranges.flatMap((range) => [
      "BEGIN:VEVENT",
      `UID:${escapeIcal(range.id)}@love-room-absolu`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${range.start.replaceAll("-", "")}`,
      `DTEND;VALUE=DATE:${range.end.replaceAll("-", "")}`,
      `SUMMARY:${escapeIcal(range.summary ?? "Indisponible")}`,
      `DESCRIPTION:${escapeIcal(range.description ?? "Période indisponible — Love Room Absolu")}`,
      `STATUS:${escapeIcal(range.status ?? "CONFIRMED")}`,
      "TRANSP:OPAQUE",
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
