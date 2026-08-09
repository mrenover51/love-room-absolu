import { NextResponse } from "next/server";

import { rejectCrossSite } from "@/lib/security/request";
import { reservationRequestSchema } from "@/lib/supabase/validators/reservation";
import { CheckoutService } from "@/lib/stripe/checkout-service";

const attempts = new Map<string, { count: number; resetAt: number }>();

function limited(ip: string) {
  const now = Date.now();
  const item = attempts.get(ip);
  if (!item || item.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60_000 });
    return false;
  }
  item.count += 1;
  return item.count > 5;
}

export async function POST(request: Request) {
  if (rejectCrossSite(request))
    return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip))
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez plus tard." },
      { status: 429 },
    );
  try {
    const body: unknown = await request.json();
    if (
      typeof body === "object" &&
      body !== null &&
      "website" in body &&
      body.website
    )
      return NextResponse.json({ ok: true }, { status: 202 });
    const parsed = reservationRequestSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        {
          error: "Certains champs sont invalides.",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    return NextResponse.json(await new CheckoutService().create(parsed.data), {
      status: 201,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code.includes("MINIMUM_ADVANCE_DAYS"))
      return NextResponse.json(
        {
          error: "La date d’arrivée ne respecte plus le délai minimum de réservation.",
          code: "MINIMUM_ADVANCE_DAYS",
        },
        { status: 409 },
      );
    if (code.includes("DATES_UNAVAILABLE"))
      return NextResponse.json(
        {
          error: "Ces dates ne sont plus disponibles.",
          code: "DATES_UNAVAILABLE",
        },
        { status: 409 },
      );
    if (code.includes("PROMO_INVALID"))
      return NextResponse.json(
        {
          error: "Le code promotionnel n’est plus valide.",
          code: "PROMO_INVALID",
        },
        { status: 409 },
      );
    if (code.includes("NOT_CONFIGURED") || code.includes("CONFIG_MISSING")) {
      console.error("checkout_configuration_missing");
      return NextResponse.json(
        { error: "Le paiement est temporairement indisponible." },
        { status: 503 },
      );
    }
    console.error("checkout_creation_failed", { code: code.slice(0, 80) });
    return NextResponse.json(
      { error: "Le paiement n’a pas pu être préparé. Réessayez." },
      { status: 500 },
    );
  }
}
