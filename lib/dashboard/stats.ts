import type { DashboardReservation, DashboardStats } from "./dashboard-data";
const day = (value: Date) => value.toISOString().slice(0, 10);
export function buildStats(rows: DashboardReservation[], now: Date): DashboardStats {
  const today = day(now), year = now.getUTCFullYear(), month = now.getUTCMonth();
  const startWeek = new Date(now); startWeek.setUTCDate(now.getUTCDate() - ((now.getUTCDay() + 6) % 7));
  const paid = rows.filter((row) => row.payment_status === "paid");
  const revenue = (filter: (row: DashboardReservation) => boolean) => paid.filter(filter).reduce((sum, row) => sum + row.total, 0);
  const confirmed = rows.filter((row) => row.status === "confirmed" || row.status === "completed");
  const occupiedNights = confirmed.reduce((sum, row) => sum + row.nights, 0);
  return { todayRevenue: revenue((r) => r.created_at.startsWith(today)), weekRevenue: revenue((r) => r.created_at >= day(startWeek)), monthRevenue: revenue((r) => { const d=new Date(r.created_at); return d.getUTCFullYear()===year&&d.getUTCMonth()===month }), yearRevenue: revenue((r) => new Date(r.created_at).getUTCFullYear() === year), reservations: rows.length, occupancy: Math.min(100, Math.round(occupiedNights / (365) * 100)), averageBasket: paid.length ? Math.round(paid.reduce((s,r)=>s+r.total,0)/paid.length) : 0, pendingPayments: rows.filter((r)=>r.status==="pending_payment"||r.payment_status==="unpaid").length, pendingRequests: rows.filter((r)=>r.status==="pending").length };
}
