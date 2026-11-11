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

/** Honeypot (verborgen veld hp_url) ingevuld = bot. */
export function isBot(v: Velden): boolean {
  return Boolean(v.hp_url && v.hp_url.trim());
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

// ---------- Gratis voorbeeld op maat ----------

export interface VoorbeeldAanvraag {
  naam: string;
  functie: string;
  bedrijf: string | null;
  email: string;
  telefoon: string | null;
  contact_voorkeur: "email" | "whatsapp";
  website: string | null;
  wensen: string | null;
  src: string | null;
  ref: string | null;
}

export function valideerVoorbeeld(v: Velden): Resultaat<VoorbeeldAanvraag> {
  const fouten: string[] = [];
  const naam = schoon(v.naam, 120);
  const functie = schoon(v.functie, 120);
  const bedrijf = schoon(v.bedrijf, 160);
  const email = schoon(v.email, 200)?.toLowerCase() ?? null;
  const telefoon = schoon(v.telefoon, 40);
  const voorkeur = v.contact_voorkeur === "whatsapp" ? "whatsapp" : "email";
  const websiteRuw = schoon(v.website, 300);
  const wensen = schoonTekst(v.wensen, 2000);

  if (!naam) fouten.push("naam");
  if (!functie) fouten.push("functie");
  if (!email || !EMAIL.test(email)) fouten.push("email");
  if (telefoon && !/^[+0-9 ()./-]{6,40}$/.test(telefoon)) fouten.push("telefoon");
  if (voorkeur === "whatsapp" && !telefoon) fouten.push("telefoon");
  let website: string | null = null;
  if (websiteRuw) {
    try {
      const u = new URL(/^https?:\/\//i.test(websiteRuw) ? websiteRuw : `https://${websiteRuw}`);
      if (!/^https?:$/.test(u.protocol) || !u.hostname.includes(".")) throw new Error();
      website = u.toString();
    } catch {
      fouten.push("website");
    }
  }
  if (v.toestemming !== "ja") fouten.push("toestemming");

  if (fouten.length) return { ok: false, fouten: [...new Set(fouten)] };
  return {
    ok: true,
    data: {
      naam: naam!, functie: functie!, bedrijf, email: email!, telefoon,
      contact_voorkeur: voorkeur, website, wensen, src: code(v.src), ref: code(v.ref),
    },
  };
}

// ---------- Foto's ----------

export const MAX_FOTO = 8 * 1024 * 1024;
export type FotoType = "jpg" | "png" | "webp" | "heic";

/** Herkent het type aan de eerste bytes (niet aan de bestandsnaam). */
export function fotoType(b: Uint8Array): FotoType | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((x, i) => b[i] === x)) return "png";
  const ascii = (s: number, e: number) => String.fromCharCode(...b.slice(s, e));
  if (b.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  if (b.length >= 12 && ascii(4, 8) === "ftyp" && ["heic", "heix", "heif", "mif1", "msf1", "hevc"].includes(ascii(8, 12))) return "heic";
  return null;
}

export const MIME: Record<FotoType, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", heic: "image/heic" };

export function valideerFoto(grootte: number, kop: Uint8Array): Resultaat<FotoType> {
  if (!grootte) return { ok: false, fouten: ["foto"] };
  if (grootte > MAX_FOTO) return { ok: false, fouten: ["foto_groot"] };
  const t = fotoType(kop);
  if (!t) return { ok: false, fouten: ["foto_type"] };
  return { ok: true, data: t };
}
