import test from "node:test";
import assert from "node:assert/strict";
import { mentionedInvestigations } from "../src/lib/research/identities";
import { interpretConversation } from "../src/lib/ai/conversation";
import { runResearchTool } from "../src/lib/ai/natural-tools";
import {
  buildEvidenceReferences,
  resolveEvidenceReferences,
} from "../src/lib/research/evidence-references";
import { checkMaterialClaims } from "../src/lib/ai/natural-review";
import { checkConversationProvenance } from "../src/lib/qa/conversation-provenance";
import { unsupportedQuantities } from "../src/lib/qa/quantities";
import {
  scientificFramework,
  frameworkPolicy,
} from "../src/lib/ai/natural-policy";
import { findNasaResource } from "../src/lib/resources/catalog";
import type { ConversationInput } from "../src/types/conversation";
const input: ConversationInput = {
  message: "Why do flames behave differently in space?",
  environment: "All",
  context: { tab: "Overview", recordIds: [] },
  history: [],
};
const completed = (value: unknown) =>
  Response.json({
    status: "completed",
    output: [
      {
        type: "message",
        content: [{ type: "output_text", text: JSON.stringify(value) }],
      },
    ],
  });
test("the project policy preserves all twenty principles without prescribing response headings", () => {
  assert.equal(scientificFramework.length, 20);
  assert.match(frameworkPolicy, /not an official NASA evaluation rubric/);
  assert.match(frameworkPolicy, /independent data/);
  assert.match(frameworkPolicy, /likelihood/);
  assert.match(frameworkPolicy, /Spaceflight Resource Management/);
  assert.match(frameworkPolicy, /approved crew/);
});
test("canonical citations retain review observations and reject invented identities and numbers", () => {
  const source = findNasaResource("nasa-combustion-guide-pdf")!,
    references = buildEvidenceReferences({
      missionContext: "",
      records: [],
      resources: [source],
    }),
    ref = references.find((item) => item.id.endsWith(":flex-report"))!;
  const claims = [
    {
      evidenceId: ref.id,
      interpretation: "The same safety margin is not assured.",
    },
  ];
  assert.deepEqual(
    checkMaterialClaims(
      { reply: "The same safety margin is not assured. [1]", claims },
      references,
    ),
    [],
  );
  const resolved = resolveEvidenceReferences(claims, references, null);
  assert.equal(resolved.resourceStatements?.[0].claimType, "observation");
  assert.equal(resolved.statements.length, 0);
  assert.throws(
    () =>
      resolveEvidenceReferences(
        [{ evidenceId: "made-up", interpretation: "Invented" }],
        references,
        null,
      ),
    /UNKNOWN_EVIDENCE/,
  );
  assert.ok(
    checkMaterialClaims(
      { reply: "The result is 99999%. [1]", claims },
      references,
    ).length,
  );
  assert.ok(
    checkMaterialClaims({ reply: "Some finding [2]", claims }, references)
      .length,
  );
});
test("model-selected tools retrieve source context and a separate reviewer requests material corrections", async () => {
  const previous = {
    key: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL,
  };
  process.env.OPENAI_API_KEY = "test";
  process.env.OPENAI_MODEL = "test";
  let generation = 0,
    reviews = 0;
  const phases: string[] = [];
  try {
    const answer = await interpretConversation(
      input,
      {
        missionContext: "All",
        records: [],
        reportProgress: (phase) => phases.push(phase),
      },
      undefined,
      async (_url, options) => {
        const body = JSON.parse(options!.body as string);
        assert.equal(body.store, false);
        if (body.instructions.startsWith("You independently")) {
          reviews++;
          const reviewInput = JSON.parse(body.input[0].content);
          assert.ok(Array.isArray(reviewInput.toolTrace));
          assert.equal(reviewInput.numberedEvidence[0].citation, 1);
          return completed(
            reviews === 1
              ? {
                  approved: false,
                  issues: [
                    "Do not convert qualitative background into a safe operating limit.",
                  ],
                }
              : { approved: true, issues: [] },
          );
        }
        generation++;
        if (generation === 1)
          return Response.json({
            status: "completed",
            output: [
              {
                type: "function_call",
                name: "open_nasa_source",
                call_id: "call_1",
                arguments: JSON.stringify({ id: "nasa-challenge-2026" }),
              },
            ],
          });
        assert.ok(
          body.input.some(
            (item: { type?: string }) => item.type === "function_call_output",
          ),
        );
        return completed({
          reply:
            "In microgravity, hot gases do not rise as they do on Earth; the challenge describes a candle flame relying on diffusion for oxygen. [1]",
          claims: [
            {
              evidenceId: "official:nasa-challenge-2026:buoyancy",
              interpretation:
                "The challenge describes reduced buoyant transport and a diffusion-fed candle flame.",
            },
          ],
        });
      },
    );
    assert.equal(reviews, 2);
    assert.equal(
      answer.resourceStatements?.[0].sourceId,
      "nasa-challenge-2026",
    );
    assert.match(answer.reply!, /diffusion/);
    assert.equal(answer.audit?.toolTrace.length, 1);
    assert.ok(phases.includes("grounding"));
    const opened = runResearchTool("open_nasa_source", {
      id: "nasa-apollo-13",
    });
    assert.ok("references" in opened);
    assert.throws(
      () => runResearchTool("arbitrary_url", { id: "http://private" }),
      /UNKNOWN/,
    );
  } finally {
    for (const [name, value] of Object.entries({
      OPENAI_API_KEY: previous.key,
      OPENAI_MODEL: previous.model,
    })) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
test("an ungrounded draft never becomes a completed conversational answer", async () => {
  const previous = {
    key: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL,
  };
  process.env.OPENAI_API_KEY = "test";
  process.env.OPENAI_MODEL = "test";
  try {
    await assert.rejects(
      () =>
        interpretConversation(
          input,
          { missionContext: "All", records: [] },
          undefined,
          async (_url, options) =>
            JSON.parse(options!.body as string).instructions.startsWith(
              "You independently",
            )
              ? completed({
                  approved: false,
                  issues: ["No evidence for the claim."],
                })
              : completed({
                  reply: "An unsupported safety claim.",
                  claims: [],
                }),
        ),
      /GROUNDING_REVIEW_FAILED/,
    );
  } finally {
    for (const [name, value] of Object.entries({
      OPENAI_API_KEY: previous.key,
      OPENAI_MODEL: previous.model,
    })) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

test("value-unit checks reject plausible-looking unit substitution without pretending to convert", () => {
  assert.deepEqual(
    unsupportedQuantities("Pressure was 5 kPa.", "Pressure was 5 atm."),
    ["5:kPa"],
  );
  assert.deepEqual(
    unsupportedQuantities("Airflow was 5 cm/s.", "Airflow was 15 cm/s."),
    ["5:cm/s"],
  );
  assert.deepEqual(
    unsupportedQuantities("Pressure was 5 atm.", "Pressure was 5 atm."),
    [],
  );
});

test("a replacement conversational provider cannot bypass canonical-source checks with an audit label", () => {
  const source = findNasaResource("nasa-combustion-guide-pdf")!,
    excerpt = source.excerpts.find((item) => item.id === "flex-report")!;
  const issues = checkConversationProvenance({
    reply: "Unsafe claim",
    audit: {
      promptVersion: "fake",
      frameworkVersion: "fake",
      checks: [],
      toolTrace: [],
      scientificStatus: "claimed",
    },
    statements: [],
    clarification: null,
    resourceStatements: [
      {
        sourceId: source.id,
        excerptId: excerpt.id,
        quote: excerpt.text,
        interpretation: "A review claim.",
        claimType: "application",
      },
    ],
  });
  assert.equal(issues.length, 1);
});

test("ordinary same is not an experiment identity", () => {
  assert.deepEqual(mentionedInvestigations("the same explanation"), []);
  assert.ok(mentionedInvestigations("the SAME experiment").length);
});
test("research tool search prioritizes an explicitly named investigation", () => {
  const result = runResearchTool("search_nasa_research", {
    query:
      "CFI NASA microgravity combustion research spacecraft fire prediction source background",
  });
  assert.ok("investigations" in result);
  if ("investigations" in result)
    assert.equal(result.investigations?.[0].name, "CFI");
});
