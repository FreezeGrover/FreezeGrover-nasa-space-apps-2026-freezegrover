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
 * 1. Identify the exact word, phrase, reference, condition, or scope that gives
 *    rise to more than one plausible interpretation. Do not describe the user's
 *    question with a diagnostic label; instead explain the concrete issue.
 *
 *    Example:
 *      "That" could refer to the earlier experiment, the material sample, or
 *      the reported result.
 *
 *    Then state the plausible interpretations that remain relevant.
 *
 * 2. Do not assume that the most likely interpretation is necessarily the one
 *    the user intended, and do not equate popularity or common usage with
 *    certainty. A strong preference may be reported as a preference, but it must
 *    not erase other reasonable interpretations that still fit the question.
 *
 * 3. If more than one plausible interpretation would materially change the
 *    evidence, comparison, or conclusion, ask a concise clarification question
 *    before continuing. Do not silently choose one branch.
 *
 * 4. Preserve important entities, references, objects, relations, conditions,
 *    states, and user instructions distinctly throughout the reasoning process.
 *    When several similar items appear, trace each one separately rather than
 *    merging them. Re-check local interpretations against the full question and
 *    later evidence, and revise them when necessary.
 *
 * 5. Do not introduce relationships, events, rules, experimental conditions,
 *    causal claims, or conclusions that the available information does not
 *    establish. If several interpretations remain possible after review,
 *    preserve the alternatives and their relative support rather than forcing a
 *    single answer.
 *
 * 6. Before answering, perform a final consistency check: every reference,
 *    condition, comparison, and conclusion must still fit the complete state of
 *    the question and the retrieved evidence.
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
