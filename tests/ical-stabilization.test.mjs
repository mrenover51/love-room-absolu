import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(file, "utf8");
const sql = read("supabase/migrations/202608090037_safe_ical_sync.sql");

function synchronize(existing, provider, incoming) {
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  if (
    incoming.some(
      (event) =>
        event.provider !== provider ||
        !event.uid ||
        !event.reference ||
        !event.email ||
        !isoDate.test(event.start) ||
        !isoDate.test(event.end) ||
        event.end <= event.start,
    )
  )
    throw new Error("ICAL_EVENT_INVALID");
  if (!incoming.length) return structuredClone(existing);
  const incomingIds = new Set(incoming.map((event) => event.uid));
  const reconciled = existing.map((event) =>
    event.provider === provider && !incomingIds.has(event.uid)
      ? { ...event, active: false }
      : event,
  );
  for (const event of incoming) {
    const index = reconciled.findIndex(
      (current) =>
        current.provider === provider && current.uid === event.uid,
    );
    if (index >= 0) reconciled[index] = { ...event, active: true };
    else reconciled.push({ ...event, active: true });
  }
  return reconciled;
}

const bookingEvent = (uid) => ({
  provider: "booking",
  uid,
  reference: `EXT-${uid}`,
  email: `${uid.toLowerCase()}@invalid.local`,
  start: "2026-09-10",
  end: "2026-09-12",
  active: true,
});

test("test 1 — un flux Booking valide est importé normalement", () => {
  const result = synchronize([], "booking", [bookingEvent("A")]);
  assert.deepEqual(result.map((event) => event.uid), ["A"]);
  assert.equal(result[0].active, true);
});

test("test 2 — deux synchronisations identiques ne créent aucun doublon", () => {
  const first = synchronize([], "booking", [bookingEvent("A")]);
  const second = synchronize(first, "booking", [bookingEvent("A")]);
  assert.equal(second.length, 1);
  assert.match(sql, /on conflict \(provider, ical_uid\)/i);
});

test("test 3 — un UID absent d’un flux complet non vide est annulé", () => {
  const existing = ["A", "B", "C"].map(bookingEvent);
  const result = synchronize(existing, "booking", [
    bookingEvent("A"),
    bookingEvent("C"),
  ]);
  assert.equal(result.find((event) => event.uid === "A")?.active, true);
  assert.equal(result.find((event) => event.uid === "B")?.active, false);
  assert.equal(result.find((event) => event.uid === "C")?.active, true);
  assert.match(sql, /not exists \([\s\S]*jsonb_array_elements\(p_events\)/);
});

test("test 4 critique — un flux vide conserve réservations et blocs", () => {
  const existing = ["A", "B", "C"].map(bookingEvent);
  assert.deepEqual(synchronize(existing, "booking", []), existing);
  const guard = sql.indexOf("if jsonb_array_length(p_events) = 0 then");
  const reconciliation = sql.indexOf("with cancelled as");
  assert.ok(guard > 0 && guard < reconciliation);
  const emptyBranch = sql.slice(guard, sql.indexOf("end if;", guard));
  assert.match(emptyBranch, /'cancelled', 0/);
  assert.doesNotMatch(emptyBranch, /public\.reservations|public\.calendar_blocks/);
});

test("test 5 — tout le flux est validé avant la première écriture", () => {
  const existing = [bookingEvent("A")];
  assert.throws(
    () =>
      synchronize(existing, "booking", [
        bookingEvent("B"),
        { ...bookingEvent("C"), end: "date-invalide" },
      ]),
    /ICAL_EVENT_INVALID/,
  );
  assert.equal(existing.length, 1);
  assert.equal(existing[0].uid, "A");
  const validationLoop = sql.indexOf(
    "-- Valider le flux complet avant la moindre écriture",
  );
  const firstSourceUpdate = sql.indexOf("update public.calendar_sources");
  const firstReservationInsert = sql.indexOf("insert into public.reservations");
  assert.ok(validationLoop > 0);
  assert.ok(firstSourceUpdate > validationLoop);
  assert.ok(firstReservationInsert > firstSourceUpdate);
  for (const validation of [
    "ICAL_EVENT_REQUIRED_FIELD_MISSING",
    "ICAL_EVENT_DATE_INVALID",
    "ICAL_EVENT_CANCELLED_INVALID",
    "ICAL_EVENT_UID_DUPLICATE",
  ])
    assert.ok(sql.includes(validation), validation);
});

test("test 6 — Booking en échec n’empêche pas Airbnb de réussir", () => {
  const existing = [bookingEvent("A")];
  assert.throws(
    () =>
      synchronize(existing, "booking", [
        { ...bookingEvent("B"), uid: "" },
      ]),
    /ICAL_EVENT_INVALID/,
  );
  const airbnb = {
    ...bookingEvent("AIR-1"),
    provider: "airbnb",
  };
  const result = synchronize(existing, "airbnb", [airbnb]);
  assert.equal(result.find((event) => event.uid === "A")?.active, true);
  assert.equal(result.find((event) => event.uid === "AIR-1")?.active, true);
  const sync = read("lib/calendar/sync.ts");
  assert.match(sync, /for \(const \{ source, url \} of definitions\)/);
});

test("les URLs, l’activation et les droits restent protégés", () => {
  assert.doesNotMatch(sql, /delete\s+from\s+public\.calendar_sources/i);
  assert.doesNotMatch(sql, /enabled\s*=\s*false/i);
  assert.doesNotMatch(sql, /import_url\s*=/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = ''/i);
  assert.match(sql, /pg_advisory_xact_lock/);
  assert.match(sql, /grant execute[\s\S]*to service_role/i);
  assert.match(sql, /revoke all[\s\S]*from public, anon, authenticated/i);
});
