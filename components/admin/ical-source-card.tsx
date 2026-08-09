"use client";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  CloudDownload,
  Save,
  TestTube2,
  TriangleAlert,
} from "lucide-react";

type Provider = "booking" | "airbnb";
type Result = {
  valid?: boolean;
  events?: number;
  status?: string;
  imported?: number;
  updated?: number;
  conflicts?: number;
  error?: string;
  saved?: boolean;
};
export function IcalSourceCard({
  provider,
  name,
  initialUrl,
  enabled,
  lastAttempt,
  lastSync,
  count,
  status,
  lastError,
}: {
  provider: Provider;
  name: string;
  initialUrl: string;
  enabled: boolean;
  lastAttempt: string | null;
  lastSync: string | null;
  count: number;
  status: string;
  lastError: string | null;
}) {
  const reduced = useReducedMotion(),
    [url, setUrl] = useState(initialUrl),
    [busy, setBusy] = useState<"test" | "save" | "sync" | null>(null),
    [result, setResult] = useState<Result | null>(null);
  async function run(action: "test" | "save" | "sync") {
    setBusy(action);
    setResult(null);
    try {
      const response = await fetch(
          action === "test" ? "/api/ical/test" : "/api/ical/import",
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              provider,
              url,
              ...(action === "test" ? {} : { action }),
            }),
          },
        ),
        data = (await response.json()) as Result;
      if (!response.ok) throw new Error(data.error ?? "ICAL_REQUEST_FAILED");
      setResult(data);
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    } finally {
      setBusy(null);
    }
  }
  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[1.5rem] border border-white/[.08] bg-white/[.035] p-5 shadow-xl backdrop-blur-xl sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[.2em] text-[#C8A66A]">
            Import iCal
          </p>
          <h2 className="mt-1 font-heading text-2xl">{name}</h2>
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] ${status === "ok" ? "bg-emerald-400/10 text-emerald-300" : status === "error" ? "bg-rose-400/10 text-rose-300" : "bg-white/5 text-white/40"}`}
        >
          {status === "ok" ? (
            <CheckCircle2 className="size-3" />
          ) : (
            <TriangleAlert className="size-3" />
          )}
          {status === "ok"
            ? "OK"
            : status === "error"
              ? "Erreur"
              : "À configurer"}
        </span>
      </div>
      <label className="mt-6 block text-xs text-white/50">
        URL iCal {name}
        <input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://…/calendar.ics"
          className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm outline-none transition focus:border-[#C8A66A]/50"
        />
      </label>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Action
          icon={TestTube2}
          label="Tester"
          active={busy === "test"}
          disabled={!url || Boolean(busy)}
          onClick={() => void run("test")}
        />
        <Action
          icon={Save}
          label="Enregistrer"
          active={busy === "save"}
          disabled={!url || Boolean(busy)}
          onClick={() => void run("save")}
        />
        <Action
          icon={CloudDownload}
          label="Synchroniser"
          active={busy === "sync"}
          disabled={!url || Boolean(busy)}
          primary
          onClick={() => void run("sync")}
        />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-white/[.06] pt-4 text-xs">
        <div>
          <dt className="text-white/35">Configuration</dt>
          <dd className="mt-1 text-white/65">
            {initialUrl ? "Configuré" : "Non configuré"}
          </dd>
        </div>
        <div>
          <dt className="text-white/35">Activation</dt>
          <dd className="mt-1 text-white/65">
            {enabled ? "Actif" : "Inactif"}
          </dd>
        </div>
        <div>
          <dt className="text-white/35">Dernière tentative</dt>
          <dd className="mt-1 text-white/65">
            {lastAttempt ? new Date(lastAttempt).toLocaleString("fr-FR") : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-white/35">Dernière synchronisation réussie</dt>
          <dd className="mt-1 text-white/65">
            {lastSync ? new Date(lastSync).toLocaleString("fr-FR") : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-white/35">Réservations importées</dt>
          <dd className="mt-1 text-white/65">{count}</dd>
        </div>
      </dl>
      {(result || lastError) && (
        <p
          aria-live="polite"
          className={`mt-4 rounded-xl border p-3 text-xs ${result?.error || (!result && lastError) ? "border-rose-400/20 bg-rose-400/[.06] text-rose-200" : "border-emerald-400/20 bg-emerald-400/[.06] text-emerald-200"}`}
        >
          {result
            ? result.error
              ? `Erreur de synchronisation ${name} : ${result.error}`
              : result.saved
                ? "URL enregistrée."
                : result.valid
                  ? `Calendrier valide · ${result.events ?? 0} événement(s)`
                  : `Synchronisation terminée · ${result.imported ?? 0} ajoutée(s), ${result.updated ?? 0} mise(s) à jour, ${result.conflicts ?? 0} conflit(s)`
            : `Erreur de synchronisation ${name} : ${lastError}`}
        </p>
      )}
    </motion.article>
  );
}
function Action({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
  primary = false,
}: {
  icon: typeof Save;
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-medium disabled:opacity-40 ${primary ? "bg-[#C8A66A] text-black" : "border border-white/10 bg-white/[.03] text-white/70"}`}
    >
      <Icon className={`size-3.5 ${active ? "animate-pulse" : ""}`} />
      {active ? "Patientez…" : label}
    </button>
  );
}
