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
//   {{bewijsstrip}} {{voorbeelden}} {{testimonials}}   secties uit config/; leeg = sectie weg
//   {{voet}}            juridische gegevens + contact uit site.json (lege velden vallen weg)
// In i18n-teksten: {levering} {dagen} {maanden} {updates_min} {updates_max} {prijs_domein}
// pages/404.html wordt dist/404.html.

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
const proof = json("config/proof.json");
const testimonials = json("config/testimonials.json");
const voorbeelden = json("config/voorbeelden.json");

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

function prijsrij() {
  return offers.pakketten.filter((p) => p.in_prijstabel).sort((a, b) => a.positie - b.positie)
    .map((p) => `<li><span class="pr-naam">${esc(p.naam)}</span> <span class="pr-bedrag">${euro(p.prijs)}</span></li>`).join("");
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

// ---------- variabelen in teksten ----------
const tabel = offers.pakketten.filter((p) => p.in_prijstabel);
const upd = tabel.map((p) => p.inhoud.updates).filter((n) => n != null);
const VARS = {
  levering: offers.levering.werkdagen_min != null
    ? (offers.levering.werkdagen_min === offers.levering.werkdagen_max
        ? String(offers.levering.werkdagen_min)
        : `${offers.levering.werkdagen_min} tot ${offers.levering.werkdagen_max}`)
    : null,
  dagen: offers.garantie?.na_levering_dagen != null ? String(offers.garantie.na_levering_dagen) : null,
  maanden: offers.garantie?.defect_maanden != null ? String(offers.garantie.defect_maanden) : null,
  updates_min: upd.length ? String(Math.min(...upd)) : null,
  updates_max: upd.length ? String(Math.max(...upd)) : null,
  prijs_domein: upsells.eigen_domein ? euro(upsells.eigen_domein.prijs) : null,
};
const vul = (tekst, waar) =>
  tekst.replace(/\{(\w+)\}/g, (m, k) => {
    if (!(k in VARS)) return m;
    if (VARS[k] == null) { errors.push(`${waar}: {${k}} heeft geen waarde in config`); return m; }
    return VARS[k];
  });

// ---------- secties uit config ----------
function bewijsstrip(t) {
  const items = (proof.items || []).filter((i) => i.toestemming === true);
  if (!items.length) return "";
  return `<section class="bewijsstrip" aria-labelledby="bewijs-titel"><div class="wrap">
  <h2 id="bewijs-titel" class="bewijs-titel">${t("bewijs.titel")}</h2>
  <ul class="bewijs-lijst">${items.map((i) => `<li>${i.logo ? `<img src="${esc(i.logo)}" alt="${esc(i.naam)}" height="32" loading="lazy">` : esc(i.naam)}</li>`).join("")}</ul>
</div></section>`;
}

function voorbeeldenSectie(t) {
  const items = (voorbeelden.items || []).filter((i) => i.toestemming === true);
  if (!items.length) return "";
  const kaarten = items.map((i) => `<li class="vb">
    <a class="vb-link" href="${esc(i.url)}" rel="noopener" target="_blank">
      <span class="gsm gsm-klein"><span class="gsm-scherm">
        <img src="${esc(i.beeld_klein || i.beeld)}" width="390" height="844" loading="lazy" alt="${esc(t("voorbeelden.alt").replace("{naam}", i.naam))}">
      </span></span>
      <span class="vb-naam">${esc(i.naam)}</span>
      <span class="vb-functie">${esc(i.functie)}</span>
      <span class="vb-bekijk">${t("voorbeelden.bekijk")}<svg class="i" aria-hidden="true"><use href="#i-arrow-up-right"/></svg></span>
    </a></li>`).join("");
  return `<section class="voorbeelden" id="voorbeelden" aria-labelledby="vb-titel"><div class="wrap">
  <header class="sectie-kop">
    <p class="eyebrow">${t("voorbeelden.eyebrow")}</p>
    <h2 id="vb-titel">${t("voorbeelden.h2")}</h2>
    <p class="sectie-sub">${t("voorbeelden.sub")}</p>
  </header>
  <ul class="vb-lijst vb-aantal-${Math.min(items.length, 3)}">${kaarten}</ul>
</div></section>`;
}

function testimonialsSectie(t) {
  for (const i of testimonials.items || [])
    if (i.toestemming !== true) errors.push(`testimonials.json: "${i.naam || "?"}" heeft geen toestemming: true`);
  const items = (testimonials.items || []).filter((i) => i.toestemming === true);
  if (!items.length) return "";
  return `<section class="testimonials" aria-labelledby="test-titel"><div class="wrap">
  <header class="sectie-kop"><p class="eyebrow">${t("testimonials.eyebrow")}</p><h2 id="test-titel">${t("testimonials.h2")}</h2></header>
  <ul class="test-lijst">${items.map((i) => `<li><figure><blockquote><p>${esc(i.quote)}</p></blockquote>
    <figcaption>${i.foto ? `<img src="${esc(i.foto)}" alt="" width="48" height="48" loading="lazy">` : ""}<span><strong>${esc(i.naam)}</strong> ${esc(i.functie || "")}</span></figcaption></figure></li>`).join("")}</ul>
</div></section>`;
}

function voet(t) {
  const j = site.juridisch || {};
  const delen = [j.naam, j.adres, j.ondernemingsnummer && `Ondernemingsnummer ${j.ondernemingsnummer}`, j.btw_vermelding].filter(Boolean);
  const c = site.contact || {};
  const s = site.socials || {};
  const contact = [
    c.email && `<li><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>`,
    c.whatsapp && `<li><a href="https://wa.me/${esc(c.whatsapp.replace(/\D/g, ""))}" rel="noopener">WhatsApp</a></li>`,
  ].filter(Boolean).join("");
  const socials = [
    s.instagram && `<li><a href="${esc(s.instagram)}" rel="noopener">Instagram</a></li>`,
    s.linkedin && `<li><a href="${esc(s.linkedin)}" rel="noopener">LinkedIn</a></li>`,
  ].filter(Boolean).join("");
  return `<div class="voet-kolommen">
    ${contact ? `<div><h2 class="voet-kop">${t("voet.contact")}</h2><ul>${contact}</ul></div>` : ""}
    <div><h2 class="voet-kop">${t("voet.juridisch")}</h2><ul><li><a href="/privacy/">${t("voet.privacy")}</a></li><li><a href="/voorwaarden/">${t("voet.voorwaarden")}</a></li></ul></div>
    ${socials ? `<div><h2 class="voet-kop">${t("voet.volg")}</h2><ul>${socials}</ul></div>` : ""}
  </div>
  <p class="voet-juridisch">© ${new Date().getFullYear()} ${delen.map(esc).join(" · ")}</p>`;
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
  if (/€\s?\d/.test(JSON.stringify(dict))) errors.push(`i18n/${lang}.json: hardgecodeerde prijs, gebruik {prijs_…}`);
  const t = (k) => {
    const v = get(dict, k);
    if (typeof v !== "string") { errors.push(`[${lang}] ontbrekende vertaling: ${k}`); return `[[${k}]]`; }
    return vul(v, `[${lang}] ${k}`);
  };
  for (const file of readdirSync(join(SRC, "pages")).filter((f) => f.endsWith(".html"))) {
    let html = readFileSync(join(SRC, "pages", file), "utf8");
    // Bronbestanden mogen geen bedragen bevatten: prijzen komen uit offers.json.
    if (/€\s?\d/.test(html)) errors.push(`${file}: hardgecodeerde prijs, gebruik {{prijs:…}}`);
    for (let i = 0; i < 5 && /\{\{>/.test(html); i++)
      html = html.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, n) => partial(n));
    html = html
      .replace(/\{\{prijstabel\}\}/g, () => prijstabel(t))
      .replace(/\{\{capaciteit\}\}/g, () => capaciteit(t))
      .replace(/\{\{prijsrij\}\}/g, () => prijsrij())
      .replace(/\{\{bewijsstrip\}\}/g, () => bewijsstrip(t))
      .replace(/\{\{voorbeelden\}\}/g, () => voorbeeldenSectie(t))
      .replace(/\{\{testimonials\}\}/g, () => testimonialsSectie(t))
      .replace(/\{\{voet\}\}/g, () => voet(t))
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
    const out = name === "index" ? join(base, "index.html")
      : name === "404" ? join(base, "404.html")
      : join(base, name, "index.html");
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
