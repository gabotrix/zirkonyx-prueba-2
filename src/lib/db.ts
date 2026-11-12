import { Pool, type PoolClient } from "pg";

// Conexión a PostgreSQL (DATABASE_URL). Se crea al primer uso y se reutiliza;
// se guarda en globalThis para no abrir una nueva en cada recarga en desarrollo.
const global = globalThis as typeof globalThis & { poolSonrisaViva?: Pool };

function pool(): Pool {
  if (!global.poolSonrisaViva) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("Falta la variable DATABASE_URL");
    global.poolSonrisaViva = new Pool({ connectionString, max: 5 });
  }
  return global.poolSonrisaViva;
}

/** Presta una conexión para hacer consultas y la devuelve al terminar. */
export async function conConexion<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool().connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

/** Igual que conConexion, pero todo dentro de una transacción. */
export async function enTransaccion<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  return conConexion(async (c) => {
    await c.query("BEGIN");
    try {
      const resultado = await fn(c);
      await c.query("COMMIT");
      return resultado;
    } catch (error) {
      await c.query("ROLLBACK");
      throw error;
    }
  });
}
