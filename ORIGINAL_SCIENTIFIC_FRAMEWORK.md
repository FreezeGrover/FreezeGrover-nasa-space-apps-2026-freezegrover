# NASA Space Apps — Flames in Free Fall
## Original 20-Point Scientific Reasoning Framework

**Source:** NASA_Interview_Guide_Professional.pdf

This is our project's proposed scientific and engineering framework, not an official NASA evaluation rubric.

### Four governing rules

- Evidence before confidence.
- Reasoning before recommendations.
- A correct measurement does not guarantee a correct interpretation.
- Cut features, not scientific standards.

## Foundations

### 01 — Understanding the Mission

**Question:** What is NASA's 'Flames in Free Fall' challenge about, and why is it called 'Free Fall'?

**What a strong answer includes:** The challenge centers on interpreting and ranking NASA microgravity combustion investigations for spacecraft fire safety. The ISS and its contents are in continuous orbital free fall; gravity is still present, but buoyancy-driven convection is greatly reduced.

**Follow-up:** Why can flames behave differently in microgravity?

### 02 — Why Astronaut Safety Matters

**Question:** Why is understanding fire in microgravity important for astronaut safety?

**What a strong answer includes:** Earth-based assumptions may not apply directly to spacecraft. Material ignition, flame spread, airflow, oxygen, smoke, detection and suppression all matter; experiments inform safety engineering.

**Follow-up:** What could go wrong if we directly transfer Earth-based fire assumptions?

### 03 — Environmental Uncertainty

**Question:** If one experiment shows a material burning in microgravity, can we conclude it is unsafe in every spacecraft?

**What a strong answer includes:** No. Conclusions depend on material form, oxygen, pressure, airflow, ignition source, test apparatus and other conditions. Separate observed behavior from general safety claims.

**Follow-up:** What extra evidence would you need?

### 04 — Conflicting Findings

**Question:** Two NASA experiments report fast and slow burning for the same material. How would you investigate?

**What a strong answer includes:** Compare measurement definitions, test setup, oxygen, pressure, airflow, sample geometry and uncertainties. Both results may be valid in different conditions. Escalate unresolved contradictions.

**Follow-up:** What should the AI say if the conflict remains unresolved?

## Building Trustworthy AI

### 05 — Modular Teamwork

**Question:** With 48 hours and several teammates, how would you organize the code for independent work and safe integration?

**What a strong answer includes:** Define small modules and agreed data contracts: NASA source retrieval, extraction, evidence analysis, ranking, API, interface and QA. Use version control, sample JSON fixtures and early integration tests.

**Follow-up:** How would two modules exchange results without tightly coupling their code?

### 06 — Ranking Research Relevance

**Question:** How would you rank 50 combustion investigations for a specific spacecraft fire-safety question?

**What a strong answer includes:** Score relevance to the exact question using transparent criteria; display evidence quality, hazard implications and uncertainty separately. Explain each ranking with sources; avoid fabricated risk scores.

**Follow-up:** Can a highly relevant investigation still have weak evidence?

### 07 — Evidence Beyond a Snippet

**Question:** How would you ensure the AI examines scientific evidence rather than extracting one sentence and guessing?

**What a strong answer includes:** Retrieve enough context across paragraphs, sections, chapters and methods as needed; resolve references, extract conditions, check units and compare original source material. Maintain citations.

**Follow-up:** When should the AI look beyond the current paragraph?

### 08 — Missing Direct Experiments

**Question:** What should the AI do when NASA has no direct experiment for the material or scenario?

**What a strong answer includes:** Identify the evidence gap; distinguish analogous research from direct measurements; explain transfer limitations and what further tests are required. Withhold unsupported conclusions.

**Follow-up:** How can related studies be useful without proving the answer?

### 09 — Avoiding False Confidence

**Question:** How would you prevent the AI from hiding uncertainty behind polished language?

**What a strong answer includes:** Require source-backed claims, explicit assumptions, missing-data notices, calibrated uncertainty where available and an option to abstain. Test whether claims match the evidence.

**Follow-up:** How would you recognize an answer that sounds confident but lacks support?

### 10 — Relevance Versus Evidence Quality

**Question:** How would you display research relevance and evidence quality without confusing them?

**What a strong answer includes:** Show separately labeled dimensions with concise explanations and provenance; do not blend them into a single unexplained score. Include applicability and uncertainty.

**Follow-up:** Why can high relevance coexist with low evidence quality?

### 11 — Testing Ambiguity Detection

**Question:** How would you test whether the AI detects ambiguity rather than producing confident answers?

**What a strong answer includes:** Build an evidence-based test set and answer key: missing oxygen conditions, apparently conflicting flame-spread results, and an excerpt whose limitation appears elsewhere. Evaluate retrieval, interpretation, abstention and citations.

**Follow-up:** What counts as a failed ambiguity test?

### 12 — Multiple Interpretations

**Question:** If the AI cannot justify a conclusion or ranking, how should it identify what is unclear and what information is needed?

**What a strong answer includes:** Pinpoint the ambiguous term or comparison; enumerate plausible interpretations and consequences; retrieve more context first; ask a focused question only if the user can resolve the gap; otherwise abstain.

**Follow-up:** When should the AI investigate itself rather than ask the user?

## Teamwork & Safety

### 13 — Scope Under Time Pressure

**Question:** If time runs short, what would you simplify without breaking “evidence before confidence”?

**What a strong answer includes:** Cut optional features such as animations, advanced filters or automated modeling; retain source links, correct context, uncertainty, basic ranking and a working end-to-end flow.

**Follow-up:** Which minimum safeguards must remain even in a basic demo?

### 14 — Spaceflight Resource Management

**Question:** How would you apply NASA Space Flight Resource Management (SFRM) principles to reduce human error and improve interpretation and hazard ranking?

**What a strong answer includes:** Use situational awareness, clear team roles, independent cross-checks, communication of uncertainty, challenge of assumptions, workload management and human escalation. Separate research triage from live emergency command; do not invent emergency procedures.

**Follow-up:** How can a correct measurement still produce an incorrect conclusion?

### 15 — Severity Versus Likelihood

**Question:** How should the AI distinguish potential hazard severity from the likelihood of the hazard occurring?

**What a strong answer includes:** Assess consequence, exposure, likelihood evidence and uncertainty separately. A laboratory demonstration does not establish event frequency in operational spacecraft. Never fabricate probabilities.

**Follow-up:** Can the AI assign a fire probability from a single burning experiment?

## Prediction & Application

### 16 — Prediction and Validation

**Question:** How would you use NASA combustion data to make scientifically defensible predictions and validate them?

**What a strong answer includes:** Extract conditions and units, assess comparability, select a justified physical or statistical model, distinguish interpolation from extrapolation, validate on independent data, show uncertainty and abstain when unsupported.

**Follow-up:** Is a plausible prediction at an untested oxygen concentration a verified fact?

### 17 — From Findings to Safety Ideas

**Question:** How should the dashboard connect combustion findings to fire prevention, detection or suppression possibilities?

**What a strong answer includes:** Separate experimentally supported findings, research-based possibilities and validated safety applications. Explain applicability, source evidence and qualification limits; do not prescribe untested spacecraft changes.

**Follow-up:** Can a single airflow experiment justify changing ventilation?

### 18 — Scientific Traceability and QA

**Question:** If the AI misinterprets an experiment, how would you detect, trace and correct the mistake without causing new errors?

**What a strong answer includes:** Preserve document/page/data provenance; identify root cause in extraction, context or ranking; independent scientific QA; minimal correction; regression tests; recheck dependent rankings; log changes and escalate unresolved concerns.

**Follow-up:** How do you verify the correction did not damage other valid conclusions?

## Delivery & Demonstration

### 19 — 48-Hour Delivery

**Question:** How would you prioritize work, assign responsibilities and deliver a working, scientifically trustworthy dashboard in 48 hours?

**What a strong answer includes:** Build a minimal vertical slice; define owners and interfaces; integrate early; keep a demoable build; communicate blockers; cut optional features rather than scientific safeguards; reserve QA and presentation time.

**Follow-up:** Would you include an unvalidated predictor to impress judges?

### 20 — Demonstrating Trust

**Question:** How would you prove to judges that the AI handles context, uncertainty and ranking rather than generating polished guesses?

**What a strong answer includes:** Demonstrate source-to-answer traceability, experimental conditions, relevance and evidence-quality separation, an ambiguity test, justified abstention, independent QA and a real working demo.

**Follow-up:** What is a successful answer when the data cannot justify a conclusion?

---

## Implementation instruction for Codex

Preserve these 20 points as the original scientific and engineering framework.

They are reasoning, testing, and implementation requirements—not mandatory conversational response headings.

Implement the relevant principles through the AI's system instructions, research tools, retrieval pipeline, evidence verification, ranking logic, Scientific QA, and regression tests.

The conversational AI must remain natural, intelligent, flexible, and context-aware.

Do not hardcode these 20 questions as the only questions the AI can answer.

Do not require the AI to recite the framework or display all 20 points to users.

Keep scientific safeguards independent of conversational presentation.

**Final objective:** A genuinely conversational NASA research assistant with rigorous evidence-grounded reasoning, transparent uncertainty, and scientifically defensible results.

**Important boundary:** Hypothetical scenarios in this framework are teaching examples, not reported NASA measurements. Operational spacecraft emergency response must follow approved crew and mission-control procedures.
