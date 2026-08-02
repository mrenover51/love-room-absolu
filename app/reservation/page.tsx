import type {Metadata} from "next";
import {Suspense} from "react";
import {Header} from "@/components/layout/header";
import {Footer} from "@/components/layout/footer";
import {Breadcrumb} from "@/components/shared/breadcrumb";
import {BookingFlow} from "@/components/reservation/booking-flow";
import {getPublicPricingConfig} from "@/lib/booking/server-pricing";
import {StayTimesNotice} from "@/components/shared/stay-times-notice";import {getStaySettings} from "@/lib/stay-settings";

export const metadata:Metadata={title:"RÃ©servation directe | Absolu",description:"RÃ©servez votre sÃ©jour romantique dans la Suite Absolu, une parenthÃ¨se de bien-Ãªtre en couple avec paiement sÃ©curisÃ©.",alternates:{canonical:"/reservation"}};

async function ReservationEngine(){const pricingConfig=await getPublicPricingConfig();return <BookingFlow pricingConfig={pricingConfig}/>}

export default async function ReservationPage(){const staySettings=await getStaySettings();return <><Header/><main className="relative min-h-screen overflow-hidden bg-[#080808] pb-24 pt-28 sm:pt-32"><div className="pointer-events-none absolute left-1/2 top-20 size-[34rem] -translate-x-1/2 rounded-full bg-[#C9A86A]/[.06] blur-[120px]"/><div className="page-shell relative"><Breadcrumb current="RÃ©servation"/><div className="mt-10 max-w-3xl"><p className="eyebrow text-[#C9A86A]">RÃ©servation directe</p><h1 className="mt-4 text-balance font-heading text-5xl sm:text-7xl">Composez votre parenthÃ¨se.</h1><p className="mt-5 max-w-2xl leading-8 text-white/60">DisponibilitÃ©s en temps rÃ©el, prix transparent et paiement sÃ©curisÃ©. Votre sÃ©jour se rÃ©serve en quelques instants.</p><p className="mt-4 max-w-2xl text-sm leading-7 text-white/45">Votre sÃ©jour est une invitation Ã  ralentir, respirer et vivre un moment privilÃ©giÃ© Ã  deux dans une ambiance inspirÃ©e des rituels de bien-Ãªtre.</p><div className="mt-6 flex flex-wrap gap-4 text-[11px] uppercase tracking-wider text-white/40"><span>âœ“ Meilleur tarif direct</span><span>âœ“ Paiement sÃ©curisÃ©</span><span>âœ“ Confirmation immÃ©diate</span></div></div><StayTimesNotice settings={staySettings} className="mt-8 max-w-3xl"/><div className="mt-12"><Suspense fallback={<div className="h-[680px] animate-pulse rounded-[1.75rem] bg-[#121212]"/>}><ReservationEngine/></Suspense></div></div></main><Footer/></>}

