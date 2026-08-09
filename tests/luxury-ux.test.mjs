import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(file, "utf8");

test("le langage visuel premium couvre les surfaces principales", () => {
  const css = read("app/globals.css");
  for (const token of [
    ".premium-panel",
    ".option-card",
    ".gallery-tile",
    ".ambient-float",
    ".confirmation-spark",
  ])
    assert.ok(css.includes(token), token);
});

test("les animations respectent la réduction de mouvement", () => {
  const css = read("app/globals.css");
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /animation-duration: (?:0)?\.01ms !important/);
});

test("le tunnel conserve ses composants métier et améliore leur présentation", () => {
  const flow = read("components/reservation/booking-flow.tsx");
  const extras = read("components/reservation/extras-selector.tsx");
  assert.match(flow, /DateRangePicker/);
  assert.match(flow, /BookingSummary/);
  assert.match(flow, /premium-panel/);
  assert.match(extras, /isExtraAvailable/);
  assert.match(extras, /data-selected/);
});
