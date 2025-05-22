// script.js

// Remove macrons for lookup keys
function stripMacrons(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

class DictionaryApp {
  constructor() {
    // DOM refs
    this.inputField      = document.getElementById("inputField");
    this.lookupButton    = document.getElementById("lookupButton");
    this.resultContainer = document.getElementById("resultContainer");
    this.inflContainer   = document.getElementById("inflContainer");
    this.tabButtons      = document.querySelectorAll(".tab-button");
    this.tabPanels       = document.querySelectorAll(".tab-panel");

    this.dictionary = [];
    this.formIndex  = new Map();

    this.init();
  }

  async init() {
    try {
      // 1) Fetch the unified Lewis & Short lemmas
      this.dictionary = await (await fetch("assets/lemmas.json")).json();

      // 2) Build a map lemma→index (macron‐stripped)
      this.formIndex = new Map(
        this.dictionary.map((entry, i) =>
          [ stripMacrons(entry.lemma), i ]
        )
      );

      console.log(`Loaded ${this.dictionary.length} lemmas`);

      // 3) Hook up lookup listeners
      this.lookupButton.addEventListener("click", e => {
        e.preventDefault();
        this.performSearch();
      });
      this.inputField.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.performSearch();
        }
      });

      // 4) Tab switcher
      this.tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
          this.switchTab(btn.dataset.tab);
        });
      });

    } catch (err) {
      console.error("Failed to load lemmas.json:", err);
    }
  }

  switchTab(tabId) {
    this.tabButtons.forEach(b => b.classList.remove("active"));
    this.tabPanels .forEach(p => p.classList.remove("active"));

    document
      .querySelector(`.tab-button[data-tab="${tabId}"]`)
      .classList.add("active");
    document
      .getElementById(tabId)
      .classList.add("active");
  }

  lookup(form) {
    const key = stripMacrons(form.toLowerCase());
    const idx = this.formIndex.get(key);
    return idx == null ? null : this.dictionary[idx];
  }

  performSearch() {
    const word = this.inputField.value.trim();
    if (!word) {
      alert("Please enter a word.");
      return;
    }

    const entry = this.lookup(word);
    if (entry) {
      // Render definition
      this.resultContainer.innerHTML = this.renderEntry(entry);

      // Clear inflections placeholder
      this.inflContainer.innerHTML = `
        <p class="placeholder">
          Inflection tables will appear here once you add stems.
        </p>`;

      // Switch to Definition tab
      this.switchTab("definition");
    } else {
      this.resultContainer.innerHTML =
        "<p>Word not found in the dictionary.</p>";
      this.inflContainer.innerHTML = "";
    }
  }

    renderEntry(entry) {
    // always show the crisp definition
    let html = `
      <h3>${entry.lemma}</h3>
      <p><strong>Part of Speech:</strong> ${entry.pos || "—"}</p>
      <p><strong>Definition:</strong> ${entry.definition}</p>
    `;

    // if there are extra notes, show them in a collapsible <details>
    if (entry.notes) {
      html += `
        <details class="extra-notes">
          <summary>More info</summary>
          <div class="notes-content">${entry.notes}</div>
        </details>
      `;
    }

    return html;
  }

document.addEventListener("DOMContentLoaded", () => {
  window.app = new DictionaryApp();
});
