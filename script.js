import { conjugateV1, declineN1 } from "./inflect.js";

function stripMacrons(str) {
  // NFC→NFD, then drop every combining mark
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/* -------------  Dictionary app ------------- */
class DictionaryApp {
  constructor() {
    // DOM refs
    this.resultContainer      = document.getElementById("resultContainer");
    this.inputField           = document.getElementById("inputField");
    this.lookupButton         = document.getElementById("lookupButton");

    // data holders
    this.dictionary = [];        // array of lemma records
    this.formIndex  = new Map(); // Map<form, lemmaID>

    this.init();                 // kick off async loader
  }

  /* -------- load slim JSON -------- */
/* -------- load slim JSON -------- */
async init() {
  try {
    const lemmas = await (await fetch("assets/lemmas.json")).json();
    this.dictionary = lemmas;

    // head-word index
    this.formIndex = new Map(
      lemmas.map((l, i) => [stripMacrons(l.lemma), i])
    );

    console.log(`Loaded ${lemmas.length} lemmas`);

    /* ---------- RESTORE THE LISTENERS ---------- */
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

  } catch (err) {
    console.error("Dictionary load failed:", err);
  }
}

  /* constant-time look-up */
  lookup(form) {
    const plain = stripMacrons(form.toLowerCase());

    // 1. direct hit?
    let id = this.formIndex.get(plain);
    if (id != null) return this.dictionary[id];

    // 2. on-the-fly generation for 1st-conj verbs & 1st-decl nouns
    this.dictionary.forEach((entry, idx) => {
      const key = stripMacrons(entry.lemma);
      if (entry.pos === "verb" && entry.decl === 1) {
        // 1st-conj verb: stems.present is like "am"
        conjugateV1(entry.stems.present).forEach(f =>
          this.formIndex.set(stripMacrons(f), idx)
        );
      }
      if (entry.pos === "noun" && entry.decl === 1) {
        // 1st-decl noun: stems.stem is like "puell"
        declineN1(entry.stems.stem).forEach(f =>
          this.formIndex.set(stripMacrons(f), idx)
        );
      }
    });

    // 3. try again
    id = this.formIndex.get(plain);
    return id == null ? null : this.dictionary[id];
  }




  /* -------------- search -------------- */
  performSearch() {
    const inputWord = this.inputField.value.trim().toLowerCase();
    if (!inputWord) return alert("Please enter a word.");

    const foundWord = this.lookup(inputWord);

    this.resultContainer.innerHTML = foundWord
      ? this.renderEntry(foundWord)
      : "<p>Word not found in the dictionary.</p>";
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
  // save the app on window so you can poke at it in the console
  window.app = new DictionaryApp();
});
