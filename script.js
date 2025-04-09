class DictionaryApp {
    constructor() {
        this.dictionary = [];
        this.resultContainer = document.getElementById("resultContainer");
        this.inputField = document.getElementById("inputField");
        this.lookupButton = document.getElementById("lookupButton");
        this.wordCountDisplay = document.getElementById("wordCount");

        if (!this.resultContainer || !this.inputField || !this.lookupButton || !this.wordCountDisplay) {
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

            // Display the word count in the webpage
            this.wordCountDisplay.textContent = `Total Words: ${this.dictionary.length}`;
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
            entry.all_forms && entry.all_forms.some(form => form.toLowerCase() === inputWord)
        );

        if (foundWord) {
            this.resultContainer.innerHTML = this.processWord(foundWord, inputWord);
            this.setupTabListeners();
        } else {
            this.resultContainer.innerHTML = `<p>Word not found in the dictionary.</p>`;
        }
    }

    processWord(wordEntry, inputWord) {
        // Definition section
        let outputHTML = `
            <h3>${wordEntry.latin}</h3>
            <p><strong>Part of Speech:</strong> ${wordEntry.part_of_speech}</p>
            <p><strong>Definition:</strong> ${wordEntry.definition}</p>
        `;

        // Tabs for forms
        outputHTML += `
            <div class="tabs">
                <button class="tab-link active" data-tab="tab-singular">Singular</button>
                <button class="tab-link" data-tab="tab-plural">Plural</button>
                <button class="tab-link" data-tab="tab-verbs">Verb Forms</button>
                <button class="tab-link" data-tab="tab-infinitives">Infinitives</button>
            </div>
            <div class="tab-content">
                <div id="tab-singular" class="tab active">
                    ${this.renderNounForms(wordEntry.forms.singular, "Singular")}
                </div>
                <div id="tab-plural" class="tab">
                    ${this.renderNounForms(wordEntry.forms.plural, "Plural")}
                </div>
                <div id="tab-verbs" class="tab">
                    ${this.renderVerbForms(wordEntry.forms)}
                </div>
                <div id="tab-infinitives" class="tab">
                    ${this.renderInfinitives(wordEntry.forms.infinitives)}
                </div>
            </div>
        `;

        return outputHTML;
    }

    renderNounForms(forms, label) {
        if (!forms || Object.keys(forms).length === 0) {
            return `<p>No ${label.toLowerCase()} forms available.</p>`;
        }

        let formHTML = `<h4>${label} Forms:</h4>`;
        for (const [caseName, form] of Object.entries(forms)) {
            formHTML += `<p><strong>${caseName}:</strong> ${form}</p>`;
        }
        return formHTML;
    }

    renderVerbForms(forms) {
        if (!forms) {
            return `<p>No verb forms available.</p>`;
        }

        const verbForms = [
            "indicative_present",
            "indicative_imperfect",
            "indicative_future",
            "indicative_pluperfect",
            "subjunctive_present",
            "subjunctive_imperfect",
            "subjunctive_perfect",
            "subjunctive_pluperfect"
        ];

        let formHTML = `<h4>Verb Forms:</h4>`;
        verbForms.forEach(formType => {
            if (forms[formType]) {
                const readableKey = formType.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());
                formHTML += `<p><strong>${readableKey}:</strong> ${forms[formType].join(", ")}</p>`;
            }
        });

        return formHTML;
    }

    renderInfinitives(infinitives) {
        if (!infinitives || infinitives.length === 0) {
            return `<p>No infinitives available.</p>`;
        }

        return `
            <h4>Infinitives:</h4>
            <p>${infinitives.join(", ")}</p>
        `;
    }

    setupTabListeners() {
        const tabLinks = document.querySelectorAll(".tab-link");
        const tabs = document.querySelectorAll(".tab");

        tabLinks.forEach(link => {
            link.addEventListener("click", function () {
                // Remove active class from all tabs and tab links
                tabLinks.forEach(l => l.classList.remove("active"));
                tabs.forEach(tab => tab.classList.remove("active"));

                // Add active class to clicked tab and its content
                link.classList.add("active");
                document.getElementById(link.dataset.tab).classList.add("active");
            });
        });
    }
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => new DictionaryApp());
