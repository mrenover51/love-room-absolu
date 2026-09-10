import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const action=readFileSync(new URL("../app/admin/logout-action.ts",import.meta.url),"utf8");
const header=readFileSync(new URL("../components/admin/admin-header.tsx",import.meta.url),"utf8");
const button=readFileSync(new URL("../components/admin/logout-button.tsx",import.meta.url),"utf8");
const layout=readFileSync(new URL("../app/admin/layout.tsx",import.meta.url),"utf8");
const proxy=readFileSync(new URL("../lib/supabase/proxy.ts",import.meta.url),"utf8");

test("la déconnexion détruit la session Supabase avant la redirection",()=>{
  assert.match(action,/await supabase\.auth\.signOut\(\)/);
  assert.ok(action.indexOf("signOut()")<action.indexOf('redirect("/admin/connexion")'));
});

test("le bouton est présent dans le header partagé de toutes les pages admin",()=>{
  assert.match(layout,/<AdminHeader \/>/);
  assert.match(header,/<LogoutButton\/>/);
  assert.match(header,/user&&/);
});

test("le bouton empêche le double clic pendant la déconnexion",()=>{
  assert.match(button,/useFormStatus/);
  assert.match(button,/disabled=\{pending\}/);
  assert.match(button,/Déconnexion…/);
});

test("une session absente redirige toujours les routes admin vers la connexion",()=>{
  assert.match(proxy,/pathname\.startsWith\("\/admin"\)/);
  assert.match(proxy,/!user/);
  assert.match(proxy,/new URL\("\/admin\/connexion"/);
});
