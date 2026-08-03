import { BadgeEuro, CalendarCheck, CreditCard, Heart, Star } from "lucide-react";

const assurances = [
  { icon: Star, title: "★★★★★", detail: "Une expérience pensée à deux" },
  { icon: Heart, title: "Réservation directe", detail: "La relation la plus simple" },
  { icon: CreditCard, title: "Paiement sécurisé Stripe", detail: "Transaction protégée" },
  { icon: CalendarCheck, title: "Annulation jusqu’à J-5", detail: "Sans frais selon nos conditions" },
  { icon: BadgeEuro, title: "Meilleur tarif garanti", detail: "En réservant sans intermédiaire" },
] as const;

export function TrustBar() {
  return (
    <section className="relative z-20 border-y border-[#D0AE72]/15 bg-[#100D0B] shadow-[inset_0_1px_0_rgba(255,244,225,.025)]" aria-label="Les engagements Absolu">
      <div className="page-shell grid divide-y divide-white/[.08] sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-5">
        {assurances.map(({ icon: Icon, title, detail }) => (
          <div key={title} className="group flex items-center gap-4 px-3 py-7 sm:px-6 lg:py-8 xl:px-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-[#D0AE72]/25 bg-[linear-gradient(145deg,rgba(208,174,114,.1),rgba(91,61,46,.04))] shadow-[inset_0_1px_0_rgba(255,244,225,.07)] transition-all duration-500 group-hover:border-[#D0AE72]/60 group-hover:bg-[#D0AE72]/12 group-hover:shadow-[0_10px_28px_rgba(91,61,46,.2)]">
              <Icon className="size-4 text-[#DEC38E]" aria-hidden="true" />
            </span>
            <span>
              <strong className="block font-heading text-lg font-normal text-[#F6F2EC]">{title}</strong>
              <span className="mt-1 block text-[.65rem] uppercase tracking-[.15em] text-white/40">{detail}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
