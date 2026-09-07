import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Amenities } from "@/components/home/amenities";
import { AtmosphereTransition } from "@/components/home/atmosphere-transition";
import { BookingCta } from "@/components/home/booking-cta";
import { ExperienceGrid } from "@/components/home/experience-grid";
import { GalleryPreview } from "@/components/home/gallery-preview";
import { Hero } from "@/components/home/hero";
import { TrustBar } from "@/components/home/trust-bar";
import { Introduction } from "@/components/home/introduction";
import { Testimonials } from "@/components/home/testimonials";
import { WhyAbsolu } from "@/components/home/why-absolu";
import { ReconnectSection } from "@/components/home/reconnect-section";
import { TantraExperience } from "@/components/amenities/tantra-experience";
import { pageMetadata } from "@/lib/seo";
import { languageAlternates } from "@/lib/i18n/config";

export const metadata = pageMetadata({
  title: "Love Room Épernay | Balnéo & Sauna privatifs | Absolu",
  description:
    "Découvrez Absolu, une love room romantique à Avize près d’Épernay, avec baignoire balnéo et sauna privatifs. Une parenthèse à deux au cœur de la Champagne.",
  path: "/",
  imageAlt: "Suite romantique Absolu à Avize près d’Épernay",
  languageAlternates: {
    ...languageAlternates(),
    "x-default": "https://love-room-absolu.fr",
  },
});

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Introduction />
        <ReconnectSection />
        <ExperienceGrid />
        <TantraExperience />
        <AtmosphereTransition />
        <Amenities />
        <WhyAbsolu />
        <GalleryPreview />
        <Testimonials />
        <BookingCta />
      </main>
      <Footer />
    </>
  );
}
