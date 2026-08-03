import Link from "next/link";

const legalLinks = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/politique-confidentialite", label: "Confidentialité" },
  { href: "/cookies", label: "Cookies" },
  { href: "/conditions", label: "Conditions" },
  { href: "/plan-du-site", label: "Plan du site" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

export function LegalLinks() {
  return <nav aria-label="Informations pratiques et légales"><ul className="flex flex-wrap gap-x-6 gap-y-3">{legalLinks.map(link => <li key={link.href}><Link href={link.href} className="transition-colors duration-300 hover:text-white">{link.label}</Link></li>)}</ul></nav>;
}
