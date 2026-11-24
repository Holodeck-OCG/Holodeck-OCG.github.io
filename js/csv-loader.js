/**
 * CSV Loader - Shared module for parsing and loading CSV card data
 * Used by: index.js, card-library.js, deckbuilder.js, quiz.js, tournaments.js
 */

export const csvFilesToLoad = [
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

/**
 * Parse CSV text into rows, handling quoted fields and escaped quotes
 */
export function parseCSV(text) {
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

/**
 * Load and parse all CSV files, returning combined card database
 * @returns {Promise<Array>} Array of card objects
 */
export async function loadCardDatabase() {
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

  // Build variant mapping dictionary
  window.cardVariants = {};
  combinedDatabase.forEach((c) => {
    let baseId = c.card_id.split("_")[0];
    if (!window.cardVariants[baseId]) window.cardVariants[baseId] = [];
    window.cardVariants[baseId].push(c.card_id);
  });

  // Sort database by Card ID order
  combinedDatabase.sort((a, b) => a.card_id.localeCompare(b.card_id));

  return combinedDatabase;
}