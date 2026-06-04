-- Esquema D1 para "mis viajes". Modelo: documento JSON único por viaje (columna
-- `blob` = StoredTrip serializado) + columnas indexadas para listar/ordenar sin
-- deserializar. Aplicar: wrangler d1 execute tripcraft --file=worker/schema.sql
CREATE TABLE IF NOT EXISTS trips (
  id         TEXT PRIMARY KEY,
  owner_id   TEXT NOT NULL,
  slug       TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  blob       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_trips_owner ON trips (owner_id);
