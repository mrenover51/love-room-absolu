import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { InteriorHero } from "@/components/shared/interior-hero";
import { Faq } from "@/components/contact/faq";
import { createFaqItems } from "@/lib/constants";
import { getStaySettings } from "@/lib/stay-settings";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Questions fréquentes sur la Suite Absolu",
  description: "Horaires, spa privatif, paiement et réservation directe : toutes les réponses utiles pour préparer votre séjour dans la Suite Absolu.",
  path: "/faq",
});

export default async function FaqPage() {
  const faqItems = createFaqItems(await getStaySettings());
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replaceAll("<", "\\u003c") }} />
    <Header />
    <main>
      <InteriorHero image="/images/optimized/entree1.webp" title="Questions fréquentes" eyebrow="Préparer votre séjour" description="Les informations essentielles pour organiser votre parenthèse en toute sérénité." />
      <section className="bg-[#F6F2EC] py-24 text-[#171411] sm:py-32">
        <div className="page-shell mx-auto max-w-4xl"><Faq items={faqItems} /></div>
      </section>
    </main>
    <Footer />
  </>;
}
