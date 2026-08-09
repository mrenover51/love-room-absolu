import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(file, "utf8");
const reconcile = (existing, incoming) => ({
  active: incoming.map((event) => `${event.provider}:${event.uid}`),
  cancelled: existing
    .filter(
      (event) =>
        !incoming.some(
          (next) => next.provider === event.provider && next.uid === event.uid,
        ),
    )
    .map((event) => `${event.provider}:${event.uid}`),
});

test("cas A — Booking et Airbnb gardent des identités séparées", () => {
  const result = reconcile(
    [],
    [
      { provider: "booking", uid: "B-1" },
      { provider: "airbnb", uid: "A-1" },
    ],
  );
  assert.deepEqual(result.active, ["booking:B-1", "airbnb:A-1"]);
});

test("cas B — un flux vide ne supprime jamais la source", () => {
  const sql = read("supabase/migrations/202608090037_safe_ical_sync.sql");
  assert.doesNotMatch(sql, /delete\s+from\s+public\.calendar_sources/i);
  assert.doesNotMatch(sql, /enabled\s*=\s*false/i);
});

test("cas C et D — HTTP ou parsing échoués précèdent toute transaction", () => {
  const sync = read("lib/calendar/sync.ts");
  assert.ok(
    sync.indexOf("downloadCalendar(url,source)") <
      sync.indexOf('db.rpc("sync_external_calendar"'),
  );
  assert.match(sync, /ICAL_HTTP_/);
  assert.match(sync, /ICAL_FORMAT_INVALID/);
});

test("cas E — chaque fournisseur est synchronisé indépendamment", () => {
  const sync = read("lib/calendar/sync.ts");
  assert.match(sync, /for \(const \{ source, url \} of definitions\)/);
  assert.match(sync, /syncExternalCalendar\(source, url\)/);
});

test("cas F — deux imports identiques ne créent aucun doublon", () => {
  const first = reconcile([], [{ provider: "booking", uid: "B-1" }]);
  const second = reconcile(
    [{ provider: "booking", uid: "B-1" }],
    [{ provider: "booking", uid: "B-1" }],
  );
  assert.deepEqual(first.active, second.active);
  assert.deepEqual(second.cancelled, []);
  const sql = read("supabase/migrations/202608090037_safe_ical_sync.sql");
  assert.match(sql, /on conflict \(provider, ical_uid\)/i);
});

test("cas G — une disparition externe n'annule qu'après import validé", () => {
  const result = reconcile(
    [
      { provider: "booking", uid: "B-1" },
      { provider: "airbnb", uid: "A-1" },
    ],
    [{ provider: "airbnb", uid: "A-1" }],
  );
  assert.deepEqual(result.cancelled, ["booking:B-1"]);
  const sql = read("supabase/migrations/202608090037_safe_ical_sync.sql");
  assert.match(sql, /pg_advisory_xact_lock/);
  assert.match(sql, /not exists \([\s\S]*jsonb_array_elements\(p_events\)/);
});

test("les erreurs ne modifient ni URL ni activation", () => {
  const sync = read("lib/calendar/sync.ts");
  const catchBlock = sync.slice(sync.lastIndexOf("} catch (error)"));
  assert.doesNotMatch(catchBlock, /import_url|enabled/);
  assert.match(catchBlock, /sync_logs/);
});
