import Image from "next/image";
import { Breadcrumb } from "./breadcrumb";
import { neutralBlurDataUrl } from "@/lib/performance/images";

export function InteriorHero({
  image,
  title,
  eyebrow,
  description,
  position = "object-center",
}: {
  image: string;
  title: string;
  eyebrow: string;
  description?: string;
  position?: string;
}) {
  return (
    <section className="relative flex min-h-[70svh] items-end overflow-hidden pb-16 pt-32 sm:min-h-[78svh] sm:pb-20">
      <Image
        src={image}
        alt=""
        fill
        preload
        sizes="100vw"
        placeholder="blur"
        blurDataURL={neutralBlurDataUrl}
        className={`object-cover ${position}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0908] via-[#1B120E]/38 to-black/32" />
      <div className="page-shell relative">
        <Breadcrumb current={title} />
        <p className="eyebrow mt-9 text-[#C9A86A]">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-heading text-6xl leading-none sm:text-7xl lg:text-8xl">
          {title}
        </h1>
        {description && (
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/70">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
