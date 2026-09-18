import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BookingFlow } from "@/components/reservation/booking-flow";
import { dictionaries, isLocale, locales } from "@/lib/i18n/config";
import { getUiDictionary } from "@/lib/i18n/ui";
import { localeAlternates, localizedPath } from "@/lib/i18n/routing";
import { siteConfig } from "@/lib/site-config";
import { getPublicPricingConfig } from "@/lib/booking/server-pricing";
import { getReservationWorkflowSettings } from "@/lib/booking/workflow-settings";

export const dynamic = "force-dynamic";
export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const title = getUiDictionary(locale).nav.book, canonical = `${siteConfig.url}${localizedPath(locale,"reservation")}`;
  const description=`${title} — ${dictionaries[locale].intro}`;
  return { title: `${title} | Absolu`, description, alternates: { canonical, languages: { ...localeAlternates("reservation"), "x-default": `${siteConfig.url}/fr/reservation` } },openGraph:{type:"website",locale,url:canonical,title:`${title} | Absolu`,description,siteName:siteConfig.commercialName,images:[{url:`${siteConfig.url}/opengraph-image`,width:1200,height:630,alt:title}]},twitter:{card:"summary_large_image",title:`${title} | Absolu`,description,images:[`${siteConfig.url}/opengraph-image`]} };
}

async function ReservationEngine({ locale }: { locale: (typeof locales)[number] }) {
  const [pricingConfig, workflow] = await Promise.all([getPublicPricingConfig(), getReservationWorkflowSettings()]);
  return <BookingFlow pricingConfig={pricingConfig} bookingMode={workflow.mode} locale={locale}/>;
}

export default async function LocalizedReservation({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = dictionaries[locale], labels = getUiDictionary(locale);
  return <><Header locale={locale}/><main id="main-content" lang={locale} className="page-shell min-h-screen pb-24 pt-36"><p className="eyebrow text-[#C9A86A]">Absolu · Avize</p><h1 className="mt-4 font-heading text-6xl">{labels.nav.book}</h1><p className="mt-5 max-w-2xl leading-8 text-white/60">{d.intro}</p><div className="mt-12"><Suspense fallback={<div className="h-[680px] animate-pulse rounded-3xl bg-[#121212]"/>}><ReservationEngine locale={locale}/></Suspense></div></main><Footer locale={locale}/></>;
}
