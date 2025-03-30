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

const container = document.getElementById("dictionary");
container.innerHTML = words.map(word => `
    <div class="entry">
        <h2>${word.latin}</h2>
        <p><strong>Part of Speech:</strong> ${word.part_of_speech}</p>
        <p><strong>Definition:</strong> ${word.definition}</p>
        ${word.declension ? `<p><strong>Declension:</strong> ${word.declension}</p>` : ""}
        ${word.conjugation ? `<p><strong>Conjugation:</strong> ${word.conjugation}</p>` : ""}
        ${word.comparative ? `<p><strong>Comparative:</strong> ${word.comparative}</p>` : ""}
        ${word.superlative ? `<p><strong>Superlative:</strong> ${word.superlative}</p>` : ""}
        ${word.forms ? `<p><strong>Forms:</strong> ${word.forms.join(", ")}</p>` : ""}
    </div>
`).join("");
