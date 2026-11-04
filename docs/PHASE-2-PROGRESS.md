# Phase 2 — product completeness, first increment

Date: November 4, 2026. Working branch: `feat/product-quality-roadmap`.

Phase 1 is committed as `b36efa9` (`fix: complete phase 1 product integrity and reliability improvements`). This branch is intended to carry all improvement phases. This Phase 2 increment is committed independently of the Phase 1 baseline. The remaining Phase 2 backlog below is not represented as complete. Nothing has been pushed or deployed.

## Implemented in this increment

- **A09:** Dashboard now has an explicit fixed sending-template selector. It is independent of the lead preview choice. Selected and continuous launch controls first request a server-built plan, then show sender, eligible recipient counts per campaign, fixed/random template policy and pacing in an explicit confirmation. Cancel leaves outreach stopped.
- **A10, partial:** New `/api/launch-plan` and `/api/launch` routes require the intended campaign/profile and a matching context fingerprint before launching. The fingerprint covers the audience, campaign revision, profiles, templates, settings, local/shared protections and send history. Changes between review and confirmation return HTTP 409. Audience counts deduplicate addresses across campaigns; the runner retains the reviewed campaign IDs. Continuous mode can pick up future eligible leads in those campaigns, as explained in the review. Each send still rechecks eligibility and protection.
- **A10, manual preview path:** The current UI submits campaign ID and revision when preparing a lead. Stale campaign/revision requests fail instead of resolving the same row/email ID under a changed campaign.
- **A20:** Reply approval context now includes original-body digest, availability/truncation and recovery provenance. Recovering material source context invalidates the active approval and preserves its audit history.

Compatibility boundary: old local `/api/start` and `/api/batch` endpoints remain for existing callers and regression contracts. The current UI uses the reviewed launch routes. Legacy callers do not acquire the new launch-review guarantee merely by upgrading. General version checks for settings/profile/campaign/template writes remain pending; A10 is not claimed complete.

## Verification

- Full Node 22.23.4/Chrome suite: **239 JavaScript tests and 12 Python tests passed**, zero failures/skips.
- Focused launch and approval tests verify missing/stale confirmation, changed wording, stale campaign context, duplicate recipient counts, retained campaign scope, independent sending/preview choices, visible review/cancel, and approval invalidation with retained history. All fixture mail is synthetic; launch acceptance waits without a connected mailbox and no email is submitted.
- Strict TypeScript, formatting, production UI build, server syntax and diff checks passed.
- No live mailbox access, production-state changes, system-runtime replacement, push or deployment.

## Remaining Phase 2 work

Follow the audit dependencies rather than treating this increment as the whole phase:

1. Coverage/freshness-gated proactive follow-up and due/overdue work (A11/A23).
2. Entity-version conflict handling and consistent draft protection/recovery (remaining A10, A21/A22).
3. Full backup/restore with post-backup send reconciliation, readiness and component health (A14/A26/A32).
4. Automatic team outcome synchronization (A30).
5. Defined mailbox ownership/handoff and hardened network coordination (A15/A16).
6. Supported-provider acceptance, explicit OAuth lifecycle and hosted collector ownership (A17–A19).

Native Windows/Edge, live provider acceptance and other-PC rollout remain unverified. The package keeps its current internal alpha label; no new release archive has been distributed.
