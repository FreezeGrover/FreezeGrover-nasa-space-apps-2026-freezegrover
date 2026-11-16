export const rankingFrameworkGroups = [
  {
    label: "Mission and applicability",
    points: [1, 2, 3, 8, 17],
    implementation:
      "Identify the mission, retain environmental conditions and evidence gaps, and distinguish findings, analogies and qualified safety applications.",
  },
  {
    label: "Evidence and interpretation",
    points: [4, 7, 9, 11, 12],
    implementation:
      "Inspect original context, flag missing conditions and possible source-field inconsistencies, preserve units, test cases with multiple plausible interpretations and abstain from unsupported conclusions.",
  },
  {
    label: "Separate assessment dimensions",
    points: [6, 10, 15, 16],
    implementation:
      "Order question relevance independently from evidence coverage and conclusion confidence. Keep severity, likelihood and predictive validation separate.",
  },
  {
    label: "Independent review and traceability",
    points: [14, 18, 20],
    implementation:
      "Preserve provenance, communicate uncertainty, support independent QA and human escalation, and recheck dependent rankings after corrections. Research triage is distinct from emergency command.",
  },
  {
    label: "Engineering and delivery",
    points: [5, 13, 19],
    implementation:
      "Separate assessment from retrieval, ranking and presentation through tested contracts. Preserve source links, uncertainty and the end-to-end flow before adding optional modeling or animation.",
  },
] as const;
