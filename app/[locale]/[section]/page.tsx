import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { dictionaries, isLocale, locales } from "@/lib/i18n/config";
import { getUiDictionary } from "@/lib/i18n/ui";
import { isIndexableTranslatedRoute, localeAlternates, localizedPath, localizedSections, routeForLocalizedSection, type TranslatedRoute } from "@/lib/i18n/routing";
import { siteConfig } from "@/lib/site-config";
import { editorial, type EditorialPage } from "@/lib/i18n/editorial";

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.flatMap((locale) => localizedSections(locale).map(({section}) => ({ locale, section })));
}

function sectionTitle(locale: (typeof locales)[number], route: TranslatedRoute) {
  if (route in editorial[locale]) return editorial[locale][route as EditorialPage].title;
  const ui = getUiDictionary(locale), home = dictionaries[locale];
  const titles: Partial<Record<TranslatedRoute, string>> = {
    suite: ui.nav.suite, reservation: ui.nav.book, equipment: ui.nav.equipment,
    gallery: ui.nav.gallery, faq: home.faqTitle, contact: ui.nav.contact,
    gifts: ui.nav.gifts, blog: home.blogTitle, guide: home.guideTitle, restaurants: ui.nav.restaurants,
    conditions: "Conditions", privacy: locale === "en" ? "Privacy policy" : "Privacy",
  };
  return titles[route] ? `${titles[route]} · ${home.localeName}` : home.title;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; section: string }> }): Promise<Metadata> {
  const { locale, section } = await params;
  if (!isLocale(locale)) return {};
  const route = routeForLocalizedSection(locale,section); if(!route)return{};
  const title = sectionTitle(locale, route), canonical = `${siteConfig.url}${localizedPath(locale, route)}`;
  const content = route in editorial[locale] ? editorial[locale][route as EditorialPage] : null;
  const description=content?.meta ?? `${title} — ${dictionaries[locale].description}`;
  const indexable = isIndexableTranslatedRoute(route);
  return { title: `${title} | Absolu`, description, alternates: { canonical, ...(indexable ? { languages: { ...localeAlternates(route), "x-default": `${siteConfig.url}${localizedPath("fr", route)}` } } : {}) }, robots: indexable ? { index: true, follow: true } : { index: false, follow: true }, openGraph:{type:"website",locale,url:canonical,title:`${title} | Absolu`,description,siteName:siteConfig.commercialName,images:[{url:`${siteConfig.url}/opengraph-image`,width:1200,height:630,alt:title}]},twitter:{card:"summary_large_image",title:`${title} | Absolu`,description,images:[`${siteConfig.url}/opengraph-image`]} };
}

export default async function LocalizedSection({ params }: { params: Promise<{ locale: string; section: string }> }) {
  const { locale, section } = await params;
  if (!isLocale(locale)) notFound();
  const route=routeForLocalizedSection(locale,section);if(!route)notFound();
  const d = dictionaries[locale], title = sectionTitle(locale, route), isFaq = route === "faq";
  const content = route in editorial[locale] ? editorial[locale][route as EditorialPage] : null;
  const items = isFaq ? d.faq.map((item) => item.q) : route === "guide" ? d.guides : route === "blog" ? d.posts : d.facts;
  const sections = content?.sections ?? items.map((item,index)=>({title:item,body:isFaq?d.faq[index].a:""}));
  return <><Header locale={locale}/><main id="main-content" lang={locale} className="page-shell min-h-screen pb-24 pt-36">
    <JsonLd data={{ "@context": "https://schema.org", "@graph":[{ "@type":"WebPage","@id":`${siteConfig.url}${localizedPath(locale,route)}#webpage`,url:`${siteConfig.url}${localizedPath(locale,route)}`,name:title,description:content?.meta,inLanguage:locale,isPartOf:{"@id":`${siteConfig.url}/#website`},about:{"@id":`${siteConfig.url}/#lodging`}},{"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Absolu",item:`${siteConfig.url}/${locale}`},{"@type":"ListItem",position:2,name:title,item:`${siteConfig.url}${localizedPath(locale,route)}`}]} ,...(isFaq ? [{"@type":"FAQPage",mainEntity:d.faq.map((item)=>({"@type":"Question",name:item.q,acceptedAnswer:{"@type":"Answer",text:item.a}}))}] : [])] }}/>
    <p className="eyebrow text-[#C9A86A]">{content?.eyebrow ?? d.eyebrow}</p><h1 className="mt-4 font-heading text-6xl sm:text-8xl">{title}</h1>
    <p className="mt-6 max-w-3xl text-lg leading-8 text-white/60">{content?.intro ?? d.intro}</p>
    {content?.notice && <aside className="mt-8 max-w-3xl rounded-2xl border border-amber-300/25 bg-amber-300/[.06] p-5 text-sm leading-7 text-amber-100">{content.notice}</aside>}
    <div className="mt-14 grid gap-5 md:grid-cols-2">{sections.map((item) => <article key={item.title} className="rounded-3xl border border-white/10 bg-[#121212] p-7"><h2 className="font-heading text-3xl">{item.title}</h2><p className="mt-4 leading-7 text-white/55">{item.body}</p></article>)}</div>
    <nav aria-label={getUiDictionary(locale).nav.explore} className="mt-12 flex flex-wrap gap-3">{(["balneo","sauna","avize","epernay","champagne"] as const).filter((key)=>key!==route).map((key)=><Link key={key} href={localizedPath(locale,key)} className="rounded-full border border-white/15 px-5 py-3 text-sm hover:border-[#C9A86A]">{editorial[locale][key].title}</Link>)}</nav>
    {route !== "reservation" && <Link href={localizedPath(locale, "reservation")} className="mt-12 inline-flex rounded-full bg-[#C9A86A] px-6 py-3 font-semibold text-black">{d.book}</Link>}
  </main><Footer locale={locale}/></>;
}
