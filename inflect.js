// inflect.js
// ——— Tiny on-the-fly inflector for 1st-conj verbs & 1st-decl nouns ———

export const V1_ENDINGS = {
  pres: ["o","as","at","amus","atis","ant"],
  impf:["abam","abas","abat","abamus","abatis","abant"],
  fut: ["abo","abis","abit","abimus","abitis","abunt"],
};

export const N1_ENDINGS = {
  sing: ["a","ae","ae","am","ā"],      // nom, gen, dat, acc, abl
  plur: ["ae","ārum","īs","ās","īs"],
};

export function conjugateV1(stem) {
  // stem = verb-stem without final -o ("am" for amō)
  return Object.values(V1_ENDINGS)
    .flatMap(arr => arr.map(end => stem + end));
}

export function declineN1(stem) {
  // stem = noun-stem ("puell" for puella, puellae, etc.)
  return [
    ...N1_ENDINGS.sing.map(e => stem + e),
    ...N1_ENDINGS.plur.map(e => stem + e),
  ];
}
