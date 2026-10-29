// 👉 NEW: Hides the translation overlay until the user un-hovers
window.hideOverlay = function (btn) {
  const cardItem = btn.closest(".card-item");
  if (cardItem) {
    cardItem.classList.add("hide-translation");
  }
};
// SVG Fallback for Missing Low-Res Images
const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 336'%3E%3Crect width='240' height='336' fill='%2315202B' rx='12'/%3E%3Crect x='10' y='10' width='220' height='316' fill='none' stroke='%2341C3E3' stroke-width='2' stroke-dasharray='6 6' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='28' font-weight='bold' fill='%2341C3E3' opacity='0.3'%3EhOCG%3C/text%3E%3C/svg%3E";

const csvFilesToLoad = [
  "data/hBP01.csv",
  "data/hBP02.csv",
  "data/hBP03.csv",
  "data/hBP04.csv",
  "data/hBP05.csv",
  "data/hBP06.csv",
  "data/hBP07.csv",
  "data/hBP08.csv",
  "data/hBP09.csv",
  "data/hEB01.csv",
  "data/hSD.csv",
];

let masterCardPool = [];
let currentFilteredPool = [];
let renderedCount = 0;
const CHUNK_SIZE = 40;

let currentSetFilter = "all";

const synergyDictionary = {
  holox: ["la+", "lui", "koyori", "chloe", "iroha", "holox"],
  myth: ["calliope", "kiara", "ina'nis", "gura", "amelia", "myth"],
  promise: ["fauna", "kronii", "mumei", "baelz", "irys", "promise"],
  holotori: ["kiara", "mumei", "lui", "subaru", "reine"],
  advent: [
    "shiori",
    "bijou",
    "nerissa",
    "fuwawa",
    "mococo",
    "fuwamoco",
    "advent",
  ],
  justice: ["elizabeth", "gigi", "cecilia", "raora", "justice"],
  gamers: ["fubuki", "mio", "okayu", "korone", "gamers"],
  fantasy: ["pekora", "flare", "noel", "marine", "fantasy"],
  "gen 0": ["sora", "robocosan", "azki", "miko", "suisei"],
  "gen 1": ["mel", "fubuki", "matsuri", "aki", "haato"],
  "gen 2": ["aqua", "shion", "ayame", "choco", "subaru"],
  nepolabo: ["lamy", "nene", "botan", "polka", "nepolabo"],
  regloss: ["ao", "kanade", "ririka", "raden", "hajime"],
  "flow glow": ["riona", "niko", "mizumiya", "chihaya", "vivi"],
  "holo id": [
    "moona",
    "risu",
    "iofi",
    "reine",
    "ollie",
    "anya",
    "kobo",
    "kaela",
    "zeta",
    "holo id",
    "#id",
  ],
  koyori: [
    "koyori",
    "green test tube",
    "kokoro",
    "koyori's assistant",
    "joshu-kun",
  ],
  sora: ["tokino sora", "sora", "ankimo", "sora-tomo", "nun-nun"],
  azki: ["azki", "pioneers"],
  fubuki: ["shirakami fubuki", "fubuki", "sukon-bu", "mitama"],
  mio: [
    "ookami mio",
    "mio",
    "mio-fam",
    "pigeotaurus",
    "taurus",
    "fortune telling",
    "tarot",
  ],
  watame: ["tsunomaki watame", "watame", "watamates", "watame's hammer"],
  nene: ["momosuzu nene", "nene", "nekko", "giraffe stag beetle", "beetle"],
  zeta: ["vestia zeta", "zeta", "zecretary", "bazo"],
  kronii: ["ouro kronii", "kronii", "kronies", "boros"],
  shiori: ["shiori novella", "shiori", "novellite", "bookmark"],
  kiara: ["takanashi kiara", "kiara", "kfp"],
  pekora: ["usada pekora", "pekora", "nousagi", "don-chan", "carrot"],
};

function getSynergyTerms(query) {
  const lowerQuery = query.toLowerCase().trim();

  // 1. Check if they searched a group (like "myth")
  for (const member in synergyDictionary) {
    if (member.includes(lowerQuery) || lowerQuery.includes(member)) {
      return synergyDictionary[member];
    }
  }

  // 2. NICKNAME MAP: Translates common short names
  const nicknameMap = {
    ina: ["ina'nis", "ina's"],
    calli: ["calliope", "calli's"],
    bae: ["baelz", "bae's"],
    sui: ["suisei"],
    laplus: ["la+"],
  };

  if (nicknameMap[lowerQuery]) {
    return nicknameMap[lowerQuery];
  }

  return [lowerQuery];
}

function getTypeClass(type) {
  if (type === "Oshi") return "oshi";
  if (type === "Holomem") return "member";
  if (type === "Support") return "support";
  if (type === "Cheer") return "cheer";
  return "support";
}

function getIconClass(type) {
  if (type === "Oshi") return "ti-star";
  if (type === "Holomem") return "ti-device-gamepad-2";
  if (type === "Support") return "ti-bolt";
  if (type === "Cheer") return "ti-heart";
  return "ti-cards";
}

function parseCSV(text) {
  let result = [];
  let row = [];
  let inQuotes = false;
  let val = "";
  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          val += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        val += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(val.trim());
        val = "";
      } else if (char === "\n" || char === "\r") {
        row.push(val.trim());
        result.push(row);
        row = [];
        val = "";
        if (char === "\r" && i + 1 < text.length && text[i + 1] === "\n") i++;
      } else {
        val += char;
      }
    }
  }
  if (val !== "" || row.length > 0) {
    row.push(val.trim());
    result.push(row);
  }
  return result;
}
// 👉 NEW: Map all alternative arts to their base card
window.cardVariants = {};

window.toggleAltArt = function (btn, baseId) {
  let variants = window.cardVariants[baseId];
  let cardElement =
    btn.closest(".card-item") || btn.closest(".deck-history-item");
  let currentId =
    cardElement.getAttribute("data-id") ||
    cardElement.querySelector(".card-id, .proxy-stats").innerText.trim();

  let currentIndex = variants.indexOf(currentId);
  let nextIndex = (currentIndex + 1) % variants.length;
  let nextId = variants[nextIndex];
  let deck = getDeck();
  let deckIndex = deck.findIndex((c) => c.card_id === currentId);
  if (deckIndex > -1) {
    let nextCardData = masterCardPool.find((c) => c.card_id === nextId);
    if (nextCardData) {
      deck.splice(deckIndex, 1, nextCardData);
      // Save silently without triggering a re-render of the list
      localStorage.setItem("ocgCustomDeck", JSON.stringify(deck));
    }
  }

  let setPrefix = nextId.split("-")[0];
  let imagePath = `images/${setPrefix}/${nextId}.webp`;

  // 1. Update Images
  cardElement.querySelectorAll("img").forEach((img) => {
    if (!img.classList.contains("holo-logo-loader")) img.src = imagePath;
  });

  // 2. Update Text IDs
  cardElement
    .querySelectorAll(".card-id, .proxy-stats")
    .forEach((el) => (el.innerText = nextId));
  cardElement.querySelectorAll(".list-sub").forEach((el) => {
    let parts = el.innerText.split("•");
    if (parts.length > 1) el.innerText = `${parts[0].trim()} • ${nextId}`;
  });

  // 3. Update Data Attributes & Clicks
  if (cardElement.hasAttribute("data-id"))
    cardElement.setAttribute("data-id", nextId);
  if (
    cardElement.hasAttribute("onclick") &&
    cardElement.getAttribute("onclick").includes("addCardToDeck")
  ) {
    cardElement.setAttribute("onclick", `addCardToDeck('${nextId}')`);
  }

  // 4. Update Bookmark Buttons
  cardElement
    .querySelectorAll(".bookmark-btn, .btn-bookmark-toggle")
    .forEach((b) => {
      b.setAttribute("data-card-id", nextId);
      let oldClick = b.getAttribute("onclick");
      if (oldClick.includes("removeCardFromDeckByCardId"))
        b.setAttribute(
          "onclick",
          `event.stopPropagation(); window.removeCardFromDeckByCardId('${nextId}')`,
        );
      else if (oldClick.includes("handleAddClick"))
        b.setAttribute(
          "onclick",
          `event.stopPropagation(); window.handleAddClick('${nextId}')`,
        );
      else if (oldClick.includes("toggleBookmarkFromSheet"))
        b.setAttribute(
          "onclick",
          `event.stopPropagation(); window.toggleBookmarkFromSheet('${nextId}')`,
        );
    });

  // 5. Update Premium Border Class
  if (nextId.match(/_(OUR|SEC|UR|HR|SR)$/i))
    cardElement.classList.add("premium-alt-art");
  else cardElement.classList.remove("premium-alt-art");

  if (typeof updateBookmarkButtons === "function") updateBookmarkButtons();
};

async function initializeDatabase() {
  let combinedDatabase = [];
  let seenIds = new Set();

  for (const fileName of csvFilesToLoad) {
    try {
      const response = await fetch(fileName);
      if (!response.ok) continue;
      const text = await response.text();
      if (
        text.trim().toLowerCase().startsWith("<!doctype html") ||
        text.trim().toLowerCase().startsWith("<html")
      )
        continue;

      const rows = parseCSV(text);
      if (rows.length < 2) continue;

      const headers = rows[0].map((h) =>
        h.replace(/"/g, "").trim().toLowerCase(),
      );
      let typeIdx = 3,
        hpIdx = 6,
        tagsIdx = -1,
        textIdx = 8;
      for (let i = 0; i < headers.length; i++) {
        if (headers[i].includes("type")) typeIdx = i;
        if (headers[i].includes("life") || headers[i].includes("hp")) hpIdx = i;
        if (headers[i].includes("tag")) tagsIdx = i;
        if (headers[i].includes("text")) textIdx = i;
      }

      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        if (cols.length < 3) continue;

        const setCode = cols[0];
        const nameRaw = cols[1];
        if (!setCode || !nameRaw || setCode.toLowerCase().includes("setcode"))
          continue;

        const finalCardId = setCode.trim();
        if (seenIds.has(finalCardId)) continue;
        seenIds.add(finalCardId);

        let cardName = nameRaw;
        const match = nameRaw.match(/\((.*?)\)/);
        if (match) cardName = match[1].trim();

        const typeRaw = cols[typeIdx] || "";
        let cardType = "Unknown";
        let bloomLevel = null;

        if (typeRaw.toLowerCase().includes("holomem")) {
          if (typeRaw.includes("Oshi")) cardType = "Oshi";
          else {
            cardType = "Holomem";
            if (typeRaw.includes("Debut")) bloomLevel = "Debut";
            if (typeRaw.includes("1st")) bloomLevel = "1st";
            if (typeRaw.includes("2nd")) bloomLevel = "2nd";
            if (typeRaw.includes("Spot")) bloomLevel = "Spot";
            if (typeRaw.includes("Buzz")) bloomLevel = "Buzz";
            if (typeRaw.includes("PC")) bloomLevel = "PC";
          }
        } else if (typeRaw.includes("Support")) cardType = "Support";
        else if (typeRaw.includes("Cheer")) cardType = "Cheer";

        const hpRaw = cols[hpIdx];
        let hp = hpRaw ? parseInt(hpRaw.replace(/,/g, "")) : null;

        let rawSkills = cols[textIdx] || "None";
        let rawTags = tagsIdx !== -1 ? cols[tagsIdx] || "" : "";
        let finalSkillsText = rawTags ? `${rawTags} | ${rawSkills}` : rawSkills;

        combinedDatabase.push({
          card_name: cardName,
          card_type: cardType,
          bloom_level: bloomLevel,
          card_id: finalCardId,
          hp: isNaN(hp) ? null : hp,
          skills_text: finalSkillsText,
          thumbnail: null,
          raw_type: typeRaw.toLowerCase(),
        });
      }
    } catch (error) {
      console.warn(`[CSV Loader] Failed to load or parse ${fileName}:`, error);
    }
  }

  masterCardPool = combinedDatabase;

  // 👉 NEW: Build the variant mapping dictionary
  masterCardPool.forEach((c) => {
    let baseId = c.card_id.split("_")[0];
    if (!window.cardVariants[baseId]) window.cardVariants[baseId] = [];
    window.cardVariants[baseId].push(c.card_id);
  });
  // Permanently sort database by Card ID order
  masterCardPool.sort((a, b) => a.card_id.localeCompare(b.card_id));
  document.getElementById("search-db-input").value = "";
  document.getElementById("search-db-input2").value = "";
  renderCardPool("");
}

// 👉 NEW: Replace the old sort listener with the set-select listener!
document.getElementById("set-select").addEventListener("change", (e) => {
  currentSetFilter = e.target.value;
  const activeSearch =
    document.getElementById("search-db-input").value ||
    document.getElementById("search-db-input2").value ||
    "";
  renderCardPool(activeSearch);
});

/* ── FILTER CHIP SYSTEM ── */
window.setChipFilter = function (tag, btn) {
  document
    .querySelectorAll(".filter-chips .chip")
    .forEach((c) => c.classList.remove("active"));
  if (btn) btn.classList.add("active");

  const searchInput = document.getElementById("search-db-input");
  const searchInput2 = document.getElementById("search-db-input2");
  if (searchInput) searchInput.value = tag;
  if (searchInput2) searchInput2.value = tag;

  renderCardPool(tag);
};

window.setView = function (mode) {
  const dbGrid = document.getElementById("scanned-pool");
  const gridBtn = document.getElementById("btn-grid-view");
  const listBtn = document.getElementById("btn-list-view");

  if (mode === "list") {
    dbGrid.classList.add("list-view");
    listBtn.style.background = "var(--brand-main)";
    listBtn.style.color = "white";
    gridBtn.style.background = "transparent";
    gridBtn.style.color = "var(--text-dim)";
  } else {
    dbGrid.classList.remove("list-view");
    gridBtn.style.background = "var(--brand-main)";
    gridBtn.style.color = "white";
    listBtn.style.background = "transparent";
    listBtn.style.color = "var(--text-dim)";
  }
};

window.toggleAccordion = function (element) {
  const cardItem = element.closest(".card-item");
  const allExpanded = document.querySelectorAll(".card-item.expanded");
  allExpanded.forEach((acc) => {
    if (acc !== cardItem) {
      acc.classList.remove("expanded");
      acc.querySelector(".list-content").style.maxHeight = null;
    }
  });

  cardItem.classList.toggle("expanded");
  const content = cardItem.querySelector(".list-content");

  if (cardItem.classList.contains("expanded")) {
    content.style.maxHeight = content.scrollHeight + 50 + "px";
    setTimeout(() => {
      cardItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 250);
  } else {
    content.style.maxHeight = null;
  }
};

function getDeck() {
  return localStorage.getItem("ocgCustomDeck")
    ? JSON.parse(localStorage.getItem("ocgCustomDeck"))
    : [];
}

function saveDeck(deckArray) {
  localStorage.setItem("ocgCustomDeck", JSON.stringify(deckArray));
  renderDeck();
  updateBookmarkButtons();
}

function addCardToDeck(cardData) {
  let deck = getDeck();
  if (!deck.some((card) => card.card_id === cardData.card_id)) {
    deck.push(cardData);
    saveDeck(deck);
  }
}

function updateBookmarkButtons() {
  const savedCardIds = new Set(getDeck().map((c) => c.card_id));
  document.querySelectorAll(".bookmark-btn").forEach((btn) => {
    const cardId = btn.getAttribute("data-card-id");
    if (savedCardIds.has(cardId)) {
      btn.className = "bookmark-btn saved";
      btn.innerHTML = "<i class='ti ti-star-filled'></i>";
      btn.onclick = (e) => {
        e.stopPropagation();
        removeCardFromDeckByCardId(cardId);
      };
    } else {
      btn.className = "bookmark-btn unsaved";
      btn.innerHTML = "<i class='ti ti-star'></i>";
      btn.onclick = (e) => {
        e.stopPropagation();
        window.handleAddClick(cardId);
      };
    }
  });
}

function removeCardFromDeckByCardId(cardId) {
  let deck = getDeck();
  const index = deck.findIndex((c) => c.card_id === cardId);
  if (index > -1) {
    deck.splice(index, 1);
    saveDeck(deck);
  }
}

function formatSkillText(card) {
  let rawText = card.skills_text || "None";

  // 👉 THE FIX: Sanitize the angle brackets FIRST so names like <Fuwawa...> don't disappear
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
function buildCardHtml(card, isSaved) {
  // 👉 1. ESCAPE TEXT FOR HTML DISPLAY
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
                    <img src="${imagePath}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImage}'" />
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
                        <img src="${imagePath}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImage}'" />
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
                            <img src="${imagePath}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImage}'" />
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

function renderCardPool(searchQuery = "") {
  const poolContainer = document.getElementById("scanned-pool");
  const countDisplay = document.getElementById("cardCount");
  if (masterCardPool.length === 0) return;

  // Split the search query into individual words and convert standalone rarities
  const queryWords = searchQuery
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (["sr", "hr", "ur", "our", "sec"].includes(word)) return "_" + word;
      return word;
    });

  currentFilteredPool = masterCardPool.filter((card) => {
    if (
      currentSetFilter !== "all" &&
      !card.card_id.startsWith(currentSetFilter)
    )
      return false;
    const nameSafe = card.card_name ? card.card_name.toLowerCase() : "";
    const idSafe = card.card_id ? card.card_id.toLowerCase() : "";
    const typeSafe = card.raw_type
      ? card.raw_type
      : card.card_type
        ? card.card_type.toLowerCase()
        : "";
    const skillSafe = card.skills_text ? card.skills_text.toLowerCase() : "";
    const bloomSafe = card.bloom_level ? card.bloom_level.toLowerCase() : "";

    const isAltArt = card.card_id.includes("_");
    const searchWordsUpper = searchQuery.toUpperCase().trim().split(/\s+/);
    const isSearchingPremium =
      searchQuery.includes("_") ||
      ["SR", "HR", "UR", "OUR", "SEC"].some((r) =>
        searchWordsUpper.includes(r),
      );

    if (isAltArt && !isSearchingPremium) return false;

    if (queryWords.length === 0 || queryWords[0] === "") return true;

    // The card must match EVERY word you typed
    return queryWords.every((word) => {
      const synergyTerms = getSynergyTerms(word); // Checks for synergy/nicknames

      // 👉 NEW: The card must match AT LEAST ONE of the synergy rules for this specific word
      return synergyTerms.some((term) => {
        const strictTypes = [
          "oshi",
          "holomem",
          "support",
          "cheer",
          "tool",
          "event",
          "mascot",
          "fan",
          "staff",
          "item",
          "limited",
          "debut",
          "1st",
          "2nd",
          "spot",
        ];
        if (strictTypes.includes(term))
          return typeSafe.includes(term) || bloomSafe.includes(term);
        if (term.startsWith("#"))
          return (
            skillSafe.includes(term) ||
            nameSafe.includes(term) ||
            bloomSafe.includes(term.substring(1))
          );

        // ── STRICT CHARACTER ISOLATION ──
        const strictHolomemNames = [
          "sora",
          "roboco",
          "robocosan",
          "miko",
          "suisei",
          "azki",
          "aki",
          "haato",
          "haachama",
          "fubuki",
          "matsuri",
          "mel",
          "aqua",
          "shion",
          "ayame",
          "choco",
          "subaru",
          "mio",
          "okayu",
          "korone",
          "pekora",
          "flare",
          "noel",
          "marine",
          "kanata",
          "watame",
          "towa",
          "luna",
          "lamy",
          "nene",
          "botan",
          "polka",
          "la+",
          "lui",
          "koyori",
          "chloe",
          "iroha",
          "risu",
          "moona",
          "iofi",
          "ollie",
          "anya",
          "reine",
          "zeta",
          "kaela",
          "kobo",
          "calliope",
          "kiara",
          "ina'nis",
          "gura",
          "amelia",
          "irys",
          "fauna",
          "kronii",
          "mumei",
          "baelz",
          "shiori",
          "bijou",
          "nerissa",
          "fuwawa",
          "mococo",
          "fuwamoco",
          "elizabeth",
          "gigi",
          "cecilia",
          "raora",
          "riona",
          "niko",
          "su",
          "chihaya",
          "vivi",
          "ao",
          "kanade",
          "ririka",
          "raden",
          "hajime",
        ];

        if (strictHolomemNames.includes(term)) {
          const isDirectMatch =
            nameSafe.includes(term) || skillSafe.includes(`#${term}`);
          const isSupportMatch =
            (card.card_type === "Support" || card.card_type === "Cheer") &&
            (nameSafe.includes(term) || skillSafe.includes(term));

          let relatedGroups = [];
          for (const group in synergyDictionary) {
            if (synergyDictionary[group].includes(term)) {
              relatedGroups.push(group);
            }
          }
          const isGroupSupport =
            (card.card_type === "Support" || card.card_type === "Cheer") &&
            relatedGroups.some(
              (g) =>
                nameSafe.includes(g) ||
                skillSafe.includes(g) ||
                skillSafe.includes(`#${g.replace(/\s+/g, "")}`),
            );

          return isDirectMatch || isSupportMatch || isGroupSupport;
        }

        return (
          nameSafe.includes(term) ||
          idSafe.includes(term) ||
          typeSafe.includes(term) ||
          skillSafe.includes(term) ||
          bloomSafe.includes(term)
        );
      });
    });
  });

  poolContainer.innerHTML = "";
  renderedCount = 0;
  if (countDisplay) countDisplay.textContent = currentFilteredPool.length;

  if (currentFilteredPool.length === 0) {
    poolContainer.innerHTML = `<div class="empty-state">No cards found matching "${searchQuery}".</div>`;
    return;
  }

  loadNextChunk();
}

function loadNextChunk() {
  const poolContainer = document.getElementById("scanned-pool");
  const currentBookmarks = getDeck();
  const savedCardIds = new Set(currentBookmarks.map((c) => c.card_id));

  const endIndex = Math.min(
    renderedCount + CHUNK_SIZE,
    currentFilteredPool.length,
  );
  let htmlBuilder = "";

  for (let i = renderedCount; i < endIndex; i++) {
    const card = currentFilteredPool[i];
    const isSaved = savedCardIds.has(card.card_id);
    htmlBuilder += buildCardHtml(card, isSaved); // 👉 Uses the helper
  }
  poolContainer.insertAdjacentHTML("beforeend", htmlBuilder);
  renderedCount = endIndex;

  const targetUnrevealed = poolContainer.querySelectorAll(
    ".card-item:not(.fade-in)",
  );
  targetUnrevealed.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add("fade-in");
    }, index * 20);
  });
}

// Desktop Scroll
document.getElementById("scanned-pool").addEventListener("scroll", function () {
  if (window.innerWidth > 768) {
    if (this.scrollTop + this.clientHeight >= this.scrollHeight - 600) {
      if (renderedCount < currentFilteredPool.length) loadNextChunk();
    }
  }
});

// Mobile Scroll
document.querySelector(".main-panel").addEventListener("scroll", function () {
  if (window.innerWidth <= 768) {
    if (this.scrollTop + this.clientHeight >= this.scrollHeight - 800) {
      if (renderedCount < currentFilteredPool.length) loadNextChunk();
    }
  }
});

/* ── NATIVE APP BOTTOM SHEET SWIPE-TO-CLOSE LOGIC ── */
const dragArea = document.getElementById("sheet-drag-area");
const bottomSheet = document.getElementById("mobile-bottom-sheet");
let startY = 0;
let currentY = 0;
let isDragging = false;

dragArea.addEventListener(
  "touchstart",
  (e) => {
    startY = e.touches[0].clientY;
    currentY = startY;
    isDragging = true;
    bottomSheet.style.transition = "none";
  },
  { passive: true },
);

dragArea.addEventListener(
  "touchmove",
  (e) => {
    if (!isDragging) return;
    currentY = e.touches[0].clientY;
    let deltaY = currentY - startY;

    if (deltaY > 0) {
      bottomSheet.style.transform = `translateY(${deltaY}px)`;
    }
  },
  { passive: true },
);

dragArea.addEventListener("touchend", () => {
  if (!isDragging) return;
  isDragging = false;
  let deltaY = currentY - startY;

  bottomSheet.style.transition =
    "transform 0.3s ease, bottom 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)";

  if (deltaY > 60) {
    closeBottomSheet();
  } else {
    bottomSheet.style.transform = "translateY(0)";
  }
});

function tapToggle(el) {
  if (window.innerWidth > 768) return;
  if (el.closest(".card-grid").classList.contains("list-view")) return;

  const cardId = el.getAttribute("data-id");
  if (cardId) openBottomSheet(cardId);
}

function openBottomSheet(cardId) {
  const card = masterCardPool.find((c) => c.card_id === cardId);
  if (!card) return;

  const isSaved = getDeck().some((c) => c.card_id === cardId);
  const { formattedTagsHtml, formattedSkillHtml, formattedArtsHtml } =
    formatSkillText(card);
  const typeClass = getTypeClass(card.card_type);
  const type = escapeHtml(card.card_type || "Type");
  const safeBloom = escapeHtml(card.bloom_level);
  const level = safeBloom ? `[${safeBloom}] ` : "";

  let btnHtml = isSaved
    ? `<button class="bookmark-btn saved" data-card-id="${escapeHtml(card.card_id)}" onclick="event.stopPropagation(); window.toggleBookmarkFromSheet('${escapeHtml(card.card_id)}')"><i class="ti ti-star-filled"></i></button>`
    : `<button class="bookmark-btn unsaved" data-card-id="${escapeHtml(card.card_id)}" onclick="event.stopPropagation(); window.toggleBookmarkFromSheet('${escapeHtml(card.card_id)}')"><i class="ti ti-star"></i></button>`;

  let hpHtml = card.hp
    ? `<div class="tl-hp" style="font-size: 22px; color: #FFD700; font-weight: 800; text-align: center; padding-top: 12px; margin-top: 12px; border-top: 1px solid var(--border-dim);">HP: ${escapeHtml(card.hp)}</div>`
    : "";

  const setPrefix = card.card_id.split("-")[0];
  const imagePath = card.thumbnail
    ? card.thumbnail
    : `images/${setPrefix}/${card.card_id}.webp`;

  
  const safeName = escapeHtml(card.card_name);
  const safeId = escapeHtml(card.card_id);
  
  document.getElementById("sheet-content").innerHTML = `
          <div style="display: flex; gap: 16px; margin-bottom: 20px;">
              <img src="${imagePath}" style="width: 110px; border-radius: 8px; border: 1px solid var(--border-dim); object-fit: cover;" onerror="this.onerror=null; this.src='${fallbackImage}'"/>
              <div style="flex: 1;">
                  <div class="tl-header" style="margin-bottom: 8px; justify-content: flex-start; gap: 12px;">
                      <span class="tl-type badge ${typeClass}">${type.toUpperCase()}</span>
                      ${btnHtml}
                  </div>
                  <div class="tl-title" style="font-size: 18px; color: var(--text-bright); font-weight: 800; line-height: 1.2;">${level}${safeName}</div>
                  <div style="font-size: 13px; color: var(--text-mid); margin-top: 6px; font-weight: 600;">${safeId}</div>
              </div>
          </div>
          ${formattedTagsHtml}
          ${formattedSkillHtml}
          ${formattedArtsHtml}
          ${hpHtml}
      `;

  document.getElementById("mobile-bottom-sheet").classList.add("open");
  document.getElementById("sheet-overlay").classList.add("open");
}

function closeBottomSheet() {
  document.getElementById("mobile-bottom-sheet").classList.remove("open");
  document.getElementById("sheet-overlay").classList.remove("open");
  setTimeout(() => {
    document.getElementById("mobile-bottom-sheet").style.transform =
      "translateY(0)";
  }, 350);
}

window.toggleBookmarkFromSheet = function (cardId) {
  const savedCardIds = new Set(getDeck().map((c) => c.card_id));
  if (savedCardIds.has(cardId)) {
    removeCardFromDeckByCardId(cardId);
  } else {
    handleAddClick(cardId);
  }
  openBottomSheet(cardId);
};

/* ── ABOUT MODAL LOGIC ── */
window.openAboutModal = function () {
  document.getElementById("about-modal").classList.add("open");
  document.getElementById("about-overlay").classList.add("open");
};
window.closeAboutModal = function () {
  document.getElementById("about-modal").classList.remove("open");
  document.getElementById("about-overlay").classList.remove("open");
};

// BOOKMARKS GRID RENDERING
function renderDeck() {
  const deckContainer = document.getElementById("current-deck");
  const countDisplay = document.getElementById("deck-count");
  const deck = getDeck();
  if (countDisplay) countDisplay.innerText = deck.length;

  if (deck.length === 0) {
    deckContainer.innerHTML = `<div class="empty-state">You haven't bookmarked any cards yet. Search below and tap the star icon!</div>`;
    return;
  }

  let htmlBuilder = "";
  deck.forEach((card) => {
    htmlBuilder += buildCardHtml(card, true); // 👉 Uses the helper
  });
  deckContainer.innerHTML = htmlBuilder;

  const targetDeckUnrevealed = deckContainer.querySelectorAll(
    ".card-item:not(.fade-in)",
  );
  targetDeckUnrevealed.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add("fade-in");
    }, index * 25);
  });
}

window.exportDecklist = function () {
  const deck = getDeck();
  if (deck.length === 0) return;
  let exportText = "My Bookmarked Cards:\n\n";
  deck.forEach((card) => {
    const level = card.bloom_level ? `[${card.bloom_level}] ` : "";
    const { skillText, artsText, isLimited } = formatSkillText(card);
    exportText += `Code: ${card.card_id}\nName: ${level}${card.card_name}\n`;
    if (
      skillText !== "None" &&
      skillText !== "No skills listed." &&
      skillText.trim() !== ""
    ) {
      let limitedLabel = isLimited ? "[LIMITED] " : "";
      exportText += `Skill:\n${limitedLabel}${skillText.replace(/<br>/g, "\n")}\n`;
    }
    if (artsText !== "-" && artsText !== "")
      exportText += `Arts:\n${artsText.replace("Arts:", "").trim().replace(/<br>/g, "\n")}\n`;
    exportText += `\n`;
  });

  navigator.clipboard.writeText(exportText.trim()).then(() => {
    // Visual Feedback
    const copyBtn = document.getElementById("btn-copy-deck");
    if (copyBtn) {
      const originalHTML = copyBtn.innerHTML;
      copyBtn.innerHTML = `<i class="ti ti-check"></i> <span>Copied!</span>`;
      copyBtn.style.color = "var(--brand-main)";
      copyBtn.style.borderColor = "var(--brand-main)";
      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.style.color = "";
        copyBtn.style.borderColor = "";
      }, 2000);
    }
  });
};

window.clearAllBookmarks = function () {
  if (confirm("Are you sure you want to remove ALL bookmarked cards?"))
    saveDeck([]);
};

let searchTimeout;
document.getElementById("search-db-input").addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    document
      .querySelectorAll(".filter-chips .chip")
      .forEach((c) => c.classList.remove("active"));
    renderCardPool(e.target.value);
  }, 150);
});
document.getElementById("search-db-input2").addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    document
      .querySelectorAll(".filter-chips .chip")
      .forEach((c) => c.classList.remove("active"));
    renderCardPool(e.target.value);
  }, 150);
});

window.handleAddClick = function (cardId) {
  const cardToCopy = masterCardPool.find((c) => c.card_id === cardId);
  if (cardToCopy) addCardToDeck(cardToCopy);
};

initializeDatabase();
renderDeck();

/* ── VISITOR COUNTER ── */
async function updateVisitorCounter() {
  const counterEl = document.getElementById("visitor-count");
  if (!counterEl) return;

  try {
    const response = await fetch(
      "https://api.counterapi.dev/v1/hocg_db_siuspras/visits_2/up",
    );
    if (response.ok) {
      const data = await response.json();
      let count = data.count;
      let displayStr =
        count < 10
          ? count.toString()
          : (
              Math.floor(count / Math.pow(10, Math.floor(Math.log10(count)))) *
              Math.pow(10, Math.floor(Math.log10(count)))
            ).toLocaleString() + "+";
      counterEl.innerText = displayStr;
    } else {
      counterEl.parentElement.style.display = "none"; // Hide row if fails
    }
  } catch (error) {
    counterEl.parentElement.style.display = "none"; // Hide row if fails
  }
}

updateVisitorCounter();

// ── LAYOUT TOGGLE LOGIC ──
window.toggleLayout = function (mode) {
  const mainPanel = document.querySelector(".main-panel");
  const bookmarkGrid = document.getElementById("current-deck"); // The bookmarks container

  // 1. Remove both layout classes to reset to the default split view
  mainPanel.classList.remove("layout-left-full", "layout-right-full");

  // 2. Always safely reset the Bookmarks back to List View by default
  if (bookmarkGrid) {
    bookmarkGrid.classList.add("list-view");
  }

  // 3. Apply the requested full-screen class
  if (mode === "left") {
    mainPanel.classList.add("layout-left-full");

    // 👉 NEW: Remove the list-view class so the Bookmarks become a Grid!
    if (bookmarkGrid) {
      bookmarkGrid.classList.remove("list-view");
    }
  } else if (mode === "right") {
    mainPanel.classList.add("layout-right-full");
  }
};

function escapeHtml(str) {
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
