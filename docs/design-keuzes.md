# Design-keuzes (voorstel, toon ik in fase 2 als hero + prijzen)

## Font: Geist + Instrument Serif

| Rol | Font | Waarom |
|---|---|---|
| Tekst, knoppen, prijzen, formulieren | **Geist** (variabel, 400–600) | Modern, strak, heel leesbaar op een kleine gsm. Hetzelfde font als op de klantkaarten, dus site en product voelen als één merk. |
| Titels (H1, H2) en accenten | **Instrument Serif** (regular + italic) | Geeft het klassevolle: denk aan een metalen kaart of een goede pen. Een schreef in de titels en een strakke sans eronder is modern zonder koud te zijn. |

- Beide fonts zijn open source (SIL OFL) en worden self-hosted (geen Google Fonts, geen third-party request, past in de CSP).
- Alleen Latin + de tekens voor NL/FR (é, è, ê, ç, ë, ï, œ, €). Samen ± 60 KB.
- Cursief van Instrument Serif gebruik ik spaarzaam, voor één woord in een titel (bv. "Eén tik. Je contact staat *in hun gsm*.").
- Cijfers in de prijzen in Geist, met `tabular-nums`, zodat de bedragen netjes onder elkaar staan.

## Kleuren: zwart en wit

Overwegend wit met zwarte inkt. Zwarte vlakken voor de momenten die moeten opvallen: de hero-visual, de Signature-kolom (het anker) en de slot-CTA. Zo krijgt de pagina ritme zonder een extra kleur.

| Token | Hex | Gebruik | Contrast |
|---|---|---|---|
| `--ink` | `#0a0a0a` | tekst, zwarte vlakken, primaire knop | 19.8 : 1 op wit |
| `--paper` | `#ffffff` | achtergrond | |
| `--paper-2` | `#f5f5f4` | afwisselende secties, kaarten | |
| `--ink-2` | `#52525b` | secundaire tekst | 7.7 : 1 op wit, 7.1 : 1 op `--paper-2` |
| `--ink-3` | `#71717a` | kleine labels, alleen op wit | 4.8 : 1 (AA) |
| `--line` | `#e4e4e7` | randen en scheidingslijnen (decoratief) | |
| `--on-ink` | `#ffffff` | tekst op zwart | 19.8 : 1 |
| `--on-ink-2` | `#a1a1aa` | secundaire tekst op zwart | 7.7 : 1 |
| `--line-dark` | `#27272a` | randen op zwart (decoratief) | |

- Alle tekstcombinaties halen WCAG AA, de meeste AAA.
- Geen accentkleur. Vinkjes zijn zwart, kruisjes grijs (`--ink-3`), en "niet inbegrepen" staat er ook in tekst bij (niet alleen met kleur).
- De officiële Apple/Google Wallet-badges blijven in hun eigen zwarte versie (brand guidelines), dat past er vanzelf bij.
- De klantkaarten in de phone-mockups hebben hun eigen kleuren. Dat is goed: het toont dat elke kaart op maat is.
