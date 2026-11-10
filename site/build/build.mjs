// Salix-site build. Geen dependencies: alleen Node (>= 20).
//   node build/build.mjs            bouwt site/dist, waarschuwt bij onbevestigde aanbiedingen
//   node build/build.mjs --strict   faalt ook op lege verplichte velden (voor productie)
//
// Templates in src/pages/*.html. Tokens:
//   {{t:sleutel.pad}}   tekst uit i18n/<taal>.json
//   {{prijs:id}}        prijs uit config/offers.json (pakket-id, upsell.<id>, referral.vriend)
//   {{asset:/pad}}      pad naar een bestand in src/, met cache-hash ?v=
//   {{> partial}}       src/partials/partial.html
//   {{prijstabel}}      de drie pakketten uit offers.json
//   {{capaciteit}}      melding uit config/capacity.json
//   {{lang}}            taalcode

import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync, copyFileSync, existsSync } from "node:fs";
import { join, dirname, relative, extname } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const DIST = join(ROOT, "dist");
const STRICT = process.argv.includes("--strict");
const TALEN = ["nl"]; // EN/FR komen na akkoord op het NL-design

const errors = [];
const warnings = [];
const json = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

const offers = json("config/offers.json");
const capacity = json("config/capacity.json");
const site = json("config/site.json");

// ---------- helpers ----------
const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const hash = (p) => createHash("sha256").update(readFileSync(p)).digest("hex").slice(0, 10);
const euro = (cent) => "€" + (cent % 100 === 0 ? String(cent / 100) : (cent / 100).toFixed(2).replace(".", ","));

function get(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

// ---------- prijzen ----------
const pakketten = Object.fromEntries(offers.pakketten.map((p) => [p.id, p]));
const upsells = Object.fromEntries(offers.upsells_checkout.map((u) => [u.id, u]));

function prijs(id) {
  if (pakketten[id]) return euro(pakketten[id].prijs);
  if (id.startsWith("upsell.")) {
    const u = upsells[id.slice(7)];
    if (u?.prijs != null) return euro(u.prijs);
    if (u?.korting_pct != null) return `−${u.korting_pct}%`;
  }
  if (id === "referral.vriend") return euro(offers.referral.vriend_korting);
  errors.push(`Onbekende prijs: {{prijs:${id}}}`);
  return "";
}

// Onbevestigde aanbiedingen: waarschuwing (fase 1-afspraak).
for (const [naam, o] of [
  ...offers.pakketten.map((p) => [`pakket ${p.id}`, p]),
  ...offers.upsells_checkout.map((u) => [`upsell ${u.id}`, u]),
  ["rollover", offers.rollover], ["teams", offers.teams], ["referral", offers.referral],
  ["updates_inbegrepen", offers.updates_inbegrepen], ["levering", offers.levering], ["garantie", offers.garantie],
]) if (o && o.bevestigd === false) warnings.push(`Nog niet bevestigd: ${naam}`);

// Verplichte site-velden
for (const k of ["domein", "contact.email", "juridisch.naam", "juridisch.adres", "juridisch.ondernemingsnummer"]) {
  if (get(site, k) == null) (STRICT ? errors : warnings).push(`site.json: ${k} is leeg`);
}

// ---------- prijstabel ----------
function prijstabel(t) {
  const rijen = [
    ["site_op_maat", (i) => i.site_op_maat],
    ["wallet_pass", (i) => i.wallet_pass],
    ["kaart", (i) => (i.kaart_metaal ? t("prijzen.waarde.metaal") : i.kaart_pvc ? t("prijzen.waarde.pvc") : false)],
    ["pen", (i) => (i.pen_premium ? t("prijzen.waarde.premium") : i.pen ? t("prijzen.waarde.standaard") : false)],
    ["sleutelhanger", (i) => i.sleutelhanger],
    ["eigen_domein", (i) => i.eigen_domein || { optie: prijs("upsell.eigen_domein") }],
    ["updates", (i) => (i.updates != null ? String(i.updates) : false)],
  ];
  const lijst = offers.pakketten.filter((p) => p.in_prijstabel).sort((a, b) => a.positie - b.positie);
  return lijst
    .map((p) => {
      const items = rijen
        .map(([key, f]) => {
          const v = f(p.inhoud);
          let label = t(`prijzen.rij.${key}`);
          if (key === "updates" && typeof v === "string") {
            label = label.replace("{n}", `<strong>${esc(v)}</strong>`);
          }
          if (v === false || v == null)
            return `<li class="nee"><svg class="i" aria-hidden="true"><use href="#i-x"/></svg><span><span class="sr-only">${t("prijzen.niet")}: </span>${label}</span></li>`;
          let extra = "";
          if (typeof v === "string" && v && key !== "updates") extra = ` <strong>${esc(v)}</strong>`;
          if (typeof v === "object") extra = ` <span class="optie">+${v.optie} ${t("prijzen.optie")}</span>`;
          const nee = typeof v === "object";
          return `<li class="${nee ? "nee" : "ja"}"><svg class="i" aria-hidden="true"><use href="#i-${nee ? "plus" : "check"}"/></svg><span>${label}${extra}</span></li>`;
        })
        .join("");
      const badge = p.badge ? `<p class="plan-badge">${esc(p.badge)}</p>` : "";
      return `<article class="plan plan-${p.rol}" aria-labelledby="plan-${p.id}">
  <div class="plan-kop">
    <h3 id="plan-${p.id}">${esc(p.naam)}</h3>${badge}
  </div>
  <p class="plan-prijs"><span class="bedrag">${euro(p.prijs)}</span> <span class="eenmalig">${t("prijzen.eenmalig")}</span></p>
  <p class="plan-kort">${esc(p.kort)}</p>
  <a class="btn ${p.rol === "kern" ? "btn-primair" : "btn-secundair"}" href="/bestel/?pakket=${p.id}" data-cta="prijzen-${p.id}">${t("prijzen.kies")} ${esc(p.naam)}</a>
  <ul class="plan-lijst">${items}</ul>
</article>`;
    })
    .join("\n");
}

function capaciteit(t) {
  const vrij = capacity.plaatsen_vrij;
  const week = capacity.week;
  const actueel = vrij != null && week != null && week === isoWeek(new Date());
  return actueel ? `${t("capaciteit.basis")} ${t("capaciteit.nog").replace("{n}", String(vrij))}` : t("capaciteit.basis");
}
function isoWeek(d) {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = x.getUTCDay() || 7;
  x.setUTCDate(x.getUTCDate() + 4 - day);
  const y = new Date(Date.UTC(x.getUTCFullYear(), 0, 1));
  return `${x.getUTCFullYear()}-W${String(Math.ceil(((x - y) / 864e5 + 1) / 7)).padStart(2, "0")}`;
}

// ---------- assets kopiëren ----------
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
const assetHash = {};
for (const sub of ["css", "js", "fonts", "img"]) {
  const dir = join(SRC, sub);
  if (!existsSync(dir)) continue;
  for (const f of walk(dir)) {
    const rel = "/" + relative(SRC, f);
    if (extname(f) === ".txt") continue;
    mkdirSync(dirname(join(DIST, rel)), { recursive: true });
    copyFileSync(f, join(DIST, rel));
    assetHash[rel] = hash(f);
  }
}
for (const f of ["_headers", "robots.txt"]) if (existsSync(join(SRC, f))) copyFileSync(join(SRC, f), join(DIST, f));

// ---------- pagina's ----------
const partial = (name) => {
  const p = join(SRC, "partials", name + ".html");
  if (!existsSync(p)) { errors.push(`Ontbrekende partial: ${name}`); return ""; }
  return readFileSync(p, "utf8");
};

for (const lang of TALEN) {
  const dict = json(`i18n/${lang}.json`);
  const t = (k) => {
    const v = get(dict, k);
    if (typeof v !== "string") { errors.push(`[${lang}] ontbrekende vertaling: ${k}`); return `[[${k}]]`; }
    return v;
  };
  for (const file of readdirSync(join(SRC, "pages")).filter((f) => f.endsWith(".html"))) {
    let html = readFileSync(join(SRC, "pages", file), "utf8");
    // Bronbestanden mogen geen bedragen bevatten: prijzen komen uit offers.json.
    if (/€\s?\d/.test(html)) errors.push(`${file}: hardgecodeerde prijs, gebruik {{prijs:…}}`);
    html = html.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, n) => partial(n));
    html = html
      .replace(/\{\{prijstabel\}\}/g, () => prijstabel(t))
      .replace(/\{\{capaciteit\}\}/g, () => capaciteit(t))
      .replace(/\{\{lang\}\}/g, lang)
      .replace(/\{\{t:([\w.]+)\}\}/g, (_, k) => t(k))
      .replace(/\{\{prijs:([\w.]+)\}\}/g, (_, k) => prijs(k))
      .replace(/\{\{asset:([^}]+)\}\}/g, (_, p) => {
        if (!assetHash[p]) { errors.push(`${file}: ontbrekend bestand ${p}`); return p; }
        return `${p}?v=${assetHash[p]}`;
      });

    // ---------- controles ----------
    const left = html.match(/\{\{[^}]*\}\}/g);
    if (left) errors.push(`${file}: niet ingevulde placeholder(s): ${[...new Set(left)].join(", ")}`);
    if (/<script(?![^>]*\bsrc=)[^>]*>/i.test(html)) errors.push(`${file}: inline <script> (CSP)`);
    if (/<style[\s>]/i.test(html) || /\sstyle="/i.test(html)) errors.push(`${file}: inline style (CSP)`);
    if (/\son[a-z]+="/i.test(html)) errors.push(`${file}: inline event handler (CSP)`);
    if (/\b(TODO|lorem ipsum)\b/i.test(html)) errors.push(`${file}: placeholder-tekst (TODO/lorem)`);
    for (const [, ref] of html.matchAll(/(?:src|href)="(\/[^"?#]*)/g)) {
      if (/\/$/.test(ref) || !extname(ref)) continue; // pagina-routes
      if (!existsSync(join(DIST, ref))) errors.push(`${file}: verwijst naar ontbrekend ${ref}`);
    }

    const name = file.replace(/\.html$/, "");
    const base = lang === "nl" ? DIST : join(DIST, lang);
    const out = name === "index" ? join(base, "index.html") : join(base, name, "index.html");
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, html);
  }
}

// ---------- secret-scan (licht, gitleaks draait in CI) ----------
for (const f of walk(ROOT).filter((p) => !p.includes("/dist/") && !p.includes("node_modules") && /\.(m?js|ts|json|html|css|md|toml|jsonc)$/.test(p))) {
  if (/\b(sk|rk)_(live|test)_[0-9a-zA-Z]{10,}|whsec_[0-9a-zA-Z]{10,}|sk-ant-[0-9a-zA-Z-]{10,}/.test(readFileSync(f, "utf8")))
    errors.push(`Mogelijke geheime sleutel in ${relative(ROOT, f)}`);
}

for (const w of warnings) console.warn("⚠︎ " + w);
if (errors.length) {
  for (const e of errors) console.error("✘ " + e);
  console.error(`\nBuild mislukt: ${errors.length} fout(en).`);
  process.exit(1);
}
console.log(`✔ Build klaar → ${relative(process.cwd(), DIST) || "dist"} (${warnings.length} waarschuwingen)`);
