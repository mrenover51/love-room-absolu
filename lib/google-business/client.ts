import "server-only";

const scope = "https://www.googleapis.com/auth/business.manage";
export const googleBusinessConfig = {
  accountId: process.env.GOOGLE_BUSINESS_ACCOUNT_ID,
  locationId: process.env.GOOGLE_BUSINESS_LOCATION_ID,
  clientId: process.env.GOOGLE_BUSINESS_CLIENT_ID,
  clientSecret: process.env.GOOGLE_BUSINESS_CLIENT_SECRET,
  refreshToken: process.env.GOOGLE_BUSINESS_REFRESH_TOKEN,
};
export const googleBusinessConnected =
  Object.values(googleBusinessConfig).every(Boolean);

async function accessToken() {
  if (!googleBusinessConnected)
    throw new Error("GOOGLE_BUSINESS_NOT_CONFIGURED");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: googleBusinessConfig.clientId!,
      client_secret: googleBusinessConfig.clientSecret!,
      refresh_token: googleBusinessConfig.refreshToken!,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("GOOGLE_BUSINESS_OAUTH_FAILED");
  return ((await response.json()) as { access_token: string }).access_token;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const token = await accessToken();
  const response = await fetch(url, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`GOOGLE_BUSINESS_API_${response.status}`);
  return response.json() as Promise<T>;
}

const parent = () =>
  `accounts/${googleBusinessConfig.accountId}/locations/${googleBusinessConfig.locationId}`;
const locationName = () => `locations/${googleBusinessConfig.locationId}`;
const metrics = [
  "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
  "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
  "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
  "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
  "CALL_CLICKS",
  "BUSINESS_DIRECTION_REQUESTS",
  "WEBSITE_CLICKS",
  "BUSINESS_BOOKINGS",
];

type Point = {
  date: { year: number; month: number; day: number };
  value?: string;
};
type MetricSeries = {
  dailyMetric: string;
  timeSeries?: { datedValues?: Point[] };
};
export async function getGoogleBusinessPerformance(start: Date, end: Date) {
  const params = new URLSearchParams();
  metrics.forEach((metric) => params.append("dailyMetrics", metric));
  [
    ["start_date", start],
    ["end_date", end],
  ].forEach(([key, raw]) => {
    const date = raw as Date;
    params.set(`daily_range.${key}.year`, String(date.getUTCFullYear()));
    params.set(`daily_range.${key}.month`, String(date.getUTCMonth() + 1));
    params.set(`daily_range.${key}.day`, String(date.getUTCDate()));
  });
  const data = await request<{
    multiDailyMetricTimeSeries?: { dailyMetricTimeSeries?: MetricSeries[] }[];
  }>(
    `https://businessprofileperformance.googleapis.com/v1/${locationName()}:fetchMultiDailyMetricsTimeSeries?${params}`,
  );
  const series =
    data.multiDailyMetricTimeSeries?.flatMap(
      (item) => item.dailyMetricTimeSeries ?? [],
    ) ?? [];
  const sum = (name: string) =>
    series
      .filter((item) => item.dailyMetric === name)
      .flatMap((item) => item.timeSeries?.datedValues ?? [])
      .reduce((total, point) => total + Number(point.value ?? 0), 0);
  const monthly = new Map<string, Record<string, number>>();
  for (const item of series)
    for (const point of item.timeSeries?.datedValues ?? []) {
      const key = `${point.date.year}-${String(point.date.month).padStart(2, "0")}`;
      const row = monthly.get(key) ?? {};
      row[item.dailyMetric] =
        (row[item.dailyMetric] ?? 0) + Number(point.value ?? 0);
      monthly.set(key, row);
    }
  const views = metrics
    .slice(0, 4)
    .reduce((total, metric) => total + sum(metric), 0);
  return {
    totals: {
      views,
      calls: sum("CALL_CLICKS"),
      directions: sum("BUSINESS_DIRECTION_REQUESTS"),
      websiteClicks: sum("WEBSITE_CLICKS"),
      bookings: sum("BUSINESS_BOOKINGS"),
    },
    monthly: [...monthly].map(([month, row]) => ({
      month,
      views: metrics
        .slice(0, 4)
        .reduce((total, metric) => total + (row[metric] ?? 0), 0),
      calls: row.CALL_CLICKS ?? 0,
      directions: row.BUSINESS_DIRECTION_REQUESTS ?? 0,
      websiteClicks: row.WEBSITE_CLICKS ?? 0,
      bookings: row.BUSINESS_BOOKINGS ?? 0,
    })),
  };
}

export const listGoogleReviews = () =>
  request<{
    reviews?: unknown[];
    averageRating?: number;
    totalReviewCount?: number;
  }>(
    `https://mybusiness.googleapis.com/v4/${parent()}/reviews?pageSize=50&orderBy=updateTime%20desc`,
  );
export const listGooglePosts = () =>
  request<{ localPosts?: unknown[] }>(
    `https://mybusiness.googleapis.com/v4/${parent()}/localPosts?pageSize=50`,
  );
export const listGoogleMedia = () =>
  request<{ mediaItems?: unknown[] }>(
    `https://mybusiness.googleapis.com/v4/${parent()}/media`,
  );
export const createGooglePost = (body: unknown) =>
  request(`https://mybusiness.googleapis.com/v4/${parent()}/localPosts`, {
    method: "POST",
    body: JSON.stringify(body),
  });
export const replyToGoogleReview = (reviewId: string, comment: string) =>
  request(
    `https://mybusiness.googleapis.com/v4/${parent()}/reviews/${encodeURIComponent(reviewId)}/reply`,
    { method: "PUT", body: JSON.stringify({ comment }) },
  );
export { scope as googleBusinessScope };
