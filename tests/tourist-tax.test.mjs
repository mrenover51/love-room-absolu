import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateBookingTotal,
  calculateTouristTax,
  touristTaxRateToAmount,
} from "../lib/booking/tourist-tax.ts";
import { checkoutLineItems } from "../lib/stripe/stripe-mapper.ts";

test("A — 1 personne × 1 nuit × 1 € produit 1 €", () => {
  assert.equal(calculateTouristTax(touristTaxRateToAmount(1), 1, 1), 100);
});

test("B — 2 personnes × 1 nuit × 1 € produit 2 €", () => {
  assert.equal(calculateTouristTax(touristTaxRateToAmount(1), 1, 2), 200);
});

test("C — 2 personnes × 2 nuits × 1 € produit 4 €", () => {
  assert.equal(calculateTouristTax(touristTaxRateToAmount(1), 2, 2), 400);
});

test("D — 2 personnes × 3 nuits × 1,50 € produit 9 €", () => {
  assert.equal(calculateTouristTax(touristTaxRateToAmount(1.5), 3, 2), 900);
});

test("E — un taux nul produit une taxe nulle", () => {
  assert.equal(calculateTouristTax(touristTaxRateToAmount(0), 3, 2), 0);
});

test("F — le total additionne séjour, options et taxe", () => {
  assert.equal(calculateBookingTotal(40_000, 4_500, 400), 44_900);
});

test("G — les lignes Stripe correspondent exactement au total calculé", () => {
  const pricing = {
    nights: 2,
    nightPrices: [],
    baseAmount: 40_000,
    weekendSupplements: 0,
    extrasAmount: 4_500,
    feesAmount: 400,
    totalAmount: 44_900,
    currency: "EUR",
    extras: [
      { key: "champagne", label: "Champagne", amount: 4_500, quantity: 1 },
    ],
  };
  const stripeTotal = checkoutLineItems(pricing).reduce(
    (sum, item) =>
      sum + (item.price_data?.unit_amount ?? 0) * (item.quantity ?? 1),
    0,
  );
  assert.equal(stripeTotal, pricing.totalAmount);
});
