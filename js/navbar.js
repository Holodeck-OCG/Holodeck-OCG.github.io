document.write(`
  <header class="topbar">
    <!-- Paste your exact navbar HTML here -->
  </header>
`);

// Set the active tab immediately based on current URL
(function highlightActiveTab() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("#navbar-placeholder .tab, #navbar-placeholder .dropdown-item").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });
})();