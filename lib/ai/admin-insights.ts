export type InsightReservation = {
  created_at: string;
  check_in: string;
  check_out: string;
  nights: number;
  total: number;
  status: string;
  payment_status: string;
  source: string;
};

export type AdminInsights = {
  revenue: number;
  bookings: number;
  nights: number;
  occupancy: number;
  forecastRevenue: number;
  averageBasket: number;
  cancellationRate: number;
  directShare: number;
  monthly: Array<{ label: string; revenue: number; occupancy: number }>;
  lowPeriods: string[];
  pricingSuggestion: string;
  recommendations: string[];
};

const day = (date: Date) => date.toISOString().slice(0, 10);
const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + amount);
  return next;
};
const active = (row: InsightReservation) =>
  row.status === "confirmed" || row.status === "completed";

export function buildAdminInsights(
  rows: InsightReservation[],
  now = new Date(),
): AdminInsights {
  const paid = rows.filter((row) => row.payment_status === "paid"),
    confirmed = rows.filter(active),
    revenue = paid.reduce((sum, row) => sum + row.total, 0),
    bookings = rows.length,
    nights = confirmed.reduce((sum, row) => sum + row.nights, 0),
    next90 = Array.from({ length: 90 }, (_, index) => day(addDays(now, index))),
    occupiedNext90 = next90.filter((date) =>
      confirmed.some((row) => row.check_in <= date && row.check_out > date),
    ).length,
    occupancy = Math.round((occupiedNext90 / 90) * 100),
    averageBasket = paid.length ? Math.round(revenue / paid.length) : 0,
    cancellationRate = bookings
      ? Math.round(
          (rows.filter((row) => row.status === "cancelled").length / bookings) *
            100,
        )
      : 0,
    directShare = bookings
      ? Math.round(
          (rows.filter((row) => row.source === "direct").length / bookings) *
            100,
        )
      : 0;

  const monthly = Array.from({ length: 6 }, (_, offset) => {
    const date = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1),
      ),
      next = new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1),
      ),
      start = day(date),
      end = day(next),
      days = Math.round((next.getTime() - date.getTime()) / 86_400_000),
      occupied = confirmed.reduce((sum, row) => {
        const from = Math.max(
            Date.parse(`${row.check_in}T00:00:00Z`),
            date.getTime(),
          ),
          to = Math.min(
            Date.parse(`${row.check_out}T00:00:00Z`),
            next.getTime(),
          );
        return sum + Math.max(0, Math.round((to - from) / 86_400_000));
      }, 0),
      monthRevenue = paid
        .filter((row) => row.created_at >= start && row.created_at < end)
        .reduce((sum, row) => sum + row.total, 0);
    return {
      label: new Intl.DateTimeFormat("fr-FR", {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
      }).format(date),
      revenue: monthRevenue,
      occupancy: Math.min(100, Math.round((occupied / days) * 100)),
    };
  });

  const historicalRevenue = Array.from({ length: 3 }, (_, offset) => {
    const start = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset - 1, 1),
      ),
      end = new Date(
        Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1),
      );
    return paid
      .filter(
        (row) =>
          row.created_at >= start.toISOString() &&
          row.created_at < end.toISOString(),
      )
      .reduce((sum, row) => sum + row.total, 0);
  });
  const forecastRevenue = historicalRevenue.some(Boolean)
    ? Math.round(
        historicalRevenue.reduce((sum, value) => sum + value, 0) /
          historicalRevenue.length,
      )
    : 0;
  const lowPeriods = monthly
    .filter((month) => month.occupancy < 35)
    .map((month) => month.label);
  const pricingSuggestion =
    occupancy < 30
      ? "Tester une offre courte du dimanche au jeudi, sans dégrader le tarif des samedis."
      : occupancy > 70
        ? "La demande est soutenue : préserver le prix premium et tester une hausse mesurée sur les dates les plus sollicitées."
        : "Maintenir les tarifs actuels et surveiller les dates à moins de 21 jours encore libres.";
  const recommendations = [
    lowPeriods.length
      ? `Concentrer les actions commerciales sur ${lowPeriods.slice(0, 3).join(", ")}.`
      : "Aucune période très creuse détectée sur les six prochains mois.",
    directShare < 50
      ? "Renforcer la réservation directe pour réduire la dépendance aux plateformes."
      : `La part directe atteint ${directShare} % : continuer à valoriser les avantages du site.`,
    cancellationRate > 15
      ? "Analyser les annulations récentes et clarifier les conditions avant paiement."
      : "Le niveau d’annulation reste contenu ; conserver les conditions actuelles.",
  ];
  return {
    revenue,
    bookings,
    nights,
    occupancy,
    forecastRevenue,
    averageBasket,
    cancellationRate,
    directShare,
    monthly,
    lowPeriods,
    pricingSuggestion,
    recommendations,
  };
}
