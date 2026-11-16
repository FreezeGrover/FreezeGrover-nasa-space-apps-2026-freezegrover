// Check the value and unit together. Seeing “5” somewhere in a source cannot
// justify changing 5 atm into 5 kPa. This does not convert or infer units.
const quantity =
  /([+−-]?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?)\s*(cm\s*\/\s*s|mm\s*\/\s*s|m\s*\/\s*s|mole\s+fraction|percent|kPa|MPa|Pa|atm|psi|bar|mm|cm|km|m|ms|seconds?|minutes?|hours?|°\s*C|°\s*F|K|%)(?![a-zA-Z])/g;
function tokens(text: string) {
  return [...text.matchAll(quantity)].map(
    (match) =>
      match[1].replace("−", "-") +
      ":" +
      match[2]
        .replace(/\s+/g, "")
        .replace(/^percent$/, "%")
        .replace(/^seconds?$/, "s")
        .replace(/^minutes?$/, "min")
        .replace(/^hours?$/, "h"),
  );
}
export function unsupportedQuantities(claim: string, source: string) {
  const known = new Set(tokens(source));
  return [...new Set(tokens(claim).filter((token) => !known.has(token)))];
}
