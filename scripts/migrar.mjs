// Aplica, en orden, las migraciones de db/migrations que aún no se han aplicado.
// Uso: node scripts/migrar.mjs   (lee DATABASE_URL del entorno o de .env.local)
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";

function leerDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const archivo = path.join(process.cwd(), ".env.local");
  if (!existsSync(archivo)) return undefined;
  for (const linea of readFileSync(archivo, "utf8").split(/\r?\n/)) {
    const m = linea.match(/^\s*DATABASE_URL\s*=\s*(.*?)\s*$/);
    if (m) return m[1].replace(/^["']|["']$/g, "") || undefined;
  }
  return undefined;
}

const url = leerDatabaseUrl();
if (!url) {
  console.error("Falta DATABASE_URL (en el entorno o en .env.local).");
  process.exit(1);
}

const carpeta = path.join(process.cwd(), "db", "migrations");
const archivos = readdirSync(carpeta)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await client.query(
    "CREATE TABLE IF NOT EXISTS migraciones_aplicadas (nombre text PRIMARY KEY, aplicada_en timestamptz NOT NULL DEFAULT now())",
  );
  const { rows } = await client.query("SELECT nombre FROM migraciones_aplicadas");
  const hechas = new Set(rows.map((r) => r.nombre));

  let aplicadas = 0;
  for (const archivo of archivos) {
    if (hechas.has(archivo)) continue;
    const sql = readFileSync(path.join(carpeta, archivo), "utf8");
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("INSERT INTO migraciones_aplicadas (nombre) VALUES ($1)", [archivo]);
      await client.query("COMMIT");
      aplicadas++;
      console.log(`Aplicada ${archivo}`);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(`Falló ${archivo}: ${error.message}`);
      process.exitCode = 1;
      break;
    }
  }
  if (aplicadas === 0 && !process.exitCode) console.log("La base ya está al día.");
} finally {
  await client.end();
}
