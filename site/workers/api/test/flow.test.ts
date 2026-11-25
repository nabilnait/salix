// End-to-end door de worker, met nep-D1, nep-R2 en een nep-Resend (fetch).
import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.ts";

function maak(metSleutel = true) {
  const calls: { url: string; body: any }[] = [];
  globalThis.fetch = (async (u: string, o: RequestInit) => {
    calls.push({ url: String(u), body: JSON.parse(String(o.body)) });
    return new Response("{}", { status: 200 });
  }) as typeof fetch;
  const env: any = {
    ASSETS: { fetch: async () => new Response("asset") },
    DB: { prepare: () => ({ bind: () => ({ run: async () => ({}) }) }) },
    FOTOS: { put: async () => {}, delete: async () => {} },
    MAIL_FROM: "Salix website <salix@naitvision.be>",
    MAIL_TO: "info@naitvision.be",
    ...(metSleutel ? { RESEND_API_KEY: "test" } : {}),
  };
  const waits: Promise<unknown>[] = [];
  return { env, calls, waits, ctx: { waitUntil: (p: Promise<unknown>) => waits.push(p) } };
}
const team = () => new Request("https://salix.naitvision.be/api/teams", {
  method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
  body: JSON.stringify({ naam: "Sara", bedrijf: "Studio", email: "sara@voorbeeld.be", aantal: "6", toestemming: "ja" }),
});

test("teamaanvraag stuurt een melding via Resend", async () => {
  const { env, calls, waits, ctx } = maak();
  const r = await worker.fetch(team(), env, ctx);
  await Promise.all(waits);
  assert.equal(r.status, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.resend.com/emails");
  assert.equal(calls[0].body.reply_to, "sara@voorbeeld.be");
  assert.match(calls[0].body.subject, /Teamaanvraag: Studio \(6 personen\)/);
});

test("voorbeeldaanvraag: foto als bijlage, redirect in de juiste taal", async () => {
  const { env, calls, waits, ctx } = maak();
  const fd = new FormData();
  for (const [k, v] of Object.entries({ naam: "Sara", functie: "Architect", email: "sara@voorbeeld.be", toestemming: "ja" })) fd.append(k, v);
  fd.append("foto", new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3])], { type: "image/jpeg" }), "x.jpg");
  const r = await worker.fetch(new Request("https://salix.naitvision.be/api/voorbeeld?lang=fr", { method: "POST", body: fd }), env, ctx);
  await Promise.all(waits);
  assert.equal(r.status, 303);
  assert.equal(r.headers.get("location"), "/fr/bedankt-voorbeeld/");
  assert.equal(calls[0].body.attachments[0].filename, "foto-Sara.jpg");
});

test("zonder sleutel: geen mail, aanvraag lukt wel", async () => {
  const { env, calls, waits, ctx } = maak(false);
  const r = await worker.fetch(team(), env, ctx);
  await Promise.all(waits);
  assert.equal(r.status, 200);
  assert.equal(calls.length, 0);
});

test("Resend faalt: aanvraag lukt toch", async () => {
  const { env, waits, ctx } = maak();
  globalThis.fetch = (async () => new Response("kapot", { status: 500 })) as typeof fetch;
  const origErr = console.error; console.error = () => {};
  const r = await worker.fetch(team(), env, ctx);
  await Promise.all(waits);
  console.error = origErr;
  assert.equal(r.status, 200);
});
