import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  canRevealKeybox,
  parisParts,
  portalExpired,
} from "../lib/guest-portal/eligibility.ts";

const read = (file) =>
  readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const migration = read(
  "supabase/migrations/202609110043_guest_portal_communications.sql",
);
const accessMigration = read(
  "supabase/migrations/202609170045_guest_access_48h.sql",
);
const repository = read("lib/guest-portal/repository.ts");
const communications = read("lib/guest-portal/communications.ts");
const webhook = read("app/api/stripe/webhook/route.ts");
const ical = read("lib/calendar/sync.ts");
const outbound = read("lib/calendar/outbound-export.ts");
const portal = read("app/mon-sejour/[token]/page.tsx");
const base = {
  checkIn: "2026-09-25",
  status: "confirmed",
  paymentStatus: "paid",
  source: "direct",
  checkInTime: "16:00",
  leadHours: 48,
};

test("portail: token fort, unique et lookup exclusivement par token", () => {
  assert.match(migration, /encode\(gen_random_bytes\(32\), 'hex'\)/);
  assert.match(migration, /unique index[\s\S]*guest_portal_token/i);
  assert.match(repository, /TOKEN=\/\^\[0-9a-f\]\{64\}\$\//);
  assert.match(repository, /\.eq\("guest_portal_token",token\)/);
  assert.doesNotMatch(portal, /stripe_payment_intent|stripe_checkout_session/);
});

test("portail: avant H-48 le code est refusé, à H-48 il est permis", () => {
  assert.equal(
    canRevealKeybox({ ...base, now: new Date("2026-09-23T13:59:00Z") }),
    false,
  );
  assert.equal(
    canRevealKeybox({ ...base, now: new Date("2026-09-23T14:00:00Z") }),
    true,
  );
  assert.deepEqual(parisParts(new Date("2026-09-23T14:00:00Z")), {
    date: "2026-09-23",
    time: "16:00",
  });
});

test("portail: annulation, remboursement, impayé et arrivée passée masquent le code", () => {
  const due = new Date("2026-09-23T14:00:00Z");
  assert.equal(canRevealKeybox({ ...base, status: "cancelled", now: due }), false);
  assert.equal(canRevealKeybox({ ...base, status: "refunded", now: due }), false);
  assert.equal(
    canRevealKeybox({ ...base, paymentStatus: "refunded", now: due }),
    false,
  );
  assert.equal(
    canRevealKeybox({ ...base, paymentStatus: "unpaid", now: due }),
    false,
  );
  assert.equal(
    canRevealKeybox({ ...base, now: new Date("2026-09-25T14:00:00Z") }),
    false,
  );
  assert.equal(
    portalExpired("2026-09-27", 7, new Date("2026-10-05T10:00:00Z")),
    true,
  );
});

test("le code n'est sélectionné qu'après la décision serveur", () => {
  const first = repository.indexOf('.select("reference');
  const decision = repository.indexOf("if(!expired&&canRevealKeybox");
  const sensitive = repository.indexOf('.select("keybox_code")');
  assert.ok(first < decision && decision < sensitive);
  assert.doesNotMatch(repository.slice(first, decision), /keybox_code/);
});

test("communications: unicité et claim empêchent les doubles envois", () => {
  assert.match(migration, /unique \(reservation_id, type\)/i);
  assert.match(accessMigration, /'access_48h'/);
  assert.match(communications, /\.is\("sent_at", null\)/);
  assert.match(communications, /status: "processing"/);
  assert.match(communications, /ignoreDuplicates: true/);
});

test("Stripe confirme puis met en file sans envoi Resend synchrone", () => {
  assert.match(webhook, /await queueConfirmation\(id\)/);
  assert.doesNotMatch(webhook, /await sendConfirmation/);
  assert.match(webhook, /payments\.confirm/);
});

test("Booking et Airbnb: aucune adresse iCal technique n'est envoyée", () => {
  assert.match(ical, /@invalid\.local/);
  assert.match(communications, /endsWith\("@invalid\.local"\)/);
  assert.doesNotMatch(outbound, /guest_portal_token/);
  assert.doesNotMatch(ical, /guest_portal_token/);
});

test("SMS reste une abstraction sans fournisseur activé", () => {
  const providers = read("lib/notifications/providers.ts");
  assert.match(providers, /channel:'email'\|'push'\|'sms'/);
  assert.doesNotMatch(communications, /Twilio|sendSms|smsEnabled\s*===\s*true/i);
});
