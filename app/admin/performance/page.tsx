import {
  Activity,
  CheckCircle2,
  Gauge,
  ImageIcon,
  MonitorCheck,
  XCircle,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import report from "@/reports/performance.json";
import budget from "@/performance-budget.json";

const bytes = (value?: number) =>
  value ? `${Math.round(value / 1024)} Ko` : "—";

export default async function PerformanceDashboard() {
  await requireAdmin();
  const inventory = report.inventory as Record<
    string,
    number | { path?: string; bytes?: number }
  >;
  const checks = report.checks as Record<string, boolean>;
  return (
    <>
      <AdminPageHeader
        eyebrow="Core Web Vitals"
        title="Performance & Lighthouse"
        description="Budgets de performance contrôlés avant chaque build et scores Lighthouse mesurés automatiquement sur les pull requests."
      />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={Gauge}
          label="Objectif Performance"
          value="100"
          detail="Lighthouse CI"
        />
        <Metric
          icon={MonitorCheck}
          label="Accessibilité"
          value="100"
          detail="Seuil bloquant"
        />
        <Metric
          icon={Activity}
          label="Limites client"
          value={String(inventory.clientBoundaries ?? "—")}
          detail={`Budget ≤ ${budget.assets.maxClientBoundaries}`}
        />
        <Metric
          icon={ImageIcon}
          label="Image optimisée max."
          value={bytes(
            (inventory.largestOptimized as { bytes?: number })?.bytes,
          )}
          detail={`Budget ≤ ${bytes(budget.assets.maxOptimizedImageBytes)}`}
        />
      </section>
      <section className="mt-6 grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <article className="rounded-[1.5rem] border border-white/[.08] bg-[#121212] p-6">
          <p className="text-[10px] uppercase tracking-[.2em] text-[#C9A86A]">
            Audit statique
          </p>
          <h2 className="mt-1 font-heading text-3xl">Garde-fous du build</h2>
          <div className="mt-6 space-y-3">
            {Object.entries(checks).map(([name, pass]) => (
              <div
                key={name}
                className="flex items-center gap-3 rounded-xl bg-white/[.03] p-3 text-sm"
              >
                {pass ? (
                  <CheckCircle2 className="size-4 text-emerald-300" />
                ) : (
                  <XCircle className="size-4 text-rose-300" />
                )}
                <span className="flex-1">{name}</span>
                <strong className={pass ? "text-emerald-300" : "text-rose-300"}>
                  {pass ? "OK" : "Échec"}
                </strong>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-[1.5rem] border border-white/[.08] bg-[#121212] p-6">
          <p className="text-[10px] uppercase tracking-[.2em] text-[#C9A86A]">
            Seuils terrain
          </p>
          <h2 className="mt-1 font-heading text-3xl">Core Web Vitals</h2>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {Object.entries(budget.metrics).map(([name, value]) => (
              <div key={name} className="rounded-xl bg-white/[.03] p-4">
                <dt className="text-xs text-white/40">{name}</dt>
                <dd className="mt-2 text-xl font-semibold">
                  {name === "cumulative-layout-shift" ? value : `${value} ms`}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-xs leading-6 text-white/35">
            Dernier audit statique : {report.generatedAt}. Les scores navigateur
            sont publiés comme artefacts Lighthouse CI ; ils ne sont pas simulés
            dans ce tableau.
          </p>
        </article>
      </section>
    </>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-white/[.08] bg-[#121212] p-5">
      <Icon className="size-5 text-[#C9A86A]" />
      <p className="mt-5 text-[10px] uppercase tracking-wider text-white/35">
        {label}
      </p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-[10px] text-white/30">{detail}</p>
    </article>
  );
}
