// Keep numeric text intact: 5 is not evidence for 15, -5, 0.5 or 5%.
// This checks transcription only; matching values still need units and context reviewed.
export function numericEvidenceTokens(text: string): string[] {
  return (text.match(/[+-]?(?:(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?(?:\s*%)?/g) ?? [])
    .map(value => value.replace(/\s+/g, ""));
}

export function unsupportedNumericValues(claim: string, source: string): string[] {
  const available = new Set(numericEvidenceTokens(source));
  // Do not convert or round source values here. Equivalent-looking quantities
  // can describe different measurements, and this is not a unit converter.
  return [...new Set(numericEvidenceTokens(claim).filter(value => !available.has(value)))];
}

