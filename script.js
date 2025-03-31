document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("lookupButton").addEventListener("click", function () {
        const inputWord = document.getElementById("inputField").value.trim().toLowerCase();
        console.log("User entered:", inputWord); // Debugging step

        if (!inputWord) {
            alert("Please enter a word.");
            return;
        }

        // Dummy data dictionary
        const dictionary = [
            {
                "latin": "aqua",
                "part_of_speech": "Noun (f.)",
                "definition": "Water",
                "declension": "1st Declension",
                "forms": ["Aqua", "Aquae", "Aquam", "Aquā", "Aquae", "Aquārum", "Aquis", "Aquas", "Aquis"]
            },
            {
                "latin": "amare",
                "part_of_speech": "Verb",
                "definition": "To love",
                "conjugation": "1st Conjugation",
                "forms": ["Amo", "Amas", "Amat", "Amamus", "Amatis", "Amant"]
            },
            {
                "latin": "bonus",
                "part_of_speech": "Adjective",
                "definition": "Good",
                "comparative": "Melior",
                "superlative": "Optimus"
            },
            {
                "latin": "celeriter",
                "part_of_speech": "Adverb",
                "definition": "Quickly",
                "comparative": "Celerius",
                "superlative": "Celerrime"
            },
            {
                "latin": "puer",
                "part_of_speech": "Noun (m.)",
                "definition": "Boy",
                "declension": "2nd Declension",
                "forms": ["Puer", "Pueri", "Puero", "Puerum", "Puero", "Pueri", "Puerorum", "Pueris", "Pueros", "Pueris"]
            }
        ];

        const resultContainer = document.getElementById("resultContainer");
        let foundWord = null;

        // Search for the input word in the dictionary
        for (const entry of dictionary) {
            if (entry.latin.toLowerCase() === inputWord) {
                foundWord = entry;
                break;
            }
        }

        if (foundWord) {
            let outputHTML = `<h3>${foundWord.latin}</h3>
                <p><strong>Part of Speech:</strong> ${foundWord.part_of_speech}</p>
                <p><strong>Definition:</strong> ${foundWord.definition}</p>`;

            if (foundWord.declension) {
                outputHTML += `<p><strong>Declension:</strong> ${foundWord.declension}</p>`;
            }

            if (foundWord.conjugation) {
                outputHTML += `<p><strong>Conjugation:</strong> ${foundWord.conjugation}</p>`;
            }

            if (foundWord.comparative) {
                outputHTML += `<p><strong>Comparative:</strong> ${foundWord.comparative}</p>`;
            }

            if (foundWord.superlative) {
                outputHTML += `<p><strong>Superlative:</strong> ${foundWord.superlative}</p>`;
            }

            if (foundWord.forms) {
                outputHTML += `<p><strong>Forms:</strong> ${foundWord.forms.join(", ")}</p>`;
            }

            resultContainer.innerHTML = outputHTML;
        } else {
            resultContainer.innerHTML = `<p>Word not found in the dictionary.</p>`;
        }
    });
});
