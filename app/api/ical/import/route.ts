import { z } from "zod";
import { isAdminRequest } from "@/lib/admin/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncExternalCalendar, validateCalendarUrl } from "@/lib/calendar/sync";
import type { CalendarSource } from "@/lib/booking/ical";

const input = z.object({
  provider: z.enum(["booking", "airbnb"]),
  url: z.url().max(2048),
  action: z.enum(["save", "sync"]).default("sync"),
});

export async function POST(request: Request) {
  if (!(await isAdminRequest()))
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const body = input.parse(await request.json());
    const url = validateCalendarUrl(body.url);
    const provider = body.provider as CalendarSource;
    const { error: saveError } = await createAdminClient()
      .from("calendar_sources")
      .upsert(
        {
          provider,
          name: provider === "booking" ? "Booking.com" : "Airbnb",
          import_url: url,
          enabled: true,
          ...(body.action === "save" ? { status: "not_configured" } : {}),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "provider" },
      );
    if (saveError) throw new Error("ICAL_SOURCE_SAVE_FAILED");
    if (body.action === "save") return Response.json({ ok: true, saved: true });
    const result = await syncExternalCalendar(provider, url);
    return Response.json(result, {
      status: result.status === "ok" ? 200 : 502,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "ICAL_IMPORT_FAILED" },
      { status: 400 },
    );
  }
}
