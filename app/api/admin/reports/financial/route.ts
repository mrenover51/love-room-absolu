import { z } from "zod";
import { isAdminRequest } from "@/lib/admin/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const escape = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const euro = (value: number) => `${(value / 100).toFixed(2)} €`;

export async function GET(request: Request) {
  if (!(await isAdminRequest()))
    return new Response("Non autorisé", { status: 401 });
  const parsed = z.coerce
    .number()
    .int()
    .min(2020)
    .max(2100)
    .safeParse(new URL(request.url).searchParams.get("year"));
  if (!parsed.success) return new Response("Année invalide", { status: 400 });
  const year = parsed.data;
  const { data, error } = await createAdminClient()
    .from("reservations")
    .select(
      "reference,created_at,subtotal,extras_total,taxes,total,payment_status",
    )
    .gte("created_at", `${year}-01-01`)
    .lt("created_at", `${year + 1}-01-01`)
    .in("payment_status", ["paid", "partially_refunded"])
    .order("created_at");
  if (error) return new Response("Rapport indisponible", { status: 500 });
  const rows = data ?? [];
  const totals = rows.reduce(
    (sum, row) => ({
      subtotal: sum.subtotal + row.subtotal,
      extras: sum.extras + row.extras_total,
      taxes: sum.taxes + row.taxes,
      total: sum.total + row.total,
    }),
    { subtotal: 0, extras: 0, taxes: 0, total: 0 },
  );
  const body = rows
    .map(
      (row) =>
        `<tr><td>${escape(row.reference)}</td><td>${escape(new Date(row.created_at).toLocaleDateString("fr-FR"))}</td><td>${euro(row.subtotal)}</td><td>${euro(row.extras_total)}</td><td>${euro(row.taxes)}</td><td>${euro(row.total)}</td></tr>`,
    )
    .join("");
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Rapport financier ${year}</title><style>body{font:14px Arial;color:#191715;margin:40px}h1{font:38px Georgia}table{width:100%;border-collapse:collapse;margin-top:30px}th,td{padding:10px;border-bottom:1px solid #ddd;text-align:right}th:first-child,td:first-child,th:nth-child(2),td:nth-child(2){text-align:left}.totals{margin-top:28px;font-size:16px}.muted{color:#666}@media print{button{display:none}body{margin:12mm}}</style></head><body><button onclick="window.print()">Imprimer / enregistrer en PDF</button><h1>ABSOLU</h1><p class="muted">Rapport financier ${year} · généré le ${escape(new Date().toLocaleString("fr-FR"))}</p><table><thead><tr><th>Référence</th><th>Date</th><th>Hébergement</th><th>Options</th><th>Taxes</th><th>Total</th></tr></thead><tbody>${body}</tbody></table><p class="totals"><strong>CA encaissé : ${euro(totals.total)}</strong><br>Hébergement : ${euro(totals.subtotal)} · Options : ${euro(totals.extras)} · Taxes collectées : ${euro(totals.taxes)}</p></body></html>`;
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, no-store",
    },
  });
}
