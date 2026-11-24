/**
 * quiz - Page-specific logic (extracted from original inline script)
 * Maintains full original functionality
 */



// ===== BLOCK 1 =====

    // Submits the final score to the Firebase database
    window.submitScoreToFirebase = async function(score, btnElement) {
        if (!sessionPlayerName) {
            alert("No player name found!");
            return;
        }
        
        const statusDiv = document.getElementById("submit-status");
        
        // Prevent double-clicking
        btnElement.disabled = true;
        btnElement.innerText = "Submitting...";
        if (statusDiv) statusDiv.innerText = "";
        
        try {
            // Uses the exposed window.db and window.addDoc from your module script
            await window.addDoc(window.collection(window.db, "highscores"), {
                name: sessionPlayerName,
                score: score,
                timestamp: new Date()
            });
            
            // Success UI update
            btnElement.innerText = "Submitted!";
            btnElement.style.background = "var(--holo-teal)";
            btnElement.style.color = "#fff";
            
            // Automatically refresh the leaderboard if it's currently open
            if (document.getElementById("leaderboard-container").style.display === "block") {
                window.loadLeaderboard();
            }
        } catch (error) {
            console.error("Error submitting score:", error);
            if (statusDiv) statusDiv.innerText = "Error submitting score. Please try again.";
            
            // Re-enable the button if it failed
            btnElement.innerText = "Submit Score";
            btnElement.disabled = false;
        }
    };
    // 1. DATABASE LOADER (Copied from your library)
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

    function parseCSV(text) {
        let result = []; let row = []; let inQuotes = false; let val = '';
        for (let i = 0; i < text.length; i++) {
            let char = text[i];
            if (inQuotes) {
                if (char === '"') {
                    if (i + 1 < text.length && text[i + 1] === '"') { val += '"'; i++; } 
                    else { inQuotes = false; }
                } else { val += char; }
            } else {
                if (char === '"') { inQuotes = true; } 
                else if (char === ',') { row.push(val.trim()); val = ''; } 
                else if (char === '\n' || char === '\r') {
                    row.push(val.trim()); result.push(row); row = []; val = '';
                    if (char === '\r' && i + 1 < text.length && text[i + 1] === '\n') i++; 
                } else { val += char; }
            }
        }
        if (val !== '' || row.length > 0) { row.push(val.trim()); result.push(row); }
        return result;
    }

    async function initializeDatabase() {
        let combinedDatabase = [];
        for (const fileName of csvFilesToLoad) {
            try {
                const response = await fetch(fileName);
                if (!response.ok) continue;
                const text = await response.text();
                const rows = parseCSV(text);
                if (rows.length < 2) continue;

                const headers = rows[0].map(h => h.replace(/"/g, '').trim().toLowerCase());
                let textIdx = 8;
                let typeIdx = 3; 
                let colorIdx = -1; // Track the color column!
                
                for (let i = 0; i < headers.length; i++) {
                    if (headers[i].includes("text")) textIdx = i;
                    if (headers[i].includes("type")) typeIdx = i;
                    if (headers[i].includes("color")) colorIdx = i; 
                }
                
                for (let i = 1; i < rows.length; i++) {
                    const cols = rows[i];
                    if (cols.length < 3) continue; 
                    const setCode = cols[0]; const nameRaw = cols[1];
                    if (!setCode || !nameRaw || setCode.toLowerCase().includes("setcode")) continue; 
                    
                    let cardName = nameRaw;
                    const match = nameRaw.match(/\((.*?)\)/);
                    if (match) cardName = match[1].trim();
                    
                    let rawSkills = cols[textIdx] || "None";
                    let typeRaw = cols[typeIdx] || "Unknown";
                    let colorRaw = colorIdx !== -1 ? (cols[colorIdx] || "") : "";
                    
                    combinedDatabase.push({
                        card_name: cardName, 
                        card_id: setCode.trim(), 
                        skills_text: rawSkills,
                        raw_type: typeRaw.toLowerCase(),
                        card_color: colorRaw.toLowerCase() // Save the color!
                    });
                }
            } catch (error) {}
        }
        masterCardPool = combinedDatabase;
        document.getElementById("loading-msg").innerText = "Database loaded! Select a game mode above to start.";
    }

    // 2. QUIZ LOGIC
    let currentQuizMode = 'visual';
    let correctCard = null;
    let currentStreak = 0;

    function getRandomCards(count, requireSkill = false) {
        let pool = masterCardPool.filter(c => c.card_name && c.card_id);
        if (requireSkill) {
            pool = pool.filter(c => c.skills_text && c.skills_text.length > 15 && c.skills_text !== "None");
        }
        let shuffled = pool.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
    
    let sessionPlayerName = "";
    
    window.startQuiz = function(mode) {
        if (masterCardPool.length === 0) {
            alert("Database is still loading. Please wait a moment!");
            return;
        }

        // Lock in the player's name using the correct ID from your HTML
        if (!sessionPlayerName) {
            const nameField = document.getElementById("session-player-name");
            const nameInput = nameField.value.trim();
            
            if (!nameInput) {
                alert("Please enter your name first!");
                return;
            }
            sessionPlayerName = nameInput;
            
            // Disable the input so they can't change it mid-session
            nameField.disabled = true;
            nameField.style.opacity = "0.5";
        }

        currentQuizMode = mode;
        document.getElementById("quiz-choices").innerHTML = "";
        
        let validPool = masterCardPool.filter(c => c.card_name && c.card_id);
        
        // Remove alternate arts so they don't count as "duplicates"
        validPool = validPool.filter(c => !c.card_id.match(/_(OUR|SEC|UR|HR|SR)$/i));
        
        // ≡ƒæë NEW FIX: Advanced filtering for Text Mode
        if (mode === 'text') {
            // 1. Filter out Cheer cards and cards with no real text
            validPool = validPool.filter(c => 
                c.skills_text && 
                c.skills_text.length > 15 && 
                c.skills_text !== "None" && 
                !c.raw_type.toLowerCase().includes("cheer")
            );
            
            // 2. Count how many times each exact effect text appears
            const textCounts = {};
            validPool.forEach(c => {
                textCounts[c.skills_text] = (textCounts[c.skills_text] || 0) + 1;
            });
            
            // 3. Only keep cards whose effect text is 100% unique! 
            // (This automatically removes Nodoka/A-chan duplicates)
            validPool = validPool.filter(c => textCounts[c.skills_text] === 1);
        }
        correctCard = validPool[Math.floor(Math.random() * validPool.length)];

        let wrongChoices = [];
        let seenNames = new Set();
        seenNames.add(correctCard.card_name.toLowerCase());

        let shuffledPool = validPool.sort(() => 0.5 - Math.random());

        function isNameUnique(newName) {
            let lowerNew = newName.toLowerCase();
            for (let seen of seenNames) {
                if (lowerNew.includes(seen) || seen.includes(lowerNew)) return false;
            }
            return true;
        }

        for (let card of shuffledPool) {
            let isSameType = card.raw_type === correctCard.raw_type;
            let isSameColor = card.card_color === correctCard.card_color;
            if (isSameType && isSameColor && isNameUnique(card.card_name)) {
                wrongChoices.push(card);
                seenNames.add(card.card_name.toLowerCase());
            }
            if (wrongChoices.length === 3) break;
        }

        if (wrongChoices.length < 3) {
            for (let card of shuffledPool) {
                if (card.raw_type === correctCard.raw_type && isNameUnique(card.card_name)) {
                    wrongChoices.push(card);
                    seenNames.add(card.card_name.toLowerCase());
                }
                if (wrongChoices.length === 3) break;
            }
        }

        if (wrongChoices.length < 3) {
            for (let card of shuffledPool) {
                if (isNameUnique(card.card_name)) {
                    wrongChoices.push(card);
                    seenNames.add(card.card_name.toLowerCase());
                }
                if (wrongChoices.length === 3) break;
            }
        }

        const finalChoices = [correctCard, ...wrongChoices].sort(() => 0.5 - Math.random());
        const displayArea = document.getElementById("quiz-display");

        if (mode === 'visual') {
            const setPrefix = correctCard.card_id.split('-')[0];
            const imagePath = `images/${setPrefix}/${correctCard.card_id}.webp`;
            displayArea.innerHTML = `<img id="quiz-art" src="${imagePath}" class="quiz-image silhouette-mode" onerror="this.src=''; this.alt='Image not found'; this.classList.remove('silhouette-mode');" />`;
        } else {
            let hiddenText = correctCard.skills_text;

            // ≡ƒæë THE NEW CENSOR: Grab EVERY unique name in the database and sort by longest first
            let allNames = [...new Set(masterCardPool.map(c => c.card_name))].filter(n => n.length > 2).sort((a, b) => b.length - a.length);
            
            // Scrub every single one of those names from the text
            allNames.forEach(name => {
                let safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Prevent regex crashes
                hiddenText = hiddenText.replace(new RegExp(safeName, 'gi'), "<b>[???]</b>");
            });

            displayArea.innerHTML = `
                <div style="text-align: left; background: #fff; color: #000; padding: 1.5rem; border-radius: 8px; border-left: 5px solid var(--holo-orange); font-weight: 600; line-height: 1.5; width: 100%;">
                    <div style="font-size: 0.8rem; color: var(--holo-orange); text-transform: uppercase; margin-bottom: 8px;">Whose skill is this?</div>
                    ${hiddenText.replace(/\\n/g, '<br>').replace(/\n/g, '<br>')}
                </div>
            `;
        }

        const choicesContainer = document.getElementById("quiz-choices");
        finalChoices.forEach(card => {
            const btn = document.createElement("button");
            btn.className = "btn-choice";
            btn.innerText = card.card_name;
            btn.onclick = () => checkAnswer(btn, card.card_id);
            choicesContainer.appendChild(btn);
        });
    }

    function checkAnswer(clickedButton, guessedCardId) {
    const allButtons = document.querySelectorAll(".btn-choice");
    allButtons.forEach(btn => btn.style.pointerEvents = "none");

    if (guessedCardId === correctCard.card_id) {
        clickedButton.classList.add("correct");
        currentStreak++;
        document.getElementById("quiz-score").innerText = currentStreak;
        
        const art = document.getElementById("quiz-art");
        if (art) {
            art.classList.remove("silhouette-mode");
            art.classList.add("revealed-mode");
        }
        setTimeout(() => startQuiz(currentQuizMode), 1500);

    } else {
        // ≡ƒæë NEW: Save the final score BEFORE resetting it!
        const finalScore = currentStreak; 
        
        clickedButton.classList.add("wrong");
        currentStreak = 0; // Now it's safe to reset
        document.getElementById("quiz-score").innerText = currentStreak;

        allButtons.forEach(btn => {
            if (btn.innerText.includes(correctCard.card_name)) {
                btn.classList.add("correct");
            }
        });

        const art = document.getElementById("quiz-art");
        if (art) {
            art.classList.remove("silhouette-mode");
            art.classList.add("revealed-mode");
        }

        // ≡ƒæë NEW: Inject the Submit Form directly into the Game Over screen!
        document.getElementById("quiz-choices").innerHTML += `
            <div style="grid-column: span 2; background: rgba(255, 82, 82, 0.1); border: 1px solid var(--danger); padding: 20px; border-radius: 12px; margin-top: 15px; display: flex; flex-direction: column; align-items: center; gap: 12px;">
                <h2 style="color: var(--danger); margin: 0; font-weight: 900;">Incorrect! Final Streak: ${finalScore}</h2>
                
                <button class="btn-export" onclick="submitScoreToFirebase(${finalScore}, this)" style="background: var(--brand-main); color: var(--navy); width: auto; margin-top: 10px;">Submit Score</button>
                <div id="submit-status" style="font-size: 13px; color: var(--text-dim); margin-top: 5px;"></div>

                <button class="btn-export" onclick="startQuiz('${currentQuizMode}')" style="width: auto; margin-top: 10px;">Try Again</button>
            </div>
        `;
    }
}
      /* ΓöÇΓöÇ ABOUT MODAL LOGIC ΓöÇΓöÇ */
    window.openAboutModal = function() {
      document.getElementById("about-modal").classList.add("open");
      document.getElementById("about-overlay").classList.add("open");
    };
    window.closeAboutModal = function() {
      document.getElementById("about-modal").classList.remove("open");
      document.getElementById("about-overlay").classList.remove("open");
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
    initializeDatabase();

    window.loadLeaderboard = async function() {
  const leaderboardContainer = document.getElementById("leaderboard-container");
  const leaderboardList = document.getElementById("leaderboard-list");
  
  // Show the container and set a loading message
  leaderboardContainer.style.display = "block";
  leaderboardList.innerHTML = `<div style="text-align: center; color: var(--text-dim);">Loading scores...</div>`;

  try {
    // 1. Query Firebase: Get "highscores" ordered by score (descending), limited to top 10
    const scoresRef = window.collection(window.db, "highscores");
    const q = window.query(scoresRef, window.orderBy("score", "desc"), window.limit(10));
    
    const querySnapshot = await window.getDocs(q);
    
    // 2. Build the HTML for the list
    let listHtml = "";
    let rank = 1;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Add a gold color for 1st place!
      const rankColor = rank === 1 ? "var(--holo-gold)" : "var(--text-dim)";
      
      listHtml += `
        <div style="display: flex; justify-content: space-between; background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-dim);">
          <div style="display: flex; gap: 12px;">
            <span style="color: ${rankColor}; font-weight: 800;">#${rank}</span>
            <span style="color: var(--text-bright); font-weight: 700;">${data.name}</span>
          </div>
          <span style="color: var(--brand-main); font-weight: 800;">${data.score}</span>
        </div>
      `;
      rank++;
    });

    // 3. Inject the HTML
    if (listHtml === "") {
        leaderboardList.innerHTML = `<div style="text-align: center; color: var(--text-dim);">No scores yet!</div>`;
    } else {
        leaderboardList.innerHTML = listHtml;
    }

  } catch (error) {
    console.error("Error fetching leaderboard: ", error);
    leaderboardList.innerHTML = `<div style="text-align: center; color: var(--danger);">Failed to load leaderboard.</div>`;
  }
};
    // ≡ƒæë NEW: The function now accepts the finalScore as a parameter
    window.toggleLeaderboard = function() {
      const container = document.getElementById("leaderboard-container");
      const btnSpan = document.querySelector("#btn-toggle-leaderboard span");
      
      if (container.style.display === "none" || container.style.display === "") {
        // Show it and fetch data
        container.style.display = "block";
        btnSpan.innerText = "Hide Leaderboard";
        loadLeaderboard(); 
      } else {
        // Hide it
        container.style.display = "none";
        btnSpan.innerText = "View Leaderboard";
      }
    };
    // Closes the Games dropdown if the user clicks anywhere else on the screen
      window.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
          document.querySelectorAll('.dropdown.open').forEach(dropdown => {
            dropdown.classList.remove('open');
          });
        }
      });
      // Closes the Games dropdown if the user clicks anywhere else on the screen
      window.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
          document.querySelectorAll('.dropdown.open').forEach(dropdown => {
            dropdown.classList.remove('open');
          });
        }
      });
    

// ===== BLOCK 2 =====

  // Import the core Firebase App
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";
  
  // Single, clean import for all Firestore tools
  import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyCAIHsG9fB7dRih74FgPv805Lud2q0BfGE",
    authDomain: "holoocg-ef4bf.firebaseapp.com",
    projectId: "holoocg-ef4bf",
    storageBucket: "holoocg-ef4bf.firebasestorage.app",
    messagingSenderId: "942377973020",
    appId: "1:942377973020:web:51f7dfa9c8251a29a9b6d9",
    measurementId: "G-K26ZT2BFEP"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

  // Initialize Firestore and attach it to the window
  const db = getFirestore(app);
  window.db = db;
  window.collection = collection;
  window.addDoc = addDoc;
  window.query = query;
  window.orderBy = orderBy;
  window.limit = limit;
  window.getDocs = getDocs;
  window.setDoc = setDoc;
  window.doc = doc;
  window.getDoc = getDoc;
