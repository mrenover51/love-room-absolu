import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { contactDetails } from "@/lib/constants";
import { SmartContextLinks } from "@/components/seo/smart-context-links";
import { NewsletterForm } from "./newsletter-form";
import { LegalLinks } from "@/components/seo/LegalLinks";

export function Footer() {
  return (
    <footer
      id="contact"
      className="relative overflow-hidden border-t border-[#D0AE72]/15 bg-[#0B0908] py-28 text-white/55 sm:py-40"
    >
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#C9A86A]/55 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D0AE72]/[.065] blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-20 [background-image:repeating-linear-gradient(105deg,transparent_0,transparent_11px,rgba(255,255,255,.012)_12px)]" />
      <SmartContextLinks />
      <div className="page-shell relative mt-20 grid gap-16 md:grid-cols-2 lg:mt-24 lg:grid-cols-[1.25fr_.8fr_.9fr_1.15fr] lg:gap-20">
        <div>
          <Link href="/" aria-label="Absolu — accueil" className="inline-flex font-heading text-4xl tracking-[.24em] text-[#F6F2EC] transition-colors duration-300 hover:text-[#DCC18E]">
            ABSOLU
          </Link>
          <p className="mt-7 max-w-sm text-sm leading-8">
            Une suite romantique confidentielle, imaginée pour le bien-être, la
            complicité et la reconnexion du couple.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-5 text-[#C9A86A]">Explorer</p>
          <nav
            aria-label="Clusters thématiques"
            className="flex flex-col gap-4 text-sm [&_a]:w-fit [&_a]:transition-all [&_a]:duration-300 [&_a:hover]:translate-x-1 [&_a:hover]:text-white"
          >
            <Link href="/experiences-romantiques" className="hover:text-white">
              Inspirations romantiques
            </Link>
            <Link href="/love-room" className="hover:text-white">
              Champagne et villes proches
            </Link>
            <Link href="/guide-touristique" className="hover:text-white">
              Tourisme en Champagne
            </Link>
            <Link href="/equipements" className="hover:text-white">
              Équipements privatifs
            </Link>
            <Link href="/faq" className="hover:text-white">
              Réservation et FAQ
            </Link>
            <Link href="/reponses" className="hover:text-white">
              Réponses aux questions naturelles
            </Link>
            <Link href="/plan-du-site" className="hover:text-white">
              Plan du site HTML
            </Link>
            <Link href="/partenaires" className="hover:text-white">
              Partenaires locaux
            </Link>
            <Link href="/presse" className="hover:text-white">
              Presse et médias
            </Link>
            <Link href="/evenements" className="hover:text-white">
              Calendrier romantique
            </Link>
          </nav>
        </div>
        <div>
          <p className="eyebrow mb-5 text-[#C9A86A]">Nous contacter</p>
          <div className="flex flex-col gap-5 text-sm leading-7 [&_a]:transition-colors [&_a]:duration-300">
            {contactDetails.phone !== "À renseigner" ? (
              <a
                href={`tel:${contactDetails.phone.replaceAll(" ", "")}`}
                className="group flex items-start gap-3 hover:text-white"
              >
                <Phone className="mt-1 size-4 shrink-0 text-[#C9A86A]" aria-hidden="true" />
                <span>{contactDetails.phone}</span>
              </a>
            ) : (
              <span>Téléphone — à renseigner</span>
            )}
            <span className="flex items-start gap-3"><MapPin className="mt-1 size-4 shrink-0 text-[#C9A86A]" aria-hidden="true" />{contactDetails.address}</span>
            {contactDetails.email !== "À renseigner" ? (
              <a
                href={`mailto:${contactDetails.email}`}
                className="flex items-start gap-3 hover:text-white"
              >
                <Mail className="mt-1 size-4 shrink-0 text-[#C9A86A]" aria-hidden="true" />
                <span>{contactDetails.email}</span>
              </a>
            ) : (
              <span>Email — à renseigner</span>
            )}
          </div>
        </div>
        <div>
          <p className="eyebrow text-[#C9A86A]">Newsletter</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="page-shell relative mt-24 flex flex-col gap-7 border-t border-white/10 pt-10 text-xs md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Absolu. Tous droits réservés.</p>
        <div className="flex items-center gap-3"><LegalLinks /><ArrowUpRight className="hidden size-3 text-[#C9A86A] sm:block" aria-hidden="true" /></div>
      </div>
    </footer>
  );
}
