import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(file, "utf8");
const preview = read("app/admin/parametres/experience-client/apercu/page.tsx");
const settingsPage = read("app/admin/parametres/experience-client/page.tsx");
const emailTemplate = read("emails/templates/guest-communication.tsx");
const emailDelivery = read("lib/email.tsx");
const previewData = read("lib/guest-portal/email-preview.ts");
const actions = read("app/admin/parametres/experience-client/actions.ts");
const testButton = read("components/admin/guest-email-test-button.tsx");

test("l’aperçu admin réutilise le template réel sans envoyer d’email", () => {
  assert.match(preview, /await requireAdmin\(\)/);
  assert.match(preview, /<GuestCommunicationEmail \{\.\.\.data\} \/>/);
  assert.doesNotMatch(preview, /from ["']resend["']|sendGuestCommunication|createAdminClient|\.from\(/);
  assert.match(settingsPage, /Aperçu des emails voyageurs/);
});

test("l’aperçu H-48 ne peut utiliser qu’un code fictif", () => {
  assert.match(previewData, /keyboxCode: type === "access_48h" \? "1234" : null/);
  assert.doesNotMatch(previewData, /defaultKeyboxCode|keybox_code|reservations/);
  assert.match(previewData, /reference: "ABS-APERÇU"/);
  assert.match(previewData, /example\.invalid\/mon-sejour-apercu/);
});

test("l’objet affiché et l’objet envoyé partagent la même source", () => {
  assert.match(emailTemplate, /export const guestCommunicationSubjects/);
  assert.match(emailDelivery, /guestCommunicationSubjects\[data\.type\]/);
  assert.match(preview, /guestCommunicationSubjects\[type\]/);
});

test("les emails tests ont un destinataire serveur immuable et un objet TEST", () => {
  const testSender = emailDelivery.slice(
    emailDelivery.indexOf("export async function sendGuestCommunicationTest"),
    emailDelivery.indexOf("export async function sendConfirmation"),
  );
  assert.match(testSender, /to:'love\.room\.absolu@gmail\.com'/);
  assert.match(testSender, /subject:`\[TEST\] \$\{guestCommunicationSubjects\[data\.type\]\}`/);
  assert.match(testSender, /<GuestCommunicationEmail \{\.\.\.data\}\/>/);
  assert.doesNotMatch(testSender, /logEmail|createAdminClient|reservation_communications/);
});

test("l’action test est authentifiée, bornée et sans écriture Supabase", () => {
  const testAction = actions.slice(actions.indexOf("export async function sendGuestEmailTest"));
  assert.match(testAction, /await requireAdmin\(\)/);
  assert.match(testAction, /z\.enum\(\["confirmation", "access_48h"\]\)/);
  assert.match(testAction, /getGuestEmailPreviewData\(type\.data, settings\)/);
  assert.match(testAction, /Email test envoyé à love\.room\.absolu@gmail\.com/);
  assert.doesNotMatch(testAction, /createAdminClient|auditAdminAction|\.from\(/);
  assert.doesNotMatch(testButton, /name="email"|name="recipient"|type="email"/);
  assert.match(settingsPage, /<GuestEmailTestButton type="access_48h"/);
  assert.match(settingsPage, /<GuestEmailTestButton type="confirmation"/);
});
