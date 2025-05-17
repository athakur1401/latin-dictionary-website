#!/usr/bin/env python3
"""
Build two compact files from Whitaker’s DICTLINE.GEN / DICTLINE.RAW

• dist/lemmas.json – one record per lemma (keeps macrons)
• dist/forms.json  – { form : lemma_id }   ← includes BOTH macron + ASCII keys
"""
import json, pathlib, unicodedata

RAW = "dictline.raw"                     # <-- make sure this exists
OUT = pathlib.Path("dist")
OUT.mkdir(exist_ok=True)

def demacron(txt: str) -> str:
    """remove macrons (all combining marks) from a Latin word"""
    return ''.join(
        c for c in unicodedata.normalize("NFD", txt)
        if unicodedata.category(c) != "Mn"
    )

lemmas, form_index, seen = [], {}, set()

with open(RAW, encoding="latin-1") as f:
    for line in f:
        if not line.strip():
            continue
        head, *rest = line.split(None, 1)       # lemma, then gloss
        lemma = head.lower()                    # keeps macron
        if lemma in seen:
            continue
        seen.add(lemma)

        gloss = rest[0].strip() if rest else ""
        lemma_id = len(lemmas)
        lemmas.append({
            "lemma": lemma,
            "definition": gloss,
            "pos": "",
            "irregular": {}
        })

        form_index[lemma] = lemma_id              # macron key
        plain = demacron(lemma)
        form_index[plain] = lemma_id              # plain ASCII key (no if-test)

# write (no pretty-print → small)
json.dump(lemmas,      open(OUT / "lemmas.json", "w"), ensure_ascii=False)
json.dump(form_index, open(OUT / "forms.json",  "w"))
print(f"✅  wrote {len(lemmas):,} lemmas & {len(form_index):,} forms")
