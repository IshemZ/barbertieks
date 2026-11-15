import Link from "next/link";
import { redirect } from "next/navigation";
import { unlockTill } from "../actions/till";
import { PinPad } from "../pin-pad";
import { canUseTill } from "@/lib/till-session";

export const metadata = { title: "Caisse · Barber Tieks" };

export default async function UnlockTillPage() {
  if (await canUseTill()) redirect("/");
  return (
    <div className="flex flex-1 flex-col">
      <Link href="/" className="self-start px-4 py-3 text-lg font-medium underline">
        Retour
      </Link>
      <PinPad action={unlockTill} />
    </div>
  );
}
