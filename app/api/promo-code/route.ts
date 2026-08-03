import { NextResponse } from "next/server";
import { z } from "zod";
import { rejectCrossSite } from "@/lib/security/request";
import { SupabasePricingRepository } from "@/lib/supabase/repositories/pricing-repository";

export async function POST(request: Request) {
  if (rejectCrossSite(request))
    return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  const parsed = z
    .object({ code: z.string().trim().toUpperCase().min(2).max(40) })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Code invalide." }, { status: 400 });
  try {
    const promo = await new SupabasePricingRepository().validatePromoCode(
      parsed.data.code,
    );
    if (!promo)
      return NextResponse.json(
        { error: "Ce code n’est pas valide ou a expiré." },
        { status: 404 },
      );
    return NextResponse.json(promo, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Validation temporairement indisponible." },
      { status: 503 },
    );
  }
}
