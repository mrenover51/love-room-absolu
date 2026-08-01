"use client";

import { useEffect, useState } from "react";

type Consent = { analytics: boolean; marketing: boolean; preferences: boolean };
const empty: Consent = { analytics: false, marketing: false, preferences: false };

function loadScript(src: string, id: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
}

export function ConsentManager() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(empty);

  function apply(value: Consent) {
    setSettings(value);
    localStorage.setItem("absolu-consent", JSON.stringify(value));
    if (value.analytics) {
      const ga = process.env.NEXT_PUBLIC_GA_ID;
      const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
      if (ga) loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`, "absolu-ga");
      if (plausible) loadScript("https://plausible.io/js/script.js", "absolu-plausible");
    }
    if (value.marketing && process.env.NEXT_PUBLIC_META_PIXEL_ID) {
      loadScript("https://connect.facebook.net/en_US/fbevents.js", "absolu-meta");
    }
    setOpen(false);
  }

  useEffect(() => {
    queueMicrotask(() => {
      const stored = localStorage.getItem("absolu-consent");
      if (!stored) {
        setOpen(true);
        return;
      }
      try {
        apply(JSON.parse(stored) as Consent);
      } catch {
        localStorage.removeItem("absolu-consent");
        setOpen(true);
      }
    });
  }, []);

  if (!open) {
    return <button type="button" onClick={() => setOpen(true)} className="fixed bottom-3 left-3 z-40 rounded-full border border-white/15 bg-black/80 px-3 py-2 text-[.65rem] text-white/50 backdrop-blur">Cookies</button>;
  }

  return <section role="dialog" aria-modal="true" aria-labelledby="consent-title" className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-3xl rounded-2xl border border-[#C9A86A]/30 bg-[#121212] p-5 text-[#F6F2EC] shadow-2xl">
    <h2 id="consent-title" className="font-heading text-2xl">Votre intimité compte.</h2>
    <p className="mt-2 text-sm leading-6 text-white/55">Les cookies nécessaires fonctionnent toujours. Analytics, marketing et préférences restent désactivés sans votre accord.</p>
    <div className="mt-4 flex flex-wrap gap-4 text-sm">{(["analytics", "marketing", "preferences"] as const).map((key) => <label key={key} className="flex gap-2"><input type="checkbox" checked={settings[key]} onChange={(event) => setSettings({ ...settings, [key]: event.target.checked })}/>{key === "analytics" ? "Mesure d’audience" : key === "marketing" ? "Marketing" : "Préférences"}</label>)}</div>
    <div className="mt-5 flex flex-wrap gap-3">
      <button type="button" onClick={() => apply(empty)} className="min-h-11 border border-white/20 px-4">Tout refuser</button>
      <button type="button" onClick={() => apply(settings)} className="min-h-11 border border-[#C9A86A]/50 px-4">Enregistrer</button>
      <button type="button" onClick={() => apply({ analytics: true, marketing: true, preferences: true })} className="min-h-11 bg-[#C9A86A] px-4 font-semibold text-black">Tout accepter</button>
    </div>
  </section>;
}
