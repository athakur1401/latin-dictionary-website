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

        const foundWord = this.dictionary.find(entry =>
            entry.all_forms && entry.all_forms.some(form => form.toLowerCase() === inputWord)
        );

        if (foundWord) {
            this.resultContainer.innerHTML = this.processWord(foundWord, inputWord);
        } else {
            this.resultContainer.innerHTML = `<p>Word not found in the dictionary.</p>`;
        }
    }

    processWord(wordEntry, inputWord) {
        let outputHTML = `<h3>${wordEntry.latin}</h3>`;
        outputHTML += `<p><strong>Part of Speech:</strong> ${wordEntry.part_of_speech}</p>`;
        outputHTML += `<p><strong>Definition:</strong> ${wordEntry.definition}</p>`;

        // Delegate processing based on part of speech
        switch (wordEntry.part_of_speech.toLowerCase()) {
            case "noun (m.)":
            case "noun (f.)":
                return outputHTML + new Noun(wordEntry, this).render(inputWord);
            case "verb":
                return outputHTML + new Verb(wordEntry, this).render(inputWord);
            case "adjective":
                return outputHTML + new Adjective(wordEntry, this).render(inputWord);
            case "adverb":
                return outputHTML + new Adverb(wordEntry, this).render(inputWord);
            default:
                return outputHTML + `<p>Details for this part of speech are not supported yet.</p>`;
        }
    }

    // Shared method to find matched forms
    findMatchedForms(inputWord, forms, prefix = "") {
        let matchedDetails = "";

        // Process typical nested forms (used in nouns/verbs)
        for (const [key, value] of Object.entries(forms)) {
            if (typeof value === "object" && !Array.isArray(value)) {
                matchedDetails += this.findMatchedForms(inputWord, value, `${prefix} ${key}`);
            } else if (Array.isArray(value)) {
                const index = value.findIndex(form => form.toLowerCase() === inputWord.toLowerCase());
                if (index !== -1) {
                    const readableKey = (prefix + " " + key).trim().replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());
                    const position = index + 1;
                    matchedDetails += `<p><strong>Matched In:</strong> ${readableKey} ${position}</p>`;
                }
            } else if (typeof value === "string" && value.toLowerCase() === inputWord.toLowerCase()) {
                const readableKey = (prefix + " " + key).trim().replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());
                matchedDetails += `<p><strong>Matched In:</strong> ${readableKey}</p>`;
            }
        }

        // Process degrees (specific to adjectives/adverbs)
        if (forms.degrees) {
            for (const [degree, form] of Object.entries(forms.degrees)) {
                if (form.toLowerCase() === inputWord.toLowerCase()) {
                    const readableKey = degree.charAt(0).toUpperCase() + degree.slice(1); // Capitalize the degree name
                    matchedDetails += `<p><strong>Matched In:</strong> ${readableKey} Degree</p>`;
                }
            }
        }

        return matchedDetails;
    }
}

class Noun {
    constructor(wordEntry, app) {
        this.wordEntry = wordEntry;
        this.app = app; // Reference to DictionaryApp
    }

    render(inputWord) {
        let outputHTML = `<h4>Noun Forms:</h4>`;
        const singularForms = this.wordEntry.forms.singular || {};
        const pluralForms = this.wordEntry.forms.plural || {};

        if (Object.keys(singularForms).length > 0) {
            outputHTML += `<p><strong>Singular:</strong></p>`;
            for (const [caseName, form] of Object.entries(singularForms)) {
                outputHTML += `<p>${caseName}: ${form}</p>`;
            }
        }

        if (Object.keys(pluralForms).length > 0) {
            outputHTML += `<p><strong>Plural:</strong></p>`;
            for (const [caseName, form] of Object.entries(pluralForms)) {
                outputHTML += `<p>${caseName}: ${form}</p>`;
            }
        }

        // Include matched forms
        outputHTML += `<h4>Matched Form Details:</h4>`;
        outputHTML += this.app.findMatchedForms(inputWord, this.wordEntry.forms || {});

        return outputHTML;
    }
}

class Verb {
    constructor(wordEntry, app) {
        this.wordEntry = wordEntry;
        this.app = app; // Reference to DictionaryApp
    }

    render(inputWord) {
        let outputHTML = `<h4>Verb Forms:</h4>`;
        const verbForms = [
            "indicative_present",
            "indicative_imperfect",
            "indicative_future",
            "subjunctive_present",
            "subjunctive_imperfect",
            "subjunctive_perfect",
            "subjunctive_pluperfect"
        ];

        verbForms.forEach(formType => {
            if (this.wordEntry.forms[formType]) {
                const readableKey = formType.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());
                outputHTML += `<p><strong>${readableKey}:</strong> ${this.wordEntry.forms[formType].join(", ")}</p>`;
            }
        });

        // Include matched forms
        outputHTML += `<h4>Matched Form Details:</h4>`;
        outputHTML += this.app.findMatchedForms(inputWord, this.wordEntry.forms || {});

        return outputHTML;
    }
}

class Adjective {
    constructor(wordEntry, app) {
        this.wordEntry = wordEntry;
        this.app = app; // Reference to DictionaryApp
    }

    render(inputWord) {
        let outputHTML = `<h4>Adjective Degrees:</h4>`;

        if (this.wordEntry.degrees.positive) {
            const positiveForms = this.wordEntry.degrees.positive;
            outputHTML += `<h5>Positive Forms:</h5>`;
            for (const [number, genderForms] of Object.entries(positiveForms)) {
                outputHTML += `<p><strong>${number}:</strong></p>`;
                for (const [gender, caseForms] of Object.entries(genderForms)) {
                    outputHTML += `<p>${gender}:</p>`;
                    for (const [caseName, form] of Object.entries(caseForms)) {
                        outputHTML += `<p>${caseName}: ${form}</p>`;
                    }
                }
            }
        }

        if (this.wordEntry.degrees.comparative) {
            outputHTML += `<p><strong>Comparative:</strong> ${this.wordEntry.degrees.comparative}</p>`;
        }

        if (this.wordEntry.degrees.superlative) {
            outputHTML += `<p><strong>Superlative:</strong> ${this.wordEntry.degrees.superlative}</p>`;
        }

        // Include matched forms for degrees
        outputHTML += `<h4>Matched Form Details:</h4>`;
        outputHTML += this.app.findMatchedForms(inputWord, { degrees: this.wordEntry.degrees });

        return outputHTML;
    }
}

class Adverb {
    constructor(wordEntry, app) {
        this.wordEntry = wordEntry;
        this.app = app; // Reference to DictionaryApp
    }
    render(inputWord) {
        let outputHTML = `<h4>Adverb Degrees:</h4>`;
        outputHTML += `<p><strong>Positive:</strong> ${this.wordEntry.degrees.positive}</p>`;
        outputHTML += `<p><strong>Comparative:</strong> ${this.wordEntry.degrees.comparative}</p>`;
        outputHTML += `<p><strong>Superlative:</strong> ${this.wordEntry.degrees.superlative}</p>`;

        // Include matched forms for degrees
        outputHTML += `<h4>Matched Form Details:</h4>`;
        outputHTML += this.app.findMatchedForms(inputWord, { degrees: this.wordEntry.degrees });

        return outputHTML;
    }
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => new DictionaryApp());
