// Puerto de almacenamiento (hexagonal): el router depende de esta interfaz, no de
// D1. Dos adaptadores: memoria (tests) y D1 (producción). Modelo: documento JSON
// único por viaje (StoredTrip) — sin normalizar.
import type { StoredTrip } from "@tripcraft/schema";

export interface TripStorage {
  list(ownerId: string): Promise<StoredTrip[]>;
  get(id: string): Promise<StoredTrip | null>;
  put(trip: StoredTrip): Promise<void>;
  remove(id: string): Promise<void>;
}

/** Adaptador en memoria — para tests y desarrollo local. */
export const createMemoryStorage = (): TripStorage => {
  const rows = new Map<string, StoredTrip>();
  return {
    async list(ownerId) {
      return [...rows.values()].filter((t) => t.ownerId === ownerId);
    },
    async get(id) {
      return rows.get(id) ?? null;
    },
    async put(trip) {
      rows.set(trip.id, trip);
    },
    async remove(id) {
      rows.delete(id);
    },
  };
};

// Forma mínima de D1 que usamos (evita depender de @cloudflare/workers-types).
export interface D1Like {
  prepare(sql: string): {
    bind(...vals: unknown[]): {
      all(): Promise<{ results: Array<{ blob: string }> }>;
      first(): Promise<{ blob: string } | null>;
      run(): Promise<unknown>;
    };
  };
}

/**
 * Adaptador D1: el StoredTrip se guarda serializado en la columna `blob`; owner_id
 * queda indexado para listar sin deserializar todo (decisión: blob + columnas clave).
 * Tabla: ver worker/schema.sql.
 */
export const createD1Storage = (db: D1Like): TripStorage => ({
  async list(ownerId) {
    const { results } = await db
      .prepare("SELECT blob FROM trips WHERE owner_id = ? ORDER BY updated_at DESC")
      .bind(ownerId)
      .all();
    return results.map((r) => JSON.parse(r.blob) as StoredTrip);
  },
  async get(id) {
    const row = await db.prepare("SELECT blob FROM trips WHERE id = ?").bind(id).first();
    return row ? (JSON.parse(row.blob) as StoredTrip) : null;
  },
  async put(trip) {
    await db
      .prepare(
        "INSERT OR REPLACE INTO trips (id, owner_id, slug, updated_at, blob) VALUES (?, ?, ?, ?, ?)",
      )
      .bind(trip.id, trip.ownerId ?? "", trip.slug, trip.updatedAt, JSON.stringify(trip))
      .run();
  },
  async remove(id) {
    await db.prepare("DELETE FROM trips WHERE id = ?").bind(id).run();
  },
});
