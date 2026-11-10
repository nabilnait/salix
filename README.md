# Salix

Marketingwebsite en verkoopfunnel voor Salix: digitale visitekaartjes met een NFC-kaart erbij.

## Mappen

```
site/      marketingsite (statisch) + config + worker   (in opbouw)
  config/  offers.json (alle prijzen), capacity.json
docs/      copy en checklists voor review
```

## Werkwijze

- `main` = productie. Nooit rechtstreeks naar `main` pushen.
- Per fase of feature een branch (`feat/...`) en een pull request.
- Geen secrets en geen klantdata in deze repo.
