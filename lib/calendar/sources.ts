import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type CalendarSourceDefinition = {
  source: "booking" | "airbnb";
  url?: string;
};

const sources = ["booking", "airbnb"] as const;

function environmentFallback(source: CalendarSourceDefinition["source"]) {
  return source === "booking"
    ? process.env.BOOKING_ICAL_URL ?? process.env.BOOKING_ICAL
    : process.env.AIRBNB_ICAL_URL ?? process.env.AIRBNB_ICAL;
}

export async function getCalendarSourceDefinitions(): Promise<CalendarSourceDefinition[]> {
  const { data, error } = await createAdminClient()
    .from("calendar_sources")
    .select("provider,import_url,enabled")
    .in("provider", sources);

  if (error) throw new Error("CALENDAR_SOURCES_READ_FAILED");

  const configured = new Map((data ?? []).map((row) => [row.provider, row]));
  return sources.map((source) => {
    const item = configured.get(source);
    const databaseUrl = item?.import_url?.trim() || undefined;

    if (databaseUrl) {
      return { source, url: item?.enabled === false ? undefined : databaseUrl };
    }

    return { source, url: environmentFallback(source) };
  });
}
