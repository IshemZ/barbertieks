import { addEmployee, renameEmployee, setEmployeeActive } from "./actions";
import { ActionForm } from "../../action-form";
import { inputClass, primaryButtonClass, rowClass, secondaryButtonClass } from "../../ui";
import { NAME_MAX_LENGTH } from "@/lib/form-input";
import { requireManager } from "@/lib/manager-session";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const metadata = { title: "Salariés · Barber Tieks" };

export default async function EmployeesPage() {
  await requireManager();
  const { data, error } = await supabaseAdmin().from("employees").select("id, name, active").order("name");
  if (error) throw error;
  const active = data.filter((e) => e.active);
  const archived = data.filter((e) => !e.active);

  return (
    <>
      <h1 className="text-3xl font-semibold">Salariés</h1>

      <ActionForm action={addEmployee} className="flex flex-wrap gap-2">
        <input name="name" aria-label="Prénom" placeholder="Prénom" required maxLength={NAME_MAX_LENGTH} className={inputClass} />
        <button type="submit" className={primaryButtonClass}>
          Ajouter
        </button>
      </ActionForm>

      <ul aria-label="Salariés actifs" className="flex flex-col gap-3">
        {active.map((e) => (
          <li key={e.id} className={rowClass}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xl font-medium">{e.name}</span>
              <ActionForm action={setEmployeeActive}>
                <input type="hidden" name="id" value={e.id} />
                <input type="hidden" name="active" value="false" />
                <button type="submit" className={secondaryButtonClass}>
                  Archiver
                </button>
              </ActionForm>
            </div>
            <details>
              <summary className="cursor-pointer text-lg text-zinc-500">Modifier le prénom</summary>
              <ActionForm action={renameEmployee} className="mt-2 flex flex-wrap gap-2">
                <input type="hidden" name="id" value={e.id} />
                <input name="name" aria-label="Nouveau prénom" defaultValue={e.name} required maxLength={NAME_MAX_LENGTH} className={inputClass} />
                <button type="submit" className={primaryButtonClass}>
                  Enregistrer
                </button>
              </ActionForm>
            </details>
          </li>
        ))}
        {active.length === 0 && <li className="text-lg">Aucun salarié actif : la caisse ne peut pas enregistrer de vente.</li>}
      </ul>

      {archived.length > 0 && (
        <section aria-labelledby="archived-employees" className="flex flex-col gap-3">
          <h2 id="archived-employees" className="text-xl font-semibold text-zinc-500">
            Archivés
          </h2>
          <p className="text-zinc-500">Absents de la caisse, toujours visibles dans les chiffres.</p>
          <ul aria-label="Salariés archivés" className="flex flex-col gap-3">
            {archived.map((e) => (
              <li key={e.id} className={`${rowClass} flex-row items-center justify-between`}>
                <span className="text-xl text-zinc-500">{e.name}</span>
                <ActionForm action={setEmployeeActive}>
                  <input type="hidden" name="id" value={e.id} />
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
