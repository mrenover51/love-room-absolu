"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarRange,
  CircleDollarSign,
  Moon,
  TrendingUp,
} from "lucide-react";

type Reservation = {
  created_at: string;
  check_in: string;
  nights: number;
  total: number;
  source: string;
  payment_status: string;
  status: string;
};
const euro = (cents: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
const months = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Aoû",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];
const colors = ["#C9A86A", "#8E48FF", "#F03C9B", "#4ADE80"];

export function StatisticsDashboard({
  rows,
  year,
  customerOrigins,
}: {
  rows: Reservation[];
  year: number;
  customerOrigins: Array<{city:string|null;country:string|null}>;
}) {
  const paid = rows.filter((row) => row.payment_status === "paid");
  const funnel = rows.filter(
    (row) => new Date(row.created_at).getUTCFullYear() === year,
  );
  const current = paid.filter(
    (row) => new Date(row.check_in).getUTCFullYear() === year,
  );
  const previous = paid.filter(
    (row) => new Date(row.check_in).getUTCFullYear() === year - 1,
  );
  const monthly = months.map((month, index) => {
    const currentRows = current.filter(
      (row) => new Date(row.check_in).getUTCMonth() === index,
    );
    const previousRows = previous.filter(
      (row) => new Date(row.check_in).getUTCMonth() === index,
    );
    return {
      month,
      revenue: currentRows.reduce((sum, row) => sum + row.total, 0) / 100,
      previous: previousRows.reduce((sum, row) => sum + row.total, 0) / 100,
      occupancy: Math.min(
        100,
        Math.round(
          (currentRows.reduce((sum, row) => sum + row.nights, 0) /
            new Date(year, index + 1, 0).getDate()) *
            100,
        ),
      ),
    };
  });
  const channels = Object.entries(
    current.reduce<Record<string, number>>(
      (result, row) => ({
        ...result,
        [row.source]: (result[row.source] ?? 0) + 1,
      }),
      {},
    ),
  ).map(([name, value]) => ({ name, value }));
  const revenue = current.reduce((sum, row) => sum + row.total, 0);
  const nights = current.reduce((sum, row) => sum + row.nights, 0);
  const average = current.length ? revenue / current.length : 0;
  const averageNight= nights ? revenue/nights : 0;
  const averageDuration=current.length?nights/current.length:0;
  const bestMonth=monthly.reduce((best,item)=>item.revenue>best.revenue?item:best,monthly[0]);
  const geography=Object.entries(customerOrigins.reduce<Record<string,number>>((result,item)=>{const name=[item.city,item.country].filter(Boolean).join(", ")||"Non renseignée";result[name]=(result[name]??0)+1;return result},{})).map(([name,value])=>({name,value}));
  const forecast =
    (monthly
      .slice(0, new Date().getUTCMonth() + 1)
      .reduce((sum, month) => sum + month.revenue, 0) /
      Math.max(1, new Date().getUTCMonth() + 1)) *
    12;
  const paidFunnel = funnel.filter(
    (row) => row.payment_status === "paid",
  ).length;
  const conversionRate = funnel.length
    ? Math.round((paidFunnel / funnel.length) * 1000) / 10
    : 0;
  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={CircleDollarSign}
          label="Chiffre d’affaires"
          value={euro(revenue)}
          detail={`${year}`}
        />
        <Metric
          icon={CalendarRange}
          label="Occupation"
          value={`${Math.round((nights / 365) * 100)}%`}
          detail={`${nights} nuits`}
        />
        <Metric
          icon={Moon}
          label="Panier moyen"
          value={euro(average)}
          detail={`${current.length} séjours`}
        />
        <Metric
          icon={TrendingUp}
          label="Prévision annuelle"
          value={new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
          }).format(forecast)}
          detail="Rythme actuel"
        />
      </section>
      <section className="mt-3 grid gap-3 sm:grid-cols-3"><Metric icon={CircleDollarSign} label="Prix moyen / nuit" value={euro(averageNight)} detail="Revenu par nuit occupée"/><Metric icon={Moon} label="Durée moyenne" value={`${averageDuration.toFixed(1)} nuits`} detail="Par séjour confirmé"/><Metric icon={TrendingUp} label="Mois le plus rentable" value={bestMonth?.month??"—"} detail={bestMonth?euro(bestMonth.revenue*100):"Aucune donnée"}/></section>
      <section
        className="mt-3 grid gap-3 sm:grid-cols-3"
        aria-label="Statistiques de conversion"
      >
        <Metric
          icon={CalendarRange}
          label="Checkouts créés"
          value={String(funnel.length)}
          detail="Réservations initiées"
        />
        <Metric
          icon={CircleDollarSign}
          label="Paiements aboutis"
          value={String(paidFunnel)}
          detail="Paiements Stripe confirmés"
        />
        <Metric
          icon={TrendingUp}
          label="Conversion checkout"
          value={`${conversionRate}%`}
          detail="Paiements / checkouts créés"
        />
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <ChartCard
          title="Revenus & comparaison annuelle"
          subtitle={`${year} comparé à ${year - 1}`}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#C9A86A" stopOpacity={0.45} />
                  <stop offset="1" stopColor="#C9A86A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#777", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#777", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#171717",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#C9A86A"
                fill="url(#revenue)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="previous"
                stroke="#8E48FF"
                fill="transparent"
                strokeDasharray="4 4"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard
          title="Origine des réservations"
          subtitle="Répartition par canal"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={
                  channels.length
                    ? channels
                    : [{ name: "Aucune donnée", value: 1 }]
                }
                dataKey="value"
                nameKey="name"
                innerRadius={68}
                outerRadius={100}
                paddingAngle={4}
              >
                {(channels.length
                  ? channels
                  : [{ name: "Aucune donnée", value: 1 }]
                ).map((entry, index) => (
                  <Cell
                    key={`${entry.name}-${index}`}
                    fill={
                      channels.length
                        ? colors[index % colors.length]
                        : "#252525"
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#171717",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3">
            {channels.map((channel, index) => (
              <span
                key={`${channel.name}-${index}`}
                className="flex items-center gap-1.5 text-[10px] text-white/45"
              >
                <i
                  className="size-2 rounded-full"
                  style={{ background: colors[index % colors.length] }}
                />
                {channel.name} · {channel.value}
              </span>
            ))}
          </div>
        </ChartCard>
      </section>
      <section className="mt-5">
        <ChartCard
          title="Occupation mensuelle"
          subtitle="Saisonnalité et périodes à développer"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthly}>
              <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#777", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#777", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#171717",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="occupancy" fill="#8E48FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>
      <section className="mt-5"><ChartCard title="Origine géographique" subtitle="Répartition renseignée dans les fiches clients"><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={geography.length?geography:[{name:"Non renseignée",value:1}]} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}>{(geography.length?geography:[{name:"Non renseignée",value:1}]).map((entry,index)=><Cell key={`${entry.name}-${index}`} fill={geography.length?colors[index%colors.length]:"#252525"}/>)}</Pie><Tooltip contentStyle={{background:"#171717",border:"1px solid rgba(255,255,255,.1)",borderRadius:12}}/></PieChart></ResponsiveContainer><div className="flex flex-wrap justify-center gap-3">{geography.map((item,index)=><span key={`${item.name}-${index}`} className="text-[10px] text-white/45"><i className="mr-1.5 inline-block size-2 rounded-full" style={{background:colors[index%colors.length]}}/>{item.name} · {item.value}</span>)}</div></ChartCard></section>
    </>
  );
}
function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof CircleDollarSign;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-white/[.08] bg-[#121212] p-5">
      <Icon className="size-5 text-[#C9A86A]" />
      <p className="mt-5 text-[10px] uppercase tracking-wider text-white/35">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-[10px] text-white/30">{detail}</p>
    </article>
  );
}
function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="min-w-0 rounded-[1.5rem] border border-white/[.08] bg-[#121212] p-5 sm:p-6">
      <figcaption>
        <p className="text-[10px] uppercase tracking-[.18em] text-[#C9A86A]">
          {subtitle}
        </p>
        <h2 className="mt-1 font-heading text-2xl">{title}</h2>
      </figcaption>
      <div className="mt-6">{children}</div>
    </figure>
  );
}
