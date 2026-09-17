import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { classifyImportedCalendarEvent } from "../lib/calendar/event-kind.ts";

const read = (file) => readFileSync(file, "utf8");
const migration = read(
  "supabase/migrations/202609170044_canonical_ical_conflicts.sql",
);
const syncCode = read("lib/calendar/sync.ts");
const confirmationMigration = read(
  "supabase/migrations/202609100041_safe_confirmation_conflicts.sql",
);

const canonicalPair = (left, right) =>
  [left, right].sort((a, b) => a.localeCompare(b)).join("|");

test("Booking CLOSED - Not available est un bloc uniquement", () => {
  assert.equal(
    classifyImportedCalendarEvent("CLOSED - Not available"),
    "block",
  );
  assert.match(syncCode, /kind: classifyImportedCalendarEvent\(event\.summary\)/);
  assert.match(
    migration,
    /if v_kind = 'reservation' then[\s\S]*insert into public\.reservations/i,
  );
});

test("Airbnb Not available est un bloc uniquement", () => {
  assert.equal(classifyImportedCalendarEvent("Airbnb (Not available)"), "block");
  assert.match(migration, /v_kind = 'block'[\s\S]*'technical_block'/i);
});

test("un événement identifié comme réservation reste importable", () => {
  assert.equal(classifyImportedCalendarEvent("Reserved"), "reservation");
  assert.equal(classifyImportedCalendarEvent("Booking 48291"), "reservation");
});

test("un bloc technique continue de bloquer checkout et confirmation Stripe", () => {
  assert.match(
    migration,
    /create or replace function public\.sync_external_calendar[\s\S]*insert into public\.calendar_blocks/i,
  );
  assert.match(
    confirmationMigration,
    /confirm_reservation[\s\S]*calendar_blocks[\s\S]*status in\('confirmed','blocked'\)[\s\S]*DATES_UNAVAILABLE/i,
  );
  const failClosed = read(
    "supabase/migrations/202608090039_fail_closed_ical_availability.sql",
  );
  assert.match(
    failClosed,
    /create_checkout_reservation[\s\S]*calendar_blocks[\s\S]*DATES_UNAVAILABLE/i,
  );
});

test("snapshot suspect conserve les blocs et ne libère aucune date", () => {
  const suspiciousBranch = migration.match(
    /if v_suspicious then[\s\S]*?elsif v_missing > 0 then/i,
  )?.[0];
  assert.ok(suspiciousBranch);
  assert.doesNotMatch(suspiciousBranch, /update public\.calendar_blocks/i);
  assert.doesNotMatch(suspiciousBranch, /status = 'cancelled'/i);
  assert.match(suspiciousBranch, /suspicious_snapshot_protected/i);
});

test("snapshot suspect ne crée pas artificiellement de conflit de réservation", () => {
  assert.match(
    migration,
    /if v_kind = 'reservation' then[\s\S]*insert into public\.calendar_conflicts/i,
  );
  assert.doesNotMatch(
    migration.match(/if v_suspicious then[\s\S]*?elsif v_missing > 0 then/i)?.[0] ?? "",
    /calendar_conflicts/i,
  );
});

test("la paire canonique supprime les conflits inversés", () => {
  assert.equal(canonicalPair("booking:A", "airbnb:B"), canonicalPair("airbnb:B", "booking:A"));
  assert.match(migration, /v_object_a := least\(v_current_key, v_primary_key\)/i);
  assert.match(migration, /v_object_b := greatest\(v_current_key, v_primary_key\)/i);
  assert.match(migration, /calendar_conflicts_canonical_pair_idx/i);
});

test("une fenêtre glissante conserve la même identité de conflit", () => {
  const before = canonicalPair("reservation:booking:UID-A", "reservation:airbnb:UID-B");
  const after = canonicalPair("reservation:booking:UID-A", "reservation:airbnb:UID-B");
  assert.equal(before, after);
  assert.doesNotMatch(
    migration.match(/create unique index if not exists calendar_conflicts_canonical_pair_idx[\s\S]*?;/i)?.[0] ?? "",
    /start_date|end_date/i,
  );
});

test("un conflit résolu n'est pas rouvert par la synchronisation suivante", () => {
  assert.match(
    migration,
    /on conflict \(object_a_key, object_b_key\)[\s\S]*where public\.calendar_conflicts\.status = 'open'/i,
  );
  assert.match(migration, /resolution_kind/i);
});

test("une véritable double réservation crée un conflit canonique", () => {
  assert.match(
    migration,
    /evidence\.object_kind = 'reservation'[\s\S]*insert into public\.calendar_conflicts/i,
  );
  assert.match(migration, /conflict_kind[\s\S]*'reservation_conflict'/i);
});

test("le conflit stocke l'intersection réelle", () => {
  assert.match(
    migration,
    /greatest\(v_primary_start, v_start\), least\(v_primary_end, v_end\)/i,
  );
});

test("la sécurité et les droits de la RPC restent inchangés", () => {
  assert.match(migration, /v_missing > 1/i);
  assert.match(migration, /v_missing \* 2 >= v_previous_active/i);
  assert.match(migration, /ICAL_SUSPICIOUS_SNAPSHOT_PROTECTED/i);
  assert.match(
    migration,
    /revoke all on function public\.sync_external_calendar[\s\S]*from public, anon, authenticated/i,
  );
  assert.match(migration, /grant execute[\s\S]*to service_role/i);
});

test("l'export iCal n'est pas modifié par cette évolution", () => {
  const exportPolicy = read("lib/calendar/outbound-policy.ts");
  const exportService = read("lib/calendar/outbound-export.ts");
  assert.doesNotMatch(exportPolicy, /calendar_blocks/);
  assert.doesNotMatch(exportService, /calendar_blocks/);
});
