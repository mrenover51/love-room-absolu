import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { contactDetails } from "@/lib/constants";
import { SmartContextLinks } from "@/components/seo/smart-context-links";
import { NewsletterForm } from "./newsletter-form";
import { LegalLinks } from "@/components/seo/LegalLinks";
import type { Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/routing";
import { getUiDictionary } from "@/lib/i18n/ui";

export function Footer({ locale = "fr" }: { locale?: Locale }) {
  const labels = getUiDictionary(locale);
  return (
    <footer
      id="contact"
      className="luxury-footer relative overflow-hidden border-t border-[#D0AE72]/15 bg-[#0B0908] py-28 text-white/55 sm:py-40"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#C9A86A]/55 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D0AE72]/[.065] blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20 [background-image:repeating-linear-gradient(105deg,transparent_0,transparent_11px,rgba(255,255,255,.012)_12px)]"
      />
      {locale === "fr" && <SmartContextLinks />}
      <div className="page-shell relative mt-20 grid gap-16 md:grid-cols-2 lg:mt-24 lg:grid-cols-[1.25fr_.8fr_.9fr_1.15fr] lg:gap-20">
        <div>
          <Link
            href={localizedPath(locale, "home")}
            aria-label="Absolu — accueil"
            className="inline-flex font-heading text-4xl tracking-[.24em] text-[#F6F2EC] transition-colors duration-300 hover:text-[#DCC18E]"
          >
            ABSOLU
          </Link>
          <p className="mt-7 max-w-sm text-sm leading-8">
            {labels.footer.tagline}
          </p>
        </div>
        <div>
          <p className="eyebrow mb-5 text-[#C9A86A]">{labels.footer.stay}</p>
          <nav
            aria-label={labels.nav.explore}
            className="flex flex-col gap-4 text-sm [&_a]:w-fit [&_a]:transition-all [&_a]:duration-300 [&_a:hover]:translate-x-1 [&_a:hover]:text-white"
          >
            <Link href={localizedPath(locale, "suite")} className="hover:text-white">
              {labels.nav.suite}
            </Link>
            <Link href={localizedPath(locale, "reservation")} className="hover:text-white">
              {labels.nav.book}
            </Link>
            <Link href={localizedPath(locale, "equipment")} className="hover:text-white">
              {labels.nav.equipment}
            </Link>
            <Link href={localizedPath(locale, "faq")} className="hover:text-white">
              {labels.nav.faq}
            </Link>
            {locale === "fr" ? <Link href="/guide-touristique" className="hover:text-white">{labels.nav.guide}</Link> : <Link href={localizedPath(locale, "champagne")} className="hover:text-white">Champagne</Link>}
            {locale === "fr" && <Link href="/carte-touristique" className="hover:text-white">Carte touristique</Link>}
            {locale === "fr" ? <Link href="/restaurants" className="hover:text-white">{labels.nav.restaurants}</Link> : <Link href={localizedPath(locale, "avize")} className="hover:text-white">Avize</Link>}
            {locale === "fr" && <Link href="/love-room/avize" className="hover:text-white">Love room à Avize</Link>}
            <Link href={localizedPath(locale, "contact")} className="hover:text-white">
              {labels.nav.contact}
            </Link>
          </nav>
        </div>
        <div>
          <p className="eyebrow mb-5 text-[#C9A86A]">{labels.footer.contact}</p>
          <div className="flex flex-col gap-5 text-sm leading-7 [&_a]:transition-colors [&_a]:duration-300">
            {contactDetails.phone !== "À renseigner" ? (
              <a
                href={`tel:${contactDetails.phone.replaceAll(" ", "")}`}
                className="group flex items-start gap-3 hover:text-white"
              >
                <Phone
                  className="mt-1 size-4 shrink-0 text-[#C9A86A]"
                  aria-hidden="true"
                />
                <span>{contactDetails.phone}</span>
              </a>
            ) : (
              <span>{locale === "fr" ? "Téléphone — à renseigner" : "Phone — unavailable"}</span>
            )}
            <span className="flex items-start gap-3">
              <MapPin
                className="mt-1 size-4 shrink-0 text-[#C9A86A]"
                aria-hidden="true"
              />
              {contactDetails.address}
            </span>
            {contactDetails.email !== "À renseigner" ? (
              <a
                href={`mailto:${contactDetails.email}`}
                className="flex items-start gap-3 hover:text-white"
              >
                <Mail
                  className="mt-1 size-4 shrink-0 text-[#C9A86A]"
                  aria-hidden="true"
                />
                <span>{contactDetails.email}</span>
              </a>
            ) : (
              <span>{locale === "fr" ? "Email — à renseigner" : "Email — unavailable"}</span>
            )}
          </div>
        </div>
        <div>
          <p className="eyebrow text-[#C9A86A]">{labels.footer.newsletter}</p>
          <NewsletterForm locale={locale} />
        </div>
      </div>
      <div className="page-shell relative mt-24 flex flex-col gap-7 border-t border-white/10 pt-10 text-xs md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Absolu. {labels.footer.rights}</p>
        <div className="flex items-center gap-3">
          <LegalLinks locale={locale} />
          <ArrowUpRight
            className="hidden size-3 text-[#C9A86A] sm:block"
            aria-hidden="true"
          />
        </div>
      </div>
      <p className="page-shell relative mt-8 text-center text-[11px] tracking-[0.04em] text-white/35">
        {locale === "fr" ? "Site créé par" : "Website by"}{" "}
        <a
          href="https://mrdstudio.fr"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visiter le site de MRD Studio (nouvel onglet)"
          className="underline decoration-[#C9A86A]/30 underline-offset-4 transition-colors duration-300 hover:text-[#DCC18E] focus-visible:text-[#DCC18E] focus-visible:outline-none"
        >
          MRD Studio
        </a>
      </p>
    </footer>
  );
}
