import "server-only";
import { createClient } from "@supabase/supabase-js";
export const reviewCriteria = [
  "cleanliness",
  "comfort",
  "romance",
  "equipment",
  "welcome",
  "value_for_money",
  "location",
  "atmosphere",
] as const;
export type ReviewCriterion = (typeof reviewCriteria)[number];
export const reviewLabels: Record<ReviewCriterion, string> = {
  cleanliness: "Propreté",
  comfort: "Confort",
  romance: "Romantisme",
  equipment: "Équipements",
  welcome: "Accueil",
  value_for_money: "Rapport qualité/prix",
  location: "Localisation",
  atmosphere: "Ambiance",
};
export type PublishedReview = {
  id: string;
  slug: string;
  reviewer_name: string;
  title: string;
  body: string;
  stay_type: string;
  stay_date: string;
  nights: number;
  overall_rating: number;
  cleanliness: number;
  comfort: number;
  romance: number;
  equipment: number;
  welcome: number;
  value_for_money: number;
  location: number;
  atmosphere: number;
  photo_urls: string[];
  owner_response: string | null;
  owner_responded_at: string | null;
  verified: boolean;
  featured: boolean;
  published_at: string;
};
function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
export async function getPublishedReviews() {
  const db = client();
  if (!db) return [] as PublishedReview[];
  const { data, error } = await db
    .from("reviews")
    .select(
      "id,slug,reviewer_name,title,body,stay_type,stay_date,nights,overall_rating,cleanliness,comfort,romance,equipment,welcome,value_for_money,location,atmosphere,photo_urls,owner_response,owner_responded_at,verified,featured,published_at",
    )
    .eq("status", "published")
    .eq("verified", true)
    .order("published_at", { ascending: false })
    .limit(500);
  if (error) return [];
  return (data ?? []).map((item) => ({
    ...item,
    overall_rating: Number(item.overall_rating),
  })) as PublishedReview[];
}
export async function getPublishedReview(slug: string) {
  return (await getPublishedReviews()).find((item) => item.slug === slug);
}
export function reviewStats(items: PublishedReview[]) {
  const count = items.length;
  const average = (key: ReviewCriterion | "overall_rating") =>
    count ? items.reduce((sum, item) => sum + Number(item[key]), 0) / count : 0;
  return {
    count,
    overall: average("overall_rating"),
    criteria: Object.fromEntries(
      reviewCriteria.map((key) => [key, average(key)]),
    ) as Record<ReviewCriterion, number>,
    distribution: Array.from({ length: 10 }, (_, index) => {
      const rating = 10 - index;
      return {
        rating,
        count: items.filter(
          (item) => Math.round(item.overall_rating) === rating,
        ).length,
      };
    }),
  };
}
