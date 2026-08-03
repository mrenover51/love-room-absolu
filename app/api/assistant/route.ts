import { NextResponse } from "next/server";
import { z } from "zod";
import { findAssistantAnswer } from "@/lib/assistant/knowledge";
import { equipmentItems } from "@/lib/equipment/equipment-data";
import { premiumFaqItems } from "@/lib/faq/faq-data";
import { rejectCrossSite } from "@/lib/security/request";

const requestSchema = z.object({ query: z.string().trim().min(2).max(300) });
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ");
const tokens = (value: string) =>
  new Set(
    normalize(value)
      .split(/\s+/)
      .filter((word) => word.length > 3),
  );

export async function POST(request: Request) {
  if (rejectCrossSite(request))
    return NextResponse.json({ error: "Origine refusée." }, { status: 403 });
  const parsed = requestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json({ error: "Question invalide." }, { status: 400 });
  const queryTokens = tokens(parsed.data.query);
  const faqMatch = premiumFaqItems
    .map((item) => ({
      item,
      score: [...queryTokens].filter((token) =>
        normalize(`${item.question} ${item.category}`).includes(token),
      ).length,
    }))
    .sort((a, b) => b.score - a.score)[0];
  const equipmentMatch = equipmentItems
    .filter((item) => item.status === "confirmed")
    .map((item) => ({
      item,
      score: [...queryTokens].filter((token) =>
        normalize(`${item.name} ${item.features.join(" ")}`).includes(token),
      ).length,
    }))
    .sort((a, b) => b.score - a.score)[0];
  if (faqMatch?.score && faqMatch.score >= (equipmentMatch?.score ?? 0)) {
    const concise = faqMatch.item.answer.split("\n\n")[0];
    return NextResponse.json(
      {
        answer: concise,
        source: "faq",
        href: `/faq#${faqMatch.item.id}`,
        label: "Lire la réponse complète",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  if (equipmentMatch?.score)
    return NextResponse.json(
      {
        answer: `${equipmentMatch.item.detail} ${equipmentMatch.item.advice}`,
        source: "equipment",
        href: `/equipements/${equipmentMatch.item.slug}`,
        label: `Découvrir ${equipmentMatch.item.shortName}`,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  return NextResponse.json(
    {
      answer: findAssistantAnswer(parsed.data.query),
      source: "knowledge",
      href: "/faq",
      label: "Consulter le centre d’aide",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
