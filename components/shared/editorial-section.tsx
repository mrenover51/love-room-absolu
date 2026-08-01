import Image from "next/image";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";
import Link from "next/link";

export function EditorialSection({ image, alt, eyebrow, title, children, reverse = false, portrait = false }: { image: string; alt: string; eyebrow: string; title: string; children: React.ReactNode; reverse?: boolean; portrait?: boolean }) {
  return <section className="bg-[#F6F2EC] py-20 text-[#161311] sm:py-28"><div className="page-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20"><Reveal className={cn(reverse&&"lg:order-2")}><div className={cn("relative overflow-hidden",portrait?"aspect-[4/5]":"aspect-[4/3]")}><Image src={image} alt={alt} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover"/></div></Reveal><Reveal delay={.08} className={cn(reverse&&"lg:order-1")}><p className="eyebrow text-[#9A7844]">{eyebrow}</p><h2 className="mt-4 font-heading text-4xl leading-tight sm:text-5xl">{title}</h2><div className="mt-6 space-y-4 text-base leading-8 text-[#665E56]">{children}</div><Link href="/reservation" className="mt-8 inline-flex border-b border-[#9A7844] pb-2 text-xs font-semibold uppercase tracking-[.16em] text-[#7C6037]">Voir les disponibilités</Link></Reveal></div></section>;
}
