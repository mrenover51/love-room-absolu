import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  getReservationDepartureTime,
  getReservationDepartureLabel,
  LATE_CHECKOUT_OPTION_KEY,
  LATE_CHECKOUT_TIME,
} from "../lib/booking/departure-time.ts";
import {
  confirmationBccForTemplate,
  RESERVATION_CONFIRMATION_BCC,
} from "../lib/email/delivery.ts";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const guestEmail = read("emails/templates/guest-communication.tsx");
const legacyEmail = read("emails/templates/reservation-confirmation.tsx");
const portal = read("app/mon-sejour/[token]/page.tsx");
const communications = read("lib/guest-portal/communications.ts");
const pricing = read("lib/supabase/repositories/pricing-repository.ts");

test("sans late-checkout le départ standard reste 10h00", () => {
  assert.equal(getReservationDepartureTime("10:00", []), "10:00");
  assert.equal(getReservationDepartureTime("10:00", [{ option_key: "champagne" }]), "10:00");
  assert.equal(getReservationDepartureLabel("10:00", []), "avant 10h00");
});

test("late-checkout applique exclusivement le départ à 12h00", () => {
  assert.equal(LATE_CHECKOUT_OPTION_KEY, "late-checkout");
  assert.equal(LATE_CHECKOUT_TIME, "12:00");
  assert.equal(getReservationDepartureTime("10:00", [{ option_key: "late-checkout" }]), "12:00");
  assert.equal(getReservationDepartureLabel("10:00", [{ option_key: "late-checkout" }]), "jusqu’à 12h00 (option départ tardif)");
  assert.equal(getReservationDepartureTime("10:00", [{ option_key: "other", label: "Départ tardif", price: 1500 }]), "10:00");
});

test("le prix reste fourni par public.options et n'est pas redéfini par la règle horaire", () => {
  assert.match(pricing, /\.from\("options"\)/);
  assert.match(pricing, /amount: row\.price/);
  assert.doesNotMatch(read("lib/booking/departure-time.ts"), /1500|15\.00|price|amount/);
  assert.match(read("tests/manual-reservation-approval.test.mjs"), /"late-checkout","Départ tardif",1500/);
});

test("la confirmation contient tous les équipements demandés", () => {
  for (const value of ["linge de lit", "linge de bain", "Tassimo", "micro-ondes multifonction", "réfrigérateur", "vaisselle", "bouilloire", "grille-pain", "baignoire balnéo", "sauna infrarouge"])
    assert.ok(guestEmail.includes(value), value);
});

test("le BCC natif est limité aux véritables confirmations et reste invisible", () => {
  assert.equal(RESERVATION_CONFIRMATION_BCC, "love.room.absolu@gmail.com");
  assert.equal(confirmationBccForTemplate("guest-confirmation"), RESERVATION_CONFIRMATION_BCC);
  assert.equal(confirmationBccForTemplate("reservation-confirmation"), RESERVATION_CONFIRMATION_BCC);
  assert.equal(confirmationBccForTemplate("guest-access_48h"), undefined);
  assert.doesNotMatch(guestEmail, /love\.room\.absolu@gmail\.com/);
  assert.doesNotMatch(legacyEmail, /love\.room\.absolu@gmail\.com/);
});

test("Mon séjour et H-48 partagent la règle centralisée 10h/12h", () => {
  assert.match(portal, /getReservationDepartureLabel/);
  assert.match(guestEmail, /getReservationDepartureLabel/);
  assert.match(guestEmail, /props\.type === "access_48h"/);
  assert.match(guestEmail, /Votre départ est prévu/);
  assert.match(communications, /reservation_options\(option_key,label\)/);
});
