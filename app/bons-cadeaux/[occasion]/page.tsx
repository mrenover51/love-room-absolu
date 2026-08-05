import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, QrCode, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { GiftConfigurator } from "@/components/gifts/gift-configurator";
import { JsonLd } from "@/components/seo/json-ld";
import { giftBySlug, giftThemes } from "@/lib/gifts/catalog";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const dynamicParams = false;
export function generateStaticParams(){ return giftThemes.map(({slug})=>({occasion:slug})); }
export async function generateMetadata({params}:{params:Promise<{occasion:string}>}){const gift=giftBySlug((await params).occasion);return gift?pageMetadata({title:`${gift.name} personnalisé | Love Room Absolu`,description:`${gift.description} Personnalisez le message, la couleur et la photo. Paiement sécurisé et envoi numérique.`,path:`/bons-cadeaux/${gift.slug}`}):{};}
export default async function GiftPage({params}:{params:Promise<{occasion:string}>}){
  const gift=giftBySlug((await params).occasion); if(!gift)notFound(); const url=`${siteConfig.url}/bons-cadeaux/${gift.slug}`;
  const schema={"@context":"https://schema.org","@graph":[{"@type":"Product",name:gift.name,description:gift.description,image:`${siteConfig.url}${gift.image}`,url,brand:{"@type":"Brand",name:"Absolu"},offers:{"@type":"AggregateOffer",priceCurrency:"EUR",lowPrice:150,highPrice:350,offerCount:3,availability:"https://schema.org/InStock"}},{"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Accueil",item:siteConfig.url},{"@type":"ListItem",position:2,name:"Bons cadeaux",item:`${siteConfig.url}/bons-cadeaux`},{"@type":"ListItem",position:3,name:gift.shortName,item:url}]}]};
  return <><Header/><main><JsonLd data={schema}/><section className="relative min-h-[70svh] overflow-hidden"><Image src={gift.image} alt={`${gift.name} pour un séjour romantique en Champagne`} fill priority sizes="100vw" className="object-cover"/><div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20"/><div className="page-shell relative flex min-h-[70svh] items-end pb-20 pt-36"><div className="max-w-3xl"><Breadcrumb items={[{label:"Bons cadeaux",href:"/bons-cadeaux"}]} current={gift.shortName}/><p className="eyebrow mt-10" style={{color:gift.accent}}>Une émotion à offrir</p><h1 className="mt-4 font-heading text-6xl sm:text-8xl">{gift.name}</h1><p className="mt-6 max-w-xl text-lg leading-8 text-white/65">{gift.description}</p><a href="#personnaliser" className="mt-8 inline-flex min-h-13 items-center rounded-full bg-[#C9A86A] px-7 font-semibold text-black">Créer mon bon cadeau</a></div></div></section>
  <section className="page-shell grid gap-5 py-20 md:grid-cols-3">{[[Check,"Valable 12 mois","La date court à partir de l’activation après paiement."],[QrCode,"Bon vérifiable","Une référence unique protège chaque utilisation."],[Sparkles,"Entièrement personnalisé","Message, couleur et photo composent un cadeau unique."]].map(([Icon,title,text], keyIndex)=><article key={`${String(title)}-${keyIndex}`} className="rounded-3xl border border-white/10 bg-[#121212] p-6"><Icon className="size-6 text-[#C9A86A]"/><h2 className="mt-5 font-heading text-3xl">{String(title)}</h2><p className="mt-3 text-sm leading-7 text-white/45">{String(text)}</p></article>)}</section>
  <GiftConfigurator theme={gift}/><section className="page-shell pb-24"><h2 className="font-heading text-5xl">D’autres façons de faire plaisir</h2><div className="mt-8 flex flex-wrap gap-3">{giftThemes.filter(x=>x.slug!==gift.slug).map(x=><Link key={x.slug} href={`/bons-cadeaux/${x.slug}`} className="rounded-full border border-white/15 px-5 py-3 text-sm hover:border-[#C9A86A]">{x.name}</Link>)}</div></section></main><Footer/></>;
}
