import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
async function authorized() {
  try {
    const client = await createSupabaseServerClient(),
      {
        data: { user },
      } = await client.auth.getUser();
    if (!user) return false;
    const { data } = await client
      .from("admin_profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    return Boolean(data && ["admin", "owner"].includes(data.role));
  } catch {
    return false;
  }
}
const safe = (value: unknown) => {
  const text = String(value ?? "").replaceAll('"', '""');
  return `"${/^[=+\-@]/.test(text) ? "'" : ""}${text}"`;
};
const csv = (rows: Record<string, unknown>[]) => {
  if (!rows.length) return "\uFEFF";
  const keys = Object.keys(rows[0]);
  return (
    "\uFEFF" +
    [
      keys.join(";"),
      ...rows.map((row) => keys.map((key) => safe(row[key])).join(";")),
    ].join("\r\n")
  );
};
export async function GET(request: Request) {
  if (!(await authorized()))
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const type = z
    .enum([
      "reservations",
      "clients",
      "payments",
      "statistics",
      "finance",
      "backup",
    ])
    .safeParse(new URL(request.url).searchParams.get("type"));
  if (!type.success)
    return NextResponse.json({ error: "Export invalide" }, { status: 400 });
  const db = createAdminClient();
  if (type.data === "backup") {
    const tables = [
      "reservations",
      "reservation_options",
      "blocked_dates",
      "pricing",
      "options",
      "settings",
      "customers",
      "seasonal_prices",
      "promotions",
      "promo_codes",
    ];
    const entries = await Promise.all(
      tables.map(async (table) => {
        const { data } = await db.from(table).select("*");
        return [table, data ?? []] as const;
      }),
    );
    return new Response(
      JSON.stringify(
        {
          version: 1,
          exportedAt: new Date().toISOString(),
          data: Object.fromEntries(entries),
        },
        null,
        2,
      ),
      {
        headers: {
          "content-type": "application/json",
          "content-disposition": "attachment; filename=absolu-backup.json",
          "cache-control": "no-store",
        },
      },
    );
  }
  if (type.data === "finance") {
    const year = z.coerce
      .number()
      .int()
      .min(2020)
      .max(2100)
      .catch(new Date().getUTCFullYear())
      .parse(new URL(request.url).searchParams.get("year"));
    const { data, error } = await db
      .from("reservations")
      .select(
        "reference,created_at,check_in,check_out,source,status,payment_status,subtotal,extras_total,taxes,total,currency",
      )
      .gte("created_at", `${year}-01-01`)
      .lt("created_at", `${year + 1}-01-01`)
      .in("payment_status", ["paid", "partially_refunded"])
      .order("created_at")
      .limit(10000);
    if (error)
      return NextResponse.json({ error: "Export impossible" }, { status: 500 });
    return new Response(
      csv((data ?? []) as unknown as Record<string, unknown>[]),
      {
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": `attachment; filename=absolu-finance-${year}.csv`,
          "cache-control": "no-store",
        },
      },
    );
  }
  const table = type.data === "clients" ? "customers" : "reservations",
    { data, error } = await db.from(table).select("*").limit(10000);
  if (error)
    return NextResponse.json({ error: "Export impossible" }, { status: 500 });
  return new Response(
    csv((data ?? []) as unknown as Record<string, unknown>[]),
    {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename=absolu-${type.data}.csv`,
        "cache-control": "no-store",
      },
    },
  );
}
