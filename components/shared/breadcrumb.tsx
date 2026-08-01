import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Breadcrumb({ current }: { current: string }) {
  const json={"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Accueil",item:siteConfig.url},{"@type":"ListItem",position:2,name:current}]};
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(json).replaceAll("<","\\u003c")}}/><nav aria-label="Fil d’Ariane" className="text-[.65rem] uppercase tracking-[.18em] text-white/55"><ol className="flex items-center gap-3"><li><Link href="/" className="hover:text-white">Accueil</Link></li><li aria-hidden="true">/</li><li aria-current="page" className="text-[#D8C8B6]">{current}</li></ol></nav></>;
}
