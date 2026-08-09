import { Download, FileText } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const euro = (cents: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);

export default async function FinancialReportsPage() {
  await requireAdmin();
  const year = new Date().getUTCFullYear();
  const { data } = await createAdminClient()
    .from("reservations")
    .select(
      "created_at,subtotal,extras_total,taxes,total,payment_status,status",
    )
    .gte("created_at", `${year}-01-01`)
    .lt("created_at", `${year + 1}-01-01`)
    .order("created_at");
  const paid = (data ?? []).filter((row) =>
    ["paid", "partially_refunded"].includes(row.payment_status),
  );
  const totals = paid.reduce(
    (sum, row) => ({
      revenue: sum.revenue + Number(row.total),
      accommodation: sum.accommodation + Number(row.subtotal),
      extras: sum.extras + Number(row.extras_total),
      taxes: sum.taxes + Number(row.taxes),
    }),
    { revenue: 0, accommodation: 0, extras: 0, taxes: 0 },
  );
  const monthly = Array.from({ length: 12 }, (_, month) => {
    const rows = paid.filter(
      (row) => new Date(row.created_at).getUTCMonth() === month,
    );
    return {
      label: new Intl.DateTimeFormat("fr-FR", {
        month: "long",
        timeZone: "UTC",
      }).format(new Date(Date.UTC(year, month, 1))),
      bookings: rows.length,
      revenue: rows.reduce((sum, row) => sum + Number(row.total), 0),
      taxes: rows.reduce((sum, row) => sum + Number(row.taxes), 0),
    };
  });
  return (
    <>
      <AdminPageHeader
        eyebrow="Comptabilité"
        title="Rapports financiers"
        description={`Chiffre d’affaires, taxes collectées et réservations encaissées en ${year}. Les montants proviennent des écritures de réservation.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <a
              href={`/api/admin/export?type=finance&year=${year}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm"
            >
              <Download className="size-4" /> Excel / CSV
            </a>
            <a
              href={`/api/admin/reports/financial?year=${year}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm"
            >
              <FileText className="size-4" /> Imprimer / PDF
            </a>
          </div>
        }
      />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="CA encaissé" value={euro(totals.revenue)} />
        <Metric label="Hébergement" value={euro(totals.accommodation)} />
        <Metric label="Options" value={euro(totals.extras)} />
        <Metric label="Taxes collectées" value={euro(totals.taxes)} />
        <Metric label="Réservations" value={String(paid.length)} />
      </section>
      <section className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/[.08] bg-[#121212]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-white/35">
              <tr>
                <th className="p-5">Mois</th>
                <th>Réservations</th>
                <th>CA</th>
                <th>Taxes</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((row) => (
                <tr key={row.label} className="border-t border-white/[.06]">
                  <th className="p-5 font-normal capitalize">{row.label}</th>
                  <td>{row.bookings}</td>
                  <td>{euro(row.revenue)}</td>
                  <td>{euro(row.taxes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[1.5rem] border border-white/[.08] bg-[#121212] p-5">
      <p className="text-[10px] uppercase tracking-wider text-white/35">
        {label}
      </p>
      <p className="mt-2 text-2xl text-[#E5C98E]">{value}</p>
    </article>
  );
}
