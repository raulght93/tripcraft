# @tripcraft/worker — STUB

Backend en Cloudflare Workers + **D1 (SQL)** para "mis viajes por usuario" +
auth ligera (token de dispositivo anónimo → magic-link opcional).

Evoluciona el patrón Worker+KV ya probado en `french-basque-family-trip`
(`/worker.js`, `/api/state`) hacia SQL y cuentas. **Pendiente: Fase 2.**

Valida los documentos entrantes con `@tripcraft/schema` (`validateTrip`) antes de
persistirlos.
