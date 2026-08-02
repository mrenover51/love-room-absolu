import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AssistantConversation } from "@/components/admin/assistant-conversation";

export default async function Assistant() {
  await requireAdmin();
  const year = new Date().getUTCFullYear();
  const { data } = await createAdminClient().from("reservations").select("total,nights,check_in,check_out,source,status,payment_status").gte("check_in", `${year}-01-01`).lte("check_in", `${year}-12-31`);
  const rows = data ?? [];
  const paid = rows.filter((row) => row.payment_status === "paid");
  const context = { revenue: paid.reduce((sum, row) => sum + row.total, 0), bookings: rows.length, nights: rows.reduce((sum, row) => sum + row.nights, 0), bestCustomer: "Disponible dans le CRM", occupancy: Math.round(rows.filter((row) => row.status !== "cancelled").reduce((sum, row) => sum + row.nights, 0) / 365 * 100) };
  return <>
    <AdminPageHeader eyebrow="Intelligence hôtelière" title="Absolu Assistant" description="Une interface conversationnelle prête pour OpenAI, avec réponses locales sûres sur vos indicateurs essentiels." />
    <AssistantConversation context={context} />
  </>;
}
