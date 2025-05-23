// script.js
import { conjugateV1, declineN1 } from "./inflect.js";

// Strip macrons for lookup keys
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
      // 1) Load your merged Lewis & Short JSON
      this.dictionary = await (await fetch("assets/lemmas.json")).json();

      // 2) Build lookup map (lemma → index), macrons stripped
      this.dictionary.forEach((entry, i) => {
        this.formIndex.set(stripMacrons(entry.lemma), i);
      });

      console.log(`Loaded ${this.dictionary.length} lemmas`);

      // 3) Wire up lookup
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

      // 4) Wire up the tabs
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

    document.querySelector(`.tab-button[data-tab="${tabId}"]`)
            .classList.add("active");
    document.getElementById(tabId)
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
      // show definition
      this.resultContainer.innerHTML = this.renderEntry(entry);

      // populate inflections
      this.renderInflections(entry);

      // switch to Definition tab
      this.switchTab("definition");
    } else {
      this.resultContainer.innerHTML =
        "<p>Word not found in the dictionary.</p>";
      this.inflContainer.innerHTML = "";
    }
  }

  renderEntry(entry) {
    let html = `
      <h3>${entry.lemma}</h3>
      <p><strong>Part of Speech:</strong> ${entry.pos || "—"}</p>
      <p><strong>Definition:</strong> ${entry.definition}</p>
    `;

    // optional extra notes
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

  renderInflections(entry) {
    const cont = this.inflContainer;
    cont.innerHTML = "";

    // 1st-conj verbs → Present Indicative
    if (entry.pos === "verb" && entry.decl === 1 && entry.stems.present) {
      const stem  = entry.stems.present;
      const forms = conjugateV1(stem);
      const labels = ["1 Sg","2 Sg","3 Sg","1 Pl","2 Pl","3 Pl"];
      const th = labels.map(l => `<th>${l}</th>`).join("");
      const td = forms .map(f => `<td>${f}</td>`).join("");

      cont.innerHTML = `
        <h4>Present Indicative (1st Conjugation)</h4>
        <table>
          <thead><tr>${th}</tr></thead>
          <tbody><tr>${td}</tr></tbody>
        </table>
      `;
      return;
    }

    // 1st-decl nouns → six cases
    if (entry.pos === "noun" && entry.decl === 1 && entry.stems.stem) {
      const stem  = entry.stems.stem;
      const forms = declineN1(stem);
      const cases = ["Nom","Gen","Dat","Acc","Abl","Voc"];
      const sing  = forms.slice(0,6);
      const plur  = forms.slice(6,12);

      const rows = cases.map((c,i) => `
        <tr>
          <td>${c}</td>
          <td>${sing[i] || ""}</td>
          <td>${plur[i] || ""}</td>
        </tr>
      `).join("");

      cont.innerHTML = `
        <h4>First Declension Noun Forms</h4>
        <table>
          <thead><tr><th>Case</th><th>Singular</th><th>Plural</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
      return;
    }

    // fallback
    cont.innerHTML = `
      <p>No inflections available for <strong>${entry.lemma}</strong>.</p>
    `;
  }
}

// bootstrap
document.addEventListener("DOMContentLoaded", () => {
  window.app = new DictionaryApp();
});
