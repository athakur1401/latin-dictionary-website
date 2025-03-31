document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("lookupButton").addEventListener("click", function () {
        const inputWord = document.getElementById("inputField").value.trim().toLowerCase();
        console.log("User entered:", inputWord); // Debugging step

        if (!inputWord) {
            alert("Please enter a word.");
            return;
        }



//dummy data
const dictionary = [
    {
        "latin": "Aqua",
        "part_of_speech": "Noun (f.)",
        "definition": "Water",
        "declension": "1st Declension",
        "forms": ["Aqua", "Aquae", "Aquam", "Aquā", "Aquae", "Aquārum", "Aquis", "Aquas", "Aquis"]
    },
    {
        "latin": "Amare",
        "part_of_speech": "Verb",
        "definition": "To love",
        "conjugation": "1st Conjugation",
        "forms": ["Amo", "Amas", "Amat", "Amamus", "Amatis", "Amant"]
    },
    {
        "latin": "Bonus",
        "part_of_speech": "Adjective",
        "definition": "Good",
        "comparative": "Melior",
        "superlative": "Optimus"
    },
    {
        "latin": "Celeriter",
        "part_of_speech": "Adverb",
        "definition": "Quickly",
        "comparative": "Celerius",
        "superlative": "Celerrime"
    },
    {
        "latin": "Puer",
        "part_of_speech": "Noun (m.)",
        "definition": "Boy",
        "declension": "2nd Declension",
        "forms": ["Puer", "Pueri", "Puero", "Puerum", "Puero", "Pueri", "Puerorum", "Pueris", "Pueros", "Pueris"]
    }
];

const resultContainer = document.getElementById("resultContainer");

        if (dictionary[inputWord]) {
            const wordData = dictionary[inputWord];
            resultContainer.innerHTML = `
                <h3>${inputWord}</h3>
                <p><strong>Type:</strong> ${wordData.type}</p>
                <p><strong>Definition:</strong> ${wordData.definition}</p>
                <p><strong>Grammar:</strong> ${wordData.grammar}</p>
            `;
        } else {
            resultContainer.innerHTML = `<p>Word not found in the dictionary.</p>`;
        }
    });
});