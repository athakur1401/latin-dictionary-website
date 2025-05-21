import { conjugateV1, declineN1 } from "./inflect.js";

function stripMacrons(str) {
  // NFC→NFD, then drop every combining mark
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/* -------------  Dictionary app ------------- */
class DictionaryApp {
  constructor() {
    // DOM refs
    this.resultContainer = document.getElementById("resultContainer");
    this.inputField      = document.getElementById("inputField");
    this.lookupButton    = document.getElementById("lookupButton");

    // data holders
    this.dictionary = [];        // array of lemma records
    this.formIndex  = new Map(); // Map<form, lemmaID>

    this.init();                 // kick off async loader
  }

  /* -------- load slim JSON & build index -------- */
  async init() {
    try {
      const lemmas = await (await fetch("assets/lemmas.json")).json();
      this.dictionary = lemmas;

      // 1) index head-words
      this.formIndex = new Map(
        lemmas.map((l, i) => [stripMacrons(l.lemma), i])
      );

      // 2) pre-index all 1st-conj verb & 1st-decl noun forms
      lemmas.forEach((entry, idx) => {
        // 1st-conj verbs
        if (entry.pos === "verb" && entry.decl === 1 && entry.stems.present) {
          conjugateV1(entry.stems.present).forEach(form =>
            this.formIndex.set(stripMacrons(form), idx)
          );
        }
        // 1st-decl nouns
        if (entry.pos === "noun" && entry.decl === 1 && entry.stems.stem) {
          declineN1(entry.stems.stem).forEach(form =>
            this.formIndex.set(stripMacrons(form), idx)
          );
        }
      });

      console.log(
        `Loaded ${lemmas.length} lemmas, indexed ${this.formIndex.size} forms`
      );

      // 3) lookup form listeners
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

      // 4) tabs switcher
      document.querySelectorAll(".tab-button").forEach(btn => {
        btn.addEventListener("click", () => {
          // deactivate all
          document
            .querySelectorAll(".tab-button")
            .forEach(b => b.classList.remove("active"));
          document
            .querySelectorAll(".tab-panel")
            .forEach(p => p.classList.remove("active"));

          // activate this one
          btn.classList.add("active");
          document.getElementById(btn.dataset.tab).classList.add("active");
        });
      });
    } catch (err) {
      console.error("Dictionary load failed:", err);
    }
  }

  /* -------- constant-time look-up -------- */
  lookup(form) {
    const plain = stripMacrons(form.toLowerCase());
    const id = this.formIndex.get(plain);
    return id == null ? null : this.dictionary[id];
  }

  /* -------------- search -------------- */
  performSearch() {
    const inputWord = this.inputField.value.trim();
    if (!inputWord) return alert("Please enter a word.");

    const found = this.lookup(inputWord);
    if (found) {
      // show definition
      this.resultContainer.innerHTML = this.renderEntry(found);
      // switch to the Definition tab
      document.querySelector(".tab-button[data-tab=definition]").click();
    } else {
      this.resultContainer.innerHTML =
        "<p>Word not found in the dictionary.</p>";
    }
  }

  /* ------------- render one lemma ------------- */
  renderEntry(entry) {
    return `
      <h3>${entry.lemma}</h3>
      <p><strong>Part of Speech:</strong> ${entry.pos || "—"}</p>
      <p><strong>Definition:</strong> ${entry.definition}</p>
      <p>(Detailed tables will return once we add the inflection engine.)</p>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // expose for console testing
  window.app = new DictionaryApp();
});
