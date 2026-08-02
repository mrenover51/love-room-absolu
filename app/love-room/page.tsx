import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { InteriorHero } from "@/components/shared/interior-hero";
import { localCities } from "@/lib/local-seo/cities";
import { pageMetadata } from "@/lib/seo";

export const metadata=pageMetadata({title:"Love Rooms en Champagne près de chez vous | Absolu",description:"Trouvez votre itinéraire vers la Suite Absolu à Avize depuis 41 villes de Champagne : spa, sauna et baignoire balnéo privatifs.",path:"/love-room",image:"/images/champagne-local-hero.png",imageAlt:"Paysage éditorial des vignobles de Champagne au soleil couchant"});

export default function LocalHub(){return <><Header/><main>
  <InteriorHero image="/images/champagne-local-hero.png" eyebrow="Escapades en Champagne" title="Une Love Room près de chez vous" description="Préparez votre itinéraire vers la Suite Absolu, au cœur de la Côte des Blancs."/>
  <section className="bg-[#F6F2EC] py-24 text-[#201B18]"><div className="page-shell">
    <h2 className="font-heading text-5xl">Choisissez votre ville de départ</h2>
    <p className="mt-5 max-w-3xl leading-8 text-[#655D55]">Chaque guide rassemble un temps de trajet indicatif, des idées de sorties, des tables à explorer et les informations pratiques pour rejoindre Avize.</p>
    <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{localCities.map(city=><Link key={city.slug} href={`/love-room/${city.slug}`} className="rounded-xl border border-black/10 bg-white/60 p-5 transition hover:border-[#9A783E] hover:bg-white"><span className="font-heading text-2xl">{city.name}</span><span className="mt-2 block text-sm text-black/55">{city.drive} · {city.distance}</span></Link>)}</div>
  </div></section>
</main><Footer/></>}
