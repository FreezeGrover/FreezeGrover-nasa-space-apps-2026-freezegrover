# Scientific QA

QA is logically separate from answer generation. `validateGrounding` rechecks provider-selected record identities and exact excerpts, rejects unsupported numeric text and prevents objectives from being labeled proven results. These constraints apply to any future provider as well as OpenAI.

`reviewScientificClaim` checks a draft against the chosen record: narrative numbers, explicit comparison baselines, original experimental conditions, gravity coverage, table headers and gaps. Its output changes with the claim and investigation. It cannot prove scientific correctness, reproduce an experiment or establish semantic entailment. No generated answer or metadata match receives a scientific Verified status.

A source-linked AI explanation can be sent to the QA tab with its source record. Users can edit the draft, inspect original evidence and save temporary session notes. Notes reset on leaving the tab/reload and never constitute approvals.

Independent AI-assisted scientific review, human sign-off, calibrated unit interpretation and matched quantitative experimental comparison remain pending. An exact quotation may still be irrelevant to an interpretation; quote presence is not entailment. Full CSVs/documents beyond the imported sample rows are not analyzed automatically.
