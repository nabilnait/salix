import { test } from "node:test";
import assert from "node:assert/strict";
import { resendBody } from "../src/resend.ts";

const basis = { van: "SalixCards website <salix@naitvision.be>", aan: "info@naitvision.be", onderwerp: "Teamaanvraag: Café Één", tekst: "Regel 1\nRegel 2" };

test("velden voor Resend", () => {
  const b = resendBody({ ...basis, antwoordAan: "klant@voorbeeld.be" });
  assert.equal(b.from, "SalixCards website <salix@naitvision.be>");
  assert.deepEqual(b.to, ["info@naitvision.be"]);
  assert.equal(b.reply_to, "klant@voorbeeld.be");
  assert.equal(b.subject, "Teamaanvraag: Café Één");
  assert.equal(b.text, "Regel 1\nRegel 2");
  assert.equal("attachments" in b, false);
});

test("geen regeleinden in onderwerp of adressen", () => {
  const b = resendBody({ ...basis, onderwerp: "A\r\nBcc: x@y.z", antwoordAan: "a@b.c\nBcc: x@y.z" });
  assert.equal(b.subject, "A Bcc: x@y.z");
  assert.ok(!String(b.reply_to).includes("\n"));
});

test("bijlage als base64 met veilige bestandsnaam", () => {
  const inhoud = new TextEncoder().encode("foto").buffer as ArrayBuffer;
  const b = resendBody({ ...basis, bijlagen: [{ naam: "mijn foto (1).jpg", inhoud }] });
  const a = (b.attachments as { filename: string; content: string }[])[0];
  assert.equal(a.filename, "mijn_foto__1_.jpg");
  assert.equal(atob(a.content), "foto");
});

test("grote bijlage (8 MB) gaat zonder stack overflow", () => {
  const inhoud = new Uint8Array(8 * 1024 * 1024).fill(65).buffer as ArrayBuffer;
  const b = resendBody({ ...basis, bijlagen: [{ naam: "groot.jpg", inhoud }] });
  assert.ok(String((b.attachments as { content: string }[])[0].content).length > 10_000_000);
});
