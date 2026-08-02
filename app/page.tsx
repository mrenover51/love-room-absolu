import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Amenities } from "@/components/home/amenities";
import { AtmosphereTransition } from "@/components/home/atmosphere-transition";
import { BookingCta } from "@/components/home/booking-cta";
import { ExperienceGrid } from "@/components/home/experience-grid";
import { GalleryPreview } from "@/components/home/gallery-preview";
import { Hero } from "@/components/home/hero";
import { Introduction } from "@/components/home/introduction";
import { Testimonials } from "@/components/home/testimonials";
import { WhyAbsolu } from "@/components/home/why-absolu";
import { ReconnectSection } from "@/components/home/reconnect-section";
import { TantraExperience } from "@/components/amenities/tantra-experience";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
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
