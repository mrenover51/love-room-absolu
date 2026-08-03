import { siteConfig } from "@/lib/site-config";
export function GET() {
  const script = `(()=>{const s=document.currentScript;if(!s)return;const a=document.createElement('a');a.href='${siteConfig.url}?utm_source=partner_widget&utm_medium=referral&utm_campaign=authority';a.target='_blank';a.rel='noopener';a.setAttribute('aria-label','Découvrir Love Room Absolu à Avize');a.style.cssText='display:inline-flex;align-items:center;gap:10px;padding:12px 18px;border:1px solid #c9a86a;border-radius:999px;background:#090909;color:#f6f2ec;text-decoration:none;font:600 13px system-ui';a.innerHTML='<span style="color:#c9a86a">ABSOLU</span><span>Love Room à Avize</span>';s.insertAdjacentElement('afterend',a)})();`;
  return new Response(script, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "public, max-age=86400",
      "x-content-type-options": "nosniff",
    },
  });
}
