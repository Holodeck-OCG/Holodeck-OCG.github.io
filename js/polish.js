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
