/**
 * Skill Formatter - Shared module for formatting card skill text
 * Used by: index.js, card-library.js, deckbuilder.js, quiz.js, tournaments.js
 */

import { escapeHtml, fallbackImage } from "./utils.js";

/**
 * Format skill text into structured HTML components
 * @param {Object} card - Card object with skills_text, card_type, bloom_level, hp
 * @returns {Object} Formatted HTML strings for tags, skill, arts, and limited badge
 */
export function formatSkillText(card) {
  let rawText = card.skills_text || "None";

  // Sanitize the angle brackets FIRST so names like <Fuwawa...> don't disappear
  let safeText = rawText.toString().replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Now safely apply your line breaks
  let text = safeText.replace(/\\n/g, "<br>").replace(/\n/g, "<br>");

  let tags = "";
  let mainText = text;

  if (mainText.includes("|")) {
    let parts = mainText.split("|");
    tags = parts[0].trim();
    mainText = parts.slice(1).join("|").trim();
  }

  let hashMatch = mainText.match(/#[a-zA-Z0-9_]+/g);
  if (hashMatch) {
    let extractedTags = hashMatch.join(" ");
    if (tags) {
      tags = [
        ...new Set(tags.split(/\s+/).concat(extractedTags.split(/\s+/))),
      ].join(" ");
    } else {
      tags = extractedTags;
    }
    mainText = mainText
      .replace(/(<br>\s*)+$/g, "")
      .replace(/^(<br>\s*)+/g, "")
      .trim();
  }

  let skillText = mainText;
  let artsText = "-";
  let isHolomem = card.card_type === "Holomem";

  if (isHolomem) {
    let artsIndex = mainText.search(/(?:^|<br>)\s*Arts(?:\s|:)/);
    if (artsIndex !== -1) {
      skillText = mainText.substring(0, artsIndex).trim();
      artsText = mainText
        .substring(artsIndex)
        .replace(/^(?:<br>)?\s*Arts:?\s*/, "")
        .trim();
    } else if (mainText.includes("Arts:") || mainText.includes("Arts ")) {
      let splitIndex = mainText.indexOf("Arts:");
      if (splitIndex === -1) splitIndex = mainText.indexOf("Arts ");
      if (splitIndex !== -1 && splitIndex !== 0) {
        skillText = mainText.substring(0, splitIndex).trim();
        artsText = mainText.substring(splitIndex + 5).trim();
      } else if (splitIndex === 0) {
        skillText = "None";
        artsText = mainText.substring(5).trim();
      }
    }
  }

  if (skillText === "" || skillText === "-" || skillText === "<br>")
    skillText = "No skills listed.";
  if (skillText.endsWith("<br>"))
    skillText = skillText.substring(0, skillText.length - 4).trim();
  if (skillText.startsWith("<br>")) skillText = skillText.substring(4).trim();

  let isLimited = false;
  if (/\blimited\b/i.test(skillText) || /#?limited/i.test(tags)) {
    isLimited = true;
    tags = tags
      .replace(/#?limited/i, "")
      .replace(/\s+/g, " ")
      .trim();
    skillText = skillText.replace(/^Limited[:\.\-]?\s*(?:<br>\s*)*/i, "");
    skillText = skillText.replace(
      /<br>\s*Limited[:\.\-]?\s*(?:<br>\s*)*/i,
      "<br>",
    );
    if (skillText === "" || skillText === "<br>")
      skillText = "No skills listed.";
  }

  let label1 = "Card Effect";
  let label1Color = "var(--holo-blue)";
  let label1TextColor = "#fff";
  let label2 = "Arts Skill";
  let label2Color = "var(--holo-romance)";
  let label2TextColor = "#fff";

  if (isHolomem) {
    if (
      skillText.includes("Bloom Effect") ||
      skillText.includes("Bloom effect")
    ) {
      label1 = "Bloom Effect";
      skillText = skillText.replace(/Bloom [Ee]ffect:?\s*/, "");
      label1Color = "var(--holo-blue)";
    } else if (
      skillText.includes("Collab Effect") ||
      skillText.includes("Collab effect")
    ) {
      label1 = "Collab Effect";
      skillText = skillText.replace(/Collab [Ee]ffect:?\s*/, "");
      label1Color = "var(--danger)";
    } else if (skillText.includes("Gift")) {
      label1 = "Gift";
      skillText = skillText.replace(/Gift:?\s*/, "");
      label1Color = "var(--holo-teal)";
      label1TextColor = "#FFF";
    } else if (skillText !== "None" && skillText !== "No skills listed.") {
      label1 = "Auto Effect";
      skillText = skillText.replace(/Auto [Ee]ffect:?\s*/, "");
      label1Color = "var(--holo-orange)";
      label1TextColor = "#000";
    }
  }

  let formattedTagsHtml = "";
  if (tags && tags.trim() !== "") {
    formattedTagsHtml = `<div style="background: #FFFFFF; border: 1px solid #d1dce8; border-radius: 8px; padding: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02); margin-bottom: 0.5rem;"><div style="font-size: 0.8rem; text-transform: uppercase; font-weight: 800; margin-bottom: 0.3rem; color: #000; background: var(--holo-orange); display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px;">Tag</div><div style="font-weight: 800; color: var(--holo-blue); line-height: 1.4; font-size: 0.9rem;">${tags}</div></div>`;
  }

  let limitedBadgeHtml = isLimited
    ? `<div style="font-size: 0.8rem; text-transform: uppercase; font-weight: 800; margin-bottom: 0.3rem; color: #fff; background: var(--danger); display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; margin-left: 0.5rem;">Limited</div>`
    : "";

  let formattedSkillHtml = "";
  if (
    skillText !== "None" &&
    skillText !== "No skills listed." &&
    skillText.trim() !== ""
  ) {
    formattedSkillHtml = `<div style="background: #FFFFFF; border: 1px solid #d1dce8; border-radius: 8px; padding: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02); margin-bottom: 0.5rem;"><div style="font-size: 0.8rem; text-transform: uppercase; font-weight: 800; margin-bottom: 0.3rem; color: ${label1TextColor}; background: ${label1Color}; display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px;">${label1}</div>${limitedBadgeHtml}<div style="font-weight: 600; color: #171e30; line-height: 1.4; font-size: 0.9rem;">${skillText}</div></div>`;
  }

  let formattedArtsHtml =
    artsText !== "-" && artsText !== ""
      ? `<div style="background: #FFFFFF; border: 1px solid #d1dce8; border-radius: 8px; padding: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02);"><div style="font-size: 0.8rem; text-transform: uppercase; font-weight: 800; margin-bottom: 0.3rem; color: ${label2TextColor}; background: ${label2Color}; display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px;">${label2}</div><div style="font-weight: 600; color: #171e30; line-height: 1.4; font-size: 0.9rem;">${artsText}</div></div>`
      : "";

  return {
    skillText,
    artsText,
    isLimited,
    formattedTagsHtml,
    formattedSkillHtml,
    formattedArtsHtml,
  };
}

/**
 * Build complete card HTML for grid/list views
 * @param {Object} card - Card object
 * @param {boolean} isSaved - Whether card is bookmarked/saved
 * @returns {string} HTML string for the card
 */
export function buildCardHtml(card, isSaved) {
  // 1. ESCAPE TEXT FOR HTML DISPLAY
  const safeName = escapeHtml(card.card_name);
  const safeId = escapeHtml(card.card_id);
  const safeBloom = escapeHtml(card.bloom_level);
  
  const type = escapeHtml(card.card_type || "Type");
  const level = safeBloom ? `[${safeBloom}] ` : "";
  const typeClass = getTypeClass(card.card_type);
  const iconClass = getIconClass(card.card_type);
  const setPrefix = card.card_id.split("-")[0];
  const imagePath = card.thumbnail
    ? card.thumbnail
    : `images/${setPrefix}/${card.card_id}.webp`;
  const baseId = card.card_id.split("_")[0];

  const hasAltArts = window.cardVariants[baseId] && window.cardVariants[baseId].length > 1;
  const altToggleHtml = hasAltArts
    ? `<button class="btn-alt-toggle" aria-label="Switch Art" onclick="event.stopPropagation(); window.toggleAltArt(this, '${escapeHtml(baseId)}')" title="Switch Art"><i class="ti ti-refresh"></i></button>`
    : "";

  const { formattedTagsHtml, formattedSkillHtml, formattedArtsHtml } = formatSkillText(card);
  const isAltArt = card.card_id.match(/_(OUR|SEC|UR|HR|SR)$/i);
  const premiumClass = isAltArt ? "premium-alt-art" : "";

  let btnHtml = isSaved
    ? `<button class="bookmark-btn saved" aria-label="Remove Bookmark" data-card-id="${safeId}" onclick="event.stopPropagation(); window.toggleBookmarkFromSheet('${safeId}')"><i class="ti ti-star-filled"></i></button>`
    : `<button class="bookmark-btn unsaved" aria-label="Add Bookmark" data-card-id="${safeId}" onclick="event.stopPropagation(); window.toggleBookmarkFromSheet('${safeId}')"><i class="ti ti-star"></i></button>`;

  let hpHtml = card.hp ? `<div class="tl-hp">HP: ${escapeHtml(card.hp)}</div>` : "";

  return `
            <div class="card-item ${premiumClass}" tabindex="0" data-id="${safeId}" data-name="${safeName}" onclick="tapToggle(this)" onmouseleave="this.classList.remove('hide-translation')">
                ${altToggleHtml}
                <div class="card-face ${typeClass} grid-element">
                    <img src="${imagePath}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='${fallbackImage}'" />
                    <i class="ti ${iconClass}"></i>
                    <span class="face-label">${type.toUpperCase()}</span>
                </div>
                <div class="card-meta grid-element">
                    <span class="card-name-jp">${level}${safeName}</span>
                    <span class="card-id">${safeId}</span>
                    <div class="card-badges">
                        <span class="badge ${typeClass}">${type.toUpperCase()}</span>
                    </div>
                </div>
                <div class="translation-overlay grid-element">
                    <div class="tl-header">
                        <span class="tl-type badge ${typeClass}">${type.toUpperCase()}</span>
                        <div style="display: flex; gap: 6px;">
                            <button class="btn-hide-overlay" onclick="event.stopPropagation(); window.hideOverlay(this)" title="Hide Text">
                                <i class="ti ti-eye-off"></i>
                            </button>
                            ${btnHtml}
                        </div>
                    </div>
                    <div class="tl-title">${level}${safeName}</div>
                    <div class="tl-scroll-area">
                        ${formattedTagsHtml}
                        ${formattedSkillHtml}
                        ${formattedArtsHtml}
                    </div>
                    ${hpHtml}
                </div>

                <div class="list-header list-element" onclick="event.stopPropagation(); toggleAccordion(this)">
                    <div class="list-thumb ${typeClass}">
                        <img src="${imagePath}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='${fallbackImage}'" />
                    </div>
                    <div class="list-info">
                        <div class="list-name">${level}${safeName}</div>
                        <div class="list-sub">${type.toUpperCase()} • ${safeId}</div>
                    </div>
                    <div class="list-actions">
                        ${btnHtml}
                        <i class="ti ti-plus accordion-icon"></i>
                    </div>
                </div>
                <div class="list-content list-element">
                    <div class="list-content-inner">
                        <div class="list-full-img">
                            <img src="${imagePath}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='${fallbackImage}'" />
                        </div>
                        <div class="list-details">
                            ${formattedTagsHtml}
                            ${formattedSkillHtml}
                            ${formattedArtsHtml}
                            ${hpHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
}

/**
 * Get CSS class for card type
 */
function getTypeClass(type) {
  if (type === "Oshi") return "oshi";
  if (type === "Holomem") return "member";
  if (type === "Support") return "support";
  if (type === "Cheer") return "cheer";
  return "support";
}

/**
 * Get icon class for card type
 */
function getIconClass(type) {
  if (type === "Oshi") return "ti-star";
  if (type === "Holomem") return "ti-device-gamepad-2";
  if (type === "Support") return "ti-bolt";
  if (type === "Cheer") return "ti-heart";
  return "ti-cards";
}