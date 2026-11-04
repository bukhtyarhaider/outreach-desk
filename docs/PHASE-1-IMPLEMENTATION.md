# Phase 1 — integrity and reliability implementation

Date: November 4, 2026. Internal working changes based on PRODUCT-AUDIT-2026-11-03.md. This is not a deployed release or a claim of live provider/Windows acceptance.

## Implemented

- A01: Durable `sourceProtections` ledger, additive across source rows and retained import archives. Eligibility, final submission checks, shared seeding and the protection list use it. Deleting a campaign/row cannot implicitly clear source evidence. Explicit source-protection resolution remains outside this phase.
- A02: Logical campaign Trash retains the complete working file and a persisted campaign tombstone. Failed publication restores in-memory campaign pointers; files are never unlinked. Campaigns offers Restore; restored campaigns remain paused. No automatic purge is provided.
- A03: Manual submission applies the same interval/allowance gate as the runner. Quota-reset behavior remains explicit.
- A04: Manual opt-outs are saved locally with a durable coordinator outbox before attempting shared delivery. Removals wait for pending additions and require shared acknowledgment before clearing local state. Local-only removal also clears its pending outbox entry.
- A05: Common short/affirmative stop requests are recognized, including mixed sentences with negation elsewhere. Quote/negative-request safeguards remain. Rule-based classification still requires review of ambiguous wording.
- A06: Missing metadata/source cannot advance a delivery-monitor cursor unless a second UID search verifies disappearance.
- A07: Background polling is installed before optional startup requests and retries failed initial lead/history loads. Polling has an in-flight guard.
- A08: Unchanged profile/template/suppression lists keep their DOM and focus. Stable rendering is scoped to these delegated-action lists; approval/context regions retain their existing replacement behavior.
- A12/A13: Updated locked mailparser/nodemailer dependencies; the nested-comment parser regression now passes. Node 22/24/26 LTS and Python 3.11+ are the documented supported baseline. Verification uses temporary Node 22.23.4, without replacing the system Node installation.
- A14 (Phase 1 scope): Reporting export renamed to Export all send history. Launcher verifies the instance PID and requests cooperative HTTP shutdown. Unverified live lock owners are not killed; shutdown timeout retains the lock. Legacy installations without the instance endpoint require manually stopping the original app.
- Corrected environment-loader, workbook implementation, opt-out and campaign deletion documentation.

## Operator upgrade notes

Stop outreach and close the original application before replacing files; preserve this PC's `.env`, full `data` and any coordinator data. Back up the stopped workspace. Install a supported Node LTS runtime and rerun Setup for the updated lockfile. Existing data gains additive protection and retained-Trash fields. Do not roll back by deleting protection/history fields. The retained files must stay with the same data folder.

No installation, production-state mutation, live mailbox operation, email sending, commit, push or deployment was performed for verification. Full snapshot/restore UI, launch-policy redesign and shared ownership are Phase 2 work. Native Windows/Edge and authorized live-provider acceptance remain release gates.

## Verification

Final verification passed 237/237 JavaScript tests (Chrome enabled) and 12/12 Python tests on Node 22.23.4/Python 3.11.4, plus typecheck, formatting, UI build, syntax and diff checks. The detailed results are recorded in VALIDATION.md. New regressions cover reviewed-import order, protection after removal, paused restoration, failed disk publication, manual interval enforcement, offline manual opt-outs, startup history failure, stable keyboard focus, affirmative/negated stop requests, patched participant parsing, missing IMAP evidence and unverified-PID preservation.

The production npm audit has eight moderate affected entries remaining in Firebase/Google/uuid transitive chains, with zero high/critical entries. No forced major-version downgrade or untested override was applied. Their deployment-specific reachability requires separate triage.
