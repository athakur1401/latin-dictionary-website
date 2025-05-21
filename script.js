import { conjugateV1, declineN1 } from "./inflect.js";

function stripMacrons(str) {
  // NFC → NFD, then drop every combining mark
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/* ------------- Dictionary app ------------- */
class DictionaryApp {
  constructor() {
    // DOM refs
    this.resultContainer = document.getElementById("resultContainer");
    this.inputField      = document.getElementById("inputField");
    this.lookupButton    = document.getElementById("lookupButton");

    // data holders
    this.dictionary = [];        // array of lemma records
    this.formIndex  = new Map(); // Map<plainForm, lemmaIndex>

    this.init();                 // kick off async loader
  }

  /* -------- load JSON & build index -------- */
  async init() {
    try {
      const lemmas = await (await fetch("assets/lemmas.json")).json();
      this.dictionary = lemmas;

      // 1) index head-words
      this.formIndex = new Map(
        lemmas.map((l, i) => [stripMacrons(l.lemma), i])
      );

      // 2) pre-index all 1st-conj verbs & 1st-decl nouns
      lemmas.forEach((entry, idx) => {
        // verbs
        if (entry.pos === "verb" && entry.decl === 1) {
          const presStem = entry.stems.present || entry.lemma.slice(0, -1);
          conjugateV1(presStem).forEach(f =>
            this.formIndex.set(stripMacrons(f), idx)
          );
        }
        // nouns
        if (entry.pos === "noun" && entry.decl === 1 && entry.stems.stem) {
          declineN1(entry.stems.stem).forEach(f =>
            this.formIndex.set(stripMacrons(f), idx)
          );
        }
      });

      console.log(
        `Loaded ${lemmas.length} lemmas, indexed ${this.formIndex.size} forms`
      );

      // 3) lookup listeners
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
          document.querySelectorAll(".tab-button").forEach(b =>
            b.classList.remove("active")
          );
          document.querySelectorAll(".tab-panel").forEach(p =>
            p.classList.remove("active")
          );

          btn.classList.add("active");
          document.getElementById(btn.dataset.tab).classList.add("active");
        });
      });
    } catch (err) {
      console.error("Dictionary load failed:", err);
    }
  }

  /* -------- constant-time lookup -------- */
  lookup(form) {
    const plain = stripMacrons(form.toLowerCase());
    const id    = this.formIndex.get(plain);
    return id == null ? null : this.dictionary[id];
  }

  /* -------------- search -------------- */
  performSearch() {
    const w = this.inputField.value.trim();
    if (!w) return alert("Please enter a word.");

    const e = this.lookup(w);
    if (e) {
      this.resultContainer.innerHTML = this.renderEntry(e);
      this.renderInflections(e);
      document.querySelector(".tab-button[data-tab=definition]").click();
    } else {
      this.resultContainer.innerHTML =
        "<p>Word not found in the dictionary.</p>";
      document.getElementById("inflContainer").innerHTML = "";
    }
  }

  /* ------------- render one lemma ------------- */
  renderEntry(entry) {
    return `
      <h3>${entry.lemma}</h3>
      <p><strong>Part of Speech:</strong> ${entry.pos || "—"}</p>
      <p><strong>Definition:</strong> ${entry.definition}</p>
    `;
  }

  /* ------------- render inflection tables ------------- */
  renderInflections(entry) {
    const cont = document.getElementById("inflContainer");
    cont.innerHTML = "";

    // 1st-conj verbs: Present Indicative
    if (entry.pos === "verb" && entry.decl === 1) {
      const presStem = entry.stems.present || entry.lemma.slice(0, -1);
      const forms    = conjugateV1(presStem);
      const persons  = ["1 Sg","2 Sg","3 Sg","1 Pl","2 Pl","3 Pl"];
      const header   = persons.map(p => `<th>${p}</th>`).join("");
      const row      = forms.map(f => `<td>${f}</td>`).join("");

      cont.innerHTML = `
        <h4>Present Indicative (1st Conjugation)</h4>
        <table>
          <thead><tr>${header}</tr></thead>
          <tbody><tr>${row}</tr></tbody>
        </table>
      `;
      return;
    }

    // 1st-decl nouns
    if (entry.pos === "noun" && entry.decl === 1 && entry.stems.stem) {
      const forms = declineN1(entry.stems.stem);
      const cases = ["Nom","Gen","Dat","Acc","Abl","Voc"];
      const sg    = forms.slice(0,6);
      const pl    = forms.slice(6,12);

      const rows = cases.map((c,i) => `
        <tr><td>${c}</td><td>${sg[i]}</td><td>${pl[i]}</td></tr>
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
    cont.innerHTML = `<p>No inflections available for <strong>${entry.lemma}</strong>.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.app = new DictionaryApp();  // expose for console testing
});
