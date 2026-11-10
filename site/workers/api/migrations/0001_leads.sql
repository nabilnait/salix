-- Leads: aanvragen via de site (teamofferte, later ook gratis voorbeeld en Wallet-kaart).
-- Geen IP-adressen opslaan.
CREATE TABLE IF NOT EXISTS leads (
  id          TEXT PRIMARY KEY,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  type        TEXT NOT NULL CHECK (type IN ('teams', 'voorbeeld', 'wallet')),
  status      TEXT NOT NULL DEFAULT 'nieuw'
              CHECK (status IN ('nieuw', 'preview_verstuurd', 'goedgekeurd', 'betaald', 'geleverd', 'afgehaakt')),
  naam        TEXT,
  bedrijf     TEXT,
  email       TEXT NOT NULL,
  telefoon    TEXT,
  aantal      INTEGER,
  pakket      TEXT,
  bericht     TEXT,
  src         TEXT,
  ref         TEXT,
  utm         TEXT,
  lang        TEXT
);
CREATE INDEX IF NOT EXISTS leads_created ON leads (created_at);
CREATE INDEX IF NOT EXISTS leads_status  ON leads (status);
CREATE INDEX IF NOT EXISTS leads_ref     ON leads (ref);
