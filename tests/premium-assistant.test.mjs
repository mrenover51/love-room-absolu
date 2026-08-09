import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildAdminInsights } from "../lib/ai/admin-insights.ts";

const read = (file) => readFileSync(file, "utf8");

test("l'assistant client couvre les thèmes essentiels", () => {
  const knowledge = read("lib/assistant/knowledge.ts");
  for (const topic of [
    "reservation",
    "horaire",
    "spa",
    "sauna",
    "parking",
    "restaurant",
    "activite",
    "faq",
    "annulation",
    "modifier",
  ])
    assert.ok(knowledge.includes(topic), topic);
});

test("le tableau intelligent calcule ses indicateurs sans données personnelles", () => {
  const now = new Date("2026-08-09T12:00:00Z");
  const insights = buildAdminInsights(
    [
      {
        created_at: "2026-07-10T12:00:00Z",
        check_in: "2026-08-10",
        check_out: "2026-08-13",
        nights: 3,
        total: 60000,
        status: "confirmed",
        payment_status: "paid",
        source: "direct",
      },
      {
        created_at: "2026-06-10T12:00:00Z",
        check_in: "2026-09-02",
        check_out: "2026-09-04",
        nights: 2,
        total: 40000,
        status: "cancelled",
        payment_status: "refunded",
        source: "booking",
      },
    ],
    now,
  );
  assert.equal(insights.revenue, 60000);
  assert.equal(insights.bookings, 2);
  assert.equal(insights.nights, 3);
  assert.equal(insights.averageBasket, 60000);
  assert.equal(insights.directShare, 50);
  assert.equal(insights.cancellationRate, 50);
  assert.equal(insights.monthly.length, 6);
  assert.ok(insights.recommendations.length >= 3);
});

test("l'API IA administrateur reste authentifiée et sans clé publique", () => {
  const route = read("app/api/admin/assistant/route.ts");
  assert.match(route, /isAdminRequest/);
  assert.match(route, /OpenAIResponsesProvider/);
  const provider = read("lib/ai/openai-provider.ts");
  assert.match(provider, /process\.env\.OPENAI_API_KEY/);
  assert.doesNotMatch(provider, /NEXT_PUBLIC_OPENAI/);
  assert.match(provider, /store: false/);
});

test("les recommandations ne modifient aucune logique métier", () => {
  const insights = read("lib/ai/admin-insights.ts");
  assert.doesNotMatch(
    insights,
    /\.from\(["']|\.update\(|\.insert\(|\.delete\(/,
  );
  const ui = read("components/admin/assistant-insights.tsx");
  assert.match(ui, /Aucun tarif n’est modifié\s+automatiquement/);
});
