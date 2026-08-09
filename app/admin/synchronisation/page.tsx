import {
  AlertTriangle,
  CalendarSync,
  CheckCircle2,
  Clock3,
  Construction,
  History,
  ShieldCheck,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ExportCalendarCard } from "@/components/admin/channel-manager-dashboard";
import { IcalSourceCard } from "@/components/admin/ical-source-card";
import { SyncSubmit } from "@/components/admin/sync-submit";
import { resolveCalendarConflict, syncCalendarsNow } from "./actions";
import { siteConfig } from "@/lib/site-config";

type SourceRow = {
  provider: string;
  import_url: string | null;
  enabled: boolean;
  status: string;
  last_sync: string | null;
  last_successful_sync: string | null;
  last_error: string | null;
  imported_count: number;
  suspicious_snapshot: boolean;
  reconciliation_blocked: boolean;
  protected_count: number;
};
export default async function Synchronisation() {
  await requireAdmin();
  const db = createAdminClient(),
    now = new Date(),
    today = now.toISOString().slice(0, 10);
  const [
    { data: sources },
    { data: logs },
    { data: conflicts },
    { count: exportedCount },
  ] = await Promise.all([
    db
      .from("calendar_sources")
      .select(
        "provider,import_url,enabled,status,last_sync,last_successful_sync,last_error,imported_count,suspicious_snapshot,reconciliation_blocked,protected_count",
      )
      .in("provider", ["booking", "airbnb"]),
    db
      .from("sync_logs")
      .select(
        "id,source,status,events_count,imported_count,updated_count,cancelled_count,conflict_count,duration_ms,error_message,created_at,sync_trigger,downloaded_count,validated_count,previous_active_count,missing_count,missing_percentage,reconciliation_decision,suspicious_snapshot",
      )
      .order("created_at", { ascending: false })
      .limit(50),
    db
      .from("calendar_conflicts")
      .select("id,provider,start_date,end_date,created_at,resolution_note")
      .eq("status", "open")
      .order("created_at", { ascending: false }),
    db
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .gte("check_out", today)
      .in("status", ["confirmed", "pending_payment"]),
  ]);
  const source = (provider: "booking" | "airbnb") =>
    (sources ?? ([] as SourceRow[])).find(
      (item) => item.provider === provider,
    ) ?? {
      provider,
      import_url: null,
      enabled: false,
      status: "not_configured",
      last_sync: null,
      last_successful_sync: null,
      last_error: null,
      imported_count: 0,
      suspicious_snapshot: false,
      reconciliation_blocked: false,
      protected_count: 0,
    };
  const booking = source("booking"),
    airbnb = source("airbnb");
  const lastAttempt = (provider: "booking" | "airbnb") =>
    logs?.find((log) => log.source === provider)?.created_at ?? null;
  return (
    <>
      <AdminPageHeader
        eyebrow="Distribution"
        title="Channel Manager iCal"
        description="Synchronisez Booking et Airbnb, diffusez vos disponibilités et résolvez chaque conflit sans suppression automatique."
        actions={
          <form action={syncCalendarsNow}>
            <SyncSubmit />
          </form>
        }
      />
      <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
        <article className="rounded-[1.5rem] border border-white/[.08] bg-[#121212] p-5 shadow-xl sm:p-6">
          <div className="flex items-center gap-3">
            <CalendarSync className="size-5 text-[#C8A66A]" />
            <div>
              <p className="text-[10px] uppercase tracking-[.2em] text-[#C8A66A]">
                Export public
              </p>
              <h2 className="font-heading text-2xl">Calendrier Absolu</h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/50">
            Flux RFC 5545 sans données personnelles, compatible avec les
            principales plateformes.
          </p>
          <div className="mt-5">
            <ExportCalendarCard
              generatedAt={now.toISOString()}
              count={exportedCount ?? 0}
              url={`${siteConfig.url}/api/ical/export`}
            />
          </div>
          <p className="mt-4 flex gap-2 text-[10px] leading-5 text-white/35">
            <ShieldCheck className="size-3.5 shrink-0 text-emerald-400" />
            Aucune identité, coordonnée, information de paiement ou montant
            n’est exporté.
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-white/[.08] bg-[#121212] p-5 sm:p-6">
          <p className="text-[10px] uppercase tracking-[.2em] text-[#C8A66A]">
            Légende du calendrier
          </p>
          <h2 className="mt-1 font-heading text-2xl">
            Disponibilités par canal
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              ["Disponible", "bg-emerald-400"],
              ["Réservation Site", "bg-rose-500"],
              ["Booking", "bg-blue-500"],
              ["Airbnb", "bg-violet-500"],
              ["Bloqué", "bg-zinc-500"],
            ].map(([label, color], keyIndex) => (
              <div
                key={`${label}-${keyIndex}`}
                className="rounded-xl border border-white/[.06] bg-white/[.025] p-3 text-xs text-white/55"
              >
                <span className={`mb-2 block size-2.5 rounded-full ${color}`} />
                {label}
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs leading-6 text-white/35">
            Synchronisation automatique toutes les 15 minutes. Les conflits sont
            conservés et exigent toujours une décision manuelle.
          </p>
        </article>
      </section>
      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        <IcalSourceCard
          provider="booking"
          name="Booking.com"
          initialUrl={booking.import_url ?? ""}
          enabled={booking.enabled}
          lastAttempt={lastAttempt("booking")}
          lastSync={booking.last_successful_sync}
          count={booking.imported_count}
          status={booking.status}
          lastError={booking.last_error}
          suspiciousSnapshot={booking.suspicious_snapshot}
          reconciliationBlocked={booking.reconciliation_blocked}
          protectedCount={booking.protected_count}
        />
        <IcalSourceCard
          provider="airbnb"
          name="Airbnb"
          initialUrl={airbnb.import_url ?? ""}
          enabled={airbnb.enabled}
          lastAttempt={lastAttempt("airbnb")}
          lastSync={airbnb.last_successful_sync}
          count={airbnb.imported_count}
          status={airbnb.status}
          lastError={airbnb.last_error}
          suspiciousSnapshot={airbnb.suspicious_snapshot}
          reconciliationBlocked={airbnb.reconciliation_blocked}
          protectedCount={airbnb.protected_count}
        />
      </section>
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {["Abritel", "Google Vacation Rentals"].map((name, keyIndex) => (
          <article
            key={`${name}-${keyIndex}`}
            className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[.02] p-5"
          >
            <Construction className="size-5 text-[#C8A66A]" />
            <h2 className="mt-5 font-heading text-xl">{name}</h2>
            <span className="mt-3 inline-flex rounded-full bg-white/5 px-3 py-1 text-[10px] text-white/40">
              Bientôt disponible
            </span>
          </article>
        ))}
      </section>
      <section className="mt-6 rounded-[1.5rem] border border-white/[.08] bg-[#121212] p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[.2em] text-[#C8A66A]">
              Résolution manuelle
            </p>
            <h2 className="font-heading text-2xl">Conflits détectés</h2>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs ${conflicts?.length ? "bg-orange-400/10 text-orange-300" : "bg-emerald-400/10 text-emerald-300"}`}
          >
            {conflicts?.length ?? 0}
          </span>
        </div>
        <div className="mt-5 space-y-3">
          {conflicts?.length ? (
            conflicts.map((conflict) => (
              <article
                key={conflict.id}
                className="rounded-xl border border-orange-400/15 bg-orange-400/[.04] p-4"
              >
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-orange-300" />
                  <div>
                    <p className="text-sm capitalize">
                      Conflit {conflict.provider}
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      {conflict.start_date} → {conflict.end_date}
                    </p>
                  </div>
                </div>
                <form
                  action={resolveCalendarConflict}
                  className="mt-4 flex flex-col gap-2 sm:flex-row"
                >
                  <input type="hidden" name="id" value={conflict.id} />
                  <input
                    name="note"
                    required
                    minLength={3}
                    maxLength={500}
                    placeholder="Décision prise et justification"
                    className="min-h-10 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 text-xs"
                  />
                  <button className="rounded-lg border border-[#C8A66A]/30 px-4 text-xs text-[#E5C98E]">
                    Marquer comme résolu
                  </button>
                </form>
              </article>
            ))
          ) : (
            <div className="flex min-h-32 flex-col items-center justify-center text-center">
              <CheckCircle2 className="size-8 text-emerald-400/60" />
              <p className="mt-3 text-sm text-white/50">
                Aucun conflit à résoudre
              </p>
            </div>
          )}
        </div>
      </section>
      <section className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/[.08] bg-[#121212]">
        <div className="flex items-center gap-3 p-5 sm:p-6">
          <History className="size-5 text-[#C8A66A]" />
          <div>
            <p className="text-[10px] uppercase tracking-[.2em] text-[#C8A66A]">
              Journal
            </p>
            <h2 className="font-heading text-2xl">
              Historique des synchronisations
            </h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="bg-white/[.025] text-white/35">
              <tr>
                {[
                  "Date",
                  "Plateforme / origine",
                  "État",
                  "Durée",
                  "Réservations",
                  "Conflits",
                  "Erreur",
                ].map((label, keyIndex) => (
                  <th key={`${label}-${keyIndex}`} className="px-5 py-3">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs?.map((log) => (
                <tr key={log.id} className="border-t border-white/[.06]">
                  <td className="px-5 py-4">
                    <time className="flex items-center gap-1">
                      <Clock3 className="size-3" />
                      {new Date(log.created_at).toLocaleString("fr-FR")}
                    </time>
                  </td>
                  <td className="capitalize">{log.source} · {log.sync_trigger}</td>
                  <td
                    className={
                      log.status === "success"
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }
                  >
                    {log.status === "success" ? "OK" : "Erreur"}
                  </td>
                  <td>{log.duration_ms ?? 0} ms</td>
                  <td>
                    {log.validated_count ?? log.events_count} validé(s) · {log.missing_count ?? 0} absent(s)
                  </td>
                  <td>{log.conflict_count ?? 0}</td>
                  <td className="max-w-56 truncate text-rose-200/70">
                    {log.suspicious_snapshot
                      ? `Réconciliation bloquée · ${log.missing_percentage ?? 0}% absent · ${log.reconciliation_decision}`
                      : log.error_message ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!logs?.length && (
            <p className="p-6 text-sm text-white/40">
              Aucune synchronisation journalisée.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
