const words = [
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

function lookupWord() {
    let word = document.getElementById("wordInput").value.toLowerCase();
    let resultDiv = document.getElementById("result");

    if (dictionary[word]) {
        let data = dictionary[word];
        resultDiv.innerHTML = `
            <h2>${word}</h2>
            <p><strong>Type:</strong> ${data.type}</p>
            <p><strong>Definition:</strong> ${data.definition}</p>
            <p><strong>Analysis:</strong> ${data.analysis}</p>
        `;
        resultDiv.style.display = "block";
    } else {
        resultDiv.innerHTML = `<p style="color:red;">Word not found in dictionary.</p>`;
        resultDiv.style.display = "block";
    }
}