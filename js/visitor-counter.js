/**
 * Visitor Counter - Shared module for updating visitor count
 * Used by: index.js, card-library.js, deckbuilder.js, quiz.js, tournaments.js
 */

// counterapi.dev retired the visits_2 counter (HTTP 410), so no request is made.
// Kept as a no-op so existing imports keep working.
export function updateVisitorCounter(elementId = "visitor-count") {
  const counterEl = document.getElementById(elementId);
  if (counterEl?.parentElement) {
    counterEl.parentElement.style.display = "none";
  }
}