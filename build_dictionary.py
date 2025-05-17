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

POS_MAP = {"V": "verb", "N": "noun", "ADJ": "adjective", "ADV": "adverb",
           "PREP": "preposition", "INTERJ": "interjection"}

def demacron(s: str) -> str:
    return ''.join(c for c in unicodedata.normalize("NFD", s)
                   if unicodedata.category(c) != "Mn")

lemmas, seen = [], set()

with open(RAW, "rb") as fh:                         # read raw bytes
    for raw in fh:
        line = raw.decode("utf-8", errors="replace").rstrip()
        if not line:
            continue

        parts = line.split()
        lemma = parts[0].lower()
        if lemma in seen:
            continue
        seen.add(lemma)

        # POS code = first purely-alphabetic token after lemma/stems
        pos_tok_i = next(i for i, tok in enumerate(parts[1:], 1) if tok.isalpha())
        pos_code  = parts[pos_tok_i]
        pos = POS_MAP.get(pos_code, pos_code.lower())

        # conj./decl. number = first token that starts with a digit
        decl_num = None
        for tok in parts[pos_tok_i + 1:]:
            if tok[0].isdigit():
                decl_num = int(tok[0])
                break

        # take everything between lemma and POS token as “stems”
        stems_tokens = parts[1:pos_tok_i]
        stems = {}
        if pos == "verb" and len(stems_tokens) >= 3:
            stems = {
                "present": stems_tokens[0][:-1],      # drop final -o
                "perfect": stems_tokens[-2],
                "supine":  stems_tokens[-1],
            }
        elif pos == "noun" and stems_tokens:
            stems = {"stem": stems_tokens[0]}

        # ◆◆ improved gloss extraction ◆◆
        semi = line.find(";")
        if semi != -1:
            gloss = line[semi + 1 :].strip(" ;")
        else:
            # no semicolon → skip flag columns and take the remainder
            gloss_tokens = parts[pos_tok_i + 1 :]
            gloss_tokens = [t for t in gloss_tokens if len(t) > 2 or not t.isalpha()]
            gloss = " ".join(gloss_tokens)

        lemmas.append(
            {
                "lemma": lemma,
                "pos": pos,
                "decl": decl_num,
                "stems": stems,
                "definition": gloss,
            }
        )

json.dump(lemmas, open(OUT_DIR / "lemmas.json", "w"), ensure_ascii=False)
print(f"✅ wrote {len(lemmas):,} lemmas to dist/lemmas.json")
