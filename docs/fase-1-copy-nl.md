# Salix: NL-copy voor review (fase 1)

Status: **concept**, nog niets bevestigd.

Hoe je dit leest:
- `{{prijs:complete}}` en dergelijke worden bij de build ingevuld uit `site/config/offers.json`. In de copy staat geen enkel bedrag hard.
- `{{plaatsen}}` komt uit `site/config/capacity.json`. Is die leeg, dan valt de zin met het aantal weg en blijft alleen "Ik maak maar een beperkt aantal kaarten per week."
- **[BEVESTIGEN: …]** = dit moet jij beslissen of nakijken voor het live gaat.
- Per sectie staat erbij welke van de vier waardehefbomen ze versterkt: *droom* (droomresultaat), *kans* (kans dat het lukt), *tijd* (tijd tot resultaat), *moeite*.

---

## A. Home (`/`)

### 1. Nav
- Logo: Salix
- Links: Zo werkt het · Prijzen · Voor teams · FAQ
- Taal: NL · EN · FR
- Knop: **Gratis Wallet-kaart**

### 2. Hero · *droom, kans, moeite*
- Badge: **60+ professionals gingen je voor**
- H1: **Eén tik. Je contact staat in hun gsm.**
  - Alternatief 1: *Hou je papieren kaartje. Of geef ze je contact in één tik.*
  - Alternatief 2: *Ze vergeten je niet meer. Ze hebben je al in hun gsm.*
- Subkop: Je visitekaartje als persoonlijke mini-site, met een NFC-kaart erbij. Jij stuurt een foto en drie zinnen, ik maak de rest.
- Primaire CTA: **Scan je visitekaartje, gratis in 1 minuut**
  - Microtekst onder de knop: Je krijgt meteen een Wallet-kaart voor je iPhone of Android.
- Secundaire CTA: **Direct bestellen**
- Visual: gsm met een echte Salix-kaart + een NFC-kaart die tegen de gsm tikt.

### 3. Bewijsstrip · *kans*
- Kop (klein): Ze tikken al met Salix
- Inhoud: logo's/namen uit `config/proof.json`. **Leeg = sectie weg.** [BEVESTIGEN: welke klanten akkoord gaven om genoemd te worden]

### 4. Probleem → oplossing · *droom*
- Eyebrow: Het probleem
- H2: **Je papieren kaartje belandt in een la.**
- Drie kaartjes, links "Zo gaat het nu", rechts "Met Salix":

| Zo gaat het nu | Met Salix |
|---|---|
| Je kaartje verdwijnt in een jaszak of de vuilbak. | Je contact staat meteen in hun gsm, met je foto erbij. |
| Je nummer wordt verkeerd overgetypt, of helemaal niet. | Niemand typt iets over. Eén tik op "Contact opslaan". |
| Nieuw nummer of nieuwe functie? Opnieuw drukken. | Ik pas je kaart aan. Je kaart en link blijven werken. |

### 5. Zo werkt het · *moeite, tijd*
- Eyebrow: Zo werkt het
- H2: **Drie stappen. Jij doet er één.**
1. **Scan je papieren kaartje.** Maak een foto. Je gegevens worden uitgelezen, jij controleert ze, en je krijgt meteen een gratis Wallet-kaart.
2. **Bekijk je voorbeeld op maat.** Binnen 48 uur maak ik je kaart in je eigen stijl. Je betaalt pas als je het goedkeurt.
3. **Ontvang je NFC-kaart en tik.** Binnen {{levering}} werkdagen bij je thuis. Eén tik op een gsm en je contact staat erin.
- CTA: **Scan je visitekaartje, gratis in 1 minuut** · Direct bestellen

> Opmerking: in stap 3 hangt "{{levering}}" af van de levertijd in `offers.json`. [BEVESTIGEN: levertijd]

### 6. Voorbeelden · *kans*
- Eyebrow: Voorbeelden
- H2: **Echte kaarten van echte klanten.**
- Sub: Tik op een kaart om hem live te bekijken.
- 3 tot 6 klantkaarten in gsm-frames, elk met naam + functie. [BEVESTIGEN: welke klanten toestemming geven; nu gekend: Hasan (FLAi), Naitvision, FPD, Hotel Zuid]

### 7. Wat zit erin · *droom, moeite*
- Eyebrow: Op je kaart
- H2: **Alles wat iemand na een eerste gesprek nodig heeft.**
- Zes kaartjes (één keer op de pagina, nergens herhaald):
  - **Contact opslaan, met foto.** Je naam, nummer, functie en foto komen in één keer in hun contacten.
  - **WhatsApp in één tik.** Ze sturen je meteen een bericht, zonder je nummer op te slaan.
  - **Delen via QR.** Geen gsm bij de hand? Ze scannen gewoon je code.
  - **In je Wallet.** Je kaart staat naast je bankkaart. Altijd bij de hand, ook zonder internet.
  - **Aanpassingen inbegrepen.** Nieuw nummer of nieuwe functie? Stuur het door, ik pas het aan.
  - **Geen app nodig.** Werkt op elke iPhone en Android. De ander hoeft niets te installeren.

### 8. Prijzen · *kans, droom*
- Eyebrow: Prijzen
- H2: **Eén keer betalen. Geen abonnement.**
- Sub: Kies wat je wil geven: een kaart, of alles om je contact te delen. De prijs die je ziet, is de prijs die je betaalt.

Drie kolommen, in deze volgorde (op gsm onder elkaar, Signature bovenaan):

**Signature · {{prijs:signature}}**
Alles, in metaal. Voor wie wil opvallen.
- ✓ Contactsite op maat
- ✓ Wallet-kaart
- ✓ NFC-kaart in **metaal**
- ✓ **Premium** NFC-pen
- ✓ NFC-sleutelhanger met je logo
- ✓ Je kaart op je eigen domein
- ✓ {{updates:signature}} gratis aanpassingen
- Knop: **Kies Signature**

**Complete set · {{prijs:complete}}** · badge *Aanrader*
Je kaart, pen en sleutelhanger. Je contact altijd bij de hand.
- ✓ Contactsite op maat
- ✓ Wallet-kaart
- ✓ NFC-kaart in PVC
- ✓ NFC-pen
- ✓ NFC-sleutelhanger met je logo
- ✗ Eigen domein (+{{prijs:upsell.eigen_domein}})
- ✓ {{updates:complete}} gratis aanpassingen
- Knop: **Kies de Complete set**

**Essentials · {{prijs:essentials}}**
Je contactsite en een tik-kaart.
- ✓ Contactsite op maat
- ✓ Wallet-kaart
- ✓ NFC-kaart in PVC
- ✗ NFC-pen
- ✗ Sleutelhanger
- ✗ Eigen domein (+{{prijs:upsell.eigen_domein}})
- ✓ {{updates:essentials}} gratis aanpassingen
- Knop: **Kies Essentials**

Onder de tabel:
- **Voor je team:** 4 kaarten = de 5e gratis. [Vraag een offerte →](/teams)
- Capaciteit: Ik maak maar een beperkt aantal kaarten per week. Nog {{plaatsen}} plaatsen deze week.
- Twijfel je nog? **Scan eerst gratis je visitekaartje** (link naar `/gratis`).

> Badge "Aanrader" in plaats van "Meest gekozen": dat laatste is pas waar als de Complete set effectief het meest verkocht is. Dan mag het.

### 9. Garantie · *kans*
- H2: **Je loopt geen risico.**
- **Eerst zien, dan maken.** Je ziet je ontwerp altijd vóór je kaart gemaakt wordt. Via het gratis voorbeeld betaal je pas als je het goedkeurt. Bestel je direct, dan pas ik je ontwerp aan tot het klopt, en pas dan maak ik je kaart.
- **30 dagen om te tikken.** Klopt er iets niet binnen 30 dagen na levering? Ik pas het kosteloos aan.
- **Een jaar op je chip.** Werkt je NFC-kaart niet binnen 12 maanden, dan krijg je gratis een nieuwe.
- (Voorlopig, uit `offers.json` → `garantie`.)

### 10. Testimonials · *kans*
- Eyebrow: Klanten
- H2: **Wat klanten zeggen.**
- Alleen uit `config/testimonials.json`, met `toestemming: true`. **Leeg = sectie weg.** Er staan er nu geen. [BEVESTIGEN: vraag 3 klanten om een quote + foto]

### 11. FAQ
- Eyebrow: FAQ
- H2: **Veelgestelde vragen**

**Werkt het op een iPhone?**
Ja. Tik met je kaart op de bovenkant van een iPhone (XS of nieuwer) en er verschijnt een melding. Oudere iPhones scannen gewoon de QR-code. [BEVESTIGEN: klopt dit voor jullie chip?]

**Heb ik of de ander een app nodig?**
Nee. Je kaart opent in de browser van elke iPhone en Android.

**Wat als mijn gegevens veranderen?**
Stuur me de wijziging. Ik pas je kaart aan en je kaart, link en QR-code blijven werken. {{updates:complete}} aanpassingen zijn inbegrepen. [BEVESTIGEN: aantal, en de prijs van extra aanpassingen]

**Hoe lang duurt het?**
Je gratis Wallet-kaart heb je binnen een minuut. Je voorbeeld op maat binnen 48 uur. Na je goedkeuring heb je je NFC-kaart binnen {{levering}} werkdagen.

**Kan ik mijn eigen domein gebruiken?**
Ja, bijvoorbeeld `naam.jouwbedrijf.be`. Dat zit in Signature en kan bij de andere pakketten voor +{{prijs:upsell.eigen_domein}}. Het domein blijft van jou. Zonder eigen domein staat je kaart op `{{domein}}/jouw-naam`.

**Wat gebeurt er met mijn gegevens?**
De foto van je papieren kaartje wordt verwijderd zodra je gegevens zijn uitgelezen. Er staan geen cookies of trackers op je kaart. Je kan je gratis kaart en je gegevens altijd zelf verwijderen via de link in je mail. Meer in de [privacyverklaring](/privacy).

**Kan ik mijn bestelling herroepen?**
Je kaart wordt op maat voor jou gemaakt. Daarom geldt het herroepingsrecht van 14 dagen niet. Daarom krijg je eerst een voorbeeld en betaal je pas als je het goedkeurt. [BEVESTIGEN: juridisch nakijken, ook voor bestellingen zonder voorbeeld]

**Kan ik bestellen voor mijn team?**
Ja. Voor 4 kaarten krijg je de 5e gratis, en vanaf 5 stuks betaal je de helft nu en de helft bij levering. [Vraag een offerte →](/teams)

### 12. Slot-CTA · *droom, tijd*
- H2: **Je volgende contact hoeft je nummer niet over te typen.**
- Sub: Begin gratis met je Wallet-kaart. Ik maak maar een beperkt aantal kaarten per week. Nog {{plaatsen}} plaatsen deze week.
- CTA: **Scan je visitekaartje, gratis in 1 minuut** · Direct bestellen

### 13. Footer
- Salix · Digitale visitekaartjes met een NFC-kaart
- Contact: {{email}} · WhatsApp
- Privacy · Voorwaarden
- NL · EN · FR
- Instagram · LinkedIn [BEVESTIGEN: links]
- {{bedrijfsnaam}} · {{adres}} · Ondernemingsnummer {{kbo}} · Bijzondere vrijstellingsregeling kleine ondernemingen [BEVESTIGEN: naam, adres en nummer zijn wettelijk verplicht]

---

## B. Ads-landingspagina (`/start`)

Geen nav, alleen het logo (niet klikbaar). Eén CTA: de gratis Wallet-kaart.

1. **Hero**
   - Badge: 60+ professionals gingen je voor
   - H1: **Eén tik. Je contact staat in hun gsm.**
   - Sub: Scan je papieren visitekaartje en krijg gratis een digitale versie in je Wallet. In 1 minuut, zonder app.
   - CTA: **Scan je visitekaartje, gratis**
2. **Zo werkt het** (zelfde drie stappen als op home, korter)
   1. Foto van je kaartje
   2. Gegevens controleren
   3. Je Wallet-kaart staat op je gsm
3. **Voorbeelden**: 3 echte klantkaarten.
4. **Wil je meer?** (prijzen, compact)
   - Kop: Na je gratis kaart kan je upgraden naar een kaart op maat, met een NFC-kaart erbij.
   - Eén rij: Signature {{prijs:signature}} · Complete set {{prijs:complete}} · Essentials {{prijs:essentials}}, zonder knoppen. Dit is info, geen tweede CTA.
5. **FAQ** (3 vragen): Werkt het op iPhone? · Heb ik een app nodig? · Wat gebeurt er met mijn gegevens?
6. **Slot**: H2 *Probeer het gratis. Het duurt 1 minuut.* · CTA **Scan je visitekaartje, gratis**

---

## C. Bestellen (`/bestel`)

Opent vooringevuld met `?pakket=` en `?lead=`. Komt de bezoeker via een goedgekeurd voorbeeld (`?lead=`), dan staat bovenaan: "Je voorbeeld is goedgekeurd. Nog één stap."

### Stap 1 · Kies je pakket
- H1: **Kies je pakket**
- Sub: Eén keer betalen, geen abonnement.
- Drie kaarten (Signature eerst, Complete set gemarkeerd, Essentials), elk met de prijs en de 3 belangrijkste verschillen. Link "Vergelijk alles" opent de volledige tabel.

### Stap 2 · Maak het compleet (upsells, niets vooraf aangevinkt)
- ☐ **Metalen kaart in plaats van PVC** · +{{prijs:upsell.metaal}}
  *Zwaarder, en mensen onthouden hem.* (niet bij Signature, die is al metaal)
- ☐ **Je kaart op je eigen domein** · +{{prijs:upsell.eigen_domein}}
  *Bijvoorbeeld naam.jouwbedrijf.be. Het domein blijft van jou.* (niet bij Signature, die heeft het al)
- ☐ **Extra kaart voor een collega** · −20% · aantal [1–3]
  *Zelfde pakket, eigen kaart en eigen site.*
- Info bij 4 of meer: "Bestel je voor 5 of meer mensen? Dan krijg je de 5e gratis en kan je in twee keer betalen. [Vraag een teamofferte →](/teams)"

### Stap 3 · Overzicht
- Pakket + gekozen extra's, elk met prijs
- Doorverwijscode (vooringevuld als je via `?ref=` kwam): "Korting van {{prijs:referral.vriend}} via {{ref-naam}}"
- **Totaal: {{totaal}}**
- Klein, onder het totaal: Geen btw: bijzondere vrijstellingsregeling kleine ondernemingen.
- Betalen met Bancontact, kaart, Apple Pay of Google Pay.
- Knop: **Naar betalen**
- Onder de knop: Je wordt doorgestuurd naar Stripe om veilig te betalen. Je kaart wordt op maat gemaakt: na betaling geldt het herroepingsrecht niet. [BEVESTIGEN: juridisch]

### Downsell (alleen bij afhaken, één keer)
Verschijnt als iemand terugkomt van de Stripe-checkout zonder te betalen, of "te duur" aanvinkt in een formulier. Daarna nooit meer.

- Kop: **Liever eerst zonder kaart?**
- Tekst: Met **Digitaal op maat** krijg je je contactsite in je eigen stijl, met foto, diensten en contactformulier, en je Wallet-kaart die ernaar linkt. Zonder fysieke kaart, voor {{prijs:digitaal}}. Een NFC-kaart kan je later altijd nog toevoegen.
- Knoppen: **Kies Digitaal op maat** · Nee, bedankt

> Wat het verschil met de gratis versie zichtbaar maakt: eigen stijl, portretfoto, diensten, formulier, geen Salix-branding bovenaan.

---

## D. Wat voorlopig is ingevuld (alles achteraf aan te passen in `site/config/`)

| Punt | Status | Waarde |
|---|---|---|
| Btw | ✅ bevestigd | Vrijgesteld, geen btw. Let op de drempel van € 25.000 omzet per jaar. |
| Kleuren en font | ✅ bevestigd | Zwart-wit, Geist + Instrument Serif (`docs/design-keuzes.md`) |
| Upsells | ✅ bevestigd | Metaal +€40, eigen domein +€25, extra collega −20% |
| Wallet-kaart | voorlopig | In **alle** pakketten, ook Essentials |
| Badge | voorlopig | "Aanrader" bij de Complete set |
| Gratis aanpassingen | voorlopig | Essentials 2, Complete 3, Signature 5, Digitaal 2, in de eerste 12 maanden. Extra: €15 per aanpassing |
| Levertijd | voorlopig | 5–7 werkdagen na goedkeuring |
| Garantie | voorlopig | Zie §9: eerst zien, 30 dagen aanpassingen, 12 maanden op de chip |
| Referral | voorlopig | Vriend €10 korting, doorverwijzer €10 terug of een gratis sleutelhanger |
| Rollover | voorlopig | Binnen 30 dagen naar Signature, de betaalde prijs gaat er volledig af |
| Eigen domein | voorlopig | De klant bezit het domein, jij koppelt het één keer (geen jaarlijkse kost voor jou) |
| Kostprijzen | **schatting** | Intern, nooit op de site. Vervang ze door je echte inkoopprijzen. |
| Plaatsen per week | voorlopig | 10. Het aantal **vrije** plaatsen blijft leeg tot jij het invult: de site toont nooit een verzonnen getal. |

### Money Model-check met de geschatte kostprijzen

| Pakket | Prijs | Geschatte kost | Brutowinst |
|---|---|---|---|
| Signature | €199 | €49 | €150 |
| Complete set | €125 | €22 | €103 |
| Essentials | €75 | €7,50 | €67,50 |
| Digitaal op maat | €39 | €0 | €39 |

Je tijd zit hier niet in. Reken op ± 1–2 uur per kaart op maat: dat is je echte kost, en de reden dat de capaciteit beperkt is.

### Nog nodig voor livegang (niet te verzinnen)
- **Domeinnaam** van Salix (`site.json` → `domein`)
- **Juridische gegevens**: naam, adres en ondernemingsnummer (wettelijk verplicht)
- **Contact**: e-mail, WhatsApp, links naar Instagram en LinkedIn
- **Klanten die toestemming geven** voor de voorbeelden, de bewijsstrip en de testimonials
