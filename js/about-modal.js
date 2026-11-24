/**
 * About Modal - Shared modal logic
 * Used by: index.js, card-library.js, deckbuilder.js, quiz.js, tournaments.js
 */

export function openAboutModal() {
  const modal = document.getElementById("about-modal");
  const overlay = document.getElementById("about-overlay");
  if (modal) modal.classList.add("open");
  if (overlay) overlay.classList.add("open");
}

export function closeAboutModal() {
  const modal = document.getElementById("about-modal");
  const overlay = document.getElementById("about-overlay");
  if (modal) modal.classList.remove("open");
  if (overlay) overlay.classList.remove("open");
}

// Make available globally for inline onclick handlers
window.openAboutModal = openAboutModal;
window.closeAboutModal = closeAboutModal;