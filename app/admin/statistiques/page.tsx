import { Download } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatisticsDashboard } from "@/components/admin/statistics-dashboard";

type Reservation = { created_at: string; check_in: string; nights: number; total: number; source: string; payment_status: string; status: string };
export default async function Statistics() {
  await requireAdmin();
  const year = new Date().getUTCFullYear();
  const { data } = await createAdminClient().from("reservations").select("created_at,check_in,nights,total,source,payment_status,status").gte("check_in", `${year - 1}-01-01`).lte("check_in", `${year}-12-31`);
  const rows = (data ?? []) as Reservation[];
  return <>
    <AdminPageHeader eyebrow="Business intelligence" title="Statistiques" description="Pilotez revenus, occupation, canaux et saisonnalité depuis une vue consolidée." actions={<div className="flex gap-2"><button type="button" onClick={undefined} className="rounded-full border border-white/15 px-4 py-2 text-sm" title="Utilisez la fonction d’impression du navigateur">PDF</button><a href="/api/admin/export?type=statistics" className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm"><Download className="size-4" />Excel / CSV</a></div>} />
    <StatisticsDashboard rows={rows} year={year} />
  </>;
}
