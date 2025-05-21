// inflect.js
// ———  Tiny on-the-fly inflector for 1st-conj verbs & 1st-decl nouns ———

export const V1_ENDINGS = {
  pres: ["o","as","at","amus","atis","ant"],
  impf:["abam","abas","abat","abamus","abatis","abant"],
  fut: ["abo","abis","abit","abimus","abitis","abunt"],
  // you can add perf, supine participles later
};

export const N1_ENDINGS = {
  sing: ["a","ae","ae","am","ā"],      // nom, gen, dat, acc, abl
  plur: ["ae","ārum","īs","ās","īs"],
};

export function conjugateV1(stem) {
  // stem is the verb stem without final -o, e.g. "am" for amō
  const forms = [];
  Object.values(V1_ENDINGS).forEach(arr =>
    arr.forEach(end => forms.push(stem + end))
  );
  return forms;
}

export function declineN1(stem) {
  // stem is noun-stem, e.g. "puell" for puella, puellae, etc.
  return [
    ...N1_ENDINGS.sing.map(e => stem + e),
    ...N1_ENDINGS.plur.map(e => stem + e),
  ];
}
