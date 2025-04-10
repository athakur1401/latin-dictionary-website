class DictionaryApp {
  constructor() {
    this.dictionary = [];
    this.resultContainer = document.getElementById("resultContainer");
    this.inputField = document.getElementById("inputField");
    this.lookupButton = document.getElementById("lookupButton");
    this.tabsContainer = document.getElementById("tabsContainer");
    this.tabContentsContainer = document.getElementById("tabContentsContainer");
    this.tabs = {};

    if (!this.resultContainer || !this.inputField || !this.lookupButton || !this.tabsContainer || !this.tabContentsContainer) {
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
      if (!this.tabs[inputWord]) {
        this.createTab(inputWord, foundWord);
      }
      this.updateTabContent(inputWord, foundWord);
    } else {
      this.resultContainer.innerHTML = `<p>Word not found in the dictionary.</p>`;
    }
  }

  createTab(word, wordEntry) {
    const tab = document.createElement("button");
    tab.textContent = word;
    tab.classList.add("tab");
    tab.addEventListener("click", () => this.showTabContent(word));
    this.tabsContainer.appendChild(tab);

    const tabContent = document.createElement("div");
    tabContent.id = `tabContent-${word}`;
    tabContent.classList.add("tabContent");
    this.tabContentsContainer.appendChild(tabContent);

    this.tabs[word] = tabContent;
  }

  updateTabContent(word, wordEntry) {
    const tabContent = this.tabs[word];
    tabContent.innerHTML = this.processWord(wordEntry, word);
    this.showTabContent(word);
  }

  showTabContent(word) {
    Object.values(this.tabs).forEach(tabContent => tabContent.style.display = "none");
    this.tabs[word].style.display = "block";
  }

  processWord(wordEntry, inputWord) {
    let outputHTML = `<h3>${wordEntry.latin}</h3>`;
    outputHTML += `<p><strong>Part of Speech:</strong> ${wordEntry.part_of_speech}</p>`;
    outputHTML += `<p><strong>Definition:</strong> ${wordEntry.definition}</p>`;

    // Delegate processing based on part of speech
    switch (wordEntry.part_of_speech.toLowerCase()) {
      case "noun (m.)":
      case "noun (f.)":
      case "noun (n.)":
        return outputHTML + new Noun(wordEntry, inputWord).render();
      case "verb":
        return outputHTML + new Verb(wordEntry, inputWord).render();
      case "adjective":
        return outputHTML + new Adjective(wordEntry, inputWord).render();
      case "adverb":
        return outputHTML + new Adverb(wordEntry, inputWord).render();
      default:
        return outputHTML + `<p>Details for this part of speech are not supported yet.</p>`;
    }
  }
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
    let outputHTML = `<h4>Verb Forms:</h4>`;
    const verbForms = [
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

    verbForms.forEach(formType => {
      if (this.wordEntry.forms[formType]) {
        const readableKey = formType.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());
        const matchedForms = this.matchVerbForms(this.wordEntry.forms[formType]);
        outputHTML += `<p><strong>${readableKey}:</strong> ${matchedForms}</p>`;
      }
    });

    return outputHTML;
  }

  matchVerbForms(forms) {
    return forms.map(form =>
      form.toLowerCase() === this.inputWord
        ? `<span class="matched">${form}</span>` // Apply the 'matched' CSS class
        : form
    ).join(", ");
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
