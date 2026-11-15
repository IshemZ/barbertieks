import { unlockTill } from "./actions/till";
import { PinPad } from "./pin-pad";
import { isTillUnlocked } from "@/lib/till-session";

export default async function TillPage() {
  if (!(await isTillUnlocked())) return <PinPad action={unlockTill} />;

  // Assistant de vente : étape suivante de la V1.
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-semibold">Nouvelle vente</h1>
    </main>
  );
}
