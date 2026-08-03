import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
const read=(file)=>readFileSync(file,"utf8");
test("la PWA exclut les parcours sensibles de son cache",()=>{const sw=read("public/sw.js");for(const route of ["/api/","/admin","/reservation"])assert.ok(sw.includes(route),route);});
test("les en-têtes de sécurité sont présents",()=>{const config=read("next.config.ts");for(const header of ["Content-Security-Policy","Strict-Transport-Security","X-Content-Type-Options","Permissions-Policy","frame-ancestors 'none'"])assert.ok(config.includes(header),header);});
test("les secrets ne sont pas déclarés publics",()=>{const env=read(".env.example");for(const secret of ["STRIPE_SECRET_KEY","STRIPE_WEBHOOK_SECRET","SUPABASE_SERVICE_ROLE_KEY","RESEND_API_KEY","CRON_SECRET"])assert.ok(env.includes(`${secret}=`)&&!env.includes(`NEXT_PUBLIC_${secret}=`),secret);});
test("les surfaces critiques existent",()=>{for(const file of ["app/api/stripe/webhook/route.ts","app/api/calendar/export/route.ts","app/api/health/route.ts","app/error.tsx","app/global-error.tsx","app/manifest.ts","app/robots.ts","app/sitemap.ts"])assert.ok(existsSync(file),file);});
test("Lighthouse est strict et exécuté en CI",()=>{const config=JSON.parse(read("lighthouserc.json"));assert.equal(config.ci.assert.assertions["categories:performance"][1].minScore,1);assert.ok(existsSync(".github/workflows/performance.yml"));});
