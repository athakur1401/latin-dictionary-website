#!/usr/bin/env python3
"""
Parse Whitaker DICTLINE.* -> 1 compact JSON (~4 MB)

Output: dist/lemmas.json
[
  {
    "lemma": "amō",
    "pos": "verb",
    "decl": 1,                 # or conj for verbs
    "stems": {                 # keys vary by POS
        "present": "am",
        "perfect": "amav",
        "supine": "amat"
    },
    "definition": "to love, like, be fond of"
  },
  ...
]
"""
import json, pathlib, re, unicodedata, sys

RAW      = "dictline.raw"
OUT_DIR  = pathlib.Path("dist").mkdir(exist_ok=True) or pathlib.Path("dist")

POS_MAP = {"V": "verb", "N": "noun", "ADJ": "adjective", "ADV": "adverb",
           "PREP": "preposition", "INTERJ": "interjection"}

def demacron(s):
    return ''.join(c for c in unicodedata.normalize("NFD", s)
                   if unicodedata.category(c) != "Mn")

lemmas, seen = [], set()

with open(RAW, "rb") as fh:  # read bytes → decode UTF-8
    for raw in fh:
        line = raw.decode("utf-8", errors="replace").strip()
        if not line:
            continue

        parts = line.split()
        lemma = parts[0].lower()
        if lemma in seen:
            continue
        seen.add(lemma)

        # find POS token (first all-alpha field)
        pos_tok_i = next(i for i,p in enumerate(parts[1:], 1) if p.isalpha())
        pos_code  = parts[pos_tok_i]
        pos = POS_MAP.get(pos_code, pos_code.lower())

        # conj/decl number is next numeric token (if any)
        decl_num = None
        for p in parts[pos_tok_i+1:]:
            if p.isdigit() or (len(p)==2 and p[0].isdigit()):
                decl_num = int(p[0])
                break

        # heuristic stems: keep tokens until we hit the POS code
        stems_tokens = parts[1:pos_tok_i]
        stems = {}
        if pos == "verb" and len(stems_tokens) >= 3:
            stems = {"present": stems_tokens[0][:-1],   # drop final char (-o)
                     "perfect": stems_tokens[-2],
                     "supine":  stems_tokens[-1]}
        elif pos == "noun" and stems_tokens:
            stems = {"stem": stems_tokens[0]}

        # gloss: everything after last ' ; '
        gloss_match = re.search(r";\s*(.*)$", line)
        gloss = gloss_match.group(1) if gloss_match else ""

        lemmas.append({
            "lemma": lemma,
            "pos": pos,
            "decl": decl_num,
            "stems": stems,
            "definition": gloss
        })

json.dump(lemmas, open(OUT_DIR / "lemmas.json", "w"),
          ensure_ascii=False)

print(f"✅ wrote {len(lemmas):,} lemmas to dist/lemmas.json")
