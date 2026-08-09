import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(file, "utf8");
const migration = read(
  "supabase/migrations/202608090039_fail_closed_ical_availability.sql",
);
const syncCode = read("lib/calendar/sync.ts");
const repository = read(
  "lib/supabase/repositories/reservation-repository.ts",
);

const event = (uid, provider = "booking") => ({ uid, provider, active: true });
const state = (uids, provider = "booking") => ({
  events: uids.map((uid) => event(uid, provider)),
  observations: new Map(),
});

function synchronize(current, provider, incoming) {
  if (incoming === null) throw new Error("DOWNLOAD_OR_PARSE_FAILED");
  const next = structuredClone(current);
  const active = next.events.filter((item) => item.provider === provider && item.active);
  if (!incoming.length)
    return { ...next, suspicious: true, decision: "empty_snapshot_protected" };
  const received = new Set(incoming.map((item) => item.uid));
  const missing = active.filter((item) => !received.has(item.uid));
  const suspicious =
    missing.length > 1 ||
    (missing.length > 0 && missing.length * 2 >= active.length);
  for (const item of incoming) {
    const existing = next.events.find(
      (candidate) => candidate.provider === provider && candidate.uid === item.uid,
    );
    if (existing) existing.active = true;
    else next.events.push(event(item.uid, provider));
    next.observations.delete(`${provider}:${item.uid}`);
  }
  for (const item of missing) {
    const key = `${provider}:${item.uid}`;
    const count = next.observations.get(key) ?? 0;
    next.observations.set(key, suspicious ? count : count + 1);
    if (!suspicious && count + 1 >= 2) item.active = false;
  }
  return {
    ...next,
    suspicious,
    decision: suspicious
      ? "suspicious_snapshot_protected"
      : missing.length
        ? "absence_confirmation_pending"
        : "no_changes",
  };
}

test("A — une chute Booking de 10 à 3 conserve les sept UID absents", () => {
  const initial = state(Array.from({ length: 10 }, (_, index) => `B${index}`));
  const result = synchronize(initial, "booking", initial.events.slice(0, 3));
  assert.equal(result.suspicious, true);
  assert.equal(result.events.filter((item) => item.active).length, 10);
  assert.match(migration, /v_missing > 1/);
  assert.match(migration, /suspicious_snapshot_protected/);
});

test("B — une absence unique sûre exige deux snapshots cohérents", () => {
  const initial = state(["A", "B", "C"]);
  const first = synchronize(initial, "booking", [event("A"), event("C")]);
  assert.equal(first.events.find((item) => item.uid === "B")?.active, true);
  const second = synchronize(first, "booking", [event("A"), event("C")]);
  assert.equal(second.events.find((item) => item.uid === "B")?.active, false);
  assert.match(migration, /consecutive_count >= 2/);
});

test("C — un snapshot vide ne libère aucune date", () => {
  const result = synchronize(state(["A", "B", "C"]), "booking", []);
  assert.equal(result.events.every((item) => item.active), true);
  assert.equal(result.decision, "empty_snapshot_protected");
});

test("D/E — une erreur HTTP ou de parsing n'altère pas l'état", () => {
  const initial = state(["A", "B"]);
  assert.throws(() => synchronize(initial, "booking", null));
  assert.equal(initial.events.every((item) => item.active), true);
  assert.match(syncCode, /download_or_validation_failed_protected/);
  assert.ok(syncCode.indexOf("downloadCalendar") < syncCode.indexOf("db.rpc"));
});

test("F — un calendar_block Booking actif participe à la disponibilité", () => {
  assert.match(repository, /from\("calendar_blocks"\)/);
  assert.match(repository, /\.in\("status", \["confirmed", "blocked"\]\)/);
});

test("G — Checkout refuse atomiquement un bloc Airbnb actif", () => {
  assert.match(
    migration,
    /create or replace function public\.create_checkout_reservation[\s\S]*calendar_blocks[\s\S]*provider in \('booking','airbnb'\)[\s\S]*DATES_UNAVAILABLE/i,
  );
  assert.match(migration, /pg_advisory_xact_lock\(hashtext\('absolu_reservations'\)\)/);
});

test("H — demandes manuelles et validation utilisent les mêmes gardes", () => {
  const manual = read("lib/booking/manual-request-service.ts");
  assert.match(manual, /reservations\.isAvailable/);
  assert.match(manual, /repository\.create/);
  assert.match(repository, /calendar_blocks/);
  assert.match(migration, /create_checkout_reservation/);
});

test("I — une synchronisation répétée reste idempotente", () => {
  const first = synchronize(state([]), "booking", [event("A")]);
  const second = synchronize(first, "booking", [event("A")]);
  assert.equal(second.events.length, 1);
  assert.match(migration, /on conflict \(provider, ical_uid\)/i);
});

test("J — Booking suspect n'empêche pas Airbnb de progresser", () => {
  const initial = {
    events: [
      ...state(Array.from({ length: 10 }, (_, index) => `B${index}`)).events,
      event("AIR-1", "airbnb"),
    ],
    observations: new Map(),
  };
  const booking = synchronize(initial, "booking", initial.events.slice(0, 3));
  const airbnb = synchronize(booking, "airbnb", [
    event("AIR-1", "airbnb"),
    event("AIR-2", "airbnb"),
  ]);
  assert.equal(airbnb.events.filter((item) => item.provider === "booking" && item.active).length, 10);
  assert.equal(airbnb.events.filter((item) => item.provider === "airbnb" && item.active).length, 2);
  assert.match(syncCode, /for \(const \{ source, url \} of definitions\)/);
});

test("journalisation sans URL complète et droits RPC minimaux", () => {
  for (const column of [
    "sync_trigger",
    "downloaded_count",
    "validated_count",
    "previous_active_count",
    "missing_count",
    "missing_percentage",
    "reconciliation_decision",
    "suspicious_snapshot",
    "provider",
  ]) assert.ok(migration.includes(column), column);
  assert.match(syncCode, /createHash\("sha256"\)\.update\(url\)/);
  assert.doesNotMatch(syncCode, /import_url:\s*url/);
  assert.match(migration, /revoke all on function public\.sync_external_calendar[\s\S]*from public, anon, authenticated/i);
  assert.match(migration, /grant execute[\s\S]*to service_role/i);
});
