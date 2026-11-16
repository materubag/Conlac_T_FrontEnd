import { getDb } from "@/lib/db/sqlite";
import { AuthError } from "./sqliteAuth";

export interface BankSettings { banco: string; tipo: string; titular: string; cuenta: string; identificacion: string; ejemplo: boolean }
export const bankExample: BankSettings = { banco: "Banco Pichincha", tipo: "Cuenta corriente", titular: "CONLAC-T · cuenta de ejemplo", cuenta: "0000000000", identificacion: "0000000000000", ejemplo: true };
export function getBank(): BankSettings {
  const db = getDb();
  db.exec("CREATE TABLE IF NOT EXISTS commerce_settings (id TEXT PRIMARY KEY,contenido_json TEXT NOT NULL)");
  const row = db.prepare("SELECT contenido_json FROM commerce_settings WHERE id='bank'").get() as { contenido_json: string } | undefined;
  return row ? JSON.parse(row.contenido_json) : bankExample;
}
export function saveBank(body: Record<string, unknown>): BankSettings {
  getBank();
  const { tipo, titular, cuenta, identificacion } = body;
  if (!["Cuenta corriente", "Cuenta de ahorros"].includes(String(tipo)) || typeof titular !== "string" || titular.trim().length < 3 || titular.length > 150 ||
    typeof cuenta !== "string" || !/^\d{6,20}$/.test(cuenta) || /^0+$/.test(cuenta) ||
    typeof identificacion !== "string" || !/^(?:\d{10}|\d{13})$/.test(identificacion) || /^0+$/.test(identificacion)) {
    throw new AuthError("Completa el titular (3–150 caracteres), cuenta (6–20 dígitos), tipo y cédula/RUC (10 o 13 dígitos) reales.");
  }
  const bank: BankSettings = { banco: "Banco Pichincha", tipo: String(tipo), titular: titular.trim(), cuenta, identificacion, ejemplo: false };
  getDb().prepare("INSERT INTO commerce_settings(id,contenido_json) VALUES ('bank',?) ON CONFLICT(id) DO UPDATE SET contenido_json=excluded.contenido_json").run(JSON.stringify(bank));
  return bank;
}
