import { CalendarCheck, CreditCard, Heart, Star } from "lucide-react";

const assurances = [
  { icon: Star, title: "Les couples nous recommandent", detail: "Une expérience pensée à deux" },
  { icon: CreditCard, title: "Paiement sécurisé", detail: "Transaction protégée" },
  { icon: CalendarCheck, title: "Annulation jusqu’à J-5", detail: "Sans frais selon nos conditions" },
  { icon: Heart, title: "Réservation directe", detail: "La relation la plus simple" },
] as const;

export function TrustBar() {
  return (
    <section className="relative z-20 border-y border-[#C9A86A]/15 bg-[#0B0B0A]" aria-label="Les engagements Absolu">
      <div className="page-shell grid divide-y divide-white/[.08] sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
        {assurances.map(({ icon: Icon, title, detail }) => (
          <div key={title} className="group flex items-center gap-4 px-3 py-7 sm:px-7 lg:py-8">
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-[#C9A86A]/25 bg-[#C9A86A]/[.06] transition-all duration-500 group-hover:border-[#C9A86A]/55 group-hover:bg-[#C9A86A]/10">
              <Icon className="size-4 stroke-[1.4] text-[#D8BD87]" aria-hidden="true" />
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
