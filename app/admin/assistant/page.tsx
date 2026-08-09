import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AssistantConversation } from "@/components/admin/assistant-conversation";
import { AssistantInsights } from "@/components/admin/assistant-insights";
import {
  buildAdminInsights,
  type InsightReservation,
} from "@/lib/ai/admin-insights";

export default async function AssistantPage() {
  await requireAdmin();
  const { data, error } = await createAdminClient()
    .from("reservations")
    .select(
      "created_at,check_in,check_out,nights,total,status,payment_status,source",
    )
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) throw new Error("ASSISTANT_DATA_READ_FAILED");
  const insights = buildAdminInsights((data ?? []) as InsightReservation[]);
  return (
    <>
      <AdminPageHeader
        eyebrow="Intelligence hôtelière"
        title="Absolu Intelligence"
        description="Occupation, revenus, prévisions et recommandations calculés à partir des données existantes, sans action automatique sur votre activité."
      />
      <AssistantInsights insights={insights} />
      <div className="mt-5">
        <AssistantConversation context={insights} />
      </div>
    </>
  );
}
