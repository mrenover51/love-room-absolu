import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";
export const metadata:Metadata={title:"Hors connexion | Absolu",description:"Cette page hors connexion permet de revenir vers Love Room Absolu dès que votre accès Internet est rétabli.",robots:{index:false,follow:false}};
export default function Offline(){return <main className="grid min-h-[100svh] place-items-center bg-[#090909] px-5 text-center text-[#F6F2EC]"><div><WifiOff className="mx-auto size-10 text-[#C9A86A]"/><h1 className="mt-6 font-heading text-5xl">Vous êtes hors ligne.</h1><p className="mt-5 text-white/50">Reconnectez-vous pour consulter les disponibilités et gérer les réservations.</p><Link href="/" className="mt-8 inline-block border border-white/20 px-6 py-3">Réessayer</Link></div></main>}
