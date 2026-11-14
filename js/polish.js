/* =========================================================
   POLISH.JS — optional enhancement layer (no dependencies)
   Only adds a magnetic tilt to card art on mouse/trackpad
   devices. Everything else lives in css/polish.css.
   ========================================================= */
(() => {
  "use strict";

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (!finePointer.matches) return;

  let activeCard = null;
  let frame = 0;
  let rx = 0;
  let ry = 0;
  let mx = 50;
  let my = 50;

  const paint = () => {
    frame = 0;
    if (!activeCard) return;
    activeCard.style.setProperty("--rx", rx.toFixed(2) + "deg");
    activeCard.style.setProperty("--ry", ry.toFixed(2) + "deg");
    activeCard.style.setProperty("--mx", mx.toFixed(1) + "%");
    activeCard.style.setProperty("--my", my.toFixed(1) + "%");
  };

  const clear = () => {
    if (!activeCard) return;
    activeCard.style.removeProperty("--rx");
    activeCard.style.removeProperty("--ry");
    activeCard.style.removeProperty("--mx");
    activeCard.style.removeProperty("--my");
    activeCard = null;
  };

  document.addEventListener(
    "pointermove",
    (event) => {
      const target =
        event.target instanceof Element
          ? event.target.closest(".card-item")
          : null;

      if (!target) {
        clear();
        return;
      }

      if (target !== activeCard) {
        clear();
        activeCard = target;
      }

      const rect = target.getBoundingClientRect();
      const px = (event.clientX - rect.left) / Math.max(rect.width, 1);
      const py = (event.clientY - rect.top) / Math.max(rect.height, 1);

      ry = (px - 0.5) * 8;
      rx = (0.5 - py) * 8;
      mx = px * 100;
      my = py * 100;

      if (!frame) frame = requestAnimationFrame(paint);
    },
    { passive: true },
  );

  document.addEventListener("scroll", clear, {
    passive: true,
    capture: true,
  });
  window.addEventListener("blur", clear);
})();
// 1. Play directional entrance on load
window.addEventListener("pageshow", () => {
  document.body.classList.remove("tab-leave-next", "tab-leave-prev");
  const dir = sessionStorage.getItem("holodeck_tab_dir");
  if (dir) {
    sessionStorage.removeItem("holodeck_tab_dir");
    const enterClass = dir === "prev" ? "tab-enter-prev" : "tab-enter-next";
    document.body.classList.add(enterClass);
    setTimeout(() => document.body.classList.remove(enterClass), 250);
  }
});

// 2. Detect tab direction and glide out on click
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[href]");
  if (!link) return;

  const href = link.getAttribute("href");
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    link.target === "_blank" ||
    e.ctrlKey ||
    e.metaKey ||
    e.shiftKey ||
    link.origin !== window.location.origin ||
    link.href === window.location.href
  ) {
    return;
  }

  // Compare clicked tab's horizontal position against the active tab in the navbar
  let direction = "next";
  const activeTab = document.querySelector("#navbar-placeholder .tab.active");
  if (activeTab) {
    const activeX = activeTab.getBoundingClientRect().left;
    const targetX = link.getBoundingClientRect().left;
    if (targetX < activeX) direction = "prev";
  }

  e.preventDefault();
  sessionStorage.setItem("holodeck_tab_dir", direction);
  document.body.classList.add(direction === "prev" ? "tab-leave-prev" : "tab-leave-next");

  setTimeout(() => {
    window.location.href = link.href;
  }, 175);
});