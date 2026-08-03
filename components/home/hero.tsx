"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { PremiumButton } from "@/components/shared/premium-button";
import { theme } from "@/lib/theme";
import { neutralBlurDataUrl } from "@/lib/performance/images";

export function Hero() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 700], [0, reduced ? 0 : 55]);
  return (
    <section
      id="accueil"
      className="relative flex min-h-[86svh] items-end overflow-hidden bg-black pb-16 pt-32 sm:min-h-[88svh] sm:items-center sm:pb-0"
    >
      <motion.div
        className="absolute -inset-y-16 inset-x-0"
        style={{ y: imageY }}
        initial={{ scale: 1.01 }}
        animate={{ scale: reduced ? 1.01 : 1.075 }}
        transition={{
          duration: theme.durations.hero,
          ease: "easeInOut",
          repeat: reduced ? 0 : Infinity,
          repeatType: "reverse",
        }}
      >
        <Image
          src="/images/optimized/lit.webp"
          alt="Suite Absolu avec grand lit double et ambiance romantique"
          fill
          preload
          fetchPriority="high"
          sizes="100vw"
          placeholder="blur"
          blurDataURL={neutralBlurDataUrl}
          className="object-cover object-[58%_center] sm:object-center"
        />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,9,.86)_0%,rgba(9,9,9,.4)_55%,rgba(9,9,9,.16)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(9,9,9,.82)_0%,transparent_55%,rgba(9,9,9,.3)_100%)]" />
      <div className="absolute -bottom-32 left-1/4 size-[34rem] rounded-full bg-[#F13C98]/10 blur-[120px]" />
      <div className="page-shell relative z-10 py-10">
        <motion.div className="max-w-2xl" initial={reduced ? false : "hidden"} animate="show" variants={{hidden:{opacity:0},show:{opacity:1,transition:{staggerChildren:.12,delayChildren:.15}}}}>
          <motion.div variants={{hidden:{opacity:0,y:18},show:{opacity:1,y:0,transition:{duration:.8,ease:[.22,1,.36,1]}}}}>
          <p className="eyebrow mb-6 text-[#D8C8B6]">Suite & spa privé</p>
          <h1 className="font-heading text-7xl font-medium uppercase leading-none text-[#F6F2EC] sm:text-8xl lg:text-[9rem]">
            Absolu
          </h1>
          <p className="mt-3 font-heading text-2xl italic text-[#D8C8B6] sm:text-3xl">
            La Love Room d’exception.
          </p>
          <p className="mt-6 text-xs font-medium uppercase tracking-[.18em] text-white/70 sm:text-sm">
            Baignoire balnéo <span aria-hidden="true">•</span> Sauna{" "}
            <span aria-hidden="true">•</span> Suite privative
          </p>
          </motion.div>
          <motion.div variants={{hidden:{opacity:0,y:16},show:{opacity:1,y:0,transition:{duration:.75,ease:[.22,1,.36,1]}}}} className="mt-10 grid max-w-xl gap-3 sm:grid-cols-2">
            <PremiumButton href="/reservation">
              Réserver votre nuit
            </PremiumButton>
            <PremiumButton href="/la-suite" variant="outline">
              Découvrir la suite
            </PremiumButton>
          </motion.div>
        </motion.div>
      </div>
      <a
        href="#suite"
        aria-label="Faire défiler vers la présentation"
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[.6rem] uppercase tracking-[.22em] text-white/50 lg:flex"
      >
        <motion.span
          animate={reduced ? undefined : { opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Scroll
        </motion.span>
        <ChevronDown className="size-4" aria-hidden="true" />
      </a>
    </section>
  );
}
