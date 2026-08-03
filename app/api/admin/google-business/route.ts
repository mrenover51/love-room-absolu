import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createGooglePost,
  getGoogleBusinessPerformance,
  googleBusinessConnected,
  listGoogleMedia,
  listGooglePosts,
  listGoogleReviews,
  replyToGoogleReview,
} from "@/lib/google-business/client";
import { siteConfig } from "@/lib/site-config";

async function authorized() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  return Boolean(data && ["admin", "owner"].includes(data.role));
}
export async function GET() {
  if (!(await authorized()))
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  if (!googleBusinessConnected)
    return NextResponse.json({
      connected: false,
      metrics: null,
      posts: [],
      reviews: [],
      media: [],
    });
  const end = new Date(),
    start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 11, 1));
  const results = await Promise.allSettled([
    getGoogleBusinessPerformance(start, end),
    listGooglePosts(),
    listGoogleReviews(),
    listGoogleMedia(),
  ]);
  return NextResponse.json({
    connected: true,
    metrics: results[0].status === "fulfilled" ? results[0].value : null,
    posts:
      results[1].status === "fulfilled"
        ? (results[1].value.localPosts ?? [])
        : [],
    reviews:
      results[2].status === "fulfilled" ? (results[2].value.reviews ?? []) : [],
    reviewSummary:
      results[2].status === "fulfilled"
        ? {
            averageRating: results[2].value.averageRating,
            totalReviewCount: results[2].value.totalReviewCount,
          }
        : null,
    media:
      results[3].status === "fulfilled"
        ? (results[3].value.mediaItems ?? [])
        : [],
    errors: results
      .map((result, index) => (result.status === "rejected" ? index : null))
      .filter((value) => value !== null),
  });
}
const postSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("post"),
    topicType: z.enum(["STANDARD", "OFFER", "EVENT", "ALERT"]),
    summary: z.string().trim().min(10).max(1500),
    title: z.string().trim().max(100).optional(),
    couponCode: z.string().trim().max(58).optional(),
    startDate: z.iso.date().optional(),
    endDate: z.iso.date().optional(),
  }),
  z.object({
    action: z.literal("reply"),
    reviewId: z.string().min(1).max(300),
    comment: z.string().trim().min(10).max(4096),
  }),
]);
export async function POST(request: Request) {
  if (!(await authorized()))
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  if (!googleBusinessConnected)
    return NextResponse.json(
      { error: "Connectez d’abord Google Business Profile." },
      { status: 409 },
    );
  const parsed = postSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  try {
    if (parsed.data.action === "reply")
      return NextResponse.json(
        await replyToGoogleReview(parsed.data.reviewId, parsed.data.comment),
      );
    const data = parsed.data;
    const body: Record<string, unknown> = {
      languageCode: "fr-FR",
      topicType: data.topicType,
      summary: data.summary,
      callToAction: {
        actionType: "BOOK",
        url: `${siteConfig.url}/reservation?utm_source=google&utm_medium=organic&utm_campaign=gbp_post`,
      },
    };
    if (data.topicType === "OFFER")
      body.offer = {
        couponCode: data.couponCode,
        redeemOnlineUrl: `${siteConfig.url}/reservation`,
      };
    if (data.topicType === "EVENT" && data.startDate && data.endDate)
      body.event = {
        title: data.title,
        schedule: {
          startDate: splitDate(data.startDate),
          endDate: splitDate(data.endDate),
        },
      };
    return NextResponse.json(await createGooglePost(body));
  } catch {
    return NextResponse.json(
      { error: "Google Business Profile a refusé l’opération." },
      { status: 502 },
    );
  }
}
function splitDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}
