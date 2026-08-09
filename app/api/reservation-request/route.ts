import { NextResponse } from "next/server";
import { reservationRequestSchema } from "@/lib/booking/validation";
import { createManualReservationRequest } from "@/lib/booking/manual-request-service";
import { rejectCrossSite } from "@/lib/security/request";

const attempts = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string) {
  const now = Date.now(), current = attempts.get(ip);
  if (!current || current.resetAt < now) { attempts.set(ip, { count: 1, resetAt: now + 15 * 60_000 }); return false; }
  current.count += 1; return current.count > 5;
}
export async function POST(request: Request) {
  if (rejectCrossSite(request)) return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (isRateLimited(ip)) return NextResponse.json({ error: "Trop de demandes. Réessayez dans quelques minutes." }, { status: 429 });
  try {
    const body: unknown = await request.json();
    if (typeof body === "object" && body !== null && "website" in body && body.website) return NextResponse.json({ ok: true }, { status: 202 });
    const parsed = reservationRequestSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Certains champs sont invalides.", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
    return NextResponse.json(await createManualReservationRequest(parsed.data), { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code === "MINIMUM_ADVANCE_DAYS") return NextResponse.json({ error: "La date d’arrivée ne respecte plus le délai minimum de réservation.", code }, { status: 409 });
    if (code === "DATES_UNAVAILABLE") return NextResponse.json({ error: "Ces dates ne sont plus disponibles.", code }, { status: 409 });
    if (code === "DUPLICATE_REQUEST") return NextResponse.json({ error: "Une demande identique vient déjà d’être enregistrée.", code }, { status: 409 });
    console.error("reservation_request_failed", { code: code.slice(0, 80) });
    return NextResponse.json({ error: "La demande n’a pas pu être enregistrée. Réessayez." }, { status: 500 });
  }
}
