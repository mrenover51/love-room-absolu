import { BarChart3, CheckCircle2, Link2, Network, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  authorityScore,
  partnerCategories,
  type Partner,
} from "@/lib/partners/partners";
import { createPartner, updatePartner, verifyBacklink } from "./actions";
export default async function PartnersAdmin() {
  await requireAdmin();
  let partners: Partner[] = [];
  try {
    const { data } = await createAdminClient()
      .from("partners")
      .select("*")
      .order("created_at", { ascending: false });
    partners = (data ?? []) as Partner[];
  } catch {}
  const published = partners.filter((item) => item.status === "published"),
    reciprocal = partners.filter(
      (item) => item.reciprocal_status === "verified",
    ),
    average = published.length
      ? Math.round(
          published.reduce((sum, item) => sum + authorityScore(item), 0) /
            published.length,
        )
      : 0;
  return (
    <>
      <AdminPageHeader
        eyebrow="Netlinking"
        title="Autorité & partenaires"
        description="Qualifiez les partenaires, contrôlez les liens réciproques et publiez uniquement les collaborations vérifiées."
      />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Network} label="Prospects" value={partners.length} />
        <Metric
          icon={CheckCircle2}
          label="Partenaires publiés"
          value={published.length}
        />
        <Metric
          icon={Link2}
          label="Backlinks vérifiés"
          value={reciprocal.length}
        />
        <Metric
          icon={BarChart3}
          label="Score d’autorité"
          value={average}
          suffix="/100"
        />
      </section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[.7fr_1.3fr]">
        <form
          action={createPartner}
          className="rounded-3xl border border-[#C9A86A]/20 bg-[#121212] p-6"
        >
          <Plus className="size-5 text-[#C9A86A]" />
          <h2 className="mt-4 font-heading text-3xl">Ajouter un partenaire</h2>
          <div className="mt-5 space-y-3">
            <input
              name="name"
              required
              minLength={2}
              placeholder="Nom"
              className={input}
            />
            <select name="category" className={input}>
              {Object.entries(partnerCategories).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <input name="city" required placeholder="Ville" className={input} />
            <input
              name="website_url"
              type="url"
              required
              placeholder="https://site-partenaire.fr"
              className={input}
            />
            <input
              name="contact_email"
              type="email"
              placeholder="Email du contact"
              className={input}
            />
            <textarea
              name="description"
              required
              minLength={80}
              placeholder="Présentation factuelle du partenariat (80 caractères minimum)"
              className={`${input} min-h-32 py-3`}
            />
            <button className="min-h-12 w-full rounded-xl bg-[#C9A86A] font-semibold text-black">
              Créer le prospect
            </button>
          </div>
        </form>
        <div>
          <h2 className="font-heading text-3xl">Pipeline partenaires</h2>
          <div className="mt-5 space-y-3">
            {partners.length ? (
              partners.map((partner) => (
                <article
                  key={partner.id}
                  className="rounded-2xl border border-white/10 bg-[#121212] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#C9A86A]">
                        {partnerCategories[partner.category]} · {partner.city}
                      </p>
                      <h3 className="mt-1 font-heading text-2xl">
                        {partner.name}
                      </h3>
                    </div>
                    <strong className="text-2xl">
                      {authorityScore(partner)}
                      <span className="text-xs text-white/30">/100</span>
                    </strong>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <form action={updatePartner} className="flex gap-2">
                      <input type="hidden" name="id" value={partner.id} />
                      <select
                        name="status"
                        defaultValue={partner.status}
                        className={`${input} min-w-0 flex-1`}
                      >
                        {[
                          "prospect",
                          "contacted",
                          "verified",
                          "published",
                          "declined",
                        ].map((status, keyIndex) => (
                          <option key={`${status}-${keyIndex}`}>{status}</option>
                        ))}
                      </select>
                      <button className="rounded-xl border border-white/15 px-4 text-xs">
                        Mettre à jour
                      </button>
                    </form>
                    <form action={verifyBacklink} className="flex gap-2">
                      <input type="hidden" name="id" value={partner.id} />
                      <input
                        name="backlink_url"
                        type="url"
                        required
                        defaultValue={partner.backlink_url ?? ""}
                        placeholder="URL du lien retour"
                        className={`${input} min-w-0 flex-1`}
                      />
                      <button className="rounded-xl border border-[#C9A86A]/30 px-4 text-xs">
                        Vérifier
                      </button>
                    </form>
                  </div>
                  <p
                    className={`mt-3 text-xs ${partner.reciprocal_status === "verified" ? "text-emerald-300" : "text-white/30"}`}
                  >
                    Lien réciproque : {partner.reciprocal_status}
                  </p>
                </article>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/35">
                Aucun partenaire. Appliquez d’abord la migration de la
                plateforme d’autorité.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
const input =
  "min-h-12 w-full rounded-xl border border-white/10 bg-black px-4 text-sm text-white";
function Metric({
  icon: Icon,
  label,
  value,
  suffix = "",
}: {
  icon: typeof Network;
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-white/[.08] bg-[#121212] p-5">
      <Icon className="size-5 text-[#C9A86A]" />
      <p className="mt-5 text-[10px] uppercase tracking-wider text-white/35">
        {label}
      </p>
      <p className="mt-1 text-3xl font-semibold">
        {value}
        {suffix}
      </p>
    </article>
  );
}
