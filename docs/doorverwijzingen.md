# Doorverwijzingen via de klantkaarten

**Beslissing (25 november 2026):** de NFC-kaart toont alleen het logo van de klant, met de QR-code op de achterkant. Er staat geen Salix-logo op. De site van elke klant is volledig op maat. Onderaan de site komt wel een **heel klein** linkje "Gemaakt met Salix" (EN: "Made with Salix", FR: "Créé avec Salix").

## Hoe het werkt

- Het linkje wijst naar `https://<salix-site>/?ref=<klant-id>&src=kaart`.
- De marketingsite onthoudt `ref` en `src` voor de sessie (zonder cookies) en stuurt ze mee met elk formulier. In D1 zie je ze in de kolommen `ref` en `src`.
- Zo zie je per klant hoeveel aanvragen via zijn kaart binnenkomen. Dat is de basis voor de doorverwijsbeloning (fase 3).

## In de generator (`../Salix/salix-cards`)

- `salix.config.json` → `salixUrl`: het adres van de marketingsite. Leeg = geen linkje.
  Nu: `https://salix.nabil-naits.workers.dev`. **Zodra er een eigen domein is: hier aanpassen en alle kaarten opnieuw bouwen en deployen.**
- Per klant uitzetten: `"madeWith": false` in `clients/<id>/client.json`.
- De tekst volgt `lang` van de klant (nl/en/fr).
- Stijl: klein (11 px), wat lichter, onder de copyrightregel. De CSS wordt bij het bouwen toegevoegd, omdat de template-CSS schrijfbeveiligd is.
- Back-up van de generator vóór deze wijziging: `../Salix/salix-cards-backup-2026-11-25.tgz`.

## Nog te doen (door Nabil)

- [ ] Kaarten opnieuw bouwen en deployen, één per klant: `npm run deploy -- <id>` in `salix-cards`. Niets wordt automatisch uitgerold.
- [ ] Bestaande klanten kort laten weten dat er een klein linkje onderaan komt, of het bij wie dat niet wil uitzetten met `"madeWith": false`.
