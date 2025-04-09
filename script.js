class DictionaryApp {
  constructor() {
    this.dictionary = [];
    this.resultContainer = document.getElementById("resultContainer");
    this.inputField = document.getElementById("inputField");
    this.lookupButton = document.getElementById("lookupButton");

    if (!this.resultContainer || !this.inputField || !this.lookupButton) {
      console.error("Required elements are missing!");
      return;
    }

    this.init();
  }

  async init() {
    // Load dictionary data
    try {
      const response = await fetch('data.json');
      if (!response.ok) throw new Error("Failed to load dictionary data");
      this.dictionary = await response.json();
      console.log(`Number of words stored in the dictionary: ${this.dictionary.length}`);
    } catch (error) {
      console.error("Error fetching dictionary data:", error);
    }

    // Add event listeners
    this.lookupButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.performSearch();
    });

    this.inputField.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.performSearch();
      }
    });
  }

  performSearch() {
    const inputWord = this.inputField.value.trim().toLowerCase();
    console.log("User entered:", inputWord);

    if (!inputWord) {
      alert("Please enter a word.");
      return;
    }

    // Search for the word in all_forms
    const foundWord = this.dictionary.find(entry =>
      entry.all_forms &&
      entry.all_forms.some(form => form.toLowerCase() === inputWord)
    );

    if (foundWord) {
      this.resultContainer.innerHTML = this.processWord(foundWord, inputWord);
      this.attachTabListeners();
    } else {
      this.resultContainer.innerHTML = `<p>Word not found in the dictionary.</p>`;
    }
  }

 processWord(wordEntry, inputWord) {
  let html = `<div class="definition-card">`;

  html += `<h2 class="latin-word">${wordEntry.latin}</h2>`;
  html += `<p><strong>Part of Speech:</strong> ${wordEntry.part_of_speech}</p>`;
  html += `<p><strong>Definition:</strong> ${wordEntry.definition}</p>`;

  switch (wordEntry.part_of_speech.toLowerCase()) {
    case "noun (m.)":
    case "noun (f.)":
    case "noun (n.)":
      html += new Noun(wordEntry, inputWord).render();
      break;
    case "verb":
      html += new Verb(wordEntry, inputWord).render();
      break;
    case "adjective":
      html += new Adjective(wordEntry, inputWord).render();
      break;
    case "adverb":
      html += new Adverb(wordEntry, inputWord).render();
      break;
    default:
      html += `<p>Details for this part of speech are not supported yet.</p>`;
  }

  html += `</div>`;
  return html;
}

attachTabListeners() {
  // find all cards in the result area
  const cards = this.resultContainer.querySelectorAll('.definition-card');

  cards.forEach(card => {
    const tabButtons = card.querySelectorAll('.tab-btn');
    const tabContents = card.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // deactivate all tabs + hide all contents
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.add('hidden'));

        // activate the one we clicked
        button.classList.add('active');
        const target = card.querySelector(`#${button.dataset.group}`);
        if (target) target.classList.remove('hidden');
      });
    });
  });
}

class Noun {
  constructor(wordEntry, inputWord) {
    this.wordEntry = wordEntry;
    this.inputWord = inputWord;
  }

  render() {
    let outputHTML = `<h4>Noun Forms:</h4>`;
    const singularForms = this.wordEntry.forms.singular || {};
    const pluralForms = this.wordEntry.forms.plural || {};

    if (Object.keys(singularForms).length > 0) {
      outputHTML += `<p><strong>Singular:</strong></p>`;
      for (const [caseName, form] of Object.entries(singularForms)) {
        const highlight = this.matchNounForms(form);
        outputHTML += `<p>${caseName}: ${highlight}</p>`;
      }
    }

    if (Object.keys(pluralForms).length > 0) {
      outputHTML += `<p><strong>Plural:</strong></p>`;
      for (const [caseName, form] of Object.entries(pluralForms)) {
        const highlight = this.matchNounForms(form);
        outputHTML += `<p>${caseName}: ${highlight}</p>`;
      }
    }

    return outputHTML;
  }

  matchNounForms(form) {
    return form.toLowerCase() === this.inputWord
      ? `<span class="matched">${form}</span>` // Apply the 'matched' CSS class
      : form;
  }
}

class Verb {
  constructor(wordEntry, inputWord) {
    this.wordEntry = wordEntry;
    this.inputWord = inputWord;
  }

  render() {
    // the list of all possible verb‐form keys
    const formKeys = [
      "infinitives",
      "indicative_present",
      "indicative_imperfect",
      "indicative_future",
      "indicative_pluperfect",
      "subjunctive_present",
      "subjunctive_imperfect",
      "subjunctive_perfect",
      "subjunctive_pluperfect"
    ];

    // 1) build the tab buttons
    let tabsHTML = `<div class="tabs">`;
    formKeys.forEach((key, i) => {
      const forms = this.wordEntry.forms[key];
      if (!forms) return;
      const label = key.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
      const id = `${key}-${this.wordEntry.latin}`;
      tabsHTML += `<button
                     class="tab-btn ${i===0?'active':''}"
                     data-group="${id}"
                   >${label}</button>`;
    });
    tabsHTML += `</div>`;

    // 2) build each panel
    let contentHTML = '';
    formKeys.forEach((key, i) => {
      const forms = this.wordEntry.forms[key];
      if (!forms) return;
      const label = key.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
      const id = `${key}-${this.wordEntry.latin}`;
      const matched = this.matchVerbForms(forms);
      contentHTML += `<div
                        class="tab-content ${i===0?'':'hidden'}"
                        id="${id}"
                      >
                        <p><strong>${label}:</strong> ${matched}</p>
                      </div>`;
    });

    return tabsHTML + contentHTML;
  }

  matchVerbForms(forms) {
    return forms
      .map(f => f.toLowerCase() === this.inputWord
        ? `<span class="matched">${f}</span>`
        : f
      )
      .join(', ');
  }
}


class Adjective {
  constructor(wordEntry, inputWord) {
    this.wordEntry = wordEntry;
    this.inputWord = inputWord;
  }

  render() {
    let outputHTML = `<h4>Adjective Degrees:</h4>`;

    if (this.wordEntry.degrees.positive) {
      const positiveForms = this.wordEntry.degrees.positive;
      outputHTML += `<h5>Positive Forms:</h5>`;
      for (const [number, genderForms] of Object.entries(positiveForms)) {
        outputHTML += `<p><strong>${number}:</strong></p>`;
        for (const [gender, caseForms] of Object.entries(genderForms)) {
          outputHTML += `<p>${gender}:</p>`;
          for (const [caseName, form] of Object.entries(caseForms)) {
            const highlight = this.matchAdjectiveForms(form);
            outputHTML += `<p>${caseName}: ${highlight}</p>`;
          }
        }
      }
    }

    if (this.wordEntry.degrees.comparative) {
      const highlight = this.matchAdjectiveForms(this.wordEntry.degrees.comparative);
      outputHTML += `<p><strong>Comparative:</strong> ${highlight}</p>`;
    }

    if (this.wordEntry.degrees.superlative) {
      const highlight = this.matchAdjectiveForms(this.wordEntry.degrees.superlative);
      outputHTML += `<p><strong>Superlative:</strong> ${highlight}</p>`;
    }

    return outputHTML;
  }

  matchAdjectiveForms(form) {
    return form.toLowerCase() === this.inputWord
      ? `<span class="matched">${form}</span>` // Apply the 'matched' CSS class
      : form;
  }
}

class Adverb {
  constructor(wordEntry, inputWord) {
    this.wordEntry = wordEntry;
    this.inputWord = inputWord;
  }

  render() {
    let outputHTML = `<h4>Adverb Degrees:</h4>`;

    ["positive", "comparative", "superlative"].forEach(degree => {
      const form = this.wordEntry.degrees[degree];
      const highlight = this.matchAdverbForms(form);
      outputHTML += `<p><strong>${degree.charAt(0).toUpperCase() + degree.slice(1)}:</strong> ${highlight}</p>`;
    });

    return outputHTML;
  }

  matchAdverbForms(form) {
    return form.toLowerCase() === this.inputWord
      ? `<span class="matched">${form}</span>` // Apply the 'matched' CSS class
      : form;
  }
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => new DictionaryApp());
