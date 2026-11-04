# A11 — proactive follow-up capture coverage

November 4, 2026. Branch: `feat/product-quality-roadmap`. Phase 4's first increment is committed as `a191abe`. This subsequent reliability increment is committed separately; it closes a specific earlier-phase safeguard rather than declaring all roadmap phases complete.

## Behavior

A no-response follow-up now requires a recent, successful capture pass for its own sending mailbox. The read-only worker creates a versioned coverage record only when all selected folders are exhausted, full history/all available folders are enabled, Sent is available, no folder failed, and that mailbox's tool-contact scope stayed unchanged throughout the pass. Freshness is measured from scan start, not completion: a long scan cannot refresh old Inbox observations merely by finishing recently. Coverage expires after 15 minutes.

The assistant checks coverage when preparing and reviewing follow-ups and when validating approvals for copy. Existing waiting periods, contact holds, duplicate/uncertain-send protection, conversation-context checks and maximum-follow-up rules remain in force. Existing approval context includes the coverage epoch. A healthy incremental renewal preserves that epoch; a failed scan, expired prior coverage, changed configuration, changed scope or historical scan produces a new epoch when coverage becomes healthy again. An old approval cannot become valid again merely because a failed or stale mailbox recovers. Saving capture settings changes the configuration generation. Credential values are never stored in the proof.

The UI explains missing/stale coverage and directs the operator to **Scan previous replies**. It shows successful coverage time and expiry. Manual Follow up reminders remain visible independently; dashboard eligible counts now include only contacts actually eligible to prepare a follow-up. Normal responses to existing matched human messages do not require this proactive-coverage gate.

## Upgrade and operational boundaries

No existing data is reset. Older monitor status without the new proof is insufficient; run a fresh scan. A long historical backfill can finish with already stale observations and need a subsequent fresh pass. Configuration or tool-contact changes can similarly require another scan. There is no manual override.

The proof describes configured read-only capture over available folders and local tool-contact matching. It does not guarantee deleted-message recovery, provider retention, perfect threading, human silence, or delivery. Live provider acceptance and Windows/Edge behavior remain unverified. Tests use synthetic accounts, temporary workspaces and mock IMAP; no actual email, live mailbox access, production-state changes, push or deployment occurred.

## Implementation

- `src/follow-up-coverage.mjs`: configuration/scope proof, freshness policy and approval epoch.
- `src/reply-capture.mjs`: proof creation/invalidation after actual worker passes.
- `src/carrier-workspace.mjs`: effective capture configuration and saved configuration generation.
- `src/conversation-assistant.mjs`: eligibility and approval-context enforcement.
- `src/carrier-inbox.mjs`: separate eligible-follow-up and manual-reminder counts.
- `src/ui/features/conversations/assistant.tsx`, shared DTOs and generated `public/app.js`: actionable coverage feedback.
- `tests/follow-up-coverage.test.mjs`: freshness, configuration/scope changes, healthy renewal, failure/recovery, slow scans, contacts added during scans, and normal-response boundaries. Includes the actual worker with mock IMAP.
- `tests/follow-up-coverage-ui.test.mjs`: API rejection, reminder/count separation and Chrome disabled-action feedback. Existing assistant/inbox fixtures now explicitly establish synthetic coverage for positive follow-up scenarios.

## Validation and remaining roadmap

Final focused domain and Chrome suite: **64/64 passed**. Full-suite results are recorded in `VALIDATION.md`. Strict TypeScript, frontend formatting, production UI build, module syntax and diff checks passed.

Continue with entity-version conflict handling and draft recovery, full backup/restore with post-backup send reconciliation, component health/readiness, automatic team outcome synchronization, shared ownership/acceptance, hardened network coordination and supported-provider acceptance. The local handoff export and this coverage proof do not replace those capabilities.
