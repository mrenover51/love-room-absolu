export type ReservationStatus = "pending" | "pending_payment" | "confirmed" | "cancelled" | "completed" | "refunded";
export type PaymentStatus = "unpaid" | "paid" | "partially_refunded" | "refunded" | "failed";
export type ReservationSource = "direct" | "booking" | "airbnb" | "manual";

export interface DashboardReservation {
  id: string; reference: string; created_at: string; check_in: string; check_out: string;
  nights: number; guest_first_name: string; guest_last_name: string; total: number;
  status: ReservationStatus; payment_status: PaymentStatus; source: ReservationSource;
}
export interface BlockedPeriod { id: string; start_date: string; end_date: string; source: ReservationSource; reason: string | null }
export type CalendarState = "available" | "booked" | "arrival" | "departure" | "blocked";
export interface CalendarDay { date: string; day: number; weekday: string; state: CalendarState; reservationId?: string }
export interface ChartPoint { label: string; revenue: number; bookings: number; occupancy: number }
export interface DashboardStats { todayRevenue: number; weekRevenue: number; monthRevenue: number; yearRevenue: number; previousMonthRevenue: number; reservations: number; confirmedReservations: number; cancelledReservations: number; occupancy: number; averageBasket: number; averageStay: number; pendingPayments: number; pendingRequests: number }
export interface TimelineEvent { id: string; time: string; title: string; detail: string; tone: "gold" | "green" | "blue" | "muted" }
export interface SyncItem { name: "Booking" | "Airbnb" | "Stripe" | "Emails"; status: "connected" | "error" | "syncing"; lastSync: string }
export interface AlertItem { id: string; title: string; detail: string; tone: "orange" | "blue" | "red" | "green" | "gold" }
export interface HeatmapDay { date: string; state: "available" | "occupied" | "blocked" }
export interface DashboardData { nowIso: string; reservations: DashboardReservation[]; recent: DashboardReservation[]; blocked: BlockedPeriod[]; stats: DashboardStats; charts: { sevenDays: ChartPoint[]; thirtyDays: ChartPoint[]; twelveMonths: ChartPoint[] }; calendar: CalendarDay[]; heatmap: HeatmapDay[]; timeline: TimelineEvent[]; sync: SyncItem[]; alerts: AlertItem[] }
