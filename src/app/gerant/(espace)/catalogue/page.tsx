import { addItem, setItemActive, updateItem } from "./actions";
import { ActionForm } from "../../action-form";
import { inputClass, primaryButtonClass, rowClass, secondaryButtonClass } from "../../ui";
import { centsToInput, NAME_MAX_LENGTH } from "@/lib/form-input";
import { requireManager } from "@/lib/manager-session";
import { formatEuros } from "@/lib/money";
import type { ItemKind } from "@/lib/sales-summary";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const metadata = { title: "Catalogue · Barber Tieks" };

type Item = { id: string; name: string; kind: ItemKind; price_cents: number; active: boolean };

const PRICE_PATTERN = String.raw`\d{1,4}([,.]\d{1,2})?`;

export default async function CatalogPage() {
  await requireManager();
  const { data, error } = await supabaseAdmin()
    .from("catalog_items")
    .select("id, name, kind, price_cents, active")
    .order("position");
  if (error) throw error;
  const active = data.filter((i) => i.active);
  const archived = data.filter((i) => !i.active);

  return (
    <>
      <h1 className="text-3xl font-semibold">Catalogue</h1>

      <section aria-labelledby="add-item" className={rowClass}>
        <h2 id="add-item" className="text-xl font-semibold">
          Ajouter un article
        </h2>
        <ActionForm action={addItem} className="flex flex-wrap gap-3">
          <input name="name" aria-label="Nom" placeholder="Nom" required maxLength={NAME_MAX_LENGTH} className={`${inputClass} basis-full`} />
          <fieldset className="flex basis-full gap-4 text-lg">
            <legend className="sr-only">Type</legend>
            <label className="flex items-center gap-2">
              <input type="radio" name="kind" value="service" required className="size-5" /> Prestation
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="kind" value="product" className="size-5" /> Produit
            </label>
          </fieldset>
          <PriceInput />
          <button type="submit" className={primaryButtonClass}>
            Ajouter
          </button>
        </ActionForm>
      </section>

      <ItemList title="Prestations" items={active.filter((i) => i.kind === "service")} />
      <ItemList title="Produits" items={active.filter((i) => i.kind === "product")} />

      {archived.length > 0 && (
        <section aria-labelledby="archived-items" className="flex flex-col gap-3">
          <h2 id="archived-items" className="text-xl font-semibold text-zinc-500">
            Archivés
          </h2>
          <p className="text-zinc-500">Absents de la caisse, toujours visibles dans l&apos;historique.</p>
          <ul aria-label="Articles archivés" className="flex flex-col gap-3">
            {archived.map((item) => (
              <li key={item.id} className={`${rowClass} flex-row items-center justify-between`}>
                <span className="text-xl text-zinc-500">
                  {item.name} · {formatEuros(item.price_cents)}
                </span>
                <ActionForm action={setItemActive}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="active" value="true" />
                  <button type="submit" className={secondaryButtonClass}>
                    Réactiver
                  </button>
                </ActionForm>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function PriceInput({ defaultValue }: { defaultValue?: string }) {
  return (
    <label className="flex flex-1 items-center gap-2 text-lg">
      <input
        name="price"
        aria-label="Prix en euros"
        placeholder="Prix"
        inputMode="decimal"
        pattern={PRICE_PATTERN}
        required
        defaultValue={defaultValue}
        className={inputClass}
      />
      €
    </label>
  );
}

function ItemList({ title, items }: { title: string; items: Item[] }) {
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      {items.length === 0 && <p className="text-lg text-zinc-500">Aucun article.</p>}
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id} className={rowClass}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xl font-medium">{item.name}</span>
              <span className="shrink-0 text-xl font-semibold">{formatEuros(item.price_cents)}</span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <details className="flex-1">
                <summary className="min-h-12 cursor-pointer content-center text-lg text-zinc-500">Modifier</summary>
                <ActionForm action={updateItem} className="mt-2 flex flex-wrap gap-2">
                  <input type="hidden" name="id" value={item.id} />
                  <input name="name" aria-label="Nouveau nom" defaultValue={item.name} required maxLength={NAME_MAX_LENGTH} className={`${inputClass} basis-full`} />
                  <PriceInput defaultValue={centsToInput(item.price_cents)} />
                  <button type="submit" className={primaryButtonClass}>
                    Enregistrer
                  </button>
                </ActionForm>
              </details>
              <ActionForm action={setItemActive}>
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="active" value="false" />
                <button type="submit" className={secondaryButtonClass}>
                  Archiver
                </button>
              </ActionForm>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
