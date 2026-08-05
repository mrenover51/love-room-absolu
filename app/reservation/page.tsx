import type { Metadata } from "next";
import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { BookingFlow } from "@/components/reservation/booking-flow";
import { getPublicPricingConfig } from "@/lib/booking/server-pricing";
import { StayTimesNotice } from "@/components/shared/stay-times-notice";
import { getStaySettings } from "@/lib/stay-settings";
import Image from "next/image";
import { DirectBookingComparison } from "@/components/cro/direct-booking-comparison";
import { getPublishedReviews } from "@/lib/reviews/reviews";
import { getReservationWorkflowSettings } from "@/lib/booking/workflow-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Réserver la Suite Absolu au meilleur tarif",
  description:
    "Préparez votre séjour romantique dans la Suite Absolu à Avize : dates disponibles, réservation directe et paiement sécurisé au meilleur tarif.",
  path: "/reservation",
});

async function ReservationEngine() {
  const [pricingConfig,workflow]=await Promise.all([getPublicPricingConfig(),getReservationWorkflowSettings()]);
  return <BookingFlow pricingConfig={pricingConfig} bookingMode={workflow.mode} />;
}

export default async function ReservationPage() {
  const [staySettings, reviews] = await Promise.all([
    getStaySettings(),
    getPublishedReviews(),
  ]);
  const featured = reviews.find((review) => review.featured) ?? reviews[0];
  const customerPhotos = reviews
    .flatMap((review) => review.photo_urls)
    .filter((url) => url.startsWith("/"))
    .slice(0, 3);
  return (
    <>
      <Header />
      <main className="relative min-h-screen overflow-hidden bg-[#080808] pb-24 pt-28 sm:pt-32">
        <div className="pointer-events-none absolute left-1/2 top-20 size-[34rem] -translate-x-1/2 rounded-full bg-[#C9A86A]/[.06] blur-[120px]" />
        <div className="page-shell relative">
          <Breadcrumb current="Réservation" />
          <div className="mt-10 max-w-3xl">
            <p className="eyebrow text-[#C9A86A]">
              Le début de votre parenthèse
            </p>
            <h1 className="mt-4 text-balance font-heading text-5xl sm:text-7xl">
              Choisissez le soir où le temps ralentira.
            </h1>
            <p className="mt-5 max-w-2xl leading-8 text-white/60">
              Imaginez les vignes au crépuscule, la chaleur du sauna puis les
              bulles dans l’eau. Choisissez votre date&nbsp;: le reste peut
              attendre.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/45">
              Les disponibilités sont actualisées en temps réel, le prix reste
              lisible et le paiement sécurisé. Parce que la confiance fait déjà
              partie de l’expérience.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-[11px] uppercase tracking-wider text-white/40">
              <span>✓ Paiement Stripe sécurisé</span>
              <span>✓ Annulation gratuite jusqu’à J-5</span>
              <span>✓ Réservation directe</span>
              <span>✓ Prix total avant paiement</span>
            </div>
          </div>
          <StayTimesNotice settings={staySettings} className="mt-8 max-w-3xl" />
          <div className="mt-12">
            <Suspense
              fallback={
                <div className="h-[680px] animate-pulse rounded-[1.75rem] bg-[#121212]" />
              }
            >
              <ReservationEngine />
            </Suspense>
          </div>
          {featured && (
            <aside className="mt-12 grid gap-6 rounded-3xl border border-white/10 bg-white/[.03] p-6 sm:grid-cols-[auto_1fr] sm:p-8">
              <div className="grid size-16 place-items-center rounded-full bg-[#C9A86A] font-heading text-2xl text-black">
                {featured.overall_rating.toFixed(1)}
              </div>
              <div>
                <p className="eyebrow text-[#C9A86A]">
                  Avis vérifié mis en avant
                </p>
                <blockquote className="mt-3 font-heading text-2xl">
                  « {featured.title} »
                </blockquote>
                <p className="mt-3 text-sm leading-7 text-white/55">
                  {featured.body.slice(0, 280)}
                  {featured.body.length > 280 ? "…" : ""}
                </p>
                <p className="mt-3 text-xs text-white/35">
                  {featured.reviewer_name} · séjour du{" "}
                  {new Date(
                    `${featured.stay_date}T12:00:00`,
                  ).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </aside>
          )}
          {customerPhotos.length > 0 && (
            <section className="mt-12" aria-labelledby="customer-photos-title">
              <p className="eyebrow text-[#C9A86A]">Photos clients vérifiées</p>
              <h2
                id="customer-photos-title"
                className="mt-3 font-heading text-4xl"
              >
                La suite vue par nos voyageurs
              </h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {customerPhotos.map((src, keyIndex) => (
                  <figure
                    key={`${src}-${keyIndex}`}
                    className="relative aspect-[4/3] overflow-hidden rounded-2xl"
                  >
                    <Image
                      src={src}
                      alt="Photo de la Suite Absolu partagée par un client vérifié"
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </figure>
                ))}
              </div>
            </section>
          )}
          <DirectBookingComparison />
        </div>
      </main>
      <Footer />
    </>
  );
}
