/* -------------  Dictionary app ------------- */
class DictionaryApp {
  constructor() {
    this.dictionary   = [];                 // array of lemma records
    this.formIndex    = new Map();          // Map<form, lemmaID>
    this.resultContainer      = document.getElementById("resultContainer");
    this.inputField           = document.getElementById("inputField");
    this.lookupButton         = document.getElementById("lookupButton");
    this.tabsContainer        = document.getElementById("tabsContainer");
    this.tabContentsContainer = document.getElementById("tabContentsContainer");
    this.tabs = {};

    if (!this.resultContainer || !this.inputField || !this.lookupButton ||
        !this.tabsContainer  || !this.tabContentsContainer) {
      console.error("Required elements are missing!");
      return;
    }

    this.init();   // async
  }

  /* -----------  load slim JSON files ----------- */
  async init() {
    try {
      const [lemmas, idxObj] = await Promise.all([
        fetch("assets/lemmas.json").then(r => r.json()),
        fetch("assets/forms.json").then(r => r.json())
      ]);
      this.dictionary = lemmas;
      this.formIndex  = new Map(Object.entries(idxObj));
      console.log(`Loaded ${lemmas.length} lemmas, ${this.formIndex.size} index keys`);
    } catch (err) {
      console.error("Error fetching dictionary data:", err);
      return;
    }

    /* event listeners */
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
  }

  /* constant-time lookup */
  lookup(form) {
    const id = this.formIndex.get(form.toLowerCase());
    return id == null ? null : this.dictionary[id];
  }

  /* -------------- search -------------- */
  performSearch() {
    const inputWord = this.inputField.value.trim().toLowerCase();
    if (!inputWord) {
      alert("Please enter a word.");
      return;
    }

    const foundWord = this.lookup(inputWord);

    if (foundWord) {
      this.resultContainer.innerHTML = this.processWord(foundWord, inputWord);
    } else {
      this.resultContainer.innerHTML = `<p>Word not found in the dictionary.</p>`;
    }
  }

  /* ---------- tab helpers (unchanged) ---------- */
  createTab(word) { /* your previous code if you still use tabs */ }
  updateTabContent(word, entry) { /* … */ }
  showTabContent(word) { /* … */ }

  /* ------------ render one entry ------------ */
  processWord(wordEntry, inputWord) {
    /* Whitaker fields */
    let html = `<h3>${wordEntry.lemma}</h3>`;
    html    += `<p><strong>Part of Speech:</strong> ${wordEntry.pos || "—"}</p>`;
    html    += `<p><strong>Definition:</strong> ${wordEntry.definition}</p>`;

    /* specialised tables come later, once POS parsing & forms exist */
    switch ((wordEntry.pos || "").toLowerCase()) {
      case "noun":
        return html + new Noun(wordEntry, inputWord).render();
      case "verb":
        return html + new Verb(wordEntry, inputWord).render();
      case "adj":
      case "adjective":
        return html + new Adjective(wordEntry, inputWord).render();
      case "adv":
      case "adverb":
        return html + new Adverb(wordEntry, inputWord).render();
      default:
        return html + `<p>(Detailed tables not available yet.)</p>`;
    }
  }
}

/* ---------- Noun / Verb / Adjective / Adverb classes (unchanged) ---------- */
/* paste your existing class definitions here */

document.addEventListener("DOMContentLoaded", () => new DictionaryApp());
