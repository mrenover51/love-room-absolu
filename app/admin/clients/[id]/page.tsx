import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Crown, Mail, Phone } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateCustomerProfile } from "./actions";

type Reservation = {
  id: string;
  reference: string;
  check_in: string;
  check_out: string;
  nights: number;
  total: number;
  status: string;
  payment_status: string;
  source: string;
  admin_notes: string | null;
};
const euro = (value: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    value / 100,
  );
export default async function CustomerDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params,
    db = createAdminClient(),
    { data: customer } = await db
      .from("customers")
      .select(
        "id,firstname,lastname,email,phone,last_reservation,origin,city,country,private_notes,is_returning,birthday,loyalty_tier,loyalty_points",
      )
      .eq("id", id)
      .maybeSingle();
  if (!customer) notFound();
  const { data } = await db
      .from("reservations")
      .select(
        "id,reference,check_in,check_out,nights,total,status,payment_status,source,admin_notes",
      )
      .eq("guest_email", customer.email)
      .order("check_in", { ascending: false })
      .limit(100),
    stays = (data ?? []) as Reservation[],
    paid = stays.filter((stay) =>
      ["paid", "partially_refunded"].includes(stay.payment_status),
    ),
    total = paid.reduce((sum, stay) => sum + stay.total, 0),
    totalNights = stays
      .filter((stay) => stay.status !== "cancelled")
      .reduce((sum, stay) => sum + stay.nights, 0),
    average = paid.length ? total / paid.length : 0;
  return (
    <>
      <Link
        href="/admin/clients"
        className="mb-6 inline-flex items-center gap-2 text-sm text-white/45"
      >
        <ArrowLeft className="size-4" />
        Retour aux clients
      </Link>
      <header className="rounded-[2rem] border border-[#C9A86A]/20 bg-[radial-gradient(circle_at_top_right,rgba(201,168,106,.18),transparent_38%),#121212] p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="grid size-20 place-items-center rounded-3xl bg-[#C9A86A]/10 font-heading text-3xl text-[#E5C98E]">
            {customer.firstname[0]}
            {customer.lastname[0]}
          </div>
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#C9A86A]/10 px-3 py-1 text-[10px] text-[#E5C98E]">
              <Crown className="size-3" />
              {customer.is_returning || stays.length > 1
                ? "Retour client"
                : "Premier séjour"}
            </span>
            <h1 className="mt-3 font-heading text-4xl">
              {customer.firstname} {customer.lastname}
            </h1>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/45">
              <a href={`mailto:${customer.email}`}>
                <Mail className="mr-1 inline size-3" />
                {customer.email}
              </a>
              <a href={`tel:${customer.phone}`}>
                <Phone className="mr-1 inline size-3" />
                {customer.phone || "Non renseigné"}
              </a>
            </div>
          </div>
        </div>
      </header>
      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Metric label="Séjours" value={String(stays.length)} />
        <Metric label="Total dépensé" value={euro(total)} />
        <Metric label="Nuits" value={String(totalNights)} />
        <Metric label="Panier moyen" value={euro(average)} />
        <Metric
          label="Origine"
          value={customer.origin ?? stays[0]?.source ?? "site"}
        />
        <Metric
          label="Localisation"
          value={
            [customer.city, customer.country].filter(Boolean).join(", ") ||
            "À compléter"
          }
        />
        <Metric
          label="Fidélité"
          value={`${customer.loyalty_tier} · ${customer.loyalty_points} pts`}
        />
        <Metric
          label="Anniversaire"
          value={customer.birthday ?? "Non renseigné"}
        />
      </section>
      <div className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_.6fr]">
        <section className="rounded-[1.5rem] border border-white/[.08] bg-[#121212] p-6">
          <h2 className="font-heading text-2xl">Historique des séjours</h2>
          <div className="mt-5 space-y-3">
            {stays.map((stay) => (
              <Link
                href={`/admin/reservations/${stay.id}`}
                key={stay.id}
                className="grid gap-3 rounded-2xl border border-white/[.06] bg-white/[.025] p-4 sm:grid-cols-[1fr_auto_auto]"
              >
                <div>
                  <p className="text-sm text-[#E5C98E]">{stay.reference}</p>
                  <p className="text-xs text-white/40">
                    {stay.check_in} → {stay.check_out} · {stay.nights} nuit(s)
                  </p>
                </div>
                <span className="text-xs text-white/50">{stay.source}</span>
                <strong>{euro(stay.total)}</strong>
              </Link>
            ))}
            {!stays.length && (
              <p className="text-sm text-white/40">Aucun séjour rattaché.</p>
            )}
          </div>
        </section>
        <form
          action={updateCustomerProfile}
          className="rounded-[1.5rem] border border-white/[.08] bg-[#121212] p-5"
        >
          <h2 className="font-heading text-2xl">Profil relationnel</h2>
          <input type="hidden" name="id" value={customer.id} />
          <label className="mt-5 block text-xs text-white/45">
            Origine
            <select
              name="origin"
              defaultValue={customer.origin ?? "site"}
              className="mt-2 min-h-11 w-full rounded-xl bg-black px-3"
            >
              {["site", "booking", "airbnb", "manual"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <input
              name="city"
              defaultValue={customer.city ?? ""}
              placeholder="Ville"
              className="min-h-11 rounded-xl bg-black px-3 text-xs"
            />
            <input
              name="country"
              defaultValue={customer.country ?? ""}
              placeholder="Pays"
              className="min-h-11 rounded-xl bg-black px-3 text-xs"
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="text-xs text-white/45">
              Anniversaire
              <input
                type="date"
                name="birthday"
                defaultValue={customer.birthday ?? ""}
                className="mt-2 min-h-11 w-full rounded-xl bg-black px-3"
              />
            </label>
            <label className="text-xs text-white/45">
              Segment fidélité
              <select
                name="loyalty_tier"
                defaultValue={customer.loyalty_tier}
                className="mt-2 min-h-11 w-full rounded-xl bg-black px-3"
              >
                <option value="member">Membre</option>
                <option value="privilege">Privilège</option>
                <option value="signature">Signature</option>
              </select>
            </label>
          </div>
          <label className="mt-3 block text-xs text-white/45">
            Points fidélité
            <input
              type="number"
              min="0"
              name="loyalty_points"
              defaultValue={customer.loyalty_points}
              className="mt-2 min-h-11 w-full rounded-xl bg-black px-3"
            />
          </label>
          <label className="mt-4 flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              name="is_returning"
              value="true"
              defaultChecked={customer.is_returning}
              className="accent-[#C9A86A]"
            />
            Retour client
          </label>
          <textarea
            name="private_notes"
            defaultValue={customer.private_notes ?? ""}
            rows={7}
            placeholder="Notes privées, préférences et attentions…"
            className="mt-4 w-full rounded-xl bg-black p-3 text-xs"
          />
          <button className="mt-4 rounded-full bg-[#C9A86A] px-5 py-3 text-sm text-black">
            Enregistrer
          </button>
        </form>
      </div>
    </>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-white/[.08] bg-[#121212] p-4">
      <p className="text-[10px] uppercase tracking-wider text-white/35">
        {label}
      </p>
      <p className="mt-2 text-lg text-[#E5C98E]">{value}</p>
    </article>
  );
}
