import Link from "next/link";
import { contactDetails } from "@/lib/constants";
import { SmartContextLinks } from "@/components/seo/smart-context-links";
import { NewsletterForm } from "./newsletter-form";

export function Footer() {
  return (
    <footer
      id="contact"
      className="border-t border-[#C9A86A]/15 bg-[#080807] py-24 text-white/55 sm:py-32"
    >
      <SmartContextLinks />
      <div className="page-shell mt-16 grid gap-14 md:grid-cols-2 lg:grid-cols-[1.3fr_.8fr_.8fr_1.15fr] lg:gap-16">
        <div>
          <span className="font-heading text-4xl tracking-[.24em] text-[#F6F2EC]">
            ABSOLU
          </span>
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
          <div className="flex flex-col gap-4 text-sm leading-7 [&_a]:transition-colors [&_a]:duration-300">
            {contactDetails.phone !== "À renseigner" ? (
              <a
                href={`tel:${contactDetails.phone.replaceAll(" ", "")}`}
                className="hover:text-white"
              >
                {contactDetails.phone}
              </a>
            ) : (
              <span>Téléphone — à renseigner</span>
            )}
            <span>{contactDetails.address}</span>
            {contactDetails.email !== "À renseigner" ? (
              <a
                href={`mailto:${contactDetails.email}`}
                className="hover:text-white"
              >
                {contactDetails.email}
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
      <div className="page-shell mt-20 flex flex-col gap-6 border-t border-white/10 pt-9 text-xs md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Absolu. Tous droits réservés.</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/politique-confidentialite">Confidentialité</Link>
          <Link href="/conditions">Réservation</Link>
          <Link href="/conditions-utilisation">CGU</Link>
          <Link href="/cookies">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
