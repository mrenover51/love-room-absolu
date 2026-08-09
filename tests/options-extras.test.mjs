import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(file, "utf8");

test("le catalogue existant est étendu sans table parallèle", () => {
  const migration = read(
    "supabase/migrations/202608090038_admin_options_extras.sql",
  );
  assert.match(migration, /alter table public\.options/);
  assert.doesNotMatch(migration, /create table .*options/i);
  for (const column of [
    "image_url",
    "icon",
    "billing_type",
    "available_weekdays",
    "max_quantity",
    "min_lead_days",
  ])
    assert.ok(migration.includes(column), column);
});

test("les mutations d'options exigent un administrateur", () => {
  const actions = read("app/admin/actions.ts");
  for (const action of ["saveOption", "deleteOption"]) {
    const start = actions.indexOf(`function ${action}`);
    const body = actions.slice(start, start + 500);
    assert.match(body, /await requireAdmin\(\)/, action);
  }
});

test("le tunnel et le serveur relisent les options Supabase actives", () => {
  const repository = read("lib/supabase/repositories/pricing-repository.ts");
  assert.match(repository, /\.from\("options"\)/);
  assert.match(repository, /\.eq\("active", true\)/);
  assert.match(repository, /billing_type/);
  const service = read("lib/supabase/services/reservation-service.ts");
  assert.match(service, /await this\.pricing\.getConfig\(\)/);
});

test("Stripe reçoit des price_data dynamiques et les quantités calculées", () => {
  const mapper = read("lib/stripe/stripe-mapper.ts");
  assert.match(mapper, /price_data/);
  assert.match(mapper, /unit_amount: Math\.round\(extra\.amount \/ quantity\)/);
  assert.match(mapper, /quantity/);
  assert.doesNotMatch(mapper, /price:\s*["']/);
});

test("la réservation conserve un instantané des options choisies", () => {
  const repository = read(
    "lib/supabase/repositories/reservation-repository.ts",
  );
  assert.match(repository, /const quantity = item\.quantity/);
  assert.match(repository, /total: item\.amount/);
  assert.match(repository, /p_options: options/);
});

test("l'administration expose le CRUD et le détail des options", () => {
  const page = read("app/admin/options/page.tsx");
  for (const feature of [
    "Options & Extras",
    "Prix TTC",
    "Type de facturation",
    "Jours disponibles",
    "Délai minimum",
    "deleteOption",
  ])
    assert.ok(page.includes(feature), feature);
  const detail = read("app/admin/reservations/[id]/page.tsx");
  assert.match(detail, /Options choisies/);
  assert.match(detail, /Total options/);
});
