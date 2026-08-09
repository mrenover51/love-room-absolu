import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(file, "utf8");

test("la preuve sociale provient de réservations réelles", () => {
  const route = read("app/api/cro-signals/route.ts");
  const layer = read("components/cro/cro-layer.tsx");
  assert.match(route, /confirmedBookingsThisWeek/);
  assert.match(route, /payment_status/);
  assert.match(route, /confirmed/);
  assert.doesNotMatch(layer, /3 réservations cette semaine/);
  assert.match(layer, /weeklyBookings/);
});

test("les signaux CRO restent informatifs et non bloquants", () => {
  const layer = read("components/cro/cro-layer.tsx");
  assert.match(layer, /Disponibilités vérifiées en temps réel/);
  assert.match(layer, /catch\(\(\) => undefined\)/);
  assert.match(layer, /aria-live="polite"/);
});

test("le produit racine relie l'offre directe", () => {
  const schema = read("lib/schema/entities.ts");
  assert.match(schema, /Hébergement romantique/);
  assert.match(schema, /offers: \{ "@id": `\$\{url\}\/\#direct-offer` \}/);
});
