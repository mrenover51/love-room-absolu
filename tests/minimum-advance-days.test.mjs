import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_MINIMUM_ADVANCE_DAYS,
  assertMinimumAdvanceDays,
  minimumArrivalDate,
  normalizeMinimumAdvanceDays,
} from "../lib/booking/minimum-advance-days.ts";

test("0 jour autorise une arrivée le jour même", () => {
  assert.equal(minimumArrivalDate(0, "2026-08-09"), "2026-08-09");
});

test("1 jour autorise une arrivée à partir de demain", () => {
  assert.equal(minimumArrivalDate(1, "2026-08-09"), "2026-08-10");
});

test("2 jours autorisent une arrivée à partir d'après-demain", () => {
  assert.equal(minimumArrivalDate(2, "2026-08-09"), "2026-08-11");
});

test("les bornes 0 et 30 sont acceptées", () => {
  assert.equal(normalizeMinimumAdvanceDays(0), 0);
  assert.equal(normalizeMinimumAdvanceDays(30), 30);
});

test("une valeur absente ou invalide utilise le fallback sécurisé", () => {
  for (const value of [undefined, null, -1, 31, 1.5, "1", Number.NaN]) {
    assert.equal(normalizeMinimumAdvanceDays(value), DEFAULT_MINIMUM_ADVANCE_DAYS);
  }
});

test("la validation serveur refuse avant la limite et accepte la limite", () => {
  assert.throws(
    () => assertMinimumAdvanceDays("2026-08-10", 2, "2026-08-09"),
    /MINIMUM_ADVANCE_DAYS/,
  );
  assert.doesNotThrow(() =>
    assertMinimumAdvanceDays("2026-08-11", 2, "2026-08-09"),
  );
});
