import type { Investigation } from "@/types/research";
import { getExperimentMetadata } from "./metadata";
const stopWords = new Set(
  "how does do did what why when where which who is are was were a an the in on of for to and or with from by about affect affects affected effect effects influence influences impact impacts happen happens under compare compared between than can could would should will tell me explain show find research investigation investigations studies study evidence data increased increase decrease behave behavior behaviour".split(
    " ",
  ),
);
const concepts = [
  {
    key: "spread",
    pattern:
      /\b(flame spread|flame propagation|fire spread|propagation|spread)\b/g,
    terms: ["flame spread", "flame-spread", "fuel regression"],
  },
  {
    key: "smoke",
    pattern: /\b(smoke|aerosols?|particles?|detectors?|detection)\b/g,
    terms: ["smoke", "aerosol", "detector"],
  },
  {
    key: "droplet",
    pattern: /\b(droplets?|liquid fuels?)\b/g,
    terms: ["droplet", "liquid-fuel"],
  },
  {
    key: "suppression",
    pattern: /\b(extinguish\w*|extinction|suppress\w*|put out)\b/g,
    terms: ["extinction", "extinguishment", "suppressant", "suppression"],
  },
  {
    key: "cool",
    pattern: /\b(cool flames?|low temperature flames?|invisible flames?)\b/g,
    terms: ["cool flame", "cool-flame"],
  },
  { key: "oxygen", pattern: /\b(oxygen|o2)\b/g, terms: ["oxygen"] },
  {
    key: "pressure",
    pattern: /\b(pressure|pressures)\b/g,
    terms: ["pressure"],
  },
  { key: "soot", pattern: /\b(soot|sooting)\b/g, terms: ["soot"] },
  {
    key: "solid",
    pattern: /\b(solids?|solid fuels?|materials?|flammability)\b/g,
    terms: ["solid-fuel", "solid fuel", "material", "flammability"],
  },
];
export interface SearchMatch {
  item: Investigation;
  reasons: string[];
  relevance: number;
}
function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[-–—]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function searchText(item: Investigation) {
  const m = getExperimentMetadata(item.id);
  return normalize(
    [
      item.name,
      item.title,
      item.purpose,
      item.fuel,
      item.measurements,
      item.finding,
      m.variations,
      m.sensors,
      m.hardware.join(" "),
    ].join(" "),
  );
}
export function retrieveInvestigations(
  items: Investigation[],
  query: string,
): SearchMatch[] {
  if (!query.trim())
    return items.map((item) => ({
      item,
      reasons: ["Catalog record"],
      relevance: 0,
    }));
  let remaining = normalize(query);
  const wanted: typeof concepts = [];
  for (const concept of concepts) {
    if (new RegExp(concept.pattern).test(remaining)) {
      wanted.push(concept);
      remaining = remaining.replace(new RegExp(concept.pattern), " ");
    }
  }
  const gravityTerms = [
    "microgravity",
    "weightlessness",
    "weightless",
    "zero gravity",
    "low gravity",
  ];
  const gravityContext = gravityTerms.some((term) => remaining.includes(term));
  for (const term of gravityTerms) remaining = remaining.replaceAll(term, " ");
  const partial = /\b(lunar|moon|martian|mars|partial gravity)\b/.test(
    remaining,
  );
  remaining = remaining.replace(
    /\b(lunar|moon|martian|mars|partial gravity)\b/g,
    " ",
  );
  const tokens = remaining.split(/\s+/).filter((t) => t && !stopWords.has(t));
  // Unknown subject words must still find real support. Gravity alone should not
  // make an unrelated question about bananas look like a combustion result.
  if (!wanted.length && !tokens.length && !gravityContext && !partial)
    return [];
  if (
    !wanted.length &&
    !tokens.length &&
    gravityContext &&
    !gravityTerms.includes(normalize(query))
  )
    return [];
  return items
    .flatMap((item) => {
      const text = searchText(item);
      const m = getExperimentMetadata(item.id);
      if (partial) return []; // No direct partial-gravity records have been imported.
      if (tokens.some((token) => !text.includes(token))) return [];
      const matches = wanted.filter((c) => m.topics.includes(c.key));
      if (wanted.length && !matches.length) return [];
      if (gravityContext && !m.gravity.includes("microgravity")) return [];
      const reasons = matches.map((c) => `Topic: ${c.key}`);
      if (tokens.length) reasons.push(`Record terms: ${tokens.join(", ")}`);
      if (gravityContext) reasons.push("Microgravity context");
      return [
        {
          item,
          reasons,
          relevance:
            matches.length * 10 + tokens.length * 3 + (gravityContext ? 1 : 0),
        },
      ];
    })
    .sort((a, b) => b.relevance - a.relevance);
}
