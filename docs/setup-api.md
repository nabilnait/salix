# Formulieren aanzetten (API-worker)

De branch `feat/api-teams` bevat de worker die het teamformulier ontvangt, opslaat in D1 en je een mail stuurt.
Hij gaat pas naar `main` als onderstaande stappen gedaan zijn, anders faalt de deploy.

## 1. Domein en e-mail (Cloudflare-dashboard)

- [ ] Je domein staat op Cloudflare (nameservers bij je registrar aangepast).
- [ ] **Email Routing** staat aan: je domein → Email → Email Routing → Enable.
- [ ] Je inbox is toegevoegd als **destination address** en je klikte op de verificatielink.
      Zonder geverifieerd adres kan de worker niets sturen.

Stuur me:
- het **domein** (bv. `salix.be`), dan wordt het afzenderadres `website@<domein>`;
- het **inboxadres** waarop je de meldingen wil krijgen.

## 2. Database (Cloudflare-dashboard)

- [ ] Storage & Databases → **D1** → Create database → naam `salix` → Create.
- [ ] Kopieer de **Database ID** (een lange code) en stuur ze me. Dat is geen geheim.

De tabel maak je niet zelf: de deploy past `site/workers/api/migrations/` automatisch toe.

## 3. Deploy-instellingen (Workers & Pages → salix → Settings → Build)

| Instelling | Waarde |
|---|---|
| Root directory | leeg |
| Build command | leeg |
| Deploy command | `npx wrangler d1 migrations apply DB --remote && npx wrangler deploy` |

## 4. Daarna doe ik

- `VUL-IN` in `wrangler.jsonc` vervangen door je waarden;
- mergen naar `main`;
- een testaanvraag sturen en checken dat ze in D1 staat en dat de mail aankomt (ook in spam kijken).

## Hoe het formulier beschermd is

Honeypot-veld, Origin-check, max. 5 aanvragen per minuut per IP, validatie in de browser én op de server,
max. 20 KB per aanvraag. IP-adressen worden niet opgeslagen. Werkt ook zonder JavaScript
(gewone formulierpost, daarna naar `/bedankt/`).
