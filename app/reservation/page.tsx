import type {Metadata} from "next";
import {Suspense} from "react";
import {Header} from "@/components/layout/header";
import {Footer} from "@/components/layout/footer";
import {Breadcrumb} from "@/components/shared/breadcrumb";
import {BookingFlow} from "@/components/reservation/booking-flow";
import {getPublicPricingConfig} from "@/lib/booking/server-pricing";

export const metadata:Metadata={title:"Réservation directe | Absolu",description:"Choisissez vos dates et réservez la Suite Absolu avec paiement sécurisé.",alternates:{canonical:"/reservation"}};

async function ReservationEngine(){const pricingConfig=await getPublicPricingConfig();return <BookingFlow pricingConfig={pricingConfig}/>}

export default function ReservationPage(){return <><Header/><main className="relative min-h-screen overflow-hidden bg-[#080808] pb-24 pt-28 sm:pt-32"><div className="pointer-events-none absolute left-1/2 top-20 size-[34rem] -translate-x-1/2 rounded-full bg-[#C9A86A]/[.06] blur-[120px]"/><div className="page-shell relative"><Breadcrumb current="Réservation"/><div className="mt-10 max-w-3xl"><p className="eyebrow text-[#C9A86A]">Réservation directe</p><h1 className="mt-4 text-balance font-heading text-5xl sm:text-7xl">Composez votre parenthèse.</h1><p className="mt-5 max-w-2xl leading-8 text-white/60">Disponibilités en temps réel, prix transparent et paiement sécurisé. Votre séjour se réserve en quelques instants.</p><div className="mt-6 flex flex-wrap gap-4 text-[11px] uppercase tracking-wider text-white/40"><span>✓ Meilleur tarif direct</span><span>✓ Paiement sécurisé</span><span>✓ Confirmation immédiate</span></div></div><div className="mt-12"><Suspense fallback={<div className="h-[680px] animate-pulse rounded-[1.75rem] bg-[#121212]"/>}><ReservationEngine/></Suspense></div></div></main><Footer/></>}
