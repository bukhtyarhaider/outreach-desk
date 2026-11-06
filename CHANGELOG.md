# Outreach Desk internal development history

Current internal baseline: **0.1.0-alpha.1**. **No public releases have been made.**

Earlier stable/release-candidate descriptions were inaccurate: all entries below are internal testing checkpoints or dated development milestones. Original package labels are kept for traceability, not renumbered retroactively. See [versioning guide](docs/VERSIONING.md) for the alpha → beta → release-candidate → first-public-release workflow. Historical validation records retain their original labels.

## 2026-11-06 — Development fix — Import saving and campaign activation

- Fixed Windows `EPERM, fsync` when saving a reviewed revision by flushing newly created snapshot files through writable handles. Real storage failures still prevent publication.
- Added queue inclusion directly after workbook activation and beside paused campaigns in Campaigns, with a clear route to outreach controls. Saving, activation and queue inclusion do not start outreach.
- Explained disabled Start outreach controls, removed transient sign-in text from the runner, and recovered stale sign-in messages from older saved states.
- Added Windows-style file-permission and storage-failure regressions, plus a browser journey from new upload through final reviewed launch using a mocked mailbox.

## 2026-11-03 — 0.1.0-alpha.1 — internal alpha baseline — Internal alpha baseline — workspace and workflow refinement

- Established explicit internal-alpha numbering. Earlier package labels are retained as historical references; none of the recorded history represents a public release.
- Consolidated React/TypeScript UI, shared Bauhaus primitives, campaign navigation, dashboard, Unibox, tracking, settings, and guided import workflows.
- Refined templates, Mailbox tools and Do Not Contact; removed editable local release notes and improved catalog navigation.
- Retained sending, signatures, recipient protections, local state isolation and human-reviewed native-mailbox replies. Internal checks do not establish production or provider readiness.

Recorded source: Current source baseline; VALIDATION.md; docs/UI-DX.md.

## 2026-11-03 — Development milestone — Catalog cleanup during internal testing

- Removed local release-note creation and editing; retained existing note data without displaying or exporting it.
- Added compact installed-build identity, searchable expandable history, filter recovery, and a manual update guide.

Recorded source: Git c86fdc0; VALIDATION.md.

## 2026-11-01 — Development milestone — Internal UI and workflow refinements

- Aligned settings, sending pace, activity, templates and drawers with shared application primitives.
- Improved Unibox alignment, Mailbox tools setup and Do Not Contact protection workflows.

Recorded source: Git 80dd182 / 79353c8 / 08ce2a3 / 641ed56; VALIDATION.md.

## 2026-10-30 — Internal checkpoint (original label 2.2.0-rc.9) — Dismiss read dashboard messages

- Mark as read removes that incoming message from dashboard highlights while retaining its conversation and outstanding reply task.
- Mark as unread or a new carrier reply restores the alert. Filtering precedes pagination and preserves no-response follow-up work.
- Read state and dismissal persist through reload without changing provider flags or sending email.

Recorded source: VALIDATION.md; IMPORTS-AND-CONVERSATIONS.md; design-qa.md.

## 2026-10-30 — Internal checkpoint (original label 2.2.0-rc.8) — Direct read controls for carrier messages

- Dashboard carrier alerts and the latest incoming conversation message offer Mark as read / Mark as unread directly.
- Unread counts and highlights update together while reply tasks and unsaved drafts stay intact. Newly captured evidence remains unread and stale read actions are rejected.
- Saving/error feedback and desktop/mobile controls use the established design. Read tracking remains local to this PC; provider mailbox flags and sending behavior are unchanged.

Recorded source: VALIDATION.md; IMPORTS-AND-CONVERSATIONS.md; design-qa.md.

## 2026-10-30 — Internal checkpoint (original label 2.2.0-rc.7) — Conversation tracking and status recovery

- Dashboard attention covers the entire carrier backlog before pagination; same-second incoming replies remain visible as unanswered.
- Status edits retain their original version and per-carrier unsaved form through refresh/navigation. Concurrent edits are rejected without losing text, with an explicit reload action.
- Closed/Signed carrier labels clear reply tasks until new incoming evidence arrives. Read/unread buttons show the next action correctly.
- Recent native outgoing contact history postpones follow-up even without thread references; reserved mailbox IDs protect scan progress.
- Human approval, native mailbox Send, signatures, recipient protections and manual capture remain intact.

Recorded source: VALIDATION.md; IMPORTS-AND-CONVERSATIONS.md; design-qa.md.

## 2026-10-30 — Internal checkpoint (original label 2.2.0-rc.6) — Carrier inbox history and conversation workflow

- Carrier view groups confirmed tool-contacted addresses per mailbox and shows older Inbox/Sent chains, including unlinked contact context with explicit thread review.
- Active and In review queues, editable carrier stages, dated follow-up notes and synchronized history read markers support ongoing conversations without automatic sending.
- Existing delivery-monitor credentials can be reused by reference in authorized conversation capture setup; browser sign-in alone is not treated as IMAP capture configuration.
- Historical scans alternate folders, batch metadata and retain missing original Sent bodies, with safe per-UID fallback, resumable cursors and deduplication.
- New contact evidence invalidates earlier approvals across threads. Workflow status never clears opt-outs, uncertain-send holds or approval requirements.

Recorded source: IMPORTS-AND-CONVERSATIONS.md; VALIDATION.md; design-qa.md.

## 2026-10-30 — Internal checkpoint (original label 2.2.0-rc.5) — Conversations in the shared app design

- Carrier conversations uses the same shared titlebar, labeled sidebar, mailbox profile footer, developer details and responsive navigation as the other pages.
- Removed route-specific shell overrides; restored workbook/mailbox status, version information, normal notifications and preview banner styling.
- Aligned the heading, page spacing and conversation surface with existing app tokens while retaining the Mailroom queues, free editor, saved wording and exact approval flow.

Recorded source: IMPORTS-AND-CONVERSATIONS.md; VALIDATION.md; design-qa.md.

## 2026-10-30 — Internal checkpoint (original label 2.2.0-rc.4) — Mailroom conversation workspace

- Selected Mailroom layout brings the carrier list, latest message and free reply editor into a single responsive workspace.
- Needs reply, All and Waiting queues, direct search, compact intent suggestions and full thread evidence in Details keep the main writing flow focused.
- Saved lines remain optional: search, preview, insert deliberately, edit freely and manage retained wording versions.
- Review reply saves exact current text and opens account/recipient review. New evidence and edits invalidate approval; final Send remains manual in the existing mailbox.
- Unsaved drafts survive queue/search navigation; mobile uses list and thread screens with Back to inbox. Existing sender, imports and protection guards are retained.

Recorded source: IMPORTS-AND-CONVERSATIONS.md; VALIDATION.md; design-qa.md; feature branch feat/import-repairs-carrier-conversations.

## 2026-10-30 — Internal checkpoint (original label 2.2.0-rc.3) — Historical tool-conversation scan and optional saved replies

- Conversation capture is restricted to confirmed tool-started email threads; imported contacts alone no longer qualify. Older confirmed tracking sends are retained even when a newer history entry exists.
- Scan all previous replies drains historical pages across available folders, reconciles Sent identifiers, revisits discovered ancestry and resumes saved progress after interruptions. Partial/failure states stay explicit.
- Replied contacts, human-reply counts and first/latest response dates make earlier responders easy to find. Replies elsewhere and recent contact activity prevent stale no-response follow-ups.
- Write freely, search saved wording, preview before insertion, insert at the cursor or replace deliberately, then save/review/approve. Untouched starters use shorter questions; custom wording, earlier versions and exact draft approvals are retained.
- No automated response sending, production deployment or cross-PC inbox ownership is added. Final Send remains in the existing mailbox.

Recorded source: IMPORTS-AND-CONVERSATIONS.md; VALIDATION.md; feature branch feat/import-repairs-carrier-conversations.

## 2026-10-29 — Internal checkpoint (original label 2.2.0-rc.2) — Carrier reply desk, reviewed drafts and response tracking

- All local source conversations include unanswered-response and no-captured-reply work queues, rule-based intent, and dashboard highlights with read markers.
- Versioned reply templates create editable drafts. Exact recipient/text approval is required for copy; final Send remains a human action in the existing mailbox with its native thread and signature.
- Carrier phone, equipment, ZIP and other details retain cited email evidence; operator confirmation, conflicts and corrections remain reviewable.
- Read-only capture supports full history, archive folders, resumable pages and stop/restart. Changed senders/references and known imported carriers without a local send enter matching review.
- Approvals, operator-reported sends and matching Sent copies remain separate. New evidence/edits invalidate old approvals; opt-outs and uncertain sends block drafts. No automated conversation sending is added.

Recorded source: Feature branch feat/import-repairs-carrier-conversations; IMPORTS-AND-CONVERSATIONS.md; VALIDATION.md.

## 2026-10-29 — Internal checkpoint (original label 2.2.0-rc.1) — Reviewed imports and carrier conversations

- Import review is integrated into campaign upload, with guided column choices, strict outreach-Status mapping, source provenance and stable carrier/contact identity.
- Saved revisions activate separate campaign workbooks; campaigns remain paused, prior workbooks stay recoverable, and the last activation can be undone.
- Carrier conversations share the normal application shell with read-only mailbox settings, EML imports, exact thread matching, guarded manual reviews and links from leads/send history.
- Captured opt-outs protect normal sending and Do Not Contact immediately, with a durable coordinator retry queue and a final check before webmail Send.
- Team work/ownership experiments are excluded. This internal checkpoint was not a public release; live provider acceptance remains a designated-mailbox check.

Recorded source: Feature branch feat/import-repairs-carrier-conversations; IMPORTS-AND-CONVERSATIONS.md.

## 2026-10-29 — Internal checkpoint (original label 2.1.0) — Send insights and version catalog

- Send-history filters for seen status, mailbox, campaign, template, UTC send dates and manual reply review.
- Confirmed sent/seen counts, seen rates, average/median/fastest first-seen intervals with explicit sample counts.
- Filtered CSV/JSON and statistics exports, hourly open evidence, and saved manual reply status and notes.
- Version catalog with recorded releases, dated update milestones, upgrade instructions and editable local release notes.
- Package, title bar and distribution filename consistently report 2.1.0.

Recorded source: Internal package checkpoint; CHANGELOG.md.

## 2026-10-29 — Development milestone — Recover multi-PC Firebase opens

Original internal package label: 2.0.0; no separate public release.

- Paginated, resumable scans replace the blocked last-100 query.
- Token ownership recovers mismatched-PC and previously acknowledged events; local saves precede cloud acknowledgements.
- PC/Firebase Settings diagnostics, setup warnings, database selection and read-only audit command.

Recorded source: Git b8fb26c; VALIDATION.md.

## 2026-10-26 — Development milestone — Queue wait and quota recovery

Original internal package label: 2.0.0; no separate public release.

- Clear long scheduled waits and show the reason for required intervals.
- Confirmed hard reset starts fresh mailbox pacing counters while keeping history, suppression and uncertain-send protections.
- Shared coordinator pacing reset and desktop/mobile controls.

Recorded source: Git 3bafecd / eae8d1e; VALIDATION.md.

## 2026-10-21 — Development milestone — Cloud telemetry and launcher recovery

Original internal package label: 2.0.0; no separate public release.

- Realtime Database and Firestore open-event sync, credential discovery, manual/automatic sync controls.
- Single-instance launcher, stop/restart handling and modular UI build.

Recorded source: Git b3cdaff; VALIDATION.md.

## 2026-10-20 — Development milestone — Compose fixes and configurable template checks

Original internal package label: 2.0.0; no separate public release.

- Mailboxes without signatures can prepare messages while existing signature validation remains active.
- Promotional and length checks support advisory, blocking and off settings.
- Git merge 154a25c was named V1.1.0; its package.json still recorded 2.0.0. This label is retained as a historical note, not a separate public release.

Recorded source: Git 69a8473 / 8ed2071 / 154a25c; VALIDATION.md.

## 2026-10-19 — Development milestone — Persistent browser sessions

Original internal package label: 2.0.0; no separate public release.

- Saved browser profiles and attachment to an existing local Chrome/Edge debugging session.
- Manual sign-in/challenge recovery, account validation and session-expiry handling.

Recorded source: Git e502825 / 643f415; VALIDATION.md.

## 2026-10-14 — Development milestone — Delivery evidence and open tracking

Original internal package label: 2.0.0; no separate public release.

- IMAP bounce monitoring, opaque tracking pixels, seed inbox checks and DNS health reporting.
- Independent send, delivery, bounce and open evidence with searchable tracking records.

Recorded source: Git 73762ee / e19cf15; VALIDATION.md.

## 2026-10-10 — Internal checkpoint (original label 2.0.0) — Multi-mailbox outreach prototype

- Mailbox profiles, campaigns, editable templates and continuous outreach.
- Durable send reservations, workbook repair, shared recipient protection and saved history.
- Later internal improvements reused the same package label and are listed separately above.

Recorded source: Git a5d6e03 package.json; README.md.

## 2026-10-10 — Internal checkpoint (original label 1.0.0) — Initial outreach tool

- Initial local Playwright sending application with workbook integration and tests.

Recorded source: Git 74e03f3 package.json.

## Updating an internal test PC

1. Click Stop outreach, wait for the current operation, and close any prepared message. Then stop the app on this PC and back up its entire data folder and .env file.
2. Extract the new internal-build ZIP over the application files. Preserve that PC's data and .env; keep team-data if this PC hosts the shared coordinator.
3. Run Setup when dependencies changed, then Start and reload the browser. Verify the installed build in the title bar and this catalog.
4. Check Settings for the correct PC ID, public tracking URL, database selection and sync mode. Run Sync opens now and review diagnostics.
5. Update each PC separately. This catalog describes the installed internal build; it does not check an online update server or prove another PC was updated.

Package and verification instructions: [docs/VERSIONING.md](docs/VERSIONING.md). No customer data or schema versions are reset by the new application version label.
