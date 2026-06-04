import assert from "node:assert/strict";
// Bandera derivada del código ISO (§5 de la review) — sin tabla de mantenimiento.
import { test } from "node:test";
import { displayFlag, flagFromIso } from "../src/index.ts";

test("flagFromIso deriva la bandera del código ISO", () => {
  assert.equal(flagFromIso("KE"), "🇰🇪");
  assert.equal(flagFromIso("za"), "🇿🇦"); // insensible a mayúsculas
  assert.equal(flagFromIso("XXX"), ""); // inválido → ""
});

test("displayFlag: país único, multi-país y override de salto", () => {
  assert.equal(displayFlag({ country: "TZ" }), "🇹🇿");
  assert.equal(displayFlag({ country: ["ZM", "ZW"] }), "🇿🇲🇿🇼");
  assert.equal(displayFlag({ flag: "⏭️" }), "⏭️"); // override sin país
  assert.equal(displayFlag({ flag: "⏭️", country: "KE" }), "⏭️"); // override gana
  assert.equal(displayFlag({}), "");
});
