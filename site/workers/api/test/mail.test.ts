import { test } from "node:test";
import assert from "node:assert/strict";
import { bouwMime, header } from "../src/mail.ts";

const basis = {
  van: "website@salix.test", vanNaam: "Salix website", aan: "inbox@salix.test", antwoordAan: "klant@voorbeeld.be",
  onderwerp: "Teamaanvraag: Café Één (6 personen)", tekst: "Regel 1\nRegel 2 met é", domein: "salix.test",
  datum: new Date("2026-11-11T10:00:00Z"), id: "vast-id",
};

test("headers kloppen en niet-ASCII wordt gecodeerd", () => {
  const m = bouwMime(basis);
  assert.match(m, /^From: Salix website <website@salix\.test>\r\n/);
  assert.match(m, /\r\nTo: inbox@salix\.test\r\n/);
  assert.match(m, /\r\nReply-To: klant@voorbeeld\.be\r\n/);
  assert.match(m, /\r\nSubject: =\?UTF-8\?B\?[A-Za-z0-9+/=]+\?=\r\n/);
  assert.match(m, /\r\nMessage-ID: <vast-id@salix\.test>\r\n/);
  assert.match(m, /\r\nContent-Transfer-Encoding: base64\r\n\r\n/);
});

test("body decodeert terug naar de tekst", () => {
  const m = bouwMime(basis);
  const b64 = m.split("\r\n\r\n")[1].replace(/\r\n/g, "");
  const tekst = new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
  assert.equal(tekst, "Regel 1\r\nRegel 2 met é");
});

test("geen header-injectie via onderwerp of adres", () => {
  assert.equal(header("Hallo\r\nBcc: x@y.z"), "Hallo Bcc: x@y.z");
  assert.throws(() => bouwMime({ ...basis, antwoordAan: "a@b.c\r\nBcc: x@y.z" }));
  assert.ok(!bouwMime({ ...basis, onderwerp: "A\r\nBcc: x@y.z" }).includes("\r\nBcc:"));
});
