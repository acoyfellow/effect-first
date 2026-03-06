import {
  type LiveSummaryArtifact,
  parseLiveSummaryArtifact,
} from "./live/schema.js"

export const parseLiveArtifact = parseLiveSummaryArtifact

export const createClaimSummary = (live: LiveSummaryArtifact) => {
  const evidenceLevel =
    live.projectOutcome === "provisional-keep"
      ? "internally-reviewed"
      : live.projectOutcome === "kill"
        ? "live-falsified"
        : "harness-only"

  const provenToday =
    live.projectOutcome === "provisional-keep"
      ? [
          "The seeded benchmark harness is reproducible and auditable.",
          "The decisive live batch completed and satisfied the predeclared win rule.",
          "The result was reviewed under a project-only blinded process and supports continued investigation only.",
        ]
      : live.projectOutcome === "kill"
        ? [
            "The seeded benchmark harness is reproducible and auditable.",
            "The decisive live protocol reached a terminal archive state.",
            "The project should not continue as an efficacy claim.",
          ]
        : [
            "The seeded benchmark suite is deterministic and reproducible.",
            "The published benchmark artifacts are auditable against committed prompts, judges, and outputs.",
            "The live proof pipeline is implemented, but batch 001 has not yet reached a terminal decision state.",
          ]

  const notYetProven =
    live.projectOutcome === "provisional-keep"
      ? [
          "That effect-first is externally proven to improve model behavior.",
          "That project-only reviewers are sufficient for an external efficacy claim.",
          "That the result generalizes beyond the committed batch, model, and protocol.",
        ]
      : live.projectOutcome === "kill"
        ? [
            "That effect-first improves the evaluated protocol.",
            "That the website bootstrap adds enough lift to justify the project.",
            "That the project should remain active as an efficacy claim.",
          ]
        : [
            "That effect-first improves real model behavior outside the seeded artifact set.",
            "That the website bootstrap adds lift in live runs beyond direct source access alone.",
            "That the result generalizes across models, tasks, and reviewers.",
          ]

  return {
    status: live.claimStatus,
    evidenceLevel,
    publicClaim: live.publicClaim,
    provenToday,
    notYetProven,
    promotionGates: live.promotionGates,
    stopRule:
      "Do not claim external proof of efficacy. If batch 001 fails, misses the hard deadline, or becomes infeasible, archive the project.",
  } as const
}

export const createLiveEvaluationSummary = (live: LiveSummaryArtifact) => ({
  artifactFile: "bench/live/results.json",
  status: live.status,
  summary: live.summary,
  currentBatch: live.currentBatch,
  promotableBatch: live.promotableBatch,
  terminalState: live.terminalState,
  projectOutcome: live.projectOutcome,
  recommendedAction: live.recommendedAction,
  protocolAnchorCommit: live.protocolAnchorCommit,
  reviewerClass: live.reviewerClass,
  conclusionDeadline: live.conclusionDeadline,
  references: live.references,
  counts: live.counts,
}) as const

export const requiredTruthStatements = [
  {
    file: "README.md",
    snippet:
      "Current evidence only proves that the benchmark harness is reproducible and auditable. It does not yet prove that effect-first improves real model behavior.",
  },
  {
    file: "README.md",
    snippet:
      "Even if batch 001 passes under project-only reviewers, that is an internal keep signal, not external proof.",
  },
  {
    file: "kit/EVALS.md",
    snippet:
      "It does not yet prove that effect-first improves real model behavior.",
  },
  {
    file: "kit/EVALS.md",
    snippet:
      "A passing batch 001 under project-only reviewers is still not external proof.",
  },
  {
    file: "bench/METHODOLOGY.md",
    snippet:
      "The suite proves the scoring pipeline is reproducible, not that effect-first is already proven to improve live model behavior.",
  },
  {
    file: "bench/METHODOLOGY.md",
    snippet:
      "Project-only blinded review can justify an internal keep-or-kill decision, not an external efficacy claim.",
  },
  {
    file: "bench/IRON-CLAD-PLAN.md",
    snippet:
      "If harness-only evidence is not enough to justify the project, archive it.",
  },
] as const
