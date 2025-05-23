// inflect.js
// ——— Tiny on-the-fly inflector for 1st-conj verbs & 1st-decl nouns ———

// 1st-conjugation endings
export const V1_ENDINGS = {
  pres: ["o","as","at","amus","atis","ant"],
  impf: ["abam","abas","abat","abamus","abatis","abant"],
  fut:  ["abo","abis","abit","abimus","abitis","abunt"],
};

// 1st-declension endings (vocative = nominative)
export const N1_ENDINGS = {
  sing: ["a","ae","ae","am","ā","a"],      
  plur: ["ae","ārum","īs","ās","īs","ae"],
};

/**
 * Given the present-stem (e.g. "am"), return all 18 forms
 *  (6 pres, 6 impf, 6 fut).
 */
export function conjugateV1(stem) {
  return [
    ...V1_ENDINGS.pres.map(e => stem + e),
    ...V1_ENDINGS.impf.map(e => stem + e),
    ...V1_ENDINGS.fut .map(e => stem + e),
  ];
}

/**
 * Given the noun-stem (e.g. "puell"), return its 12 forms
 *  (6 singular, 6 plural).
 */
export function declineN1(stem) {
  return [
    ...N1_ENDINGS.sing.map(e => stem + e),
    ...N1_ENDINGS.plur.map(e => stem + e),
  ];
}
