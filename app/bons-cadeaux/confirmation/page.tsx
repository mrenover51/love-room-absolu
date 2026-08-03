import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { pageMetadata } from "@/lib/seo";
export const metadata=pageMetadata({title:"Confirmation du bon cadeau | Absolu",description:"Confirmation sécurisée de votre bon cadeau Absolu.",path:"/bons-cadeaux/confirmation",index:false});
export default function GiftConfirmation(){return <><Header/><main className="page-shell flex min-h-[75svh] items-center justify-center pt-28"><section className="max-w-xl rounded-[2rem] border border-white/10 bg-[#121212] p-10 text-center"><CheckCircle2 className="mx-auto size-12 text-emerald-300"/><h1 className="mt-6 font-heading text-5xl">Merci pour votre cadeau.</h1><p className="mt-5 leading-8 text-white/55">Stripe confirme le paiement en arrière-plan. Le bon activé, sa référence et les instructions d’utilisation sont envoyés automatiquement à l’adresse renseignée.</p><Link href="/bons-cadeaux" className="mt-8 inline-flex rounded-full bg-[#C9A86A] px-6 py-3 font-semibold text-black">Découvrir Absolu</Link></section></main><Footer/></>}
