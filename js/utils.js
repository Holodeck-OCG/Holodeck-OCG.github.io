/**
 * Utility functions - Shared helpers
 */

/**
 * Escape HTML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
  if (str == null) return "";
  return String(str).replace(/[&<>'"]/g, (match) => {
    const escapeMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return escapeMap[match];
  });
}

/**
 * SVG Fallback for missing low-res images
 */
export const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 336'%3E%3Crect width='240' height='336' fill='%2315202B' rx='12'/%3E%3Crect x='10' y='10' width='220' height='316' fill='none' stroke='%2341C3E3' stroke-width='2' stroke-dasharray='6 6' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='28' font-weight='bold' fill='%2341C3E3' opacity='0.3'%3EhOCG%3C/text%3E%3C/svg%3E";