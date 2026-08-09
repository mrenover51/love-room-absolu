import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { selectOutboundCalendarRanges } from "../lib/calendar/outbound-policy.ts";

const now = new Date("2026-08-09T12:00:00Z");
const reservation = (overrides = {}) => ({
  id: "direct-1",
  provider: "site",
  status: "confirmed",
  check_in: "2026-11-04",
  check_out: "2026-11-05",
  payment_expires_at: null,
  ...overrides,
});
const block = (overrides = {}) => ({
  id: "block-1",
  source: "manual",
  start_date: "2026-11-04",
  end_date: "2026-11-05",
  reason: "Motif administratif privé",
  ...overrides,
});
const select = (reservations = [], blocks = []) =>
  selectOutboundCalendarRanges(reservations, blocks, now);

test("A — un blocked_dates manuel est exporté avec DTEND exclusif", () => {
  const [item] = select([], [block()]);
  assert.equal(item.start, "2026-11-04");
  assert.equal(item.end, "2026-11-05");
  assert.equal(item.id, "blocked-block-1");
  assert.equal(item.summary, "Indisponible");
  assert.doesNotMatch(item.description, /Motif administratif privé/);
});

test("B — une réservation directe confirmée est exportée", () => {
  assert.equal(select([reservation()]).length, 1);
});

test("C — un pending_payment non expiré est exporté", () => {
  assert.equal(
    select([
      reservation({
        status: "pending_payment",
        payment_expires_at: "2026-08-09T13:00:00Z",
      }),
    ]).length,
    1,
  );
});

test("D — un pending_payment expiré est absent", () => {
  assert.equal(
    select([
      reservation({
        status: "pending_payment",
        payment_expires_at: "2026-08-09T11:00:00Z",
      }),
    ]).length,
    0,
  );
});

test("E/F — les réservations Booking et Airbnb importées sont absentes", () => {
  assert.equal(
    select([
      reservation({ id: "booking-1", provider: "booking" }),
      reservation({ id: "airbnb-1", provider: "airbnb" }),
    ]).length,
    0,
  );
});

test("G/H — aucun calendar_block externe n'est lu par l'export", () => {
  const service = readFileSync("lib/calendar/outbound-export.ts", "utf8");
  assert.doesNotMatch(service, /from\("calendar_blocks"\)/);
  assert.match(service, /from\("blocked_dates"\)/);
  assert.match(service, /\.eq\("source", "manual"\)/);
});

test("I — une réservation annulée est absente", () => {
  assert.equal(select([reservation({ status: "cancelled" })]).length, 0);
});

test("J — les deux routes délèguent au même service", () => {
  const official = readFileSync("app/api/ical/export/route.ts", "utf8");
  const legacy = readFileSync("app/api/calendar/export/route.ts", "utf8");
  for (const route of [official, legacy]) {
    assert.match(route, /createOutboundCalendarResponse/);
    assert.doesNotMatch(route, /\.from\(/);
    assert.doesNotMatch(route, /generateIcal/);
  }
});

test("le générateur conserve DTSTART et DTEND en VALUE=DATE", () => {
  const generator = readFileSync("lib/booking/ical.ts", "utf8");
  assert.match(generator, /DTSTART;VALUE=DATE/);
  assert.match(generator, /DTEND;VALUE=DATE/);
  assert.match(generator, /range\.end/);
});
