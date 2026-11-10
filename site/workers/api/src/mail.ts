// Een eenvoudige tekstmail (MIME) opbouwen voor Cloudflare Email Routing. Puur, dus testbaar.

export interface Mail {
  van: string;
  vanNaam?: string;
  aan: string;
  antwoordAan?: string | null;
  onderwerp: string;
  tekst: string;
  domein: string; // voor de Message-ID
  datum?: Date;
  id?: string;
}

/** RFC 2047: niet-ASCII in headers als UTF-8 base64. */
export function header(s: string): string {
  const schoon = s.replace(/[\r\n]+/g, " ");
  if (/^[\x20-\x7E]*$/.test(schoon)) return schoon;
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(schoon)));
  return `=?UTF-8?B?${b64}?=`;
}

/** Een adres veilig in een header zetten (geen regeleinden, geen < of >). */
function adres(a: string): string {
  const s = a.replace(/[\r\n<>]/g, "").trim();
  if (!/^[^\s@]+@[^\s@]+$/.test(s)) throw new Error("Ongeldig e-mailadres in header");
  return s;
}

/** Body als base64, in regels van 76 tekens. */
function body(tekst: string): string {
  const bytes = new TextEncoder().encode(tekst.replace(/\r?\n/g, "\r\n"));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return (btoa(bin).match(/.{1,76}/g) ?? []).join("\r\n");
}

export function bouwMime(m: Mail): string {
  const datum = (m.datum ?? new Date()).toUTCString().replace("GMT", "+0000");
  const id = m.id ?? crypto.randomUUID();
  const regels = [
    `From: ${m.vanNaam ? `${header(m.vanNaam)} <${adres(m.van)}>` : adres(m.van)}`,
    `To: ${adres(m.aan)}`,
    ...(m.antwoordAan ? [`Reply-To: ${adres(m.antwoordAan)}`] : []),
    `Subject: ${header(m.onderwerp)}`,
    `Date: ${datum}`,
    `Message-ID: <${id}@${m.domein}>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    body(m.tekst),
    "",
  ];
  return regels.join("\r\n");
}
