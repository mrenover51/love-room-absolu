import Image from "next/image";

export function ImageComparison({ natural, ambient, alt }: { natural: string; ambient: string; alt: string }) {
  return <div className="grid gap-4 sm:grid-cols-2"><figure><div className="relative aspect-[4/3] overflow-hidden"><Image src={natural} alt={`${alt}, en lumière naturelle`} fill sizes="(min-width:640px) 50vw, 100vw" className="object-cover"/></div><figcaption className="mt-3 text-xs uppercase tracking-[.18em] text-white/50">Lumière naturelle</figcaption></figure><figure><div className="relative aspect-[4/3] overflow-hidden"><Image src={ambient} alt={`${alt}, dans l’ambiance rose et violette`} fill sizes="(min-width:640px) 50vw, 100vw" className="object-cover"/></div><figcaption className="mt-3 text-xs uppercase tracking-[.18em] text-[#D8C8B6]">Ambiance rose / violette</figcaption></figure></div>;
}
