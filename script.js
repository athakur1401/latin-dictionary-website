document.addEventListener("DOMContentLoaded", function () {
    const lookupButton = document.getElementById("lookupButton");
    const inputField = document.getElementById("inputField");
    const resultContainer = document.getElementById("resultContainer");

    if (!lookupButton || !inputField || !resultContainer) {
        console.error("Required elements (lookupButton, inputField, or resultContainer) are missing!");
        return;
    }

    let dictionary = [];

    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load dictionary data");
            }
            return response.json();
        })
        .then(data => {
            dictionary = data;
        })
        .catch(error => {
            console.error("Error fetching the dictionary data:", error);
        });

    function findMatchedForms(inputWord, forms, prefix = "") {
        let matchedDetails = "";

        for (const [key, value] of Object.entries(forms)) {
            if (typeof value === "object" && !Array.isArray(value)) {
                matchedDetails += findMatchedForms(inputWord, value, `${prefix} ${key}`);
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

        return matchedDetails;
    }

    function performSearch() {
        const inputWord = inputField.value.trim().toLowerCase();
        console.log("User entered:", inputWord);

        if (!inputWord) {
            alert("Please enter a word.");
            return;
        }

        function findWord(inputWord, dictionary) {
            for (const entry of dictionary) {
                if (entry.all_forms && Array.isArray(entry.all_forms)) {
                    if (entry.all_forms.some(form => form.toLowerCase() === inputWord)) {
                        return entry;
                    }
                }
            }
            return null; // Explicitly return null when no match is found.
        }

        const foundWord = findWord(inputWord, dictionary);

        if (foundWord) {
            let outputHTML = `<h3>${foundWord.latin}</h3>`;
            outputHTML += `<p><strong>Part of Speech:</strong> ${foundWord.part_of_speech}</p>`;
            outputHTML += `<p><strong>Definition:</strong> ${foundWord.definition}</p>`;

            // Handle Noun/Adjective Forms
            if (foundWord.forms) {
                const singularForms = foundWord.forms.singular || {};
                const pluralForms = foundWord.forms.plural || {};
                if (Object.keys(singularForms).length > 0 || Object.keys(pluralForms).length > 0) {
                    outputHTML += `<h4>Noun/Adjective Forms:</h4>`;
                }
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

                const verbForms = [
                    "indicative_present",
                    "indicative_imperfect",
                    "indicative_future",
                    "subjunctive_present",
                    "subjunctive_imperfect",
                    "subjunctive_perfect",
                    "subjunctive_pluperfect"
                ];
                const hasVerbForms = verbForms.some(formType => foundWord.forms[formType]);
                if (hasVerbForms) {
                    outputHTML += `<h4>Verb Forms:</h4>`;
                    verbForms.forEach(formType => {
                        if (foundWord.forms[formType]) {
                            const readableKey = formType.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());
                            outputHTML += `<p><strong>${readableKey}:</strong> ${foundWord.forms[formType].join(", ")}</p>`;
                        }
                    });
                }
            }

            // Handle Adjective Degrees
            if (foundWord.degrees) {
                if (foundWord.degrees.positive) {
                    const positiveForms = foundWord.degrees.positive;
                    outputHTML += `<h4>Adjective Positive Degree Forms:</h4>`;
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

                if (foundWord.degrees.comparative) {
                    outputHTML += `<p><strong>Comparative:</strong> ${foundWord.degrees.comparative}</p>`;
                }

                if (foundWord.degrees.superlative) {
                    outputHTML += `<p><strong>Superlative:</strong> ${foundWord.degrees.superlative}</p>`;
                }
            }

            // Handle Adverbs
            if (foundWord.part_of_speech.toLowerCase() === "adverb" && foundWord.degrees) {
                outputHTML += `<h4>Adverb Degrees:</h4>`;
                outputHTML += `<p><strong>Positive:</strong> ${foundWord.degrees.positive}</p>`;
                outputHTML += `<p><strong>Comparative:</strong> ${foundWord.degrees.comparative}</p>`;
                outputHTML += `<p><strong>Superlative:</strong> ${foundWord.degrees.superlative}</p>`;
            }

            outputHTML += `<h4>Matched Form Details:</h4>`;
            outputHTML += findMatchedForms(inputWord, foundWord.forms || {});

            resultContainer.innerHTML = outputHTML;
        } else {
            resultContainer.innerHTML = `<p>Word not found in the dictionary.</p>`;
        }
    }

    lookupButton.addEventListener("click", function (event) {
        event.preventDefault();
        performSearch();
    });

    inputField.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            performSearch();
        }
    });
});
