// Génère la valeur de TILL_PIN_HASH à partir du code caisse saisi.
// Usage : npm run hash-pin
import { createInterface } from "node:readline/promises";
import { hashPin, isPinFormat } from "../src/lib/till-token.ts";

const rl = createInterface({ input: process.stdin, output: process.stdout });
const pin = (await rl.question("Code caisse (4 chiffres) : ")).trim();
rl.close();

if (!isPinFormat(pin)) {
  console.error("Le code doit contenir exactement 4 chiffres.");
  process.exit(1);
}

console.log(`TILL_PIN_HASH=${hashPin(pin)}`);
