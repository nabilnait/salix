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

## Nieuwe aanvragen bekijken

Tot de admin-pagina er is (fase 3): Cloudflare-dashboard → Storage & Databases → D1 → `salix` → Console, en voer uit:

```sql
SELECT created_at, naam, bedrijf, email, telefoon, aantal, pakket, src, ref, bericht
FROM leads WHERE status = 'nieuw' ORDER BY created_at DESC;
```

Een aanvraag als behandeld markeren:

```sql
UPDATE leads SET status = 'preview_verstuurd' WHERE email = 'naam@voorbeeld.be';
```

## Later: mailmeldingen (zodra er een domein is)

- [ ] Domein op Cloudflare, **Email Routing** aan, je inbox toegevoegd en geverifieerd.
- [ ] Stuur me het domein en het inboxadres. Ik zet `send_email` en `MAIL_FROM`/`MAIL_TO` terug in `wrangler.jsonc`;
      de code voor de mail staat al klaar en is getest.

## Hoe het formulier beschermd is

Honeypot-veld, Origin-check, max. 5 aanvragen per minuut per IP, validatie in de browser én op de server,
max. 20 KB per aanvraag. IP-adressen worden niet opgeslagen. Werkt ook zonder JavaScript
(gewone formulierpost, daarna naar `/bedankt/`).
