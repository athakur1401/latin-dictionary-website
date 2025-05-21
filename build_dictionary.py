#!/usr/bin/env python3
"""
Convert Whitaker’s DICTLINE.GEN/RAW → dist/lemmas.json  (≈ 4 MB)

Each record keeps only what we need for on-the-fly inflection:

{
  "lemma":     "amō",
  "pos":       "verb",
  "decl":      1,                  # conj/decl number
  "stems":     {                   # only when RAW gives them
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

# map letter-codes (and a few common full codes) to human POS
POS_MAP = {
    "V":      "verb",
    "N":      "noun",
    "ADJ":    "adjective",
    "ADV":    "adverb",
    "PREP":   "preposition",
    "INTERJ": "interjection",
    "CONJ":   "conjunction",
    "PRON":   "pronoun",
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

        # — find the POS token index by looking for either a full code
        #   (e.g. "PREP", "ADJ") or a token whose first letter matches V/N/etc.
        try:
            pos_tok_i = next(
                i for i, tok in enumerate(parts[1:], 1)
                if tok in POS_MAP or tok and tok[0] in POS_MAP
            )
        except StopIteration:
            # nothing we recognize as a part-of-speech: skip it
            continue

        tok = parts[pos_tok_i]
        # map to our normalized POS
        if tok in POS_MAP:
            pos = POS_MAP[tok]
        else:
            pos = POS_MAP.get(tok[0], tok.lower())

        # — conj/decl number: first digit in that token or in the ones after it
        decl_num = None
        # if the POS token itself has a digit, grab it
        if len(tok) > 1 and tok[1].isdigit():
            decl_num = int(tok[1])
        else:
            for t in parts[pos_tok_i + 1:]:
                if t and t[0].isdigit():
                    decl_num = int(t[0])
                    break

        # — collect any principal-parts tokens between lemma and POS
        stems_tokens = parts[1:pos_tok_i]
        stems = {}
        if pos == "verb" and len(stems_tokens) >= 3:
            stems = {
                "present": stems_tokens[0][:-1],  # drop final -o
                "perfect": stems_tokens[-2],
                "supine":  stems_tokens[-1],
            }
        elif pos == "noun" and stems_tokens:
            stems = {"stem": stems_tokens[0]}

        # — extract the gloss after the first semicolon, if there is one
        semi = line.find(";")
        if semi != -1:
            gloss = line[semi + 1 :].strip(" ;")
        else:
            # no semicolon → drop any tiny flag tokens and rejoin the rest
            tail = parts[pos_tok_i + 1 :]
            gloss_tokens = [t for t in tail if len(t) > 2 or not t.isalpha()]
            gloss = " ".join(gloss_tokens)

        lemmas.append({
            "lemma":      lemma,
            "pos":        pos,
            "decl":       decl_num,
            "stems":      stems,
            "definition": gloss
        })

# write out in UTF-8 (no ASCII escaping)
with open(OUT_DIR / "lemmas.json", "w", encoding="utf-8") as out_f:
    json.dump(lemmas, out_f, ensure_ascii=False)

print(f"✅ wrote {len(lemmas):,} lemmas to dist/lemmas.json")
