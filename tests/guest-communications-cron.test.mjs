import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { communicationWindowOpen } from "../lib/guest-portal/eligibility.ts";
import { isCronAuthorized } from "../lib/cron-auth.ts";

const read = (file) =>
  readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("scheduler GitHub 15 minutes: les horaires restent dus après la minute exacte", () => {
  const common = {
    checkIn: "2026-09-25",
    checkOut: "2026-09-27",
    checkInTime: "16:00",
  };
  assert.equal(
    communicationWindowOpen({
      ...common,
      type: "access_48h",
      now: new Date("2026-09-23T14:05:00Z"),
    }),
    true,
  );
  assert.equal(
    communicationWindowOpen({
      ...common,
      type: "checkout_reminder",
      now: new Date("2026-09-27T06:44:00Z"),
    }),
    true,
  );
  assert.equal(
    communicationWindowOpen({
      ...common,
      type: "pre_arrival",
      now: new Date("2026-09-23T08:14:00Z"),
    }),
    true,
  );
  assert.equal(
    communicationWindowOpen({
      ...common,
      type: "post_stay_review",
      now: new Date("2026-09-28T08:14:00Z"),
    }),
    true,
  );
  assert.equal(
    communicationWindowOpen({
      ...common,
      type: "access_48h",
      now: new Date("2026-09-23T13:59:00Z"),
    }),
    false,
  );
  const workflow = read(".github/workflows/guest-communications.yml");
  const vercel = read("vercel.json");
  assert.match(workflow, /cron: "\*\/15 \* \* \* \*"/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(vercel, /guest-communications/);
});

test("CRON_SECRET est obligatoire et comparé au Bearer token", () => {
  const secret = "a-strong-test-secret";
  assert.equal(
    isCronAuthorized(new Request("https://example.test/api/cron"), secret),
    false,
  );
  assert.equal(
    isCronAuthorized(
      new Request("https://example.test/api/cron", {
        headers: { authorization: "Bearer wrong" },
      }),
      secret,
    ),
    false,
  );
  assert.equal(
    isCronAuthorized(
      new Request("https://example.test/api/cron", {
        headers: { authorization: `Bearer ${secret}` },
      }),
      secret,
    ),
    true,
  );
});

test("l'endpoint refuse l'appel non autorisé avant tout traitement", () => {
  const route = read("app/api/cron/guest-communications/route.ts");
  assert.match(route, /if\(!isCronAuthorized\(request\)\).*status:401/);
  assert.ok(
    route.indexOf("isCronAuthorized(request)") <
      route.indexOf("processGuestCommunications()"),
  );
});

test("l'idempotence existante est conservée", () => {
  const engine = read("lib/guest-portal/communications.ts");
  const migration = read(
    "supabase/migrations/202609110043_guest_portal_communications.sql",
  );
  assert.match(engine, /\.is\("sent_at", null\)/);
  assert.match(engine, /status: "processing"/);
  assert.match(migration, /unique \(reservation_id, type\)/i);
});

test("le workflow ne journalise ni secret ni réponse et échoue sur HTTP ou timeout", () => {
  const workflow = read(".github/workflows/guest-communications.yml");
  assert.match(workflow, /secrets\.CRON_SECRET/);
  assert.match(workflow, /curl --fail --silent --show-error/);
  assert.match(workflow, /--connect-timeout 10/);
  assert.match(workflow, /--max-time 120/);
  assert.match(workflow, /--output \/dev\/null/);
  assert.doesNotMatch(workflow, /echo.*\$CRON_SECRET/);
});
