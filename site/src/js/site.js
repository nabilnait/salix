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
