import dynamic from "next/dynamic";
import { requireAdmin } from "@/lib/admin/auth";
import { getDashboardData } from "@/lib/dashboard/queries";
import { Hero } from "@/components/admin/dashboard/Hero";
import { StatsCards } from "@/components/admin/dashboard/StatsCards";
import { OccupancyCalendar } from "@/components/admin/dashboard/OccupancyCalendar";
import { Timeline } from "@/components/admin/dashboard/Timeline";
import { SyncStatus } from "@/components/admin/dashboard/SyncStatus";
import { RecentBookings } from "@/components/admin/dashboard/RecentBookings";
import { WeatherCard } from "@/components/admin/dashboard/WeatherCard";
import { Alerts } from "@/components/admin/dashboard/Alerts";
import { Heatmap } from "@/components/admin/dashboard/Heatmap";
import { AiAssistant } from "@/components/admin/dashboard/AiAssistant";
import { getStaySettings } from "@/lib/stay-settings";
import { RequestStats } from "@/components/admin/dashboard/RequestStats";

const RevenueChart = dynamic(() => import("@/components/admin/dashboard/RevenueChart").then((module) => module.RevenueChart), { loading: () => <div className="h-[390px] animate-pulse rounded-[1.5rem] bg-[#121212]" /> });

export default async function Dashboard() {
  await requireAdmin();
  const [data, staySettings] = await Promise.all([getDashboardData(), getStaySettings()]);
  return <div className="space-y-5 sm:space-y-7">
    <Hero nowIso={data.nowIso} reservations={data.reservations} checkOutTime={staySettings.checkOut} />
    <StatsCards stats={data.stats} />
    <RequestStats />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]"><RevenueChart data={data.charts} /><Timeline events={data.timeline} /></div>
    <OccupancyCalendar days={data.calendar} />
    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3"><SyncStatus items={data.sync} /><WeatherCard /><Alerts items={data.alerts} /></div>
    <RecentBookings rows={data.recent} />
    <Heatmap days={data.heatmap} />
    <AiAssistant />
  </div>;
}
