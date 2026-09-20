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
 * question has multiple plausible interpretations or scopes that would
 * materially change which evidence should be retrieved, compared, or used in a
 * conclusion.
 *
 * RESPONSE DISCIPLINE
 *
 * 1. Identify the exact word, phrase, scientific term, condition, or requested
 *    scope that permits more than one reasonable interpretation. Explain the
 *    concrete alternatives in plain language rather than silently choosing one.
 *
 *    Example:
 *      Question: "How does flow affect the flame?"
 *      The term "flow" could refer to forced-airflow velocity, flow direction
 *      relative to flame spread, the broader ventilation condition, or another
 *      experimentally defined flow parameter.
 *
 *      If those meanings would lead to different evidence or conclusions, ask a
 *      focused follow-up such as:
 *      "Do you mean the effect of airflow speed, flow direction, or the broader
 *       ventilation condition?"
 *
 * 2. Do not assume that the most common interpretation is necessarily the one
 *    the user intended. A more likely reading may be noted internally, but it
 *    must not erase another reasonable reading that would materially change the
 *    evidence, comparison, or conclusion.
 *
 * 3. If more than one plausible interpretation would materially change the
 *    evidence, comparison, or conclusion, ask a concise clarification question
 *    before continuing. Do not silently choose one scope.
 *
 * 4. Keep important experimental factors and requested scopes separate while
 *    reasoning. When several similar conditions or comparison targets appear,
 *    do not collapse them into one. Re-check the chosen scope against the full
 *    question and any later evidence, and revise it when necessary.
 *
 * 5. Do not introduce experimental conditions, causal claims, safety claims, or
 *    conclusions that the available information does not establish. If several
 *    interpretations remain possible after review, preserve the alternatives
 *    rather than forcing a single answer.
 *
 * 6. Before answering, perform a final consistency check so that each condition,
 *    comparison, and conclusion still fits the complete question and retrieved
 *    evidence.
 *
 * 7. When clarification is needed, make the question useful to the researcher.
 *    Briefly explain the competing scopes, then ask which one they intend. A
 *    natural follow-up can also offer the next useful action, for example:
 *      "Do you mean X or Y? Once you confirm, I can compare the relevant NASA
 *       experiments under that scope."
 *
 * The gate must not silently choose one plausible interpretation when another
 * reasonable interpretation would lead to materially different evidence or
 * conclusions. Interpretation generation and assessment are model-assisted;
 * this function only enforces whether the pipeline may continue.
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
