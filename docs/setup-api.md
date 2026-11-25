# Formulieren aanzetten (API-worker)

De branch `feat/api-teams` bevat de worker die het teamformulier ontvangt en opslaat in D1.
Zolang er geen eigen domein is, komen er **geen meldingen**: je bekijkt nieuwe aanvragen in D1.
De branch gaat pas naar `main` als stap 1 en 2 gedaan zijn, anders faalt de deploy.

## 1. Database (Cloudflare-dashboard)

- [ ] Storage & Databases → **D1** → Create database → naam `salix` → Create.
- [ ] Kopieer de **Database ID** (een lange code) en stuur ze me. Dat is geen geheim.

De tabel maak je niet zelf: de deploy past `site/workers/api/migrations/` automatisch toe.

## 2. Deploy-instellingen (Workers & Pages → salix → Settings → Build)

| Instelling | Waarde |
|---|---|
| Root directory | leeg |
| Build command | leeg |
| Deploy command | `npx wrangler d1 migrations apply DB --remote && npx wrangler deploy` |

## 3. Daarna doe ik

- `VUL-IN` in `wrangler.jsonc` vervangen door de Database ID;
- mergen naar `main`;
- een testaanvraag sturen en checken dat ze in D1 staat.

## Foto's voor het gratis voorbeeld (R2)

- [ ] Dashboard → **R2 Object Storage** → R2 activeren (eenmalig, vraagt een betaalkaart; gratis tot 10 GB).
- [ ] **Create bucket** → naam `salix-fotos` → locatie automatisch → Create. Laat hem **privé** (geen publieke toegang).
- [ ] Laat me weten dat het gedaan is. Dan merge ik `feat/voorbeeld` naar `main`.

Een foto bekijken: R2 → `salix-fotos` → de map `voorbeeld/`. De bestandsnaam staat in D1 in de kolom `foto_key`.

## Nieuwe aanvragen bekijken

Tot de admin-pagina er is (fase 3): Cloudflare-dashboard → Storage & Databases → D1 → `salix` → Console, en voer uit:

```sql
SELECT created_at, type, naam, functie, bedrijf, email, telefoon, contact_voorkeur,
       aantal, pakket, website, wensen, foto_key, src, ref, bericht
FROM leads WHERE status = 'nieuw' ORDER BY created_at DESC;
```

Een aanvraag als behandeld markeren:

```sql
UPDATE leads SET status = 'preview_verstuurd' WHERE email = 'naam@voorbeeld.be';
```

## Mailmeldingen (Resend)

Bij elke teamaanvraag en elk gratis voorbeeld krijg je een mail op `info@naitvision.be`, van `salix@naitvision.be`.
Antwoorden gaat rechtstreeks naar de aanvrager. Bij een voorbeeld zit de portretfoto als bijlage.

Eenmalig instellen:
- [ ] In Resend: controleer dat **naitvision.be** bij Domains op *Verified* staat (dat is zo als je naitvision-site al via Resend mailt).
- [ ] In Resend: API Keys → **Create API key** → naam `salix-worker`, permission **Sending access**, domein `naitvision.be`.
- [ ] In Cloudflare: Workers & Pages → **salix** → Settings → **Variables and Secrets** → Add →
      type **Secret**, naam `RESEND_API_KEY`, waarde = de sleutel → Deploy/Save.
      Plak de sleutel **nergens anders** (niet in de chat, niet in de repo).

Zonder sleutel verstuurt de worker niets; aanvragen worden altijd bewaard in D1.
Lukt een mail niet, dan zie je dat in Cloudflare → salix → **Logs** ("Melding mislukt").

## Hoe het formulier beschermd is

Honeypot-veld, Origin-check, max. 5 aanvragen per minuut per IP, validatie in de browser én op de server,
max. 20 KB per aanvraag. IP-adressen worden niet opgeslagen. Werkt ook zonder JavaScript
(gewone formulierpost, daarna naar `/bedankt/`).
