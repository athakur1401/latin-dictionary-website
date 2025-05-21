#!/usr/bin/env python3
"""
Convert Whitaker’s DICTLINE.* → dist/lemmas.json  (≈ 4 MB)
Each record keeps only what we need for on-the-fly inflection.

Structure:
{
  "lemma": "amō",
  "pos":   "verb",
  "decl":  1,                    # declension / conjugation number
  "stems": {                     # keys vary by POS
      "present": "am",
      "perfect": "amav",
      "supine":  "amat"
  },
  "definition": "to love, like, be fond of"
}
"""
import json, pathlib, re, unicodedata

RAW      = "dictline.raw"
OUT_DIR  = pathlib.Path("dist")
OUT_DIR.mkdir(exist_ok=True)

# map exactly Whitaker’s codes to our nicer POS strings
POS_MAP = {
    "V":      "verb",
    "N":      "noun",
    "ADJ":    "adjective",
    "ADV":    "adverb",
    "PREP":   "preposition",
    "INTERJ": "interjection",
    # (you can add e.g. “CONJ” → “conjunction” here, if it appears)
}

def demacron(s: str) -> str:
    """Strip all macrons (combining marks) from a string."""
    return ''.join(
        c for c in unicodedata.normalize("NFD", s)
        if unicodedata.category(c) != "Mn"
    )

lemmas, seen = [], set()

with open(RAW, "rb") as fh:
    for raw in fh:
        line = raw.decode("utf-8", errors="replace").rstrip()
        if not line:
            continue

        parts = line.split()
        lemma = parts[0].lower()
        if lemma in seen:
            continue
        seen.add(lemma)

        # — find the index of the POS code by matching exactly one of POS_MAP’s keys
        try:
            pos_tok_i = next(i for i, tok in enumerate(parts) if tok in POS_MAP)
        except StopIteration:
            # skip any lines that don’t have a recognized POS code
            continue

        pos = POS_MAP[parts[pos_tok_i]]

        # — after that comes a conj/decl number (e.g. “1” or “3”), pick the first token that starts with a digit
        decl_num = None
        for tok in parts[pos_tok_i + 1:]:
            if tok and tok[0].isdigit():
                decl_num = int(tok[0])
                break

        # — everything between parts[1] up to parts[pos_tok_i] are “stems tokens”
        stems_tokens = parts[1:pos_tok_i]
        stems = {}
        if pos == "verb" and len(stems_tokens) >= 3:
            stems = {
                "present": stems_tokens[0][:-1],   # drop final “-o”
                "perfect": stems_tokens[-2],
                "supine":  stems_tokens[-1],
            }
        elif pos == "noun" and stems_tokens:
            stems = {"stem": stems_tokens[0]}

        # — robust gloss extraction: if there’s a “;” in the line, take everything after the first “;”
        semi = line.find(";")
        if semi != -1:
            gloss = line[semi + 1 :].strip(" ;")
        else:
            # otherwise, drop short alpha flags and join the rest
            tail = parts[pos_tok_i + 1 :]
            gloss_tokens = [t for t in tail if len(t) > 2 or not t.isalpha()]
            gloss = " ".join(gloss_tokens)

        lemmas.append({
            "lemma":     lemma,
            "pos":       pos,
            "decl":      decl_num,
            "stems":     stems,
            "definition": gloss
        })

# write it out
with open(OUT_DIR / "lemmas.json", "w", encoding="utf-8") as out_f:
    json.dump(lemmas, out_f, ensure_ascii=False)

print(f"✅ wrote {len(lemmas):,} lemmas to dist/lemmas.json")
