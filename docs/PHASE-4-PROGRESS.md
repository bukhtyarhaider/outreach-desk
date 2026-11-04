# Phase 4 — advanced enhancements, first increment

Date: November 4, 2026. Branch: `feat/product-quality-roadmap`.

Prior increments are committed as Phase 1 `b36efa9`, Phase 2 `abb6c40`, and Phase 3 `538e51a`. The broader backlog in those progress notes remains open. This Phase 4 increment is committed separately before continuing the open reliability backlog; no remote push or deployment occurred.

## Implemented

### A45 — local source-backed handoff export

Unibox Details now offers an intended owner, reviewed next step, acknowledgement and Download carrier handoff. This is a portable JSON package for manual sharing, not a shared ownership/acceptance integration. The export requires current conversation and workflow versions, rejects stale requests, refuses unsaved workflow edits in the UI, and clears acknowledgement when text or evidence changes. It does not change read state, drafts, workflow ownership, send permission or contact protection.

The server builds an explicit allowlist: source-reported carrier/account identity, operator-reviewed carrier-stated facts with matched-message references, missing/conflicting qualification fields, saved workflow and next step, holds and evidence versions. Candidate details are not silently promoted to confirmed facts. Raw mail, credentials, tracking tokens, drafts and unrelated state are excluded. Locally captured evidence is not proof of complete provider history. The recipient must review current permissions/evidence before further contact. Signed remains an operator workflow label, not an agreement.

Retained source opt-out/decline/bounce/uncertainty protection now also contributes to the conversation context. This prevents source cleanup from hiding that hold in a handoff or draft review. Prior-contact evidence alone remains distinct from a ban on answering a carrier.

### A43 — image telemetry cannot assert Inbox placement

Image requests no longer mutate seed placement. Startup withdraws legacy `open_signal` placements to Awaiting once, records the previous inference in a migration event and preserves open telemetry. Explicit manual and IMAP placements are retained. No live installation was migrated during development; tests use synthetic state.

## Verification

- Focused handoff/assistant/tracking suite: **36/36 passed**, including a Chrome download, text-edit acknowledgement reset, stale evidence/workflow rejection, absence of secret fixture fields, unchanged stored ownership/drafts/read state, durable source holds, image-only placement rejection and idempotent legacy correction.
- Full Node 22.23.4/Chrome suite: **246/246 JavaScript and 12/12 Python tests passed**, zero failures/skips (approximately 219 seconds for JavaScript).
- Strict TypeScript, formatting, UI build, module/server syntax and diff checks passed.
- No real email, live provider connection, production state/configuration mutation, system-runtime replacement, remote message, push or deployment.

## Dependencies and remaining work

A45 remains partial: receiving-system import/acceptance, shared ownership/claims, reassignment and authoritative onboarding evidence require the earlier team/backup/permission work and a chosen owning system. No webhook or external message is sent.

A44 provider adapters remain deferred until there is concrete provider demand and an accepted integration contract. A46 controlled experiments remain deferred until capture coverage, versioned attribution and evidence-linked reporting are trustworthy. Earlier Phase 2/3 work—including complete backup/restore, coverage-gated proactive follow-up, entity conflict handling, shared ownership/security, bounded processing and production acceptance—must still be completed before broad unattended deployment or further outbound automation. This first increment does not mark the roadmap complete.

No new distributed package/version is claimed; the current internal alpha label remains.
