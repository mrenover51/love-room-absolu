import { NextResponse } from "next/server";
import { z } from "zod";
import { sendContactMessage } from "@/lib/email";
import { rejectCrossSite } from "@/lib/security/request";

const schema = z.object({ name: z.string().trim().min(2).max(100), email: z.email(), phone: z.string().trim().max(30).optional(), message: z.string().trim().min(10).max(3000), website: z.string().max(0).optional() });
const attempts = new Map<string, number[]>();
export async function POST(request: Request) {
  if (rejectCrossSite(request)) return NextResponse.json({ error: "Origine refusée." }, { status: 403 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now(), recent = (attempts.get(ip) ?? []).filter((time) => now - time < 3_600_000);
  if (recent.length >= 5) return NextResponse.json({ error: "Trop de messages. Réessayez plus tard." }, { status: 429 });
  attempts.set(ip, [...recent, now]);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Vérifiez les informations saisies." }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ ok: true });
  try { await sendContactMessage(parsed.data); return NextResponse.json({ ok: true }); }
  catch { console.error("contact_email_failed"); return NextResponse.json({ error: "Le message n’a pas pu être envoyé. Réessayez plus tard." }, { status: 503 }); }
}
