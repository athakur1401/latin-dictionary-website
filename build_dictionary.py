#!/usr/bin/env python3
"""
Turn Whitaker’s DICTLINE.GEN/RAW -> two compact JSON files

• dist/lemmas.json  – one record per unique lemma (keeps macrons)
• dist/forms.json   – { form : lemma_id }  <- *includes* macron-less keys

Run:  python build_dictionary.py
"""
import json, pathlib, unicodedata

RAW      = "dictline.raw"                 # make sure this file exists
OUT_DIR  = pathlib.Path("dist")
OUT_DIR.mkdir(exist_ok=True)

def demacron(text: str) -> str:
    """Remove macrons (and any other combining marks) from Latin strings."""
    return ''.join(
        c for c in unicodedata.normalize("NFD", text)
        if unicodedata.category(c) != "Mn"
    )

lemmas, form_index, seen = [], {}, set()

with open(RAW, encoding="latin-1") as f:
    for line in f:
        if not line.strip():
            continue
        head, *rest = line.split(None, 1)           # lemma, then gloss
        lemma = head.lower()                        # keep macrons here
        if lemma in seen:
            continue
        seen.add(lemma)

        gloss = rest[0].strip() if rest else ""
        lemma_id = len(lemmas)

        # -------- store lemma record ----------
        lemmas.append({
            "lemma": lemma,         # macronised form
            "definition": gloss,
            "pos": "",              # (parse later if desired)
            "irregular": {}
        })

        # -------- index keys ----------
        form_index[lemma] = lemma_id                 # macronised
        plain = demacron(lemma)
        if plain != lemma:
            form_index[plain] = lemma_id             # ASCII key

# ---------- write compact JSON (no pretty indent) ----------
json.dump(lemmas,      open(OUT_DIR / "lemmas.json", "w"), ensure_ascii=False)
json.dump(form_index, open(OUT_DIR / "forms.json",  "w"))

print(f"✅  wrote {len(lemmas):,} lemmas & {len(form_index):,} forms "
      f"(includes macron-less index keys)")


