// Meldingen per e-mail via Resend (https://resend.com/docs/api-reference/emails/send-email).
// Puur opgebouwd (testbaar); de fetch gebeurt in stuur().

export interface Bijlage { naam: string; inhoud: ArrayBuffer }

export interface Melding {
  van: string;            // bv. "SalixCards website <salix@naitvision.be>" (domein moet geverifieerd zijn in Resend)
  aan: string;
  antwoordAan?: string | null;
  onderwerp: string;
  tekst: string;
  bijlagen?: Bijlage[];
}

const geenRegeleinden = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

function base64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

export function resendBody(m: Melding): Record<string, unknown> {
  const body: Record<string, unknown> = {
    from: geenRegeleinden(m.van),
    to: [geenRegeleinden(m.aan)],
    subject: geenRegeleinden(m.onderwerp).slice(0, 200),
    text: m.tekst,
  };
  if (m.antwoordAan) body.reply_to = geenRegeleinden(m.antwoordAan);
  if (m.bijlagen?.length) {
    body.attachments = m.bijlagen.map((b) => ({
      filename: geenRegeleinden(b.naam).replace(/[^\w.-]/g, "_"),
      content: base64(b.inhoud),
    }));
  }
  return body;
}

export async function stuur(apiKey: string, m: Melding): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(resendBody(m)),
  });
  const antwoord = (await res.text()).slice(0, 300);
  if (!res.ok) throw new Error(`Resend ${res.status}: ${antwoord}`);
  console.log(`Melding verstuurd via Resend: ${antwoord}`);
}
