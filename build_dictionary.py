#!/usr/bin/env python3
"""
Convert Whitaker’s dictline.raw → lean JSON files:

• dist/lemmas.json   – 1 record per unique headword
• dist/forms.json    – { form : lemma_id }

Run:  python build_dictionary.py
"""
import json, pathlib

RAW      = "dictline.raw"
OUT_DIR  = pathlib.Path("dist")
OUT_DIR.mkdir(exist_ok=True)

lemmas, form_index, seen = [], {}, set()

with open(RAW, encoding="latin-1") as f:
    for line in f:
        if not line.strip():
            continue
        head, *rest = line.split(None, 1)   # lemma, then gloss
        lemma = head.lower()
        if lemma in seen:
            continue
        gloss = rest[0].strip() if rest else ""
        lemma_id = len(lemmas)
        lemmas.append({
            "lemma": lemma,
            "definition": gloss,
            "pos": "",          # we’ll parse tags later
            "irregular": {}
        })
        form_index[lemma] = lemma_id


# ---------- write compact JSON (no indent) ----------
json.dump(lemmas,      open(OUT_DIR / "lemmas.json", "w"), ensure_ascii=False)
json.dump(form_index, open(OUT_DIR / "forms.json",  "w"))

print(f"✅  wrote {len(lemmas):,} lemmas & {len(form_index):,} forms")
