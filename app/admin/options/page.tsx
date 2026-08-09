import { PackagePlus, Save, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { deleteOption, saveOption } from "../actions";

type OptionRow = {
  id: string;
  option_key: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
  order: number;
  image_url: string | null;
  icon: string | null;
  billing_type: BillingType;
  available_weekdays: number[];
  max_quantity: number;
  min_lead_days: number;
};
type BillingType =
  "per_stay" | "per_night" | "per_person" | "per_person_per_night";

const weekdays = [
  [1, "Lun"],
  [2, "Mar"],
  [3, "Mer"],
  [4, "Jeu"],
  [5, "Ven"],
  [6, "Sam"],
  [0, "Dim"],
] as const;
const input =
  "min-h-11 w-full rounded-xl border border-white/10 bg-black/35 px-3 text-sm outline-none transition focus:border-[#C9A86A]/60";

export default async function OptionsPage() {
  await requireAdmin();
  const { data, error } = await createAdminClient()
    .from("options")
    .select(
      "id,option_key,name,description,price,active,order,image_url,icon,billing_type,available_weekdays,max_quantity,min_lead_days",
    )
    .order("order")
    .order("name");
  if (error) throw new Error("OPTIONS_READ_FAILED");
  const options = (data ?? []) as OptionRow[];
  return (
    <>
      <AdminPageHeader
        eyebrow="Upsell"
        title="Options & Extras"
        description="Gérez les attentions proposées pendant la réservation, leur prix TTC, leur disponibilité et leur ordre d’affichage."
      />
      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        <Metric label="Options" value={options.length} />
        <Metric
          label="Actives"
          value={options.filter((item) => item.active).length}
        />
        <Metric
          label="Inactives"
          value={options.filter((item) => !item.active).length}
        />
      </section>
      <div className="space-y-5">
        {options.map((option) => (
          <article
            key={option.id}
            className="rounded-[1.5rem] border border-white/[.08] bg-[#121212] p-5 shadow-xl sm:p-6"
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[.18em] text-[#C9A86A]">
                  {option.option_key}
                </p>
                <h2 className="mt-1 font-heading text-2xl">{option.name}</h2>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs ${option.active ? "bg-emerald-400/10 text-emerald-300" : "bg-white/5 text-white/40"}`}
              >
                {option.active ? "Active" : "Inactive"}
              </span>
            </div>
            <OptionForm option={option} />
            <form
              action={deleteOption}
              className="mt-4 flex justify-end border-t border-white/[.06] pt-4"
            >
              <input type="hidden" name="id" value={option.id} />
              <button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-rose-400/20 px-4 text-xs text-rose-200 transition hover:bg-rose-400/10">
                <Trash2 className="size-3.5" /> Supprimer
              </button>
            </form>
          </article>
        ))}
      </div>
      <section className="mt-7 rounded-[1.5rem] border border-dashed border-[#C9A86A]/30 bg-[#C9A86A]/[.035] p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <PackagePlus className="size-5 text-[#C9A86A]" />
          <div>
            <p className="text-[10px] uppercase tracking-[.18em] text-[#C9A86A]">
              Catalogue
            </p>
            <h2 className="font-heading text-2xl">Ajouter une option</h2>
          </div>
        </div>
        <OptionForm />
      </section>
    </>
  );
}

function OptionForm({ option }: { option?: OptionRow }) {
  return (
    <form
      action={saveOption}
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
    >
      {option && <input type="hidden" name="id" value={option.id} />}
      <Field label="Identifiant technique">
        <input
          name="option_key"
          required
          readOnly={Boolean(option)}
          pattern="[a-z0-9-]+"
          defaultValue={option?.option_key}
          placeholder="bouquet-de-fleurs"
          className={`${input} read-only:text-white/35`}
        />
      </Field>
      <Field label="Nom">
        <input
          name="name"
          required
          minLength={2}
          maxLength={100}
          defaultValue={option?.name}
          className={input}
        />
      </Field>
      <Field label="Prix TTC (€)">
        <input
          name="price_euros"
          type="number"
          required
          min="0"
          max="100000"
          step="0.01"
          defaultValue={option ? (option.price / 100).toFixed(2) : "0.00"}
          className={input}
        />
      </Field>
      <Field label="Ordre d’affichage">
        <input
          name="order"
          type="number"
          required
          min="0"
          defaultValue={option?.order ?? 10}
          className={input}
        />
      </Field>
      <Field label="Description" className="md:col-span-2">
        <textarea
          name="description"
          maxLength={500}
          defaultValue={option?.description}
          rows={3}
          className={`${input} py-3`}
        />
      </Field>
      <Field label="URL de l’image">
        <input
          name="image_url"
          type="url"
          maxLength={2048}
          defaultValue={option?.image_url ?? ""}
          placeholder="https://…"
          className={input}
        />
      </Field>
      <Field label="Icône éventuelle">
        <input
          name="icon"
          maxLength={50}
          defaultValue={option?.icon ?? ""}
          placeholder="flower, wine…"
          className={input}
        />
      </Field>
      <Field label="Type de facturation">
        <select
          name="billing_type"
          defaultValue={option?.billing_type ?? "per_stay"}
          className={input}
        >
          <option value="per_stay">Par séjour</option>
          <option value="per_night">Par nuit</option>
          <option value="per_person">Par personne</option>
          <option value="per_person_per_night">Par personne et par nuit</option>
        </select>
      </Field>
      <Field label="Quantité maximale">
        <input
          name="max_quantity"
          type="number"
          min="1"
          max="100"
          defaultValue={option?.max_quantity ?? 1}
          className={input}
        />
      </Field>
      <Field label="Délai minimum avant arrivée (jours)">
        <input
          name="min_lead_days"
          type="number"
          min="0"
          max="365"
          defaultValue={option?.min_lead_days ?? 0}
          className={input}
        />
      </Field>
      <fieldset className="md:col-span-2 xl:col-span-4">
        <legend className="text-xs text-white/45">Jours disponibles</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {weekdays.map(([day, label]) => (
            <label
              key={day}
              className="flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs"
            >
              <input
                type="checkbox"
                name="available_weekdays"
                value={day}
                defaultChecked={
                  !option || option.available_weekdays.includes(day)
                }
                className="accent-[#C9A86A]"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex min-h-11 items-center gap-3 rounded-xl border border-white/10 px-4 text-sm">
        <input
          name="active"
          type="checkbox"
          defaultChecked={option?.active ?? true}
          className="size-4 accent-[#C9A86A]"
        />
        Option active
      </label>
      <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#C9A86A] px-5 text-sm font-semibold text-black xl:col-start-4">
        <Save className="size-4" />{" "}
        {option ? "Enregistrer" : "Ajouter l’option"}
      </button>
    </form>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`text-xs text-white/45 ${className}`}>
      {label}
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/[.08] bg-white/[.025] p-4">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-1 font-heading text-3xl text-[#E5C98E]">{value}</p>
    </div>
  );
}
