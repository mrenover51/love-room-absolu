import Link from "next/link";
import { navigation, contactDetails } from "@/lib/constants";
import { SmartContextLinks } from "@/components/seo/smart-context-links";
import { NewsletterForm } from "./newsletter-form";

export function Footer() {
  return <footer id="contact" className="border-t border-white/10 bg-[#090909] py-16 text-white/60">
    <SmartContextLinks />
    <div className="page-shell mt-12 grid gap-12 md:grid-cols-2 lg:grid-cols-[1.25fr_.8fr_.8fr_1.15fr]">
      <div><Link href="/" className="font-heading text-3xl tracking-[.2em] text-[#F6F2EC]">ABSOLU</Link><p className="mt-5 max-w-sm text-sm leading-7">Une suite romantique confidentielle, imaginée pour le bien-être, la complicité et la reconnexion du couple.</p></div>
      <div><p className="eyebrow mb-5 text-[#C9A86A]">Explorer</p><nav aria-label="Menu secondaire" className="flex flex-col gap-3 text-sm">{navigation.map((item) => <Link key={item.href} href={item.href} className="hover:text-white">{item.label}</Link>)}<Link href="/faq" className="hover:text-white">FAQ</Link><Link href="/plan-du-site" className="hover:text-white">Plan du site</Link></nav></div>
      <div><p className="eyebrow mb-5 text-[#C9A86A]">Nous contacter</p><div className="flex flex-col gap-3 text-sm">{contactDetails.phone !== "À renseigner" ? <a href={`tel:${contactDetails.phone.replaceAll(" ", "")}`} className="hover:text-white">{contactDetails.phone}</a> : <span>Téléphone — à renseigner</span>}<span>{contactDetails.address}</span>{contactDetails.email !== "À renseigner" ? <a href={`mailto:${contactDetails.email}`} className="hover:text-white">{contactDetails.email}</a> : <span>Email — à renseigner</span>}{contactDetails.instagramUrl !== "#" ? <a href={contactDetails.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-white">Instagram</a> : <span>Instagram — à renseigner</span>}</div></div>
      <div><p className="eyebrow text-[#C9A86A]">Newsletter</p><NewsletterForm /></div>
    </div>
    <div className="page-shell mt-14 flex flex-col gap-5 border-t border-white/10 pt-7 text-xs md:flex-row md:items-center md:justify-between"><p>© {new Date().getFullYear()} Absolu. Tous droits réservés.</p><div className="flex flex-wrap gap-x-6 gap-y-2"><Link href="/mentions-legales">Mentions légales</Link><Link href="/politique-confidentialite">Confidentialité</Link><Link href="/conditions">Réservation</Link><Link href="/conditions-utilisation">CGU</Link><Link href="/cookies">Cookies</Link></div></div>
  </footer>;
}
