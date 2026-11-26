/**
 * Navbar - Fetches and injects navbar HTML, highlights active tab
 * Replaces the old document.write approach
 */

const NAVBAR_HTML = `
<header class="topbar">
  <nav id="navbar-placeholder">
    <a href="index.html" class="logo" aria-label="Holodeck OCG Home">
      <img src="images/logo.webp" alt="Holodeck OCG" style="height: 32px;" decoding="async">
    </a>
    
    <div class="tabs">
      <a href="index.html" class="tab">Database</a>
      <a href="card-library.html" class="tab">Card Library</a>
      <a href="deckbuilder.html" class="tab">Deck Builder</a>
      <a href="quiz.html" class="tab">Quiz</a>
      <a href="tournaments.html" class="tab">Tournaments</a>
      
      <div class="dropdown">
        <button class="tab dropdown-toggle" aria-expanded="false" aria-haspopup="true">
          More <i class="ti ti-chevron-down"></i>
        </button>
        <div class="dropdown-menu" role="menu">
          <a href="rules.html" class="dropdown-item" role="menuitem">Rules</a>
          <a href="faq.html" class="dropdown-item" role="menuitem">FAQ</a>
          <a href="credits.html" class="dropdown-item" role="menuitem">Credits</a>
        </div>
      </div>
    </div>
    
    <div class="topbar-actions">
      <button id="theme-toggle" class="icon-btn" aria-label="Toggle theme" title="Toggle theme">
        <i class="ti ti-sun" id="theme-icon-sun"></i>
        <i class="ti ti-moon" id="theme-icon-moon"></i>
      </button>
      <button id="about-btn" class="icon-btn" aria-label="About" onclick="window.openAboutModal()">
        <i class="ti ti-info-circle"></i>
      </button>
    </div>
  </nav>
</header>
`;

/**
 * Inject navbar into the page and highlight active tab
 */
export async function loadNavbar() {
  const placeholder = document.getElementById("navbar-placeholder");
  if (!placeholder) {
    // If no placeholder, inject at the beginning of body
    document.body.insertAdjacentHTML("afterbegin", NAVBAR_HTML);
  } else {
    placeholder.outerHTML = NAVBAR_HTML;
  }
  
  highlightActiveTab();
  setupDropdowns();
}

/**
 * Highlight the active tab based on current URL
 */
function highlightActiveTab() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("#navbar-placeholder .tab, #navbar-placeholder .dropdown-item").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });
}

/**
 * Setup dropdown click/touch behavior
 */
function setupDropdowns() {
  document.querySelectorAll(".dropdown-toggle").forEach(toggle => {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const dropdown = toggle.closest(".dropdown");
      dropdown.classList.toggle("open");
      toggle.setAttribute("aria-expanded", dropdown.classList.contains("open"));
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown")) {
      document.querySelectorAll(".dropdown.open").forEach(dropdown => {
        dropdown.classList.remove("open");
        const toggle = dropdown.querySelector(".dropdown-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      });
    }
  });
}

// Auto-load navbar when module is imported
loadNavbar();