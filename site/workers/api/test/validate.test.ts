import { test } from "node:test";
import assert from "node:assert/strict";
import { valideerTeams, isBot, code, schoon } from "../src/validate.ts";

const goed = {
  naam: "  Sara   Peeters ", bedrijf: "Studio Test", email: "Sara@Voorbeeld.be", telefoon: "+32 470 12 34 56",
  aantal: "6", pakket: "complete", bericht: "Hallo\r\n\r\n\r\n\r\nGraag een offerte.", toestemming: "ja",
  src: "Warm", ref: "jan<script>", hp_url: "",
};

test("geldige teamaanvraag wordt opgekuist", () => {
  const r = valideerTeams(goed);
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.data.naam, "Sara Peeters");
  assert.equal(r.data.email, "sara@voorbeeld.be");
  assert.equal(r.data.aantal, 6);
  assert.equal(r.data.pakket, "complete");
  assert.equal(r.data.bericht, "Hallo\n\nGraag een offerte.");
  assert.equal(r.data.src, "warm");
  assert.equal(r.data.ref, "janscript");
});

test("verplichte velden ontbreken", () => {
  const r = valideerTeams({});
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.deepEqual(r.fouten.sort(), ["aantal", "bedrijf", "email", "naam", "toestemming"].sort());
});

test("ongeldige waarden worden geweigerd", () => {
  for (const [veld, waarde] of [["email", "geen-mail"], ["aantal", "1"], ["aantal", "501"], ["pakket", "goud"], ["telefoon", "bel me"], ["toestemming", ""]] as const) {
    const r = valideerTeams({ ...goed, [veld]: waarde });
    assert.equal(r.ok, false, `${veld}=${waarde} zou moeten falen`);
  }
});

test("geen pakket gekozen is toegelaten", () => {
  const r = valideerTeams({ ...goed, pakket: "" });
  assert.equal(r.ok && r.data.pakket, null);
});

test("velden worden ingekort en stuurtekens verwijderd", () => {
  assert.equal(schoon("a".repeat(500), 120)?.length, 120);
  assert.equal(schoon("a\u0000b\u0007c", 10), "abc");
  assert.equal(schoon("   ", 10), null);
  assert.equal(code("!!!"), null);
});

test("honeypot herkent bots", () => {
  assert.equal(isBot({ hp_url: "http://spam" }), true);
  assert.equal(isBot({ hp_url: "  " }), false);
  assert.equal(isBot({}), false);
});
