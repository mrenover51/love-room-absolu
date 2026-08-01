import type { Metadata } from "next";
import Link from "next/link";
import { CalendarX } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
export const metadata:Metadata={title:"Dates indisponibles | Absolu",description:"Modifiez les dates de votre demande de réservation Absolu.",robots:{index:false,follow:false}};
export default function UnavailablePage(){return <><Header/><main className="grid min-h-[85svh] place-items-center bg-[#080808] px-4 pb-20 pt-36"><section className="mx-auto max-w-2xl text-center"><CalendarX className="mx-auto size-10 text-[#C9A86A]" aria-hidden="true"/><p className="eyebrow mt-6 text-[#C9A86A]">Disponibilités mises à jour</p><h1 className="mt-5 font-heading text-5xl sm:text-7xl">Ces dates ne sont plus disponibles.</h1><p className="mt-6 leading-8 text-white/60">Une autre demande peut avoir été enregistrée entre-temps. Choisissez simplement une nouvelle période ou contactez-nous.</p><div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/reservation" className="min-h-12 bg-[#C9A86A] px-6 py-3 text-sm font-semibold text-black">Modifier les dates</Link><Link href="/contact" className="min-h-12 border border-white/25 px-6 py-3 text-sm">Contacter l’établissement</Link></div></section></main><Footer/></>}
