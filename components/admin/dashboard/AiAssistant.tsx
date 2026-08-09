import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Card } from "./dashboard-ui";

const signals = ["Occupation", "Prévisions", "Revenus", "Tarification"];

export function AiAssistant() {
  return (
    <Card className="relative overflow-hidden border-[#8E48FF]/20 p-5 sm:p-7">
      <div className="absolute -right-16 -top-16 size-48 rounded-full bg-[#8E48FF]/15 blur-3xl" />
      <div className="relative">
        <span className="inline-flex rounded-xl border border-[#C8A66A]/20 bg-[#C8A66A]/10 p-2.5">
          <Sparkles className="size-5 text-[#E2C48B]" />
        </span>
        <h2 className="mt-5 font-heading text-2xl">Absolu Intelligence</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#B8B2A8]">
          Explorez les prévisions, périodes creuses et recommandations calculées
          à partir de votre activité.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {signals.map((signal) => (
            <span
              key={signal}
              className="rounded-full border border-white/[.08] px-3 py-2 text-[11px] text-white/55"
            >
              {signal}
            </span>
          ))}
        </div>
        <Link
          href="/admin/assistant"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#C8A66A] px-5 text-sm font-semibold text-black transition hover:bg-[#E5C98E]"
        >
          Ouvrir le tableau intelligent <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </Card>
  );
}
