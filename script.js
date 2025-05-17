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

  /* -----------  load slim JSON files ----------- */
  async init() {
    try {
      const [lemmas, idxObj] = await Promise.all([
        fetch("assets/lemmas.json").then(r => r.json()),
        fetch("assets/forms.json").then(r => r.json())
      ]);
      this.dictionary = lemmas;
      this.formIndex  = new Map(Object.entries(idxObj));
      console.log(`Loaded ${lemmas.length} lemmas, ${this.formIndex.size} keys`);
    } catch (err) {
      console.error("Dictionary load failed:", err);
      return;
    }

    // event listeners
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

  /* constant-time look-up */
lookup(form) {
  const plain = stripMacrons(form.toLowerCase());

  // try ASCII first, then original (macron) spelling
  const id = this.formIndex.get(plain) ?? this.formIndex.get(form.toLowerCase());
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

document.addEventListener("DOMContentLoaded", () => new DictionaryApp());