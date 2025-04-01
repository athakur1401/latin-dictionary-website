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
            let outputHTML = `<h3>${foundWord.latin}</h3>
                <p><strong>Part of Speech:</strong> ${foundWord.part_of_speech}</p>
                <p><strong>Definition:</strong> ${foundWord.definition}</p>`;

            // Additional Information Based on Data Type
            if (foundWord.forms) {
                outputHTML += `<h4>Forms:</h4>`;
                if (foundWord.forms.singular) {
                    outputHTML += `<p><strong>Singular Forms:</strong></p>`;
                    outputHTML += `<ul>`;
                    for (const [caseName, form] of Object.entries(foundWord.forms.singular)) {
                        outputHTML += `<li>${caseName}: ${form}</li>`;
                    }
                    outputHTML += `</ul>`;
                }
                if (foundWord.forms.plural) {
                    outputHTML += `<p><strong>Plural Forms:</strong></p>`;
                    outputHTML += `<ul>`;
                    for (const [caseName, form] of Object.entries(foundWord.forms.plural)) {
                        outputHTML += `<li>${caseName}: ${form}</li>`;
                    }
                    outputHTML += `</ul>`;
                }
            }

            if (foundWord.person) {
                outputHTML += `<p><strong>Person:</strong> ${foundWord.person.join(", ")}</p>`;
            }

            if (foundWord.tense) {
                outputHTML += `<p><strong>Tense:</strong> ${foundWord.tense.join(", ")}</p>`;
            }

            if (foundWord.mood) {
                outputHTML += `<p><strong>Mood:</strong> ${foundWord.mood.join(", ")}</p>`;
            }

            if (foundWord.voice) {
                outputHTML += `<p><strong>Voice:</strong> ${foundWord.voice.join(", ")}</p>`;
            }

            if (foundWord.degree) {
                outputHTML += `<p><strong>Degree:</strong> ${foundWord.degree.join(", ")}</p>`;
            }

            if (foundWord.forms && foundWord.forms.indicative_present) {
                outputHTML += `<h4>Indicative Forms (Present):</h4>`;
                outputHTML += `<p>${foundWord.forms.indicative_present.join(", ")}</p>`;
            }

            if (foundWord.forms && foundWord.forms.subjunctive_present) {
                outputHTML += `<h4>Subjunctive Forms (Present):</h4>`;
                outputHTML += `<p>${foundWord.forms.subjunctive_present.join(", ")}</p>`;
            }

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
