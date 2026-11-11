// Salix API-worker. Serveert ook de statische site (site/dist) via ASSETS.
// Routes: POST /api/teams. Alles onder /api/ komt hier eerst langs (run_worker_first).

import { EmailMessage } from "cloudflare:email";
import { isBot, valideerTeams, type Velden, type TeamAanvraag } from "./validate.ts";
import { bouwMime } from "./mail.ts";

export interface Env {
  ASSETS: { fetch(req: Request): Promise<Response> };
  DB: D1Database;
  MAILER?: { send(m: EmailMessage): Promise<void> };
  RL?: { limit(o: { key: string }): Promise<{ success: boolean }> };
  MAIL_FROM?: string;
  MAIL_TO?: string;
}

// Minimale types, zodat er geen extra pakket nodig is.
interface D1Database {
  prepare(sql: string): { bind(...v: unknown[]): { run(): Promise<unknown> } };
}
interface Ctx { waitUntil(p: Promise<unknown>): void }

const MAX_BODY = 20_000;

export default {
  async fetch(req: Request, env: Env, ctx: Ctx): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/api/teams" || url.pathname === "/api/teams/") {
      if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
      return teams(req, env, ctx, url);
    }
    if (url.pathname.startsWith("/api/")) return json({ ok: false, fout: "niet_gevonden" }, 404);
    return env.ASSETS.fetch(req);
  },
};

async function teams(req: Request, env: Env, ctx: Ctx, url: URL): Promise<Response> {
  const wilJson = (req.headers.get("Accept") || "").includes("application/json");

  // Alleen formulieren van de eigen site.
  const origin = req.headers.get("Origin");
  if (origin && new URL(origin).host !== url.host) return antwoord(wilJson, 403, "herkomst");

  // Max. 5 aanvragen per minuut per IP (het IP wordt niet opgeslagen).
  const ip = req.headers.get("CF-Connecting-IP") || "onbekend";
  if (env.RL) {
    const { success } = await env.RL.limit({ key: `teams:${ip}` });
    if (!success) return antwoord(wilJson, 429, "te_veel");
  }

  const velden = await leesVelden(req);
  if (!velden) return antwoord(wilJson, 400, "ongeldig");

  // Bot: doe alsof het gelukt is, sla niets op.
  if (isBot(velden)) return gelukt(wilJson);

  const r = valideerTeams(velden);
  if (!r.ok) {
    if (wilJson) return json({ ok: false, fout: "velden", velden: r.fouten }, 422);
    return Response.redirect(new URL(`/teams/?fout=${r.fouten.join(",")}#offerte`, url).toString(), 303);
  }

  const id = crypto.randomUUID();
  const d = r.data;
  const lang = url.searchParams.get("lang") === "en" || url.searchParams.get("lang") === "fr" ? url.searchParams.get("lang") : "nl";
  try {
    await env.DB.prepare(
      `INSERT INTO leads (id, type, naam, bedrijf, email, telefoon, aantal, pakket, bericht, src, ref, lang)
       VALUES (?, 'teams', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, d.naam, d.bedrijf, d.email, d.telefoon, d.aantal, d.pakket, d.bericht, d.src, d.ref, lang).run();
  } catch (e) {
    // Bv. de migratie is niet toegepast. Niet crashen: de bezoeker krijgt een duidelijke melding.
    console.error("Opslaan in D1 mislukt", e);
    if (wilJson) return json({ ok: false, fout: "server" }, 503);
    return Response.redirect(new URL("/teams/?fout=server#offerte", url).toString(), 303);
  }

  // Mail naar Nabil. Mislukt de mail, dan blijft de aanvraag toch bewaard in D1.
  ctx.waitUntil(meld(env, url.host, id, d).catch((e) => console.error("Mail mislukt", e)));

  return gelukt(wilJson);
}

async function meld(env: Env, host: string, id: string, d: TeamAanvraag): Promise<void> {
  if (!env.MAILER || !env.MAIL_FROM || !env.MAIL_TO) return;
  const tekst = [
    `Nieuwe teamaanvraag via ${host}`,
    "",
    `Naam:     ${d.naam}`,
    `Bedrijf:  ${d.bedrijf}`,
    `E-mail:   ${d.email}`,
    `Telefoon: ${d.telefoon ?? "-"}`,
    `Aantal:   ${d.aantal}`,
    `Pakket:   ${d.pakket ?? "weet het nog niet"}`,
    `Bron:     ${d.src ?? "-"}   Ref: ${d.ref ?? "-"}`,
    "",
    d.bericht ? `Bericht:\n${d.bericht}` : "Geen bericht.",
    "",
    `Lead-id: ${id}`,
    "Antwoorden op deze mail gaat rechtstreeks naar de aanvrager.",
  ].join("\n");
  const raw = bouwMime({
    van: env.MAIL_FROM,
    vanNaam: "Salix website",
    aan: env.MAIL_TO,
    antwoordAan: d.email,
    onderwerp: `Teamaanvraag: ${d.bedrijf} (${d.aantal} personen)`,
    tekst,
    domein: env.MAIL_FROM.split("@")[1] || host,
  });
  await env.MAILER.send(new EmailMessage(env.MAIL_FROM, env.MAIL_TO, raw));
}

async function leesVelden(req: Request): Promise<Velden | null> {
  const lengte = Number(req.headers.get("Content-Length") || "0");
  if (lengte > MAX_BODY) return null;
  const type = req.headers.get("Content-Type") || "";
  try {
    if (type.includes("application/json")) {
      const o = (await req.json()) as Record<string, unknown>;
      return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === "string" ? v : String(v ?? "")]));
    }
    if (type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data")) {
      const f = await req.formData();
      const v: Velden = {};
      for (const [k, w] of f.entries()) if (typeof w === "string") v[k] = w;
      return v;
    }
  } catch {
    return null;
  }
  return null;
}

function gelukt(wilJson: boolean): Response {
  if (wilJson) return json({ ok: true }, 200);
  return new Response(null, { status: 303, headers: { Location: "/bedankt/?type=teams" } });
}

function antwoord(wilJson: boolean, status: number, fout: string): Response {
  if (wilJson) return json({ ok: false, fout }, status);
  return new Response(status === 429 ? "Te veel aanvragen. Probeer het over een minuut opnieuw." : "Aanvraag geweigerd.", {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function json(o: unknown, status: number): Response {
  return new Response(JSON.stringify(o), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
