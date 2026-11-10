// Salix · kleine verbeteringen bovenop de statische pagina. Zonder JS werkt alles ook.
(() => {
  const root = document.documentElement;
  const stil = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Inhoud laten opkomen bij het scrollen. Zonder JS of met 'minder beweging' staat alles meteen zichtbaar.
  const items = document.querySelectorAll("[data-reveal]");
  if (!stil && "IntersectionObserver" in window && items.length) {
    root.classList.add("reveal-aan");
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("zichtbaar");
        io.unobserve(e.target);
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach((el) => {
      // Wat al in beeld staat bij het laden, meteen tonen.
      if (el.getBoundingClientRect().top < innerHeight) el.classList.add("zichtbaar");
      else io.observe(el);
    });
  }

  // Gsm-menu sluiten na een klik op een link of met Escape.
  const menu = document.querySelector("details.menu");
  if (menu) {
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) menu.open = false; });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.open) { menu.open = false; menu.querySelector("summary").focus(); }
    });
  }
})();

// Herkomst (src, utm, ref) onthouden voor deze sessie en meegeven in formulieren. Geen cookies.
(() => {
  let bron = {};
  try { bron = JSON.parse(sessionStorage.getItem("salix-bron") || "{}"); } catch {}
  const q = new URLSearchParams(location.search);
  for (const k of ["src", "ref", "c", "utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
    const v = q.get(k);
    if (v) bron[k] = v.slice(0, 80);
  }
  try { sessionStorage.setItem("salix-bron", JSON.stringify(bron)); } catch {}
  document.querySelectorAll("[data-src]").forEach((el) => { el.value = bron.src || bron.utm_source || ""; });
  document.querySelectorAll("[data-ref]").forEach((el) => { el.value = bron.ref || ""; });
})();

// Foutmelding tonen als de server het formulier terugstuurt (?fout=veld1,veld2).
(() => {
  const fout = new URLSearchParams(location.search).get("fout");
  const el = document.querySelector("[data-fout]");
  if (!fout || !el) return;
  el.hidden = false;
  const namen = fout.split(",").map((s) => s.replace(/[^a-z]/g, ""));
  for (const n of namen) {
    const veld = document.querySelector(`[name="${n}"]`);
    if (veld) veld.setAttribute("aria-invalid", "true");
  }
  const eerste = document.querySelector(`[name="${namen[0]}"]`);
  if (eerste) eerste.focus();
})();
