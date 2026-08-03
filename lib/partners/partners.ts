import { createAdminClient } from "@/lib/supabase/admin";

export const partnerCategories = {
  restaurant: "Restaurants partenaires",
  champagne: "Maisons de Champagne",
  photographe: "Photographes",
  spa: "Spas",
  massage: "Massages",
  activite: "Activités",
} as const;
export type PartnerCategory = keyof typeof partnerCategories;
export type Partner = {
  id: string;
  slug: string;
  name: string;
  category: PartnerCategory;
  description: string;
  city: string;
  website_url: string | null;
  backlink_url: string | null;
  logo_url: string | null;
  image_url: string | null;
  status: string;
  reciprocal_status: string;
  authority_quality: number;
  local_relevance: number;
  editorial_quality: number;
  reciprocal_bonus: number;
  last_checked_at: string | null;
  published_at: string | null;
};
export const authorityScore = (
  partner: Pick<
    Partner,
    | "authority_quality"
    | "local_relevance"
    | "editorial_quality"
    | "reciprocal_bonus"
  >,
) =>
  partner.authority_quality +
  partner.local_relevance +
  partner.editorial_quality +
  partner.reciprocal_bonus;
export async function getPublishedPartners() {
  try {
    const { data, error } = await createAdminClient()
      .from("partners")
      .select(
        "id,slug,name,category,description,city,website_url,backlink_url,logo_url,image_url,status,reciprocal_status,authority_quality,local_relevance,editorial_quality,reciprocal_bonus,last_checked_at,published_at",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as Partner[];
  } catch {
    return [];
  }
}
export async function getPartner(slug: string) {
  return (await getPublishedPartners()).find(
    (partner) => partner.slug === slug,
  );
}
