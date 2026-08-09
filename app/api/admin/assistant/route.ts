import { z } from "zod";
import { isAdminRequest } from "@/lib/admin/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildAdminInsights,
  type InsightReservation,
} from "@/lib/ai/admin-insights";
import { OpenAIResponsesProvider } from "@/lib/ai/openai-provider";

const input = z.object({ query: z.string().trim().min(2).max(500) });

export async function POST(request: Request) {
  if (!(await isAdminRequest()))
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json({ error: "Question invalide" }, { status: 400 });
  const { data, error } = await createAdminClient()
    .from("reservations")
    .select(
      "created_at,check_in,check_out,nights,total,status,payment_status,source",
    )
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error)
    return Response.json({ error: "Analyse indisponible" }, { status: 503 });
  const provider = new OpenAIResponsesProvider();
  if (!provider.isConfigured())
    return Response.json(
      { error: "Fournisseur IA non configuré" },
      { status: 503 },
    );
  try {
    const result = await provider.complete({
      intent: "business_analysis",
      prompt: parsed.data.query,
      context: buildAdminInsights((data ?? []) as InsightReservation[]),
    });
    return Response.json({ answer: result.content, provider: result.provider });
  } catch (providerError) {
    console.error("admin_assistant_provider_failed", {
      code:
        providerError instanceof Error
          ? providerError.message.slice(0, 80)
          : "UNKNOWN",
    });
    return Response.json({ error: "Analyse IA indisponible" }, { status: 503 });
  }
}
