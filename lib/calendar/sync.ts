import "server-only";
import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { lookup } from "node:dns/promises";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseIcal, type CalendarSource } from "@/lib/booking/ical";
import { getCalendarSourceDefinitions } from "@/lib/calendar/sources";

export type SyncResult = {
  source: CalendarSource;
  status: "ok" | "failed" | "skipped";
  events: number;
  imported: number;
  updated: number;
  cancelled: number;
  conflicts: number;
  previousActive: number;
  missing: number;
  missingPercentage: number;
  protected: number;
  suspicious: boolean;
  decision: string;
  durationMs: number;
  error?: string;
};
type TransactionResult = {
  imported: number;
  updated: number;
  cancelled: number;
  conflicts: number;
  previousActive: number;
  missing: number;
  missingPercentage: number;
  protected: number;
  suspicious: boolean;
  decision: string;
};
export type SyncTrigger = "individual" | "sync-all" | "cron" | "api";
const MAX_ICAL_BYTES = 2_000_000;
const MAX_EVENTS = 500;

export function validateCalendarUrl(raw: string) {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("ICAL_URL_INVALID");
  }
  if (url.protocol !== "https:") throw new Error("ICAL_URL_HTTPS_REQUIRED");
  if (url.username || url.password)
    throw new Error("ICAL_URL_CREDENTIALS_FORBIDDEN");
  const host = url.hostname.toLowerCase();
  if (
    host === ["local", "host"].join("") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    isIP(host) !== 0 ||
    host === "0.0.0.0"
  )
    throw new Error("ICAL_URL_HOST_FORBIDDEN");
  return url.toString();
}

function privateAddress(address: string) {
  if (
    address === "::1" ||
    address.startsWith("fe80:") ||
    address.startsWith("fc") ||
    address.startsWith("fd")
  )
    return true;
  const parts = address.split(".").map(Number);
  if (parts.length !== 4) return false;
  return (
    parts[0] === 10 ||
    parts[0] === 127 ||
    parts[0] === 0 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && (parts[1] ?? 0) >= 16 && (parts[1] ?? 0) <= 31) ||
    (parts[0] === 192 && parts[1] === 168)
  );
}
async function assertPublicDns(rawUrl: string) {
  const host = new URL(rawUrl).hostname,
    addresses = await lookup(host, { all: true, verbatim: true });
  if (
    !addresses.length ||
    addresses.some((item) => privateAddress(item.address))
  )
    throw new Error("ICAL_URL_DNS_FORBIDDEN");
}

export async function downloadCalendar(rawUrl: string, source: CalendarSource) {
  const url = validateCalendarUrl(rawUrl);
  await assertPublicDns(url);
  const response = await fetch(url, {
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
    headers: {
      accept: "text/calendar,text/plain;q=0.8",
      "user-agent": "LoveRoomAbsolu-ChannelManager/1.0",
    },
  });
  if (!response.ok) throw new Error(`ICAL_HTTP_${response.status}`);
  const length = Number(response.headers.get("content-length") ?? 0);
  if (length > MAX_ICAL_BYTES) throw new Error("ICAL_TOO_LARGE");
  const content = await response.text();
  if (new TextEncoder().encode(content).byteLength > MAX_ICAL_BYTES)
    throw new Error("ICAL_TOO_LARGE");
  if (
    !content.includes("BEGIN:VCALENDAR") ||
    !content.includes("END:VCALENDAR")
  )
    throw new Error("ICAL_FORMAT_INVALID");
  const events = parseIcal(content, source);
  if (events.length > MAX_EVENTS) throw new Error("ICAL_TOO_MANY_EVENTS");
  return events;
}

const externalReference = (source: CalendarSource, uid: string) =>
  `EXT-${source.slice(0, 3).toUpperCase()}-${createHash("sha256").update(uid).digest("hex").slice(0, 12).toUpperCase()}`;
async function recordNotification(
  kind: string,
  title: string,
  message: string,
) {
  const db = createAdminClient();
  await db.from("notifications").insert({ kind, title, message });
}

export async function syncExternalCalendar(
  source: CalendarSource,
  url: string,
  trigger: SyncTrigger = "api",
): Promise<SyncResult> {
  const started = Date.now(),
    db = createAdminClient();
  try {
    const incoming = await downloadCalendar(url, source),
      now = new Date().toISOString();
    const events = incoming.map((event) => ({
      uid: event.uid,
      start: event.start,
      end: event.end,
      summary: event.summary,
      cancelled: event.cancelled,
      reference: externalReference(source, event.uid),
      email: `ical-${createHash("sha256").update(`${source}:${event.uid}`).digest("hex").slice(0, 16)}@invalid.local`,
    }));
    const { data, error } = await db.rpc("sync_external_calendar", {
      p_provider: source,
      p_events: events,
      p_synced_at: now,
    });
    if (error || !data) throw new Error("ICAL_DATABASE_TRANSACTION_FAILED");
    const counts = data as TransactionResult;
    const result = {
      source,
      status: "ok" as const,
      events: incoming.length,
      imported: counts.imported,
      updated: counts.updated,
      cancelled: counts.cancelled,
      conflicts: counts.conflicts,
      previousActive: counts.previousActive,
      missing: counts.missing,
      missingPercentage: counts.missingPercentage,
      protected: counts.protected,
      suspicious: counts.suspicious,
      decision: counts.decision,
      durationMs: Date.now() - started,
    };
    await db.from("sync_logs").insert({
      source,
      status: "success",
      events_count: incoming.length,
      imported_count: result.imported,
      updated_count: result.updated,
      cancelled_count: result.cancelled,
      conflict_count: result.conflicts,
      sync_trigger: trigger,
      provider: source,
      downloaded_count: incoming.length,
      validated_count: incoming.length,
      previous_active_count: result.previousActive,
      missing_count: result.missing,
      missing_percentage: result.missingPercentage,
      reconciliation_decision: result.decision,
      suspicious_snapshot: result.suspicious,
      url_fingerprint: createHash("sha256").update(url).digest("hex"),
      duration_ms: result.durationMs,
    });
    await recordNotification(
      "success",
      "Synchronisation rÃ©ussie",
      `${source} : ${incoming.length} rÃ©servation(s) traitÃ©e(s).`,
    );
    return result;
  } catch (error) {
    const message =
        error instanceof Error ? error.message : "ICAL_UNKNOWN_ERROR",
      durationMs = Date.now() - started;
    const { count: protectedCount } = await db
      .from("calendar_blocks")
      .select("id", { count: "exact", head: true })
      .eq("provider", source)
      .in("status", ["confirmed", "blocked"]);
    await db
      .from("calendar_sources")
      .update({
        status: "error",
        last_error: message,
        suspicious_snapshot: true,
        reconciliation_blocked: true,
        protected_count: protectedCount ?? 0,
        updated_at: new Date().toISOString(),
      })
      .eq("provider", source);
    await db.from("sync_logs").insert({
      source,
      status: "failed",
      events_count: 0,
      error_code: message.slice(0, 80),
      error_message: message.slice(0, 500),
      sync_trigger: trigger,
      provider: source,
      reconciliation_decision: "download_or_validation_failed_protected",
      suspicious_snapshot: true,
      url_fingerprint: createHash("sha256").update(url).digest("hex"),
      duration_ms: durationMs,
    });
    await recordNotification(
      "error",
      "Synchronisation Ã©chouÃ©e",
      `${source} : ${message}.`,
    );
    return {
      source,
      status: "failed",
      events: 0,
      imported: 0,
      updated: 0,
      cancelled: 0,
      conflicts: 0,
      previousActive: 0,
      missing: 0,
      missingPercentage: 0,
      protected: 0,
      suspicious: true,
      decision: "download_or_validation_failed_protected",
      durationMs,
      error: message,
    };
  }
}

export async function syncAllCalendars(trigger: SyncTrigger = "sync-all") {
  const definitions = await getCalendarSourceDefinitions(),
    results: SyncResult[] = [];
  for (const { source, url } of definitions) {
    if (!url) {
      results.push({
        source,
        status: "skipped",
        events: 0,
        imported: 0,
        updated: 0,
        cancelled: 0,
        conflicts: 0,
        previousActive: 0,
        missing: 0,
        missingPercentage: 0,
        protected: 0,
        suspicious: false,
        decision: "not_configured",
        durationMs: 0,
      });
      continue;
    }
    results.push(await syncExternalCalendar(source, url, trigger));
  }
  return results;
}

export async function testCalendar(source: CalendarSource, url: string) {
  const started = Date.now(),
    events = await downloadCalendar(url, source);
  return {
    source,
    valid: true,
    events: events.length,
    durationMs: Date.now() - started,
    firstEvent: events[0] ?? null,
  };
}
