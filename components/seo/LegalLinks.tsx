import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/routing";

const legalLinks = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/politique-confidentialite", label: "Confidentialité" },
  { href: "/cookies", label: "Cookies" },
  { href: "/conditions", label: "Conditions" },
  { href: "/plan-du-site", label: "Plan du site" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

const localizedLabels: Record<Exclude<Locale,"fr">,{privacy:string;conditions:string;contact:string;label:string}> = {
  en:{privacy:"Privacy",conditions:"Booking terms",contact:"Contact",label:"Practical and legal information"},
  de:{privacy:"Datenschutz",conditions:"Buchungsbedingungen",contact:"Kontakt",label:"Praktische und rechtliche Informationen"},
  nl:{privacy:"Privacy",conditions:"Boekingsvoorwaarden",contact:"Contact",label:"Praktische en juridische informatie"},
  it:{privacy:"Privacy",conditions:"Condizioni",contact:"Contatti",label:"Informazioni pratiche e legali"},
  es:{privacy:"Privacidad",conditions:"Condiciones",contact:"Contacto",label:"Información práctica y legal"},
  pt:{privacy:"Privacidade",conditions:"Condições",contact:"Contactos",label:"Informações práticas e legais"},
};

export function LegalLinks({locale="fr"}:{locale?:Locale}) {
  if(locale!=="fr") { const copy=localizedLabels[locale]; const links=[{href:localizedPath(locale,"privacy"),label:copy.privacy},{href:localizedPath(locale,"conditions"),label:copy.conditions},{href:localizedPath(locale,"contact"),label:copy.contact}]; return <nav aria-label={copy.label}><ul className="flex flex-wrap gap-x-6 gap-y-3">{links.map(link=><li key={link.href}><Link href={link.href} className="transition-colors duration-300 hover:text-white">{link.label}</Link></li>)}</ul></nav> }
  return <nav aria-label="Informations pratiques et légales"><ul className="flex flex-wrap gap-x-6 gap-y-3">{legalLinks.map(link => <li key={link.href}><Link href={link.href} className="transition-colors duration-300 hover:text-white">{link.label}</Link></li>)}</ul></nav>;
}
