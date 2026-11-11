import { test } from "node:test";
import assert from "node:assert/strict";
import { valideerVoorbeeld, valideerFoto, fotoType, MAX_FOTO } from "../src/validate.ts";

const goed = { naam: "Sara Peeters", functie: "Interieurarchitect", email: "sara@voorbeeld.be", toestemming: "ja", website: "studio-sara.be" };
const bytes = (...x: number[]) => Uint8Array.from(x);
const tekst = (s: string) => new TextEncoder().encode(s);

test("geldige voorbeeldaanvraag", () => {
  const r = valideerVoorbeeld(goed);
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.data.website, "https://studio-sara.be/");
  assert.equal(r.data.contact_voorkeur, "email");
});

test("WhatsApp als voorkeur vraagt een telefoonnummer", () => {
  const r = valideerVoorbeeld({ ...goed, contact_voorkeur: "whatsapp" });
  assert.equal(r.ok, false);
  assert.equal(valideerVoorbeeld({ ...goed, contact_voorkeur: "whatsapp", telefoon: "+32 470 12 34 56" }).ok, true);
});

test("verplichte velden en foute website", () => {
  const r = valideerVoorbeeld({ website: "javascript:alert(1)" });
  assert.equal(r.ok, false);
  if (r.ok) return;
  for (const v of ["naam", "functie", "email", "toestemming", "website"]) assert.ok(r.fouten.includes(v), v);
});

test("fototype wordt herkend aan de inhoud", () => {
  assert.equal(fotoType(bytes(0xff, 0xd8, 0xff, 0xe0)), "jpg");
  assert.equal(fotoType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)), "png");
  assert.equal(fotoType(tekst("RIFF\u0000\u0000\u0000\u0000WEBPVP8 ")), "webp");
  assert.equal(fotoType(tekst("\u0000\u0000\u0000\u0018ftypheic")), "heic");
  assert.equal(fotoType(tekst("<svg xmlns=")), null);
  assert.equal(fotoType(tekst("%PDF-1.7")), null);
});

test("foto: leeg, te groot of verkeerd type", () => {
  const jpg = bytes(0xff, 0xd8, 0xff, 0xe0);
  assert.equal(valideerFoto(0, jpg).ok, false);
  assert.equal(valideerFoto(MAX_FOTO + 1, jpg).ok, false);
  assert.equal(valideerFoto(1000, tekst("GIF89a")).ok, false);
  assert.equal(valideerFoto(MAX_FOTO, jpg).ok, true);
});
