// Validatie van formulierinvoer. Puur (geen Workers-API's), zodat het lokaal te testen is.

export type Velden = Record<string, string>;

export interface TeamAanvraag {
  naam: string;
  bedrijf: string;
  email: string;
  telefoon: string | null;
  aantal: number;
  pakket: "signature" | "complete" | "essentials" | null;
  bericht: string | null;
  src: string | null;
  ref: string | null;
}

export type Resultaat<T> = { ok: true; data: T } | { ok: false; fouten: string[] };

const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
const PAKKETTEN = new Set(["signature", "complete", "essentials"]);

/** Spaties opkuisen, stuurtekens weg, inkorten. Leeg wordt null. */
export function schoon(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const s = v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim();
  return s ? s.slice(0, max) : null;
}

/** Zelfde als schoon(), maar regeleinden blijven (voor berichten). */
export function schoonTekst(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const s = v.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/\n{3,}/g, "\n\n").trim();
  return s ? s.slice(0, max) : null;
}

/** Code voor src/ref: alleen letters, cijfers, - en _. */
export function code(v: unknown): string | null {
  const s = schoon(v, 80);
  if (!s) return null;
  const c = s.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return c || null;
}

/** Honeypot ingevuld = bot. */
export function isBot(v: Velden): boolean {
  return Boolean(v.website && v.website.trim());
}

export function valideerTeams(v: Velden): Resultaat<TeamAanvraag> {
  const fouten: string[] = [];
  const naam = schoon(v.naam, 120);
  const bedrijf = schoon(v.bedrijf, 160);
  const email = schoon(v.email, 200)?.toLowerCase() ?? null;
  const telefoon = schoon(v.telefoon, 40);
  const aantal = Number.parseInt(String(v.aantal ?? ""), 10);
  const pakketRuw = schoon(v.pakket, 20);
  const bericht = schoonTekst(v.bericht, 2000);

  if (!naam) fouten.push("naam");
  if (!bedrijf) fouten.push("bedrijf");
  if (!email || !EMAIL.test(email)) fouten.push("email");
  if (telefoon && !/^[+0-9 ()./-]{6,40}$/.test(telefoon)) fouten.push("telefoon");
  if (!Number.isFinite(aantal) || aantal < 2 || aantal > 500) fouten.push("aantal");
  if (pakketRuw && !PAKKETTEN.has(pakketRuw)) fouten.push("pakket");
  if (v.toestemming !== "ja") fouten.push("toestemming");

  if (fouten.length) return { ok: false, fouten };
  return {
    ok: true,
    data: {
      naam: naam!,
      bedrijf: bedrijf!,
      email: email!,
      telefoon,
      aantal,
      pakket: (pakketRuw as TeamAanvraag["pakket"]) ?? null,
      bericht,
      src: code(v.src),
      ref: code(v.ref),
    },
  };
}
