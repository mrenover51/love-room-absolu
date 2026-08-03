import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { pageMetadata } from "@/lib/seo";
import { eventEdition, seasonalEvents } from "@/lib/events/events";
export const metadata = pageMetadata({
  title: "Calendrier des séjours romantiques en Champagne | Absolu",
  description:
    "Saint-Valentin, fêtes, saisons, vendanges et occasions personnelles : préparez votre séjour romantique annuel dans la Suite Absolu à Avize.",
  path: "/evenements",
});
export default function Events() {
  const now = new Date();
  const calendar = seasonalEvents
    .map((event) => ({ event, edition: eventEdition(event, now) }))
    .sort((a, b) => a.edition.start.getTime() - b.edition.start.getTime());
  return (
    <>
      <Header />
      <main className="pb-24 pt-36">
        <section className="page-shell">
          <Breadcrumb current="Événements" />
          <p className="eyebrow mt-10 text-[#C9A86A]">Calendrier romantique</p>
          <h1 className="mt-4 max-w-5xl font-heading text-6xl sm:text-8xl">
            Une raison de se retrouver, à chaque saison.
          </h1>
          <p className="mt-6 max-w-2xl leading-8 text-white/55">
            Des pages pérennes, actualisées à chaque édition, pour préparer les
            temps forts de l’année sans perdre les conseils des années
            précédentes.
          </p>
        </section>
        <section className="page-shell mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {seasonalEvents.map((event) => (
            <Link
              key={event.slug}
              href={`/evenements/${event.slug}`}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-[#121212] transition hover:-translate-y-1 hover:border-[#C9A86A]/40"
            >
              <div className="relative aspect-[16/10]">
                <Image
                  src={event.image}
                  alt={`${event.name} romantique dans la Suite Absolu`}
                  fill
                  sizes="(max-width:768px)100vw,33vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
              <div className="p-6">
                <p className="text-[10px] uppercase tracking-wider text-[#C9A86A]">
                  {event.eyebrow}
                </p>
                <h2 className="mt-2 font-heading text-3xl">{event.name}</h2>
                <p className="mt-3 text-sm leading-7 text-white/45">
                  {event.promise}
                </p>
              </div>
            </Link>
          ))}
        </section>
        <section className="page-shell mt-24">
          <div className="flex items-center gap-3">
            <CalendarDays className="size-6 text-[#C9A86A]" />
            <h2 className="font-heading text-5xl">Prochaines éditions</h2>
          </div>
          <div className="mt-8 overflow-hidden rounded-3xl border border-white/10">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-white/[.04] text-white/40">
                <tr>
                  <th className="p-4">Occasion</th>
                  <th className="p-4">Période</th>
                  <th className="p-4">Édition</th>
                  <th className="p-4">Préparer</th>
                </tr>
              </thead>
              <tbody>
                {calendar.map(({ event, edition }) => (
                  <tr key={event.slug} className="border-t border-white/10">
                    <td className="p-4 font-medium">{event.name}</td>
                    <td className="p-4 text-white/45">
                      {event.personal
                        ? "Date personnelle"
                        : edition.start.toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-4 text-white/45">{edition.year}</td>
                    <td className="p-4">
                      <Link
                        href={`/evenements/${event.slug}`}
                        className="text-[#C9A86A]"
                      >
                        Voir la page
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
