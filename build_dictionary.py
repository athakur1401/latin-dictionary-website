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
import json
import pathlib
import unicodedata

RAW      = "dictline.raw"
OUT_DIR  = pathlib.Path("dist")
OUT_DIR.mkdir(exist_ok=True)

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

lemmas = []
seen = set()

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
                if tok in POS_MAP or (tok and tok[0] in POS_MAP)
            )
        except StopIteration:
            # no recognizable POS → skip
            continue

        tok = parts[pos_tok_i]
        pos = POS_MAP.get(tok, POS_MAP.get(tok[0], tok.lower()))

        # — conj/decl number: either in the POS token or the ones after it
        decl_num = None
        if len(tok) > 1 and tok[1].isdigit():
            decl_num = int(tok[1])
        else:
            for t in parts[pos_tok_i + 1 :]:
                if t and t[0].isdigit():
                    decl_num = int(t[0])
                    break

        # — collect any principal-parts between the lemma and POS token
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

        # ◆◆ improved gloss extraction ◆◆
        semi = line.find(";")
        if semi != -1:
            # RAW lines usually have a semicolon before the definition
            gloss = line[semi + 1 :].strip(" ;")
        else:
            # GEN-only lines don’t use semicolons — join everything after POS/decl
            gloss = " ".join(parts[pos_tok_i + 1 :]).strip()

        lemmas.append({
            "lemma":     lemma,
            "pos":       pos,
            "decl":      decl_num,
            "stems":     stems,
            "definition": gloss,
        })

# write out in UTF-8 (no ASCII escaping)
with open(OUT_DIR / "lemmas.json", "w", encoding="utf-8") as out_f:
    json.dump(lemmas, out_f, ensure_ascii=False)

print(f"✅ wrote {len(lemmas):,} lemmas to dist/lemmas.json")
