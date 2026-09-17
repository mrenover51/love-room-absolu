import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  accessDueAt,
  canRevealKeybox,
  communicationWindowOpen,
  parisParts,
  reservationAllowsAccess,
  selectKeyboxCode,
} from "../lib/guest-portal/eligibility.ts";

const read = (file) => readFileSync(file, "utf8");
const communications = read("lib/guest-portal/communications.ts");
const repository = read("lib/guest-portal/repository.ts");
const email = read("emails/templates/guest-communication.tsx");
const workflow = read(".github/workflows/guest-communications.yml");
const migration = read(
  "supabase/migrations/202609170045_guest_access_48h.sql",
);

const eligible = {
  checkIn: "2026-09-25",
  checkInTime: "16:00",
  status: "confirmed",
  paymentStatus: "paid",
  source: "direct",
  leadHours: 48,
};

test("vendredi 16h devient éligible mercredi 16h Europe/Paris", () => {
  const due = accessDueAt("2026-09-25", "16:00", 48);
  assert.equal(due.toISOString(), "2026-09-23T14:00:00.000Z");
  assert.deepEqual(parisParts(due), { date: "2026-09-23", time: "16:00" });
});

test("mercredi 15h59 inaccessible, mercredi 16h00 accessible", () => {
  assert.equal(
    canRevealKeybox({ ...eligible, now: new Date("2026-09-23T13:59:00Z") }),
    false,
  );
  assert.equal(
    canRevealKeybox({ ...eligible, now: new Date("2026-09-23T14:00:00Z") }),
    true,
  );
});

test("les conditions de réservation et paiement sont fail-closed", () => {
  assert.equal(reservationAllowsAccess(eligible), true);
  assert.equal(
    reservationAllowsAccess({ ...eligible, status: "pending_payment" }),
    false,
  );
  assert.equal(
    reservationAllowsAccess({ ...eligible, status: "cancelled" }),
    false,
  );
  assert.equal(
    reservationAllowsAccess({ ...eligible, status: "refunded" }),
    false,
  );
  assert.equal(
    reservationAllowsAccess({ ...eligible, paymentStatus: "refunded" }),
    false,
  );
});

test("une réservation passée ne reçoit ni ne révèle le code", () => {
  assert.equal(
    canRevealKeybox({ ...eligible, now: new Date("2026-09-25T14:00:00Z") }),
    false,
  );
  assert.equal(
    communicationWindowOpen({
      type: "access_48h",
      checkIn: eligible.checkIn,
      checkOut: "2026-09-27",
      checkInTime: eligible.checkInTime,
      now: new Date("2026-09-25T14:00:00Z"),
    }),
    false,
  );
});

test("le code réservation est prioritaire et l'absence est journalisée", () => {
  assert.deepEqual(selectKeyboxCode("1234", "9999"), {
    code: "1234",
    warning: null,
  });
  assert.deepEqual(selectKeyboxCode(null, "9999"), {
    code: "9999",
    warning: null,
  });
  assert.deepEqual(selectKeyboxCode(null, ""), {
    code: null,
    warning: "KEYBOX_CODE_MISSING",
  });
  assert.equal(selectKeyboxCode(null, "").warning, "KEYBOX_CODE_MISSING");
  assert.match(communications, /guest_communication_warning/);
});

test("access_48h est idempotent au cron suivant", () => {
  assert.match(migration, /add value if not exists 'access_48h'/i);
  assert.match(communications, /onConflict: "reservation_id,type"/);
  assert.match(communications, /ignoreDuplicates: true/);
  assert.match(communications, /\.is\("sent_at", null\)/);
  assert.match(communications, /\.in\("status", \["pending", "failed"\]\)/);
});

test("une réservation existante déjà à H-36 part au prochain cron", () => {
  assert.equal(
    communicationWindowOpen({
      type: "access_48h",
      checkIn: "2026-09-25",
      checkOut: "2026-09-27",
      checkInTime: "16:00",
      now: new Date("2026-09-24T02:00:00Z"),
    }),
    true,
  );
  assert.match(workflow, /cron: "\*\/15 \* \* \* \*"/);
});

test("H-48 reste 48 heures réelles pendant les changements DST", () => {
  const spring = accessDueAt("2026-03-30", "16:00", 48);
  assert.equal(spring.toISOString(), "2026-03-28T14:00:00.000Z");
  assert.deepEqual(parisParts(spring), { date: "2026-03-28", time: "15:00" });
  const autumn = accessDueAt("2026-10-26", "16:00", 48);
  assert.equal(autumn.toISOString(), "2026-10-24T15:00:00.000Z");
  assert.deepEqual(parisParts(autumn), { date: "2026-10-24", time: "17:00" });
});

test("le portail ne sélectionne jamais le code avant la décision H-48", () => {
  assert.ok(
    repository.indexOf("canRevealKeybox") <
      repository.indexOf('.select("keybox_code")'),
  );
  assert.doesNotMatch(
    repository.slice(
      repository.indexOf('.select("reference'),
      repository.indexOf("canRevealKeybox"),
    ),
    /keybox_code/,
  );
});

test("l'email H-48 contient les informations configurées et le lien sécurisé", () => {
  assert.match(email, /Votre arrivée chez Absolu approche/);
  assert.match(email, /props\.accessInstructions/);
  assert.match(email, /props\.keyboxInstructions/);
  assert.match(email, /props\.keyboxCode/);
  assert.match(email, /props\.portalUrl/);
  assert.doesNotMatch(email, /INSTRUCTIONS ACCÈS CONFIGURÉES/);
});

test("access_ready n'est plus planifié automatiquement", () => {
  const scheduled = communications.match(
    /const types:[\s\S]*?post_stay_review",\s*\];/,
  )?.[0] ?? "";
  assert.match(scheduled, /access_48h/);
  assert.doesNotMatch(scheduled, /access_ready/);
});
