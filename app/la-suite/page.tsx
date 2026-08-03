import { pageMetadata } from "@/lib/seo";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { InteriorHero } from "@/components/shared/interior-hero";
import { EditorialSection } from "@/components/shared/editorial-section";
import { ImageComparison } from "@/components/shared/image-comparison";
import { PremiumButton } from "@/components/shared/premium-button";
import { SuiteDetails } from "@/components/suite/suite-details";
import { TantraStory } from "@/components/suite/tantra-story";

export const metadata = pageMetadata({
  title: "Suite romantique avec baignoire balnéo et sauna | Absolu",
  description:
    "Entrez dans une Love Room romantique de 35 m² à Avize, entre baignoire balnéo, sauna privatif, lumière tamisée et douceur à deux.",
  path: "/la-suite",
});

export default function SuitePage() {
  return (
    <>
      <Header />
      <main>
        <InteriorHero
          image="/images/optimized/entree2.webp"
          title="La suite, rien que pour vous"
          eyebrow="Une expérience pensée pour deux"
          description="Poussez la porte d’une suite romantique de 35 m² où l’eau chaude, le bois du sauna et la lumière tamisée invitent à oublier l’heure."
          position="object-[center_55%]"
        />
        <SuiteDetails />
        <TantraStory />
        <EditorialSection
          image="/images/optimized/lit.webp"
          alt="Grand lit double de la Suite Absolu"
          eyebrow="L’espace nuit"
          title="Se retrouver, simplement."
        >
          <p>
            Lorsque la lumière baisse, l’espace nuit devient un refuge. La
            literie haut de gamme accueille les corps fatigués d’une journée
            passée entre vignes et maisons de Champagne.
          </p>
          <p>
            Le grand lit double, le coin salon et les matières douces invitent à
            parler moins fort, à ralentir, puis à ne plus regarder l’heure.
          </p>
        </EditorialSection>
        <EditorialSection
          reverse
          image="/images/optimized/salledebain.webp"
          alt="Baignoire balnéo privative de la Suite Absolu"
          eyebrow="La baignoire spa"
          title="Un moment suspendu."
        >
          <p>
            Glissez-vous dans une eau chaude après une journée au cœur des
            vignobles. Les bulles, la lumière et le silence transforment ce
            moment simple en souvenir à deux.
          </p>
          <p>
            La douche à l’italienne prolonge ce rituel d’eau dans une salle de
            bains entièrement privative.
          </p>
        </EditorialSection>
        <EditorialSection
          image="/images/optimized/sauna.webp"
          alt="Sauna privatif de la Suite Absolu"
          eyebrow="Le sauna privatif"
          title="Une chaleur douce et privée."
        >
          <p>
            Profitez de la chaleur douce du sauna infrarouge pour prolonger la
            parenthèse. Le bois se réchauffe, le silence s’installe et le rythme
            ralentit naturellement.
          </p>
        </EditorialSection>
        <EditorialSection
          reverse
          portrait
          image="/images/optimized/entree1.webp"
          alt="Coin café et gourmandises de la suite"
          eyebrow="Coin café"
          title="Le matin peut attendre."
        >
          <p>
            Au réveil, préparez un café sans quitter votre cocon. Réfrigérateur,
            micro-ondes, bouilloire et grille-pain permettent de savourer une
            collation dans le calme de la suite.
          </p>
        </EditorialSection>
        <section className="bg-[#080808] py-24">
          <div className="page-shell">
            <p className="eyebrow text-[#C9A86A]">
              La lumière transforme le lieu
            </p>
            <h2 className="mt-4 max-w-3xl font-heading text-5xl">
              Du jour feutré aux reflets du soir.
            </h2>
            <p className="mt-5 max-w-2xl leading-8 text-white/60">
              La lumière naturelle révèle la pierre et les lignes de la suite. À
              la nuit tombée, les nuances colorées enveloppent l’eau, le bois et
              les silences d’une atmosphère plus intime.
            </p>
            <div className="mt-12 space-y-14">
              <ImageComparison
                natural="/images/optimized/salledebain.webp"
                ambient="/images/optimized/salledebainviolet.webp"
                alt="Espace baignoire balnéo"
              />
              <ImageComparison
                natural="/images/optimized/sauna.webp"
                ambient="/images/optimized/saunaviolet.webp"
                alt="Sauna privatif"
              />
              <ImageComparison
                natural="/images/optimized/douche.webp"
                ambient="/images/optimized/doucheviolet.webp"
                alt="Douche à l’italienne"
              />
            </div>
          </div>
        </section>
        <section className="bg-[#121212] py-24 text-center">
          <div className="page-shell">
            <p className="eyebrow text-[#C9A86A]">Une nuit à votre rythme</p>
            <h2 className="font-heading text-5xl">
              Laissez le reste du monde à la porte.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-white/60">
              Choisissez votre soir. La suite, sa lumière et le silence d’Avize
              feront le reste.
            </p>
            <PremiumButton href="/reservation" className="mt-8">
              Vivre cette expérience
            </PremiumButton>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
