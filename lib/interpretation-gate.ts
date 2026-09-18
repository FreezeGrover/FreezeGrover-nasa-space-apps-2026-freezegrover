export interface PlausibleInterpretation {
  id: string;
  label: string;
  description?: string;
}

export interface InterpretationGateResult {
  status: "clear" | "needs-clarification";
  interpretations: PlausibleInterpretation[];
  clarificationQuestion?: string;
}

export interface InterpretationAssessment {
  question: string;
  interpretations: PlausibleInterpretation[];
  materiallyDifferent: boolean;
}

/**
 * Interpretation Gate
 *
 * Purpose: before retrieval or scientific reasoning, check whether a research
 * question has multiple plausible scopes that would materially change which
 * evidence should be retrieved, compared, or used in a conclusion.
 *
 * The gate must not silently choose one plausible interpretation when another
 * reasonable interpretation would lead to materially different evidence or
 * conclusions. In that case, FREEZGROVER asks a short clarification question.
 *
 * This file deliberately contains no domain-specific hardcoded examples. The
 * actual interpretation generation/assessment will be model-assisted later.
 */
export function evaluateInterpretationGate(
  assessment: InterpretationAssessment,
): InterpretationGateResult {
  const viable = assessment.interpretations.filter(
    (candidate) => candidate.label.trim().length > 0,
  );

  if (!assessment.materiallyDifferent || viable.length <= 1) {
    return {
      status: "clear",
      interpretations: viable,
    };
  }

  const options = viable.map((candidate) => candidate.label).join(", ");

  return {
    status: "needs-clarification",
    interpretations: viable,
    clarificationQuestion:
      viable.length === 2
        ? `Which scope do you mean: ${viable[0].label} or ${viable[1].label}?`
        : `Which scope do you mean: ${options}?`,
  };
}
