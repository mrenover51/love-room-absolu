import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (file) => readFileSync(file, "utf8");

test("le rapport financier reste authentifié et fondé sur les écritures", () => {
  const report = read("app/api/admin/reports/financial/route.ts");
  const page = read("app/admin/rapports/page.tsx");
  assert.match(report, /isAdminRequest/);
  assert.match(report, /subtotal,extras_total,taxes,total/);
  assert.match(page, /Taxes collectées/);
  assert.doesNotMatch(report, /insert\(|update\(|delete\(/);
});

test("les exports financiers neutralisent les formules CSV", () => {
  const route = read("app/api/admin/export/route.ts");
  assert.match(route, /\^\[=\+\\-@\]/);
  assert.match(route, /"finance"/);
  assert.match(route, /payment_status/);
});

test("le CRM conserve notes, anniversaire et fidélité", () => {
  const page = read("app/admin/clients/[id]/page.tsx");
  const action = read("app/admin/clients/[id]/actions.ts");
  for (const field of [
    "private_notes",
    "birthday",
    "loyalty_tier",
    "loyalty_points",
  ]) {
    assert.ok(page.includes(field), field);
    assert.ok(action.includes(field), field);
  }
  assert.match(action, /requireAdmin/);
  assert.ok(
    existsSync("supabase/migrations/202608050034_premium_pms_platform.sql"),
  );
});
