# Fase 1b: accounts aanmaken (start nu, er zit wachttijd op)

Deze stappen moet je zelf doen: ze vragen je identiteit, betaalgegevens of bedrijfsgegevens. Stuur me daarna alleen wat onder **"Wat ik van je nodig heb"** staat, en **nooit** wachtwoorden, certificaten of sleutels in de chat. Die zetten we later samen als Cloudflare-secret.

## 1. Apple Developer Program (± €99/jaar)

**Eerst kiezen: individu of organisatie?**
- **Individu** (eenmanszaak): sneller, je naam staat als "verkoper". Voor Wallet-passes maakt dat weinig uit: de naam op de pass kies je zelf.
- **Organisatie** (bv. BV): je hebt een gratis **D-U-N-S-nummer** nodig. Dat aanvragen kan tot ± 2 weken duren. Doe dat dan meteen.

**Stappen**
- [ ] Apple-ID met tweestapsverificatie aan (verplicht).
- [ ] Inschrijven op developer.apple.com/programs/enroll (bij voorkeur via de Apple Developer-app op je iPhone, dat gaat meestal sneller).
- [ ] Betalen en wachten op de bevestiging (meestal 1–2 dagen, soms langer).
- [ ] Na goedkeuring: Certificates, Identifiers & Profiles → Identifiers → **Pass Type IDs** → nieuwe ID, bv. `pass.<jouwdomein>.salix`.
- [ ] Het certificaat voor die Pass Type ID maken we **samen** in fase 2 (je maakt een CSR op je Mac, uploadt hem, downloadt het certificaat en exporteert een `.p12`). Niet vooraf doen: dan weet je zeker dat het bestand nergens rondslingert.

**Wat ik van je nodig heb**
- Je **Team ID** (10 tekens, staat onder Membership).
- De **Pass Type ID** die je koos.

## 2. Google Wallet (gratis)

**Stappen**
- [ ] Ga naar de **Google Pay & Wallet Console** (pay.google.com/business/console) met het Google-account dat je zakelijk wil gebruiken.
- [ ] Vul het **bedrijfsprofiel volledig** in (naam, adres, website, contact). Dit is nodig om later publishing access te krijgen.
- [ ] Kies **Google Wallet API** → maak een **issuer account** aan. Noteer de **Issuer ID**.
- [ ] Maak in **Google Cloud Console** een project (bv. `salix-wallet`) en zet de **Google Wallet API** aan.
- [ ] Maak een **service account** in dat project. Een sleutel (JSON) downloaden doen we samen in fase 2, om dezelfde reden als bij Apple.
- [ ] Voeg in de Wallet Console → **Users** het e-mailadres van dat service account toe als **Developer**.
- [ ] Voeg je eigen Google-account (en dat van je testtoestel) toe als **testgebruiker**.

**Goed om te weten**
- Een nieuw account staat in **demo mode**. Passes werken dan alleen voor testaccounts en tonen "[TEST ONLY]".
- **Publishing access** vraag je aan in de console. Daarvoor heb je nodig: een volledig bedrijfsprofiel, minstens één pass-class en screenshots van de pass. Die class en screenshots maken we in de spike van fase 2, daarna dien je de aanvraag in. Google doet dan een review (reken op enkele dagen tot een paar weken).

**Wat ik van je nodig heb**
- Je **Issuer ID**.
- Het **e-mailadres van het service account** (geen sleutel).

## 3. Ook nu al starten (voor later, maar er zit wachttijd op)

- [ ] **Stripe-account** (fase 3): KBO-nummer, bankrekening, identiteitscontrole. Zet **Bancontact** aan bij Payment methods. Testmodus werkt meteen, livebetalingen pas na de verificatie.
- [ ] **Anthropic API-sleutel** (voor de scan van het papieren kaartje): maak een account op console.anthropic.com en stel meteen een **maandelijkse uitgavelimiet** in. Hoeveel budget per maand wil je? [BEVESTIGEN]
- [ ] **Domein op Cloudflare**: staat het Salix-domein al op Cloudflare (nameservers)? Zo niet, zet het erop, dan kan de site er later meteen op.
- [ ] **GitHub**: in welke repo bouw ik? De map `Salix_app` is leeg en is geen git-repo, en `../Salix/` ook niet. Geef me de URL van de Salix-repo, of zeg dat ik er een nieuwe mag maken.
