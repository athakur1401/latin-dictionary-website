document.addEventListener("DOMContentLoaded", function () {
    const lookupButton = document.getElementById("lookupButton");
    const inputField = document.getElementById("inputField");
    const resultContainer = document.getElementById("resultContainer");

    if (!lookupButton || !inputField || !resultContainer) {
        console.error("Required elements (lookupButton, inputField, or resultContainer) are missing!");
        return;
    }

    let dictionary = [];

    // Fetch the JSON data
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

    // Recursive function to find matched forms
    function findMatchedForms(inputWord, forms, prefix = "") {
        let matchedDetails = "";

        for (const [key, value] of Object.entries(forms)) {
            if (typeof value === "object") {
                // If it's an object (e.g., singular/plural cases), recurse deeper
                matchedDetails += findMatchedForms(inputWord, value, `${prefix} ${key}`);
            } else if (Array.isArray(value) && value.some(form => form.toLowerCase() === inputWord.toLowerCase())) {
                // If it's an array and contains the input word, display it
                const readableKey = (prefix + " " + key).trim().replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());
                readableKey = readableKey.replace(/(\d+)?$/, (match, num) => num ? parseInt(num) + 1 : "1");
                matchedDetails += `<p><strong>Matched In:</strong> ${readableKey}</p>`;
            } else if (typeof value === "string" && value.toLowerCase() === inputWord.toLowerCase()) {
                // If it's a direct string match, display it
                const readableKey = (prefix + " " + key).trim().replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());
                matchedDetails += `<p><strong>Matched In:</strong> ${readableKey}</p>`;
            }
        }

        return matchedDetails;
    }

    function performSearch() {
        const inputWord = inputField.value.trim().toLowerCase();
        console.log("User entered:", inputWord); // Debugging step

        if (!inputWord) {
            alert("Please enter a word.");
            return;
        }

        // Generalized lookup function
        function findWord(inputWord, dictionary) {
            for (const entry of dictionary) {
                if (entry.all_forms && entry.all_forms.some(form => form.toLowerCase() === inputWord)) {
                    return entry;
                }
            }
            return null; // Return null if no match is found
        }

        // Search for the input word in the dictionary
        const foundWord = findWord(inputWord, dictionary);

        if (foundWord) {
            let outputHTML = `<h3>${foundWord.latin}</h3>`;
            outputHTML += `<p><strong>Part of Speech:</strong> ${foundWord.part_of_speech}</p>`;
            outputHTML += `<p><strong>Definition:</strong> ${foundWord.definition}</p>`;

            // Display noun forms (singular/plural) if applicable
            if (foundWord.forms && foundWord.forms.singular) {
                outputHTML += `<h4>Forms:</h4>`;
                outputHTML += `<p><strong>Singular:</strong></p>`;
                for (const [caseName, form] of Object.entries(foundWord.forms.singular)) {
                    outputHTML += `<p>${caseName}: ${form}</p>`;
                }

                outputHTML += `<p><strong>Plural:</strong></p>`;
                for (const [caseName, form] of Object.entries(foundWord.forms.plural)) {
                    outputHTML += `<p>${caseName}: ${form}</p>`;
                }
            }

            // Display verb forms across all tenses and moods
            if (foundWord.forms) {
                outputHTML += `<h4>Verb Forms:</h4>`;
                const verbForms = [
                    "indicative_present",
                    "indicative_future",
                    "subjunctive_present",
                    "subjunctive_imperfect",
                    "subjunctive_perfect",
                    "subjunctive_pluperfect"
                ];
                verbForms.forEach(formType => {
                    if (foundWord.forms[formType]) {
                        const readableKey = formType.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());
                        outputHTML += `<p><strong>${readableKey}:</strong> ${foundWord.forms[formType].join(", ")}</p>`;
                    }
                });
            }

            // Highlight the matched form's context (tense, number, etc.)
            outputHTML += `<h4>Matched Form Details:</h4>`;
            outputHTML += findMatchedForms(inputWord, foundWord.forms);

            resultContainer.innerHTML = outputHTML;
        } else {
            resultContainer.innerHTML = `<p>Word not found in the dictionary.</p>`;
        }
    }

    // Trigger search on button click
    lookupButton.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent form submission if part of a form
        performSearch();
    });

    // Trigger search on "Enter" key press
    inputField.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent default behavior
            performSearch();
        }
    });
});
