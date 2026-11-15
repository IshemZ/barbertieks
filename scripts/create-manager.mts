// Crée le compte du gérant (Supabase Auth, e-mail confirmé d'office).
// Usage : npm run create-manager (lit .env.local ; en production, définir les variables avant).
import { createInterface } from "node:readline/promises";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SECRET_KEY doivent être définis.");
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const email = (await rl.question("E-mail du gérant : ")).trim();
const password = await rl.question("Mot de passe (12 caractères minimum) : ");
rl.close();

if (password.length < 12) {
  console.error("Le mot de passe doit contenir au moins 12 caractères.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const { error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
if (error) {
  console.error(`Échec : ${error.message}`);
  process.exit(1);
}
console.log(`Compte gérant créé pour ${email} sur ${url}.`);
