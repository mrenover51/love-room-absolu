import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function startOfCurrentWeek(now: Date) {
  const start = new Date(now);
  const weekday = start.getUTCDay() || 7;
  start.setUTCDate(start.getUTCDate() - weekday + 1);
  start.setUTCHours(0, 0, 0, 0);
  return start.toISOString();
}

export async function GET() {
  try {
    const { count, error } = await createAdminClient()
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfCurrentWeek(new Date()))
      .in("status", ["confirmed", "completed"])
      .eq("payment_status", "paid");
    if (error) throw error;
    return NextResponse.json(
      { confirmedBookingsThisWeek: count ?? 0 },
      { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=900" } },
    );
  } catch {
    return NextResponse.json(
      { confirmedBookingsThisWeek: null },
      { headers: { "cache-control": "no-store" } },
    );
  }
}
