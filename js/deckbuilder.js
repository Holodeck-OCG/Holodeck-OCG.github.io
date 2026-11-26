/**
 * deckbuilder - Page-specific logic (extracted from original inline script)
 * Maintains full original functionality
 */



// ===== BLOCK 1 =====

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

      let currentSort = "id-asc";

      const synergyDictionary = {
        holox: ["la+", "lui", "koyori", "chloe", "iroha", "holox"],
        myth: ["calliope", "kiara", "ina'nis", "gura", "amelia", "myth"],
        promise: ["fauna", "kronii", "mumei", "baelz", "irys", "promise"],
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
        nene: [
          "momosuzu nene",
          "nene",
          "nekko",
          "giraffe stag beetle",
          "beetle",
        ],
        zeta: ["vestia zeta", "zeta", "zecretary", "bazo"],
        kronii: ["ouro kronii", "kronii", "kronies", "boros"],
        shiori: ["shiori novella", "shiori", "novellite", "bookmark"],
        kiara: ["takanashi kiara", "kiara", "kfp"],
        pekora: ["usada pekora", "pekora", "nousagi", "don-chan", "carrot"],
      };

      function getSynergyTerms(query) {
        const lowerQuery = query.toLowerCase().trim();
        for (const member in synergyDictionary) {
          if (member.includes(lowerQuery) || lowerQuery.includes(member)) {
            return synergyDictionary[member];
          }
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
              if (char === "\r" && i + 1 < text.length && text[i + 1] === "\n")
                i++;
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
              if (headers[i].includes("life") || headers[i].includes("hp"))
                hpIdx = i;
              if (headers[i].includes("tag")) tagsIdx = i;
              if (headers[i].includes("text")) textIdx = i;
            }

            for (let i = 1; i < rows.length; i++) {
              const cols = rows[i];
              if (cols.length < 3) continue;

              const setCode = cols[0];
              const nameRaw = cols[1];
              if (
                !setCode ||
                !nameRaw ||
                setCode.toLowerCase().includes("setcode")
              )
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
              let finalSkillsText = rawTags
                ? `${rawTags} | ${rawSkills}`
                : rawSkills;

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
          } catch (error) {}
        }

        masterCardPool = combinedDatabase;
        sortPool();
        document.getElementById("search-db-input").value = "";
        renderCardPool("");

        loadSavedDeck();
        renderDecklist();
      }

      function sortPool() {
        masterCardPool.sort((a, b) => {
          if (currentSort === "name-asc")
            return a.card_name.localeCompare(b.card_name);
          if (currentSort === "name-desc")
            return b.card_name.localeCompare(a.card_name);
          if (currentSort === "id-asc")
            return a.card_id.localeCompare(b.card_id);
          if (currentSort === "id-desc")
            return b.card_id.localeCompare(a.card_id);
          return 0;
        });
      }

      document.getElementById("sort-select").addEventListener("change", (e) => {
        currentSort = e.target.value;
        sortPool();
        renderCardPool(document.getElementById("search-db-input").value);
      });

      /* ΓöÇΓöÇ FILTER CHIP SYSTEM ΓöÇΓöÇ */
      window.setChipFilter = function (tag, btn) {
        document
          .querySelectorAll(".filter-chips .chip")
          .forEach((c) => c.classList.remove("active"));
        if (btn) btn.classList.add("active");

        const searchInput = document.getElementById("search-db-input");
        if (searchInput) searchInput.value = tag;

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

      // NOTE: addCardToDeck is defined in the second script block below
      // (the improved version that handles both ID strings and card objects)

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

      function formatSkillText(card) {
        let rawText = card.skills_text || "None";

        // ≡ƒæë THE FIX: Sanitize the angle brackets FIRST so names like <Fuwawa...> don't disappear
        let safeText = rawText
          .toString()
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

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
        if (skillText.startsWith("<br>"))
          skillText = skillText.substring(4).trim();

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
          } else if (
            skillText !== "None" &&
            skillText !== "No skills listed."
          ) {
            label1 = "Auto Effect";
            skillText = skillText.replace(/Auto [Ee]ffect:?\s*/, "");
            label1Color = "var(--holo-orange)";
            label1TextColor = "#000";
          }
        }

        let formattedTagsHtml = "";
        if (tags && tags.trim() !== "") {
          formattedTagsHtml = `<div style="background: #FFFFFF; border: 1px solid #d1dce8; border-radius: 8px; padding: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02); margin-bottom: 0.75rem;"><div style="font-size: 0.85rem; text-transform: uppercase; font-weight: 800; margin-bottom: 0.5rem; color: #000; background: var(--holo-orange); display: inline-block; padding: 0.2rem 0.6rem; border-radius: 4px;">Tag</div><div style="font-weight: 800; color: var(--holo-blue); line-height: 1.5; font-size: 1.05rem;">${tags}</div></div>`;
        }

        let limitedBadgeHtml = isLimited
          ? `<div style="font-size: 0.85rem; text-transform: uppercase; font-weight: 800; margin-bottom: 0.5rem; color: #fff; background: var(--danger); display: inline-block; padding: 0.2rem 0.6rem; border-radius: 4px; margin-left: 0.5rem;">Limited</div>`
          : "";

        let formattedSkillHtml = "";
        if (
          skillText !== "None" &&
          skillText !== "No skills listed." &&
          skillText.trim() !== ""
        ) {
          formattedSkillHtml = `<div style="background: #FFFFFF; border: 1px solid #d1dce8; border-radius: 8px; padding: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02); margin-bottom: 0.75rem;"><div style="font-size: 0.85rem; text-transform: uppercase; font-weight: 800; margin-bottom: 0.5rem; color: ${label1TextColor}; background: ${label1Color}; display: inline-block; padding: 0.2rem 0.6rem; border-radius: 4px;">${label1}</div>${limitedBadgeHtml}<div style="font-weight: 600; color: #171e30; line-height: 1.5; font-size: 1.05rem;">${skillText}</div></div>`;
        }

        let formattedArtsHtml =
          artsText !== "-" && artsText !== ""
            ? `<div style="background: #FFFFFF; border: 1px solid #d1dce8; border-radius: 8px; padding: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02);"><div style="font-size: 0.85rem; text-transform: uppercase; font-weight: 800; margin-bottom: 0.5rem; color: ${label2TextColor}; background: ${label2Color}; display: inline-block; padding: 0.2rem 0.6rem; border-radius: 4px;">${label2}</div><div style="font-weight: 600; color: #171e30; line-height: 1.5; font-size: 1.05rem;">${artsText}</div></div>`
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

      function renderCardPool(searchQuery = "") {
        const poolContainer = document.getElementById("scanned-pool");
        const countDisplay = document.getElementById("cardCount");
        if (masterCardPool.length === 0) return;

        // ≡ƒæë NEW: Split the search query into individual words
        const queryWords = searchQuery.toLowerCase().trim().split(/\s+/);

        currentFilteredPool = masterCardPool.filter((card) => {
          const nameSafe = card.card_name ? card.card_name.toLowerCase() : "";
          const idSafe = card.card_id ? card.card_id.toLowerCase() : "";
          const typeSafe = card.raw_type
            ? card.raw_type
            : card.card_type
              ? card.card_type.toLowerCase()
              : "";
          const skillSafe = card.skills_text
            ? card.skills_text.toLowerCase()
            : "";
          const bloomSafe = card.bloom_level
            ? card.bloom_level.toLowerCase()
            : "";

          const isAltArt = card.card_id.includes("_");
          const isSearchingPremium =
            searchQuery.includes("_") ||
            ["SR", "HR", "UR", "OUR", "SEC"].some((r) =>
              searchQuery.toUpperCase().includes(r),
            );
          if (isAltArt && !isSearchingPremium) return false;

          if (queryWords.length === 0 || queryWords[0] === "") return true;

          // ≡ƒæë NEW: The card must match EVERY word you typed
          return queryWords.every((word) => {
            const synergyTerms = getSynergyTerms(word); // Checks for synergy/nicknames

            // ≡ƒæë NEW: The card must match AT LEAST ONE of the synergy rules for this specific word
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

              // ΓöÇΓöÇ STRICT CHARACTER ISOLATION ΓöÇΓöÇ
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
                  (card.card_type === "Support" ||
                    card.card_type === "Cheer") &&
                  (nameSafe.includes(term) || skillSafe.includes(term));

                let relatedGroups = [];
                for (const group in synergyDictionary) {
                  if (synergyDictionary[group].includes(term)) {
                    relatedGroups.push(group);
                  }
                }
                const isGroupSupport =
                  (card.card_type === "Support" ||
                    card.card_type === "Cheer") &&
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
          const type = card.card_type || "Type";
          const level = card.bloom_level ? `[${card.bloom_level}] ` : "";

          const typeClass = getTypeClass(card.card_type);
          const iconClass = getIconClass(card.card_type);
          const setPrefix = card.card_id.split("-")[0];
          const imagePath = card.thumbnail
            ? card.thumbnail
            : `images/${setPrefix}/${card.card_id}.webp`;

          const { formattedTagsHtml, formattedSkillHtml, formattedArtsHtml } =
            formatSkillText(card);

          const isAltArt = card.card_id.match(/_(OUR|SEC|UR|HR|SR)$/i);
          const premiumClass = isAltArt ? "premium-alt-art" : "";

          let btnHtml = isSaved
            ? `<button class="bookmark-btn saved" data-card-id="${card.card_id}" onclick="event.stopPropagation(); window.removeCardFromDeckByCardId('${card.card_id}')"><i class="ti ti-star-filled"></i></button>`
            : `<button class="bookmark-btn unsaved" data-card-id="${card.card_id}" onclick='event.stopPropagation(); window.handleAddClick("${card.card_id}")'><i class="ti ti-star"></i></button>`;

          let hpHtml = card.hp ? `<div class="tl-hp">HP: ${card.hp}</div>` : "";

          htmlBuilder += `
              <div class="card-item ${premiumClass}" tabindex="0" data-id="${card.card_id}" data-name="${card.card_name}" onclick="addCardToDeck('${card.card_id}')">
                  
                  <div class="card-face ${typeClass} grid-element">
                      <img src="${imagePath}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='${fallbackImage}'" />
                      <i class="ti ${iconClass}"></i>
                      <span class="face-label">${type.toUpperCase()}</span>
                  </div>
                  <div class="card-meta grid-element">
                      <span class="card-name-jp">${level}${card.card_name}</span>
                      <span class="card-id">${card.card_id}</span>
                      <div class="card-badges">
                          <span class="badge ${typeClass}">${type.toUpperCase()}</span>
                      </div>
                  </div>
                  <div class="translation-overlay grid-element">
                      <div class="tl-header">
                          <span class="tl-type badge ${typeClass}">${type.toUpperCase()}</span>
                          ${btnHtml}
                      </div>
                      <div class="tl-title">${level}${card.card_name}</div>
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
                          <div class="list-name">${level}${card.card_name}</div>
                          <div class="list-sub">${type.toUpperCase()} ${card.card_id}</div>
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
      document
        .getElementById("scanned-pool")
        .addEventListener("scroll", function () {
          if (window.innerWidth > 768) {
            if (this.scrollTop + this.clientHeight >= this.scrollHeight - 600) {
              if (renderedCount < currentFilteredPool.length) loadNextChunk();
            }
          }
        });

      // Mobile Scroll
      document
        .querySelector(".main-panel")
        .addEventListener("scroll", function () {
          if (window.innerWidth <= 768) {
            if (this.scrollTop + this.clientHeight >= this.scrollHeight - 800) {
              if (renderedCount < currentFilteredPool.length) loadNextChunk();
            }
          }
        });

      /* ΓöÇΓöÇ NATIVE APP BOTTOM SHEET SWIPE-TO-CLOSE LOGIC ΓöÇΓöÇ */
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
        const type = card.card_type || "Type";
        const level = card.bloom_level ? `[${card.bloom_level}] ` : "";

        let btnHtml = `<button class="bookmark-btn saved" data-card-id="${card.card_id}" onclick="event.stopPropagation(); window.removeCardFromDeckByCardId('${card.card_id}')"><i class="ti ti-star-filled"></i></button>`;

        let hpHtml = card.hp
          ? `<div class="tl-hp" style="font-size: 22px; color: #FFD700; font-weight: 800; text-align: center; padding-top: 12px; margin-top: 12px; border-top: 1px solid var(--border-dim);">HP: ${card.hp}</div>`
          : "";

        const setPrefix = card.card_id.split("-")[0];
        const imagePath = card.thumbnail
          ? card.thumbnail
          : `images/${setPrefix}/${card.card_id}.webp`;

        document.getElementById("sheet-content").innerHTML = `
          <div style="display: flex; gap: 16px; margin-bottom: 20px;">
              <img src="${imagePath}" style="width: 110px; border-radius: 8px; border: 1px solid var(--border-dim); object-fit: cover;" onerror="this.onerror=null; this.src='${fallbackImage}'"/>
              <div style="flex: 1;">
                  <div class="tl-header" style="margin-bottom: 8px; justify-content: flex-start; gap: 12px;">
                      <span class="tl-type badge ${typeClass}">${type.toUpperCase()}</span>
                  </div>
                  <div class="tl-title" style="font-size: 18px; color: var(--text-bright); font-weight: 800; line-height: 1.2;">${level}${card.card_name}</div>
                  <div style="font-size: 13px; color: var(--text-mid); margin-top: 6px; font-weight: 600;">${card.card_id}</div>
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

      /* ΓöÇΓöÇ ABOUT MODAL LOGIC ΓöÇΓöÇ */
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
          const type = card.card_type || "Type";
          const level = card.bloom_level ? `[${card.bloom_level}] ` : "";

          const typeClass = getTypeClass(card.card_type);
          const iconClass = getIconClass(card.card_type);
          const setPrefix = card.card_id.split("-")[0];
          const imagePath = card.thumbnail
            ? card.thumbnail
            : `images/${setPrefix}/${card.card_id}.webp`;

          const { formattedTagsHtml, formattedSkillHtml, formattedArtsHtml } =
            formatSkillText(card);

          const isAltArt = card.card_id.match(/_(OUR|SEC|UR|HR|SR)$/i);
          const premiumClass = isAltArt ? "premium-alt-art" : "";

          let btnHtml = isSaved
            ? `<button class="bookmark-btn saved" data-card-id="${card.card_id}" onclick="event.stopPropagation(); window.removeCardFromDeckByCardId('${card.card_id}')"><i class="ti ti-star-filled"></i></button>`
            : `<button class="bookmark-btn unsaved" data-card-id="${card.card_id}" onclick='event.stopPropagation(); window.handleAddClick("${card.card_id}")'><i class="ti ti-star"></i></button>`;

          let hpHtml = card.hp ? `<div class="tl-hp">HP: ${card.hp}</div>` : "";

          htmlBuilder += `
              <div class="card-item ${premiumClass}" tabindex="0" data-id="${card.card_id}" data-name="${card.card_name}" onclick="addCardToDeck('${card.card_id}')">
                  
                  <div class="card-face ${typeClass} grid-element">
                      <img src="${imagePath}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='${fallbackImage}'" />
                      <i class="ti ${iconClass}"></i>
                      <span class="face-label">${type.toUpperCase()}</span>
                  </div>
                  <div class="card-meta grid-element">
                      <span class="card-name-jp">${level}${card.card_name}</span>
                      <span class="card-id">${card.card_id}</span>
                      <div class="card-badges">
                          <span class="badge ${typeClass}">${type.toUpperCase()}</span>
                      </div>
                  </div>
                  <div class="translation-overlay grid-element">
                      <div class="tl-header">
                          <span class="tl-type badge ${typeClass}">${type.toUpperCase()}</span>
                      </div>
                      <div class="tl-title">${level}${card.card_name}</div>
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
                          <div class="list-name">${level}${card.card_name}</div>
                          <div class="list-sub">${type.toUpperCase()} ${card.card_id}</div>
                      </div>
                      <div class="list-actions">
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
        navigator.clipboard
          .writeText(exportText.trim())
          .then(() => alert("Bookmark list copied to your clipboard!"));
      };

      window.clearAllBookmarks = function () {
        if (confirm("Are you sure you want to remove ALL bookmarked cards?"))
          saveDeck([]);
      };

      let searchTimeout;
      document
        .getElementById("search-db-input")
        .addEventListener("input", (e) => {
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

      /* ΓöÇΓöÇ VISITOR COUNTER ΓöÇΓöÇ */
      // counterapi.dev retired this counter (HTTP 410) — hide the row, no request.
      function updateVisitorCounter() {
        const counterEl = document.getElementById("visitor-count");
        if (counterEl?.parentElement) {
          counterEl.parentElement.style.display = "none";
        }
      }

      updateVisitorCounter();
      // ΓöÇΓöÇ DECK BUILDER STATE ΓöÇΓöÇ
      let currentDeck = {
        oshi: null, // Stores a single card object
        main: {}, // Stores { card_id: quantity }
        cheer: {}, // Stores { card_id: quantity }
      };

      function addCardToDeck(cardInput) {
        // Failsafe: Support both ID strings and full card objects
        const targetId =
          typeof cardInput === "object" ? cardInput.card_id : cardInput;
        const card = masterCardPool.find((c) => c.card_id === targetId);

        if (!card) return;

        const type = card.card_type; // e.g., "Oshi", "Cheer", "Holomem", "Support"

        // 1. Handle Oshi Zone
        if (type === "Oshi") {
          currentDeck.oshi = card;
          renderDecklist();
          return;
        }

        // 2. Handle Cheer Deck (Max 20 total)
        if (type === "Cheer") {
          let currentCheerCount = Object.values(currentDeck.cheer).reduce(
            (a, b) => a + b,
            0,
          );
          if (currentCheerCount >= 20)
            return alert("Cheer deck is full (20/20)!");

          currentDeck.cheer[targetId] = (currentDeck.cheer[targetId] || 0) + 1;
          renderDecklist();
          return;
        }

        // 3. Handle Main Deck (Max 50 total, Max 4 per card)
        let currentMainCount = Object.values(currentDeck.main).reduce(
          (a, b) => a + b,
          0,
        );
        if (currentMainCount >= 50) return alert("Main deck is full (50/50)!");

        let cardCopies = currentDeck.main[targetId] || 0;

        const safeSkill = card.skills_text
          ? card.skills_text.toLowerCase()
          : "";

        // ≡ƒæë THE TRUE FIX: Only isolate the phrase "any number" to target unlimited cards
        const isUnlimited = safeSkill.includes("any number");

        // Apply the standard 4-copy limit, but BYPASS it if it is unlimited
        if (cardCopies >= 4 && !isUnlimited) {
          return alert("You can only have 4 copies of a specific card!");
        }

        currentDeck.main[targetId] = cardCopies + 1;
        renderDecklist();
      }

      function removeCardFromDeck(cardId, zone) {
        if (zone === "oshi") {
          currentDeck.oshi = null;
        } else {
          if (currentDeck[zone][cardId] > 1) {
            currentDeck[zone][cardId]--;
          } else {
            delete currentDeck[zone][cardId];
          }
        }
        renderDecklist();
      }
      function renderDecklist() {
        // 1. Oshi Zone
        const oshiContainer = document.getElementById("deck-zone-oshi");
        oshiContainer.innerHTML = "";
        if (currentDeck.oshi) {
          oshiContainer.innerHTML = createDeckRowHtml(
            currentDeck.oshi,
            1,
            "oshi",
          );
        } else {
          oshiContainer.innerHTML = `<div style="color: var(--text-dim); font-size: 13px; font-style: italic; padding: 4px 0;">No Oshi selected.</div>`;
        }

        // 2. Main Deck Zone
        const mainContainer = document.getElementById("deck-zone-main");
        mainContainer.innerHTML = "";
        let mainCount = 0;
        let mainHtml = "";
        for (let cardId in currentDeck.main) {
          let qty = currentDeck.main[cardId];
          mainCount += qty;
          let card = masterCardPool.find((c) => c.card_id === cardId);
          if (card) mainHtml += createDeckRowHtml(card, qty, "main");
        }
        mainContainer.innerHTML =
          mainHtml ||
          `<div style="color: var(--text-dim); font-size: 13px; font-style: italic; padding: 4px 0;">Main deck is empty.</div>`;
        document.getElementById("count-main").innerText = mainCount;

        // 3. Cheer Deck Zone
        const cheerContainer = document.getElementById("deck-zone-cheer");
        cheerContainer.innerHTML = "";
        let cheerCount = 0;
        let cheerHtml = "";
        for (let cardId in currentDeck.cheer) {
          let qty = currentDeck.cheer[cardId];
          cheerCount += qty;
          let card = masterCardPool.find((c) => c.card_id === cardId);
          if (card) cheerHtml += createDeckRowHtml(card, qty, "cheer");
        }
        cheerContainer.innerHTML =
          cheerHtml ||
          `<div style="color: var(--text-dim); font-size: 13px; font-style: italic; padding: 4px 0;">Cheer deck is empty.</div>`;
        document.getElementById("count-cheer").innerText = cheerCount;
      }

      function createDeckRowHtml(card, qty, zone) {
        const setPrefix = card.card_id.split("-")[0];
        const imagePath = card.thumbnail
          ? card.thumbnail
          : `images/${setPrefix}/${card.card_id}.webp`;
        const isOshi = zone === "oshi";

        const level = card.bloom_level
          ? `<span style="color: var(--brand-main);">[${card.bloom_level}]</span> `
          : "";
        const typeColor =
          zone === "cheer"
            ? "var(--holo-rose)"
            : zone === "oshi"
              ? "var(--holo-gold)"
              : "var(--text-mid)";

        // The +/- buttons are disabled for the Oshi since you can only have 1
        const controls = isOshi
          ? `<button onclick="removeCardFromDeck('${card.card_id}', '${zone}')" style="background: transparent; border: none; color: var(--danger); cursor: pointer; padding: 2px 6px; font-weight: 800;"><i class="ti ti-trash"></i></button>`
          : `<button onclick="removeCardFromDeck('${card.card_id}', '${zone}')" style="background: transparent; border: none; color: var(--text-bright); cursor: pointer; padding: 2px 8px; font-weight: 800; font-size: 16px;">-</button>
             <span style="font-size: 13px; font-weight: 800; color: var(--brand-main); min-width: 14px; text-align: center;">${qty}</span>
             <button onclick="addCardToDeck('${card.card_id}')" style="background: transparent; border: none; color: var(--text-bright); cursor: pointer; padding: 2px 8px; font-weight: 800; font-size: 14px;">+</button>`;

        return `
      <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.2); border: 1px solid var(--border-dim); border-radius: 6px; padding: 4px 8px; gap: 10px;">
          
          <!-- ≡ƒæë UPGRADED: Taller thumbnail to look more like a card -->
          <div style="width: 32px; height: 44px; flex-shrink: 0; border-radius: 4px; overflow: hidden; border: 1px solid var(--border-dim);">
              <img src="${imagePath}" style="width: 100%; height: 100%; object-fit: cover; object-position: top;" onerror="this.onerror=null; this.src='${fallbackImage}'"/>
          </div>
          

          <div style="flex: 1; overflow: hidden; display: flex; flex-direction: column; justify-content: center; gap: 2px;">
              <div style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden; font-size: 13px; font-weight: 800; color: var(--text-bright);">
                  ${level}${card.card_name}
              </div>
              <div style="font-size: 10px; color: var(--text-dim); font-weight: 700; letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px;">
                  <span style="color: var(--text-mid);">${card.card_id}</span>
                  <span style="font-size: 8px;">•</span>
                  <span style="color: ${typeColor};">${card.card_type.toUpperCase()}</span>
              </div>
          </div>
          
          <div style="display: flex; align-items: center; gap: 4px; background: var(--navy-4); border-radius: 4px; padding: 2px;">
              ${controls}
          </div>
      </div>
      `;
      }
      initializeDatabase();
      renderDecklist();
      // ΓöÇΓöÇ DECK BUILDER EXPORT & SAVE LOGIC ΓöÇΓöÇ
      window.saveCustomDeck = function () {
        const deckName =
          document.getElementById("deck-name").value || "Untitled Deck";
        const deckData = {
          name: deckName,
          deck: currentDeck,
        };
        localStorage.setItem("hocg_deckbuilder_save", JSON.stringify(deckData));
        alert("Deck saved successfully!");
      };

      // ≡ƒæë NEW: Converts the deck into a Base64 encoded string
      window.generateDeckCode = function () {
        let oshiStr = currentDeck.oshi ? currentDeck.oshi.card_id : "";

        let mainArr = [];
        for (let id in currentDeck.main)
          mainArr.push(`${id}:${currentDeck.main[id]}`);

        let cheerArr = [];
        for (let id in currentDeck.cheer)
          cheerArr.push(`${id}:${currentDeck.cheer[id]}`);

        // Creates a compact string: OSHI_ID|MAIN_ID:QTY,MAIN_ID:QTY|CHEER_ID:QTY
        let rawString = `${oshiStr}|${mainArr.join(",")}|${cheerArr.join(",")}`;

        // btoa() converts standard text into a Base64 string
        return btoa(rawString);
      };

      // ≡ƒæë NEW: Prompts the user for a code, decodes it, and builds the deck
      window.importCustomDeck = function () {
        let code = prompt("Paste your Deck Code here:");
        if (!code) return; // User cancelled

        try {
          // atob() decodes the Base64 string back into standard text
          let decoded = atob(code.trim());
          let parts = decoded.split("|");
          if (parts.length !== 3) throw new Error("Invalid format");

          let newDeck = { oshi: null, main: {}, cheer: {} };

          // 1. Decode Oshi
          if (parts[0]) {
            let oshiCard = masterCardPool.find((c) => c.card_id === parts[0]);
            if (oshiCard) newDeck.oshi = oshiCard;
          }

          // 2. Decode Main Deck
          if (parts[1]) {
            parts[1].split(",").forEach((pair) => {
              let [id, qty] = pair.split(":");
              if (id && qty) newDeck.main[id] = parseInt(qty);
            });
          }

          // 3. Decode Cheer Deck
          if (parts[2]) {
            parts[2].split(",").forEach((pair) => {
              let [id, qty] = pair.split(":");
              if (id && qty) newDeck.cheer[id] = parseInt(qty);
            });
          }

          currentDeck = newDeck;
          renderDecklist();
          alert("Deck imported successfully!");
        } catch (e) {
          alert("Invalid deck code! Please check the code and try again.");
        }
      };

      // ≡ƒæë UPDATED: Now appends the Deck Code to the bottom of your exported text
      window.exportCustomDeck = function () {
        const deckName =
          document.getElementById("deck-name").value || "Untitled Deck";
        let exportStr = `Deck: ${deckName}\n\n`;

        if (currentDeck.oshi) {
          exportStr += `[OSHI]\n1x ${currentDeck.oshi.card_id} - ${currentDeck.oshi.card_name}\n\n`;
        }

        exportStr += `[MAIN DECK]\n`;
        for (let cardId in currentDeck.main) {
          let card = masterCardPool.find((c) => c.card_id === cardId);
          if (card)
            exportStr += `${currentDeck.main[cardId]}x ${card.card_id} - ${card.card_name}\n`;
        }

        exportStr += `\n[CHEER DECK]\n`;
        for (let cardId in currentDeck.cheer) {
          let card = masterCardPool.find((c) => c.card_id === cardId);
          if (card)
            exportStr += `${currentDeck.cheer[cardId]}x ${card.card_id} - ${card.card_name}\n`;
        }

        if (
          Object.keys(currentDeck.main).length === 0 &&
          Object.keys(currentDeck.cheer).length === 0 &&
          !currentDeck.oshi
        ) {
          return alert("Your deck is empty! Add some cards before exporting.");
        }

        // Attaches the generated code right at the bottom!
        exportStr += `\nDeck Code:\n${generateDeckCode()}\n`;

        navigator.clipboard
          .writeText(exportStr.trim())
          .then(() => alert("Decklist & Code copied to clipboard!"));
      };

      // ΓöÇΓöÇ FULL SCREEN VISUAL DECK LOGIC ΓöÇΓöÇ
      window.openVisualDeck = function () {
        const grid = document.getElementById("visual-deck-grid");
        const deckTitle =
          document.getElementById("deck-name").value || "Untitled Deck";
        document.getElementById("visual-deck-title").innerText =
          deckTitle + " (Visual View)";
        document.getElementById("visual-deck-code").value = generateDeckCode();

        grid.innerHTML = "";
        let htmlBuilder = "";

        const addCardToHtml = (card, qty, zoneLabel) => {
          const typeClass = getTypeClass(card.card_type);
          const iconClass = getIconClass(card.card_type);
          const setPrefix = card.card_id.split("-")[0];
          const imagePath = card.thumbnail
            ? card.thumbnail
            : `images/${setPrefix}/${card.card_id}.webp`;
          const { formattedTagsHtml, formattedSkillHtml, formattedArtsHtml } =
            formatSkillText(card);

          const isAltArt = card.card_id.match(/_(OUR|SEC|UR|HR|SR)$/i);
          const premiumClass = isAltArt ? "premium-alt-art" : "";
          const level = card.bloom_level ? `[${card.bloom_level}] ` : "";
          let hpHtml = card.hp ? `<div class="tl-hp">HP: ${card.hp}</div>` : "";

          const qtyBadge = `<div style="position: absolute; top: 8px; right: 8px; background: var(--brand-main); color: var(--navy); font-weight: 900; font-size: 16px; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 5; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">x${qty}</div>`;

          // ≡ƒæë FADE-IN IS NOW PERMANENTLY LOCKED IN HERE
          htmlBuilder += `
            <div class="card-item fade-in ${premiumClass}">
                ${qtyBadge}
                <div class="card-face ${typeClass} grid-element">
                    <img src="${imagePath}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='${fallbackImage}'" />
                    <i class="ti ${iconClass}"></i>
                    <span class="face-label">${card.card_type.toUpperCase()}</span>
                </div>
                <div class="card-meta grid-element">
                    <span class="card-name-jp">${level}${card.card_name}</span>
                    <span class="card-id">${card.card_id}</span>
                    <div class="card-badges">
                        <span class="badge ${typeClass}">${zoneLabel}</span>
                    </div>
                </div>
                <div class="translation-overlay grid-element">
                    <div class="tl-header">
                        <span class="tl-type badge ${typeClass}">${card.card_type.toUpperCase()}</span>
                    </div>
                    <div class="tl-title">${level}${card.card_name}</div>
                    <div class="tl-scroll-area">
                        ${formattedTagsHtml}
                        ${formattedSkillHtml}
                        ${formattedArtsHtml}
                    </div>
                    ${hpHtml}
                </div>
            </div>
          `;
        };

        if (currentDeck.oshi) addCardToHtml(currentDeck.oshi, 1, "OSHI");

        for (let cardId in currentDeck.main) {
          let card = masterCardPool.find((c) => c.card_id === cardId);
          if (card) addCardToHtml(card, currentDeck.main[cardId], "MAIN");
        }

        for (let cardId in currentDeck.cheer) {
          let card = masterCardPool.find((c) => c.card_id === cardId);
          if (card) addCardToHtml(card, currentDeck.cheer[cardId], "CHEER");
        }

        if (htmlBuilder === "") {
          htmlBuilder = `<div class="empty-state">Your deck is currently empty! Add some cards to view them here.</div>`;
        }

        grid.innerHTML = htmlBuilder;

        document.getElementById("visual-deck-modal").classList.add("open");
        document.getElementById("visual-deck-overlay").classList.add("open");
      };

      window.closeVisualDeck = function () {
        document.getElementById("visual-deck-modal").classList.remove("open");
        document.getElementById("visual-deck-overlay").classList.remove("open");
      };
      // ≡ƒæë NEW: Copies the code directly from the visual modal
      window.copyVisualDeckCode = function () {
        const codeInput = document.getElementById("visual-deck-code");
        if (!codeInput.value) return alert("Deck code is empty!");

        navigator.clipboard.writeText(codeInput.value).then(() => {
          alert("Deck Code copied to clipboard!");
        });
      };
      window.loadSavedDeck = function () {
        const savedData = localStorage.getItem("hocg_deckbuilder_save");
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            document.getElementById("deck-name").value = parsed.name || "";
            currentDeck = parsed.deck;
          } catch (e) {
            console.error("Failed to load saved deck");
          }
        }
      };
      // Closes the Games dropdown if the user clicks anywhere else on the screen
      window.addEventListener("click", function (e) {
        if (!e.target.closest(".dropdown")) {
          document.querySelectorAll(".dropdown.open").forEach((dropdown) => {
            dropdown.classList.remove("open");
          });
        }
      });
      // ΓöÇΓöÇ STARTING HAND SIMULATOR LOGIC ΓöÇΓöÇ //

      window.openTestHand = function () {
        // Count how many cards are in the main deck
        let mainCount = Object.values(currentDeck.main).reduce(
          (a, b) => a + b,
          0,
        );

        if (mainCount < 7) {
          return alert(
            "You need at least 7 cards in your Main Deck to test a starting hand!",
          );
        }

        document.getElementById("test-hand-modal").classList.add("open");
        document.getElementById("test-hand-overlay").classList.add("open");

        // Automatically draw the first hand when opened
        drawTestHand();
      };

      window.closeTestHand = function () {
        document.getElementById("test-hand-modal").classList.remove("open");
        document.getElementById("test-hand-overlay").classList.remove("open");
      };

      window.drawTestHand = function () {
        const grid = document.getElementById("test-hand-grid");
        grid.innerHTML = `<h3 style="color: var(--text-dim); margin: auto;">Shuffling deck...</h3>`;

        let deckArray = [];
        for (let cardId in currentDeck.main) {
          for (let i = 0; i < currentDeck.main[cardId]; i++) {
            deckArray.push(cardId);
          }
        }

        for (let i = deckArray.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [deckArray[i], deckArray[j]] = [deckArray[j], deckArray[i]];
        }

        const startingHand = deckArray.slice(0, 7);

        let htmlBuilder = "";
        startingHand.forEach((cardId, index) => {
          let card = masterCardPool.find((c) => c.card_id === cardId);
          if (card) {
            const typeClass = getTypeClass(card.card_type);
            const iconClass = getIconClass(card.card_type);
            const setPrefix = card.card_id.split("-")[0];
            const imagePath = card.thumbnail
              ? card.thumbnail
              : `images/${setPrefix}/${card.card_id}.webp`;
            const isAltArt = card.card_id.match(/_(OUR|SEC|UR|HR|SR)$/i);
            const premiumClass = isAltArt ? "premium-alt-art" : "";

            // Notice we DO NOT include the 'fade-in' class here anymore!
            htmlBuilder += `
                  <div class="card-item ${premiumClass}" style="width: 200px; min-height: 280px;">
                      <div class="card-face ${typeClass} grid-element">
                          <img src="${imagePath}" loading="lazy" decoding="async" onerror="this.onerror=null; this.style.display='none'" />
                          <i class="ti ${iconClass}"></i>
                          <span class="face-label">${card.card_type.toUpperCase()}</span>
                      </div>
                  </div>
                  `;
          }
        });

        setTimeout(() => {
          grid.innerHTML = htmlBuilder;

          // This loop safely triggers the opacity animation sequentially
          const dealtCards = grid.querySelectorAll(".card-item");
          dealtCards.forEach((card, index) => {
            setTimeout(() => card.classList.add("fade-in"), index * 100);
          });
        }, 150);
      };
    