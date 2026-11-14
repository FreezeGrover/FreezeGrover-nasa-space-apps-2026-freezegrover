export interface ReviewCheck {
  title: string;
  question: string;
  status: string;
  detail: string;
}
export function reviewScientificClaim(claim: string): ReviewCheck[] {
  // A linked page alone cannot establish that a claim is scientifically correct.
  // Until original evidence is connected, every source-dependent check stays pending.
  return [
    {
      title: "Evidence & Source Verification",
      question:
        "Are claims and measurements represented accurately from the original NASA sources?",
      status: "Pending Evidence",
      detail:
        "Original documents and test files have not been connected. Source support cannot be confirmed.",
    },
    {
      title: "Scientific Accuracy & Experimental Conditions",
      question:
        "Are fuel, oxygen, pressure, airflow, gravity, and units interpreted correctly?",
      status: "Pending Evidence",
      detail:
        "Exact experimental conditions and units must be extracted and checked before verification.",
    },
    {
      title: "Uncertainty, Multiple Interpretations & Research Gaps",
      question: "What is unclear? What additional evidence is needed?",
      status: claim.trim() ? "Needs Review" : "Pending Review",
      detail:
        "Comparative language requires an explicit baseline. Different oxygen levels, materials, or flow conditions can change the interpretation.",
    },
    {
      title: "Independent QA Review & Ranking Verification",
      question:
        "An independent check of interpretation, evidence, and research relevance.",
      status: "Pending Review",
      detail:
        "No independent scientific verification has run. Relevance does not establish hazard probability.",
    },
  ];
}
