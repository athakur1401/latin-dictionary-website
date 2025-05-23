// script.js

// ─── Utility: strip macrons so we can do accent‐insensitive lookups ───
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
      // 1. Load our merged L&S lemmas
      this.dictionary = await (await fetch("assets/lemmas.json")).json();

      // 2. Build a macron‐stripped lemma → index map
      this.formIndex = new Map(
        this.dictionary.map((entry, i) => [
          stripMacrons(entry.lemma.toLowerCase()),
          i
        ])
      );

      console.log(`Loaded ${this.dictionary.length} lemmas`);

      // 3. Wire up lookup
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

      // 4. Wire up tab switching
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
    document.getElementById(tabId).classList.add("active");
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
      // show the definition
      this.resultContainer.innerHTML = this.renderEntry(entry);
      // reset the inflections panel
      this.inflContainer.innerHTML = `
        <p class="placeholder">
          Inflection tables will appear here once you add stems.
        </p>`;
      // go back to the Definition tab
      this.switchTab("definition");
    } else {
      this.resultContainer.innerHTML =
        "<p>Word not found in the dictionary.</p>";
      this.inflContainer.innerHTML = "";
    }
  }

  renderEntry(entry) {
    return `
      <h3>${entry.lemma}</h3>
      <p><strong>Part of Speech:</strong> ${entry.pos || "—"}</p>
      <p><strong>Definition:</strong> ${entry.definition}</p>
    `;
  }
} // ←←← Make sure this closing brace is here!

// ─── Bootstrap ───
document.addEventListener("DOMContentLoaded", () => {
  window.app = new DictionaryApp();
});
