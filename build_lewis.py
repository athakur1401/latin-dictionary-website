#!/usr/bin/env python3
import json
import pathlib
import unicodedata

# 1️⃣ input folder (the cloned per-letter JSONs)
INPUT_DIR = pathlib.Path("assets/lewis-short")
# 2️⃣ output path
OUT_DIR  = pathlib.Path("dist")
OUT_DIR.mkdir(exist_ok=True)
OUT_FILE = OUT_DIR / "lemmas.json"

# map L&S part-of-speech → our POS
POS_MAP = {
    "v":    "verb",
    "n":    "noun",
    "adj":  "adjective",
    "adv":  "adverb",
    "prep": "preposition",
    "pron": "pronoun",
    "conj": "conjunction",
    "int":  "interjection",
}

def demacron(s: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", s)
        if unicodedata.category(c) != "Mn"
    )

merged = []
seen   = set()

for fn in sorted(INPUT_DIR.glob("ls_*.json")):
    data = json.loads(fn.read_text(encoding="utf-8"))
    for entry in data:
        senses    = entry.get("senses") or []
        pos       = entry.get("part_of_speech")
        main_note = entry.get("main_notes") or ""

        # skip entries with no pos or no senses
        if not senses or not pos:
            continue

        raw_lemma = entry.get("key") or entry.get("headword") or ""
        lemma = demacron(raw_lemma).lower()
        if not lemma or lemma in seen:
            continue
        seen.add(lemma)

        # normalize POS
        p = POS_MAP.get(pos.lower(), pos.lower())

        # collect all defs/glosses
        defs = []
        for s in senses:
            if isinstance(s, str):
                defs.append(s.strip())
            elif isinstance(s, dict):
                d = s.get("definition") or s.get("gloss") or ""
                if d:
                    defs.append(d.strip())

        if not defs:
            continue

        # split off the first definition, bundle the rest into notes
        primary_def = defs[0]
        extras = defs[1:]  # any further senses

        # include the L&S main_notes if it's non-empty
        if main_note:
            extras.insert(0, main_note.strip())

        notes = "; ".join(extras) if extras else None

        item = {
            "lemma":      lemma,
            "pos":        p,
            "decl":       None,
            "stems":      {},
            "definition": primary_def,
        }
        if notes:
            item["notes"] = notes

        merged.append(item)

# write out
with open(OUT_FILE, "w", encoding="utf-8") as f:
    json.dump(merged, f, ensure_ascii=False, indent=2)

print(f"✅ wrote {len(merged):,} lemmas to {OUT_FILE}")
