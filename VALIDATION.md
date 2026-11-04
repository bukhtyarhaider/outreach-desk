# Phase 1 integrity and reliability — November 4, 2026

Internal working changes on `feat/bauhaus-saas-ui-revamp`, based on audit commit `3aca754f4f3e9dcd8ad6d7c9247e961da50af46a`; application package remains `0.1.0-alpha.1`. This validation does not identify a newly distributed package.

- Final `FC_BROWSER_TESTS=1 node scripts/test.mjs` under a temporary **Node 22.23.4** runtime: **237/237 JavaScript tests and 12/12 Python tests passed**, zero failures/skips. Includes Chrome against synthetic fixtures. JavaScript duration approximately 174 seconds.
- New regression coverage verifies affirmative and mixed-sentence opt-outs, negation, patched nested-comment address parsing, IMAP missing-fetch cursor retention, reviewed-import order before source-campaign deletion, durable cross-campaign protection, retained workbooks, paused restoration, write-failure behavior, manual minimum-interval enforcement, local-only outbox removal, coordinator-outage protection, startup reporting-failure recovery, stable table focus and preservation of an unverified live PID.
- `npm run check:ui` passed strict TypeScript, formatting and production bundle generation. Changed server/parser/launcher syntax checks, package/lockfile metadata consistency and `git diff --check` passed.
- Locked mailparser is **3.14.1**, with its patched nodemailer chain. Fresh production npm audit reports **8 moderate affected package entries**, **0 high/critical**, in Firebase/Google/uuid chains. These are retained for compatibility/reachability triage; no forced downgrade or untested override was applied.
- Node **22/24/26 LTS**, Python **3.11+** are now the declared baseline; only Node 22.23.4 and Python 3.11.4 were exercised in this validation. The temporary runtime did not replace the machine's default Node installation.
- Campaign deletion is logical retained Trash, with a Restore action that keeps campaigns paused. Working files are retained in the data folder; there is no automatic purge. Source protection is additive and cannot be removed by campaign/row cleanup or generic unsuppression.
- Launcher uses instance-PID verification and cooperative HTTP shutdown, preserving unknown live lock owners and avoiding forced termination. An older running build lacking the instance endpoint must be stopped manually before upgrade.

No real emails, live mailbox connections, production configuration/state mutations, system-runtime replacement, commit, push, remote deployment or existing release-ZIP replacement was performed. Native Windows/Edge, live provider acceptance and other-PC installation remain unverified for these changes. Full snapshot/restore and broader team/launch-policy work remain in Phase 2. See `docs/PHASE-1-IMPLEMENTATION.md` for scope and upgrade notes.

---

# UI rendering and visual follow-up — 2026-10-30

## Mailbox & Settings layout follow-up — 2026-10-30

- Fixed intrinsic table sizing that compressed the pacing column, aligned settings in paired rows, and added narrow-screen wrapping for form actions and system information.
- Visually inspected desktop, tablet, mobile and expanded CDP states; details and local screenshot names are in `docs/UI-VISUAL-QA.md`.
- Expanded responsive settings assertions across ten widths (320–1440px), with long profile names/emails and expanded CDP fields.
- Final `FC_BROWSER_TESTS=1 npm test`: **215 Node tests + 12 Python tests passed**, zero failures/skips. Strict TypeScript, formatting, production build and diff checks passed.

- Fixed migration regressions in the sidebar shell and event-message rendering, plus responsive action rows, event cards, tracking/seed panels, native checkbox alignment, tracking section anchors and drawer footer controls.
- Manually inspected all 12 main screens at desktop/mobile sizes, tablet activity, conversation details/inbox navigation and the lead drawer. Used synthetic data for interaction tests; confirmed the reported fixes on the running app without modifying customer data or sending mail.
- Final `FC_BROWSER_TESTS=1 npm test`: **215 Node tests + 12 Python tests passed; zero failures/skips**. This includes event content, simultaneous records, filters, pause/clear behavior, all-route shell geometry/internal overflow at 1440/1024/768/390px, direct tracking section URLs and drawer action bounds.
- `npm run check:ui`, generated production assets and diff checks passed. See `docs/UI-VISUAL-QA.md` for the step-by-step visual review, repairs, local screenshots and limits.

---

# React / TypeScript UI migration — 2026-10-30

Branch: `feat/react-typescript-ui`. The package remains `2.2.0-rc.9`; this branch is not a new deployed release.

- `npm run check:ui`: strict TypeScript, unused-binding/override checks, formatting and all three production bundles passed.
- `FC_BROWSER_TESTS=1 npm test`: 213 Node tests passed with zero skips/failures, followed by all 12 Python tests. Includes desktop/mobile Chrome coverage, all 539 original main-app control IDs, all 12 routes, retained form drafts, native primitives, resource teardown/remount, imports/activation/undo, conversations, stale approvals, read markers, tracking, Firebase settings, reporting and wait reset.
- The exact-draft review snapshot was verified by all 12 carrier-release integration/browser tests after fixing a background-refresh timing case. Backend approval validation remains unchanged.
- Desktop/mobile screenshots from the synthetic browser suite were inspected. Both standalone workspaces retain their shared styles and original body class.
- A validation ZIP was built separately under `/tmp`; TypeScript configuration, architecture documentation, React sources and generated assets are included. Existing private-data exclusion checks pass. No release ZIP or installed PC was replaced.
- Dependency audit: 10 moderate advisories in existing backend dependency chains (`firebase-admin`/Google dependencies and `mailparser`/`nodemailer`/`uuid`), also present in the original lockfile. No additional frontend advisories; no high/critical findings. Backend dependency remediation is outside this UI migration.
- No backend business module, HTTP endpoint, local state file or credential file changed. No real outreach, live-mailbox acceptance test, Windows/Edge installation or multi-PC deployment was performed. Synthetic coverage does not prove every real provider corner case.

Architecture, ownership boundaries and developer commands are documented in `docs/UI-ARCHITECTURE.md`.

---

# Outreach Desk 2 validation

## Dismiss read dashboard messages — 2.2.0-rc.9 — October 30, 2026

The reported read message remained highlighted because the dashboard's attention filter also included read carriers needing a reply. The incoming-message filter now requires unread evidence, before pagination. No-response follow-up tasks retain their existing behavior. Conversations and outstanding reply counts remain intact, and marking unread or receiving a new reply restores the message alert. The dashboard confirmation explicitly says the card was removed.

A new service regression first failed against rc.8 and now passes. Final `FC_BROWSER_TESTS=1 FC_UI_SCREENSHOT_DIR=outputs/carrier-rc9-verified npm test`: **208/208 JavaScript tests and 12/12 Python tests passed**, no failures/skips. Integrated browser/API coverage remains **12/12** and now verifies disappearance immediately and after reload, retained reply tasks and draft text, marking unread, new evidence and stale-version rejection. The carrier inbox suite passes **16/16**. Syntax checks passed for **94 JavaScript and 2 Python files**, and `git diff --check` passed.

Read-only verification reproduced the real workspace's already-read carrier still being highlighted on rc.8. After the idle local app was refreshed to rc.9, the same carrier was absent from dashboard highlights while its conversation and Needs reply remained available. No real read state was changed for verification. Native browser warning/error logs were empty. Send count remained 774, with outreach stopped, no prepared message and automatic capture off. No provider flags or mail were changed, and no email was sent. Private screenshots stay in ignored outputs outside distribution.

The candidate remains on the existing feature branch, with prior packages retained and no remote push, main merge or team rollout. Packaging verifies source equality and an empty extracted preview workspace with capture off and sending blocked; existing installed dependencies are reused. Runtime data, credentials and customer evidence are excluded. Native Windows and other-PC installation remain outside this local check.

## Direct dashboard/message read controls — 2.2.0-rc.8 — October 30, 2026

Added Mark as read / Mark as unread beside Review on dashboard carrier alerts and below the latest incoming message's sender in Conversations. Both use the existing carrier/message/version-bound read endpoint. Marking read refreshes unread counters/highlights and the selected conversation while preserving draft text and reply tasks; new incoming evidence stays unread. Dashboard requests retain the displayed evidence version, serialize against conversation work and display saving/error feedback. A successful save with a failed dashboard refresh reports that the view still needs refreshing. Earlier messages cannot silently clear a newer incoming message through these quick controls.

Final `FC_BROWSER_TESTS=1 FC_UI_SCREENSHOT_DIR=outputs/carrier-rc8-final npm test`: **207/207 JavaScript tests and 12/12 Python tests passed**, with no failures/skips. Integrated API/browser coverage is **12/12**, including the new two-way read/unread actions, persisted state after reload, retained unsaved reply text, preserved Needs reply membership, stale-version rejection after a new reply, no page errors and desktop/mobile bounds. Existing approval, capture, protection and sender tests remain passing. Syntax checks passed for **94 JavaScript and 2 Python files**, and `git diff --check` passed.

Read-state mutations in verification used isolated synthetic fixtures. The real workspace was checked for button placement without changing the user's unread state, approving a draft, sending mail or changing provider flags. The local app was idle before refresh; existing send history and mailbox configuration were retained. Read markers remain local to this PC. rc.8 stays on the existing feature branch, with rc.7 retained as the previous checkpoint/package; no remote push, main merge or team rollout was performed.

The explicit-allowlist ZIP is checked against repository source bytes and starts in an empty extracted workspace with capture off and preview sending blocked. Existing installed dependencies are reused. Customer data, credentials, raw mail, screenshots and browser profiles are excluded. Native Windows and other-PC installation remain outside this local check.

## Conversation reliability audit — 2.2.0-rc.7 — October 30, 2026

The audit began with a clean feature checkout and a passing baseline of **200/200 JavaScript tests and 12/12 Python tests**. Four new synthetic cases reproduced gaps in same-second incoming/outgoing order, dashboard attention beyond the first page, native outgoing contact activity without thread references, and Closed/Signed reply tasks. These failures were fixed. A fifth case verifies unlinked native outgoing history counts toward the configured follow-up maximum. Browser regression coverage now checks the fixes for stale status-edit overwrite after a detail refresh and the read/unread action label. Reserved mailbox IDs now protect internal scan records.

Final `FC_BROWSER_TESTS=1 FC_UI_SCREENSHOT_DIR=outputs/carrier-rc7-final npm test`: **206/206 JavaScript tests and 12/12 Python tests passed**, no failures/skips. The focused browser/API suite passed **11/11**, with status version conflicts, retained edit text, explicit saved-status reload and existing shared-shell/mobile/approval coverage. Focused carrier/assistant/history tests passed **45/45**. Syntax checks passed for **94 JavaScript and 2 Python files**; `git diff --check` passed. An intermediate full run found an old rc.6 version expectation in the catalog UI test; version and catalog-count assertions now match rc.7. No sender behavior was changed to satisfy that assertion.

A fresh authorized read-only provider check queried the designated carrier in Inbox, Sent and Archive, and compared Message-IDs with the app's stored carrier history and original tool send. All **seven provider messages** were represented: **three incoming and four outgoing**, with **zero missing messages and zero duplicate captured mailbox records**. The earlier full available-folder scan remains Complete. This targeted recheck is not a claim that every mailbox/folder was rescanned in this audit. Password values were not exposed, `.env` was not edited, provider flags were not changed, and no mail was moved/deleted/sent. Live artifacts remain in private temporary storage or ignored outputs, outside the package.

The idle local app was gracefully refreshed against its existing workspace. Capture remains manual, outreach remains stopped, and the original 774 confirmed sends remain retained. rc.7 stays on `feat/import-repairs-carrier-conversations`; rc.6 is retained as the previous local checkpoint/package. No remote push, main merge, other-PC installation or production release is implied. Deleted/unavailable provider messages, other accounts and native Windows behavior remain outside this check. The final package is checked using an empty extracted workspace, source-byte equality, version consistency and preview transport blocks; installed dependencies are reused.

## Carrier contact history and workflow — 2.2.0-rc.6 — October 30, 2026

`FC_BROWSER_TESTS=1 FC_UI_SCREENSHOT_DIR=outputs/carrier-rc6-regression npm test` passed **200/200 JavaScript tests and 12/12 Python tests**, with no failures/skips. JavaScript syntax checks passed for **94 files**, Python compilation for **2 files**, and `git diff --check` passed. The integrated browser/API suite passed **10/10** cases. New cases cover older unrelated-subject chains for exact tool-contacted participants, native Sent replies, imported-only exclusion, mailbox isolation, status persistence and concurrent-update rejection, read-marker races, protected contacts, closed carriers resurfacing, cross-thread stale approvals, independent reply subjects, outgoing-only history, folder fairness, bounded metadata fallback and missing original-body recovery. Existing sender, signature, approval, coordinator, import and uncertainty checks remain passing.

With explicit user authorization, read-only IMAP verification used one configured mailbox and one identified carrier. Capture had not been enabled for that profile; the previously displayed sample preview used an isolated workspace. The normal local app was configured with existing environment-variable references, full available history and all available folders; automatic capture remains off. The historical scan finished **Complete** after checking Sent, Inbox, Archive, Spam and Trash without folder errors. The identified carrier has **three incoming replies and four sent emails**, including the original confirmed tool send. The inbox displays six captured mailbox messages plus that original source send, without duplicate source copies. A second carrier's captured native mailbox reply correctly clears its unanswered-response condition. These are local evidence counts, not delivery or signing claims. Cumulative scan checks include resumed/revisited pages and are not unique message counts.

The normal app now runs rc.6 against its existing local workspace. Authorized changes include capture configuration, cached mail/cursors and their normal persistence; `.env` was read but not edited. The original local send count remained 774, with outreach stopped and no prepared message. No message was sent, no provider read flags were changed, and no message was moved or deleted by this verification. Real-mail artifacts and screenshots remain under ignored development outputs/private temporary storage and are excluded from the package. Do not copy this PC's configuration or mail data to other PCs.

Native in-app browser verification confirmed the actual carrier's history, Active and Needs reply counts, earlier messages, and carrier status dialog without saving workflow changes or approving a draft. Templates and Conversations were compared at the same **1048 × 910** native screenshot size; the shared header, sidebar and footer remain consistent. Automated desktop/mobile browser coverage also passes. See `design-qa.md` for current evidence. The candidate remains on `feat/import-repairs-carrier-conversations`; no remote push, main merge, team-PC installation or production release was performed. Provider-deleted/unavailable mail, other mailbox permissions/retention and native Windows operation remain outside this acceptance check.

The rc.6 package uses the explicit source allowlist and includes sources, tests and documentation. Clean-extraction smoke verification checks archive/source equality, consistent versions, an empty workspace, the built-in wording library, capture off and blocked preview sending. It uses existing installed dependencies, so a fresh dependency download or Windows installer run is not implied.

## Shared Conversations shell — 2.2.0-rc.5 — October 30, 2026

`FC_BROWSER_TESTS=1 FC_UI_SCREENSHOT_DIR=outputs/carrier-rc5-regression npm test` passed **186/186 JavaScript tests and 12/12 Python tests**, with no failures/skips. The existing Mailroom browser case now compares titlebar/sidebar/footer styles and dimensions with Templates on desktop and mobile, and checks unsaved text through cross-page navigation. All existing reply approval, stale evidence, import, capture and sender safeguards passed.

Removed route-specific header, navigation, footer, banner and notification styling. Conversations uses the actual common markup and responsive rules, plus the shared heading classes and page spacing. Only its content workspace has dedicated layout rules. Native in-app browser comparisons at **1089 × 910** and **390 × 844** confirmed matching shell geometry and no Conversations horizontal overflow. `design-qa.md` records the current shared-shell target and passed comparisons; the older Mailroom reference remains as history.

The candidate stays on `feat/import-repairs-carrier-conversations`. The sample preview uses isolated synthetic state, with sending and live capture disabled. No production-state or mailbox-setting migration, remote push, merge or deployment was performed. rc.4 remains available as the prior local checkpoint/package.

## Mailroom conversation workspace — 2.2.0-rc.4 — October 30, 2026

On `feat/import-repairs-carrier-conversations`, the final `FC_BROWSER_TESTS=1 FC_UI_SCREENSHOT_DIR=outputs/carrier-rc4-regression npm test` passed **186/186 JavaScript tests and 12/12 Python tests**, no failures/skips. JavaScript syntax checks passed for **92 files**, Python compilation for **2 files**, and `git diff --check` passed. An earlier regression run exposed an outdated release-count assertion (six entries); it now expects the seventh recorded package entry. No production code was changed to satisfy that count.

The focused integrated API/browser suite passed **9/9**. Added coverage verifies unsaved reply text through queues/search, exact Review saving, rejection of new carrier evidence inside the approval dialog, retained drafts, cleared acknowledgement on fresh review, Escape and mobile Back navigation. Existing checks cover reviewed import activation/recovery, opt-outs, source-backed detail confirmation, optional saved wording, exact approval/copy/cancellation, dashboard tracking and desktop/mobile bounds. Search covers header display names and text beyond the row excerpt; historical ordering uses effective message time rather than backfill capture order. Header names never become confirmed carrier details. The assistant suite passed **15/15**.

Manual native in-app browser verification used an isolated sample preview on port 4327, including desktop at **1487 × 1058** and mobile at **390 × 844**, DPR 1. Full-view and focused source/implementation comparisons were inspected together. The visual QA loop corrected queue button overrides, displaced review controls and narrow mobile sender wrapping; `design-qa.md` reports **passed**. Optional wording preview left the original free draft unchanged. Review displayed exact text, account and recipient and remained disabled without explicit acknowledgement/note. Browser warning/error logs were empty. Preview sending and live provider capture stayed disabled.

Package creation uses the explicit source allowlist, including the QA report but excluding screenshots, runtime state, real mail and secrets. A fresh extraction is checked against repository sources, version consistency, empty-workspace startup, built-in library, disabled capture and blocked preview sending. Native Windows, live provider history/retention and other-PC rollout remain unverified. Production `data/state.json` (October 29, 16:33:02) and `.env` (October 21, 00:33:44) remained unchanged. No remote push, main merge, deployment or real message sending was performed; Team work remains on its deferred experiment branch.

## Tool-started historical conversations and saved wording — 2.2.0-rc.3 — October 30, 2026

On `feat/import-repairs-carrier-conversations`, `FC_BROWSER_TESTS=1 FC_UI_SCREENSHOT_DIR=outputs/carrier-rc3-regression npm test` passed **184/184 JavaScript tests and 12/12 Python tests**, no failures/skips. The focused historical suite passed **13/13** checks; the integrated browser/API suite passed **8/8**. Sending, signatures, pacing, reservations, uncertainty, workbook recovery, coordinator and Firebase regression checks passed with synthetic fixtures.

New evidence covers full manual backfill beyond automatic page limits; old responses and duplicate archived copies; imported-only exclusions; deep Sent reconciliation; changed-address review; child-before-parent and cross-folder references; newer source anchors reopening old cursor ranges; older tracking sends; stop/resume; verified UID disappearance; failed-fetch cursor retention; mid-scan UIDVALIDITY/high-water reset; Drafts misconfiguration; stable incremental progress; reply elsewhere/recent-contact follow-up guards; preview without draft creation; one missing question; stale saved wording; and migration preserving custom/archived wording and approved bodies. Browser checks cover search, preview, intentional insertion, free editing, approval/copy/cancellation, dashboard routing and desktop/mobile bounds.

The UI and APIs report 2.2.0-rc.3. Packaging uses an explicit source allowlist; clean-extraction smoke checks run with a new empty synthetic data directory and already-installed dependencies. No installer download, native Windows acceptance, live provider authorization/retention, real carrier email or other-PC installation is claimed. Real `data/state.json` and `.env` are not used for testing. Stored earlier inbound-only evidence/protection remains retained even when excluded from the tool-send-scoped inbox.

Known limits: provider-retained folders/source evidence bound historical coverage; ambiguous bodies/headers need mailbox review; long/failed work remains visibly incomplete and resumable; counts are local contact/message evidence rather than signings. Final sending stays in the original mailbox and requires the human’s action. The separate Team work/ownership experiment remains excluded. Option 1’s full Mailroom layout is the next UI checkpoint.

## Carrier reply desk and complete capture — 2.2.0-rc.2 — October 29, 2026

Branch: `feat/import-repairs-carrier-conversations`. This candidate extends the reviewed import/conversation release without the deferred Team work experiment. No production deployment, main merge, remote push or other-PC installation was performed.

`FC_BROWSER_TESTS=1 FC_UI_SCREENSHOT_DIR=outputs/carrier-rc2-final npm test`: **170/170 JavaScript tests and 12/12 Python tests passed**, no failures or skips. The initial run found old catalog version/count expectations, which were updated for the new release entry. JavaScript syntax checks passed for **89 files**, Python compilation for **2 files**, and whitespace checks passed. Final assistant unit checks passed **14/14**, including a later IMAP Sent observation deduplicated against an EML copy. A separately added synthetic-coordinator test checks that draft approval/copy refresh shared protections and refuse a newly captured opt-out or unavailable coordinator. The final integrated API/browser suite passed **8/8** checks. Logs and desktop/mobile screenshots are under `outputs/carrier-rc2-*` in the development checkout (not shipped).

Coverage includes both no-response and unanswered-response queues; manual approval/copy without any reply-send endpoint; exact draft text/account/recipient/context binding; source/message changes and edited drafts invalidating approval; retained earlier draft/approval versions; cancellation; idempotent draft requests; template version conflicts and invalid/missing placeholders; opt-outs, uncertain local/shared sends and pending/changed-address matches; carrier-stated phone/equipment/ZIP and other details with source quotes, reviewed corrections and renewed conflicts; read/unread races; dashboard routing; known imported carriers starting reviewed inbound-only conversations; approval/report/Sent-copy evidence separation; new replies reopening attention; full-history bounded pages, references-only relevance, archives, Drafts exclusion, partial folder failures, stop/resume and cursor durability.

Chrome verification covers the existing import activation/recovery flow and the integrated reply desk at 1440px and 390px, with no page errors or external requests in the fixtures. The in-app browser was also used to review a known-carrier inbound message, create a reviewed conversation and generate an unapproved response asking for actual carrier-stated phone/equipment/ZIP confirmation. The screenshot `outputs/carrier-rc2-reply-preview.jpg` shows the sample reply desk. Preview uses isolated synthetic data with `FC_RELEASE_PREVIEW=1`; sending and live mailbox capture are blocked by the server. Actual `data/state.json` and `.env` were not changed.

Package/lockfile/catalog/UI report 2.2.0-rc.2. The versioned package and SHA-256 file are generated under `dist/`. The clean extraction smoke check verifies package-source consistency, empty-workspace startup, integrated views and blocked preview sending. Sources/tests/docs are included; runtime data, secrets, browser sessions and Team work files are excluded. Smoke uses the existing dependency runtime, so an installer download or Windows installation is not claimed.

Intent and detail extraction are transparent local rules with explicit human review, not a validated AI sales classifier or independent phone/authority verification. Final Send remains in the existing mailbox; approval alone is never submission or delivery. Mailbox coverage depends on configured identities, provider retention/folders and source references. Live provider authorization/headers, native Windows behavior, other-PC installation and cross-PC inbox/ownership remain unverified or excluded. No real carrier email was sent or fetched during these checks. See IMPORTS-AND-CONVERSATIONS.md for operation and coverage limits.

## Reviewed imports and carrier conversations — 2.2.0-rc.1 — October 29, 2026

Feature branch: `feat/import-repairs-carrier-conversations`, based on experiment 03 (`b4a0389`). Team work is excluded and retained on `feat/sales-experiments` (`5628fc0`). The release candidate is integrated into the normal app; no production deployment, main merge or team-PC installation has been performed.

`FC_BROWSER_TESTS=1 FC_UI_SCREENSHOT_DIR=outputs/release-ui npm test`: **150/150 JavaScript tests and 12/12 Python tests passed**, with no failures or skips. Final focused API/browser verification passed **11/11** checks after the protection display wording change. UI build, JavaScript syntax and `git diff --check` passed. A final inbox/layout verification passed **10/10** focused production API/unit/browser checks after exposing coordinator-pending status outside setup and collapsing capture tools for populated inboxes. A final **20/20** guard/store/parser/capture check passed after removing dormant override handling and retaining first opt-out evidence. JavaScript syntax checks passed for **85** files; Python compilation and whitespace checks passed.

New validation covers paused browser uploads; guided review and strict outreach-Status columns; immutable save, source hashes and activation tokens; real campaign activation and exact prior-workbook undo; same-carrier contact IDs and source provenance; stale/corrupt revision rejection; failed state publication; serialized telemetry/campaign writes retaining concurrent evidence; normal suppression and immediate pre-click opt-out protection; durable coordinator retry/acknowledgement; held opt-outs after classification edits, activation, undo and restart; reply evidence storage failure/recovery; stale review conflicts; nonsecret capture settings, explicit authorization, provider/TLS rules and isolated experiment flags; CSRF/source-file boundaries; private-token redaction; sample-preview send/connection blocks; original source/history protection and restart persistence.

Chrome checks exercise the normal sidebar flow, guided mapping, activation, lead provenance, navigation into captured replies, EML import, inert script-like text, retained review/settings drafts, normal history/catalog screens, and desktop/mobile bounds. Desktop (1440px) and mobile (390px) screenshots were visually inspected. The actual in-app preview uses a generated sample data folder with `FC_RELEASE_PREVIEW=1`; sending and live mailbox capture are blocked. Production data/configuration is not loaded into this preview.

The versioned ZIP includes application sources, tests, normal launch/setup scripts and IMPORTS-AND-CONVERSATIONS.md. Package/lockfile/catalog/UI consistently report 2.2.0-rc.1. Archive verification checks source consistency and absence of customer data, .env secrets, browser profiles, credentials, experiment runtime data and Team work files. A clean extraction smoke check uses a new temporary data folder and the already-installed dependency runtime; no installer download or native Windows run is claimed.

All verification used synthetic local data and simulated mailbox/browser sending fixtures. No real email was sent/fetched. Live provider authorization, folder retention/reference headers, native Windows behavior and other-PC rollout remain designated acceptance checks before production approval. Captured opt-out override, cross-PC inbox sync, automatic retention, reply composition and ownership workflows are not part of this release. See IMPORTS-AND-CONVERSATIONS.md for coverage limits and backup/rollback requirements.

## Send insights and version catalog — 2.1.0 — October 29, 2026

Version 2.1.0 adds full-filter send-history metrics, mailbox/campaign/template/date/seen/reply-review filters, timing sorts, filtered CSV/JSON and statistics exports, detailed first/last/hourly open evidence, and durable manual reply reviews/notes. Timing averages/median/fastest values use valid confirmed-send-to-first-signal intervals and expose sample/exclusion counts. Send-date filters follow UTC confirmation time (attempt time when unconfirmed). No-signal and tracking-disabled records remain distinct. Reply reasons are not inferred.

The Version Catalog contains three verified package versions (1.0.0, 2.0.0, 2.1.0), six historical milestones with Git/validation evidence, safe upgrade steps, and editable/exportable per-PC release notes saved in the original state file. The historical V1.1.0 Git label is explained because its package still recorded 2.0.0. The title bar/server, package/lockfile and versioned ZIP now agree. State-schema version 2 stays unchanged.

`FC_BROWSER_TESTS=1 FC_UI_SCREENSHOT_DIR=outputs/v2.1.0 npm test`: **115 passed** (108 Node, 7 Python), no failures or skips. After a final UTC midnight-boundary correction, all **6 reporting/catalog unit tests and 2 focused API/browser tests passed** again. New checks cover arithmetic and denominators, invalid/missing timing, distinct tracking states, combined filters, all-pages exports, spreadsheet formula escaping, metadata redaction, manual reviews retaining send protections, restart persistence, local-note edits, and desktop/mobile navigation/layout. Existing sender/signature/uncertainty/pacing/coordinator/workbook/Firebase checks passed. Sixty JavaScript syntax checks, package/lockfile consistency, UI build and `git diff --check` passed. Desktop and narrow-screen screenshots were visually inspected.

No real emails were sent or customer state modified by verification. Tests used synthetic temporary data. Native Windows execution and installation on the other PCs remain unverified. Operator notes and send statistics are local to the current PC; the catalog does not implement remote update checks or distribution.

## Firebase multi-PC backlog repair and Settings diagnostics — October 29, 2026

A read-only live Realtime Database audit found 716 events, with 162 pending for PC 1, 252 for PC 2, 16 for PC 3 and 1 for PC 4. The old last-100 query returned 99 acknowledged PC 3 events and one pending PC 4 event, proving starvation of the PC 1/2 backlog. Firestore's read check failed. The local installation was PC 1 in Manual mode; the other PCs' local configuration/data was not accessed.

Sync now pages through both pending and acknowledged events by key/document ID, persists bounded continuation cursors, requires local token ownership, saves locally before cloud acknowledgement, and keeps durable replay receipts. Database selection is explicit and backend errors/timeouts/partial scans are visible. Settings exposes editable PC ID/URL/backend/mode plus live non-secret PC, credential, database, telemetry, local-data and progress diagnostics. Missing setup and route mismatches show warnings. Mobile responsive overrides now follow desktop CSS so the sidebar and Settings panels fit narrow screens.

`FC_BROWSER_TESTS=1 FC_UI_SCREENSHOT_DIR=outputs/sync-repair npm test`: **108 passed** (101 Node, 7 Python), no failures or skips. Coverage includes pagination beyond 100 unrelated records, recovery of previously acknowledged events, resumable scans across restart, save-before-acknowledgement and safe retries, hash-only payloads, malformed/unmatched/wrong-PC events, manual mode, concurrency, timeouts, partial failures and replay beyond the 96-hour timeline. Chrome checks verify effective configuration, warnings, save/reload, truthful disabled-sync feedback, retained unsaved inputs, and actual diagnostic bounds on desktop/mobile. JavaScript syntax checks, UI build and `git diff --check` passed.

`SYNC-REPAIR.md` contains the audit, four-PC rollout and troubleshooting steps. The distribution includes sources/docs/tests and excludes `.env`, credential files, local state, browser profiles and customer data. Live cloud access in this task was read-only; no real emails were sent. Actual recovery on the other PCs and native Windows execution remain unverified until the update is installed there.

## Confirmed hard reset of wait and quota counters — October 26, 2026

Settings now offers **Hard reset wait & quotas** with a warning and explicit confirmation. Confirmation clears the countdown/rest counter and starts fresh minimum-interval and hourly/24-hour accounting for the selected mailbox. A durable accounting ID separates future attempts from preserved historical attempts, including seed history, without relying on clocks or deleting records. New sends again enforce the configured limits. An active queue can proceed immediately; a stopped queue remains stopped. The shared coordinator supports an authenticated `reset-pacing` action and persists its accounting ID; claims use that ID and continue to enforce recipient reservations, uncertain outcomes, and suppression. An older coordinator must be updated before a shared hard reset can succeed. The existing unflagged API reset remains available as a soft reset for compatibility.

`FC_BROWSER_TESTS=1 npm test`: **96 passed** (89 Node, 7 Python), with no failures or skips. New coverage confirms override despite exhausted hourly/daily quotas and a six-hour minimum interval, unchanged historical/seed/suppression data, persistence across restart, resumed limits after a new send, selected-mailbox scope, stopped-state preservation, and shared coordinator claims after reset. Browser tests verify the warning, cancel without mutation, confirmed override, and desktop/mobile controls. Coordinator tests verify persisted resets, same-clock-tick attempt accounting, and retained uncertain/duplicate/suppression blocks. UI build, changed JavaScript syntax checks, and `git diff --check` passed. All sends used fake mail and temporary fixtures; the affected other PC and native Windows execution were not accessed or verified.

## Firebase 24/7 open telemetry sync and UI modular architecture — October 21, 2026

Integrated dual Firebase Realtime Database and Google Cloud Firestore open telemetry synchronization (`src/firebase-sync.mjs`) to capture email opens 24/7 without requiring ngrok, public inbound ports, or 24/7 workstation uptime. Added automatic service account auto-discovery (`data/firebase-service-account.json`), configurable Automatic vs Manual sync modes, dashboard "Sync Firebase" trigger button, and live worker status telemetry. Reorganized dashboard frontend into a modular source structure under `src/ui/` with automated compilation (`npm run build:ui`).

`FC_BROWSER_TESTS=1 npm test`: **86 passed** (79 Node tests, 7 Python tests), with 0 failures and 0 skipped.
- **Firebase open telemetry**: Unit tests verify graceful startup when unconfigured, Realtime Database syncing with local `openIndex` reconciliation, Cloud Firestore batch commits, multi-PC filtering via `FC_TRACKING_PC_ID`, manual mode pause enforcement, and error resilience.
- **Process lifecycle & single-instance locking**: Unit coverage validates `scripts/launch.mjs` handling active instances, graceful process termination (`--close`, `--stop`), restart (`--restart`), and stale lock recovery (`data/app.lock`).
- **Management & compliance features**: Tests verify mailbox profile management, suppression list additions and unsuppression removal with team coordinator synchronization, template JSON export/import, surgical Excel lead deletion (`/api/delete-leads`), lead preview drawers, sending pace anti-spam presets, live activity event filtering/export/clear, and reset wait.
- **Full browser checks**: Headless Chrome tests verify saved persistent browser profiles, session restoration, challenge states, CDP discovery and attach/detach, composer signature snapshotting and tamper detection, marker/pixel insertion, seed testing workflow, and tracking dashboard responsive UI.
- **Build & packaging**: `npm run build:ui` successfully compiles modular CSS, HTML partials, and JS modules into `public/`. `npm run doctor` and `python3 scripts/bundle.py` pass cleanly.

All automated verification used synthetic local fixtures and mock adapters; no real outreach emails were sent. Native Windows execution remains unverified locally.

## Optional template checks — October 20, 2026

Promotional-claim and over-180-word checks now default to advisory notes that allow outreach to continue. Mailbox & Settings provides independent Warn only / Stop before sending / Off choices and an Enable template checks switch that retains the individual choices. Settings apply consistently to template-save feedback, lead previews, manual preparation, selected batches, and continuous outreach. Existing workspaces receive advisory defaults; stopped queues require an explicit restart.

`FC_BROWSER_TESTS=1 npm test`: **82 passed** (75 Node, 7 Python), no failures or skips. New regression coverage verifies default/migrated settings, mixed modes, invalid setting rejection, manual and continuous sends with advisories, strict selected-batch blocking before an attempt, disabled preview/save feedback, restart persistence, and desktop Chrome settings save/reload with no JavaScript errors. Existing signature, suppression, uncertain-send, shared-coordinator, quota, and workbook tests pass. UI build, changed JavaScript syntax checks, and `git diff --check` passed. All sending used fake mail in temporary workspaces; no real emails were sent. Native Windows execution remains unverified.

## Queue reset feedback and long timers — October 26, 2026

Reset and the queue runner now share the calculation of required waits from mailbox/seed history and shared team history. Optional Waiting/Resting timers clear; required minimum intervals are labelled **Minimum interval**, and exhausted allowances identify the hourly or rolling 24-hour cap. The reset response includes `waitCleared` and the resulting job, so it no longer promises a cleared timer when a required wait remains. Settings shows the reason and full next check date/time. Long timers render hours explicitly, and resetting also resets the live countdown progress baseline. The runner rechecks its operation lock after asynchronous connection validation to avoid overlapping a reset/settings operation.

`FC_BROWSER_TESTS=1 npm test`: **84 Node tests and 7 Python tests passed**, without failures or skips. Additional required-wait unit coverage subsequently passed in the 13-test automation unit suite. New integration tests clear six-hour Waiting and Resting timers and confirm that the queue progresses using fake mail. They also verify a six-hour daily allowance across restart, a required minimum interval, preserved uncertainty/suppression, and desktop/mobile settings feedback. UI build, changed JavaScript syntax checks, and `git diff --check` passed. All sending used synthetic workspaces and fake mail. The affected other PC and native Windows execution were not accessed or verified.

## Reset current wait — October 20, 2026

Settings → Sending Pace & Quotas now shows the current queue countdown and a Reset current wait button. The action clears the scheduled check and rest counter, rechecks an active queue, and keeps a stopped queue stopped. Minimum send intervals, rolling allowances, shared coordinator checks, send history and blocked recipients remain in effect. The action is disabled during another operation or with a prepared message open.

`FC_BROWSER_TESTS=1 npm test`: **79 passed** (72 Node, 7 Python), with no failures or skips. New API checks verify persistence across restart, preserved uncertain-send history and suppression, no automatic sends, and reapplication of an exhausted hourly allowance. Chrome UI checks exercise the Settings action at 1440px and 390px, visible countdown status, post-reset disabled state, no page overflow, and no JavaScript errors. UI build, JavaScript syntax checks and `git diff --check` passed. All new checks use temporary synthetic workspaces; no live mailbox or production workspace was used. Native Windows execution remains unverified.

## Compose without a signature — October 20, 2026

Owen's live mailbox had a working Composer iframe but no configured signature. Preparation previously waited for a nonexistent `.spm-signature-block` before inserting the body. The adapter now snapshots all signature blocks, including an empty list, and verifies that the snapshot remains unchanged during insertion and before Send. The preview explicitly identifies mailboxes without a signature.

Verified body insertion and pre-send validation in the affected live mailbox using an unsent diagnostic message addressed to the same mailbox. The diagnostic was discarded; no email was sent and no mailbox settings were changed. `FC_BROWSER_TESTS=1 npm test`: **77 passed** (70 Node, 7 Python), no failures or skips. Regression coverage includes no signature, preserving existing signatures, and blocking added, edited, removed, or duplicate signature blocks. JavaScript syntax checks and `git diff --check` passed. Browser verification ran on macOS; native Windows execution remains unverified.

## Browser sessions — October 19, 2026

Follow-up sandbox correction: explicitly enable `chromiumSandbox: true` for app-launched persistent browsers. The previous launch inherited Playwright's sandbox-disabled default, causing Chrome's `--no-sandbox` warning. All 8 focused session tests passed on macOS after this correction, including a read of the running Chrome command line through `chrome://version` confirming no `--no-sandbox` or `--disable-setuid-sandbox`, persistent session reuse and CDP detach. Windows execution remains pending. Existing browser processes must be relaunched for the setting to take effect.

Validated on macOS with Node 20.20.2, Python 3.11.4 and the locked Playwright 1.64.0 package. `FC_BROWSER_TESTS=1 npm test`: **75 passed** (68 Node tests, 7 Python tests), no failures or skips. All browser and mail fixtures used temporary data and synthetic local inboxes. No real emails were sent or production mailbox settings changed.

Confirmed implementation faults in the previous code: each connection launched an ephemeral context; login/inbox selectors had a 45-second timeout before a challenge was explicitly handled; connection health relied on a cached authenticated flag. These are plausible contributors to the reported Windows incident. The exact Windows exception and original live Cloudflare challenge were not available, so that incident's complete cause is not confirmed.

- Real Chrome persistent profile: initial manual login, persistent cookie/localStorage recovery after browser restart without a password, optional password login, profile lock conflict without terminating the original browser, challenge state with the same tab kept open, operator continuation, wrong-account blocking, session expiration and closed-tab detection.
- Real Chrome CDP: attach to an authenticated mailbox, retain login storage, refuse ambiguous mailbox tabs, disconnect without closing the external browser or unrelated tabs, reconnect, and detect external browser shutdown.
- Local endpoint tests: discovery on entered/default ports, loopback-only validation, remote/credential/path rejection, HTTP redirects and unsafe WebSocket addresses rejected. Navigation timeout keeps the browser available; launch errors preserve profile data and omit raw browser logs.
- Settings API and startup: defaults migrate, password is optional, connection settings persist, existing saved profiles restore on startup, missing profiles wait for connection, and disabling startup restoration is respected.
- Actual UI interaction at 1440 and 390 pixels: switch methods, show/hide CDP fields, change Chrome/Edge guide, discover/select a synthetic endpoint, save/reload preferences, connect with optional password, display session status, and avoid page-width overflow or script errors.
- Existing composer, signature, fresh-confirmation, uncertainty, queue, coordinator, tracking and workbook regression tests all pass. UI build, syntax checks, dependency/lockfile consistency and `git diff --check` pass.

Windows paths/PowerShell commands (including spaces and apostrophes) have portable unit coverage. `.github/workflows/test.yml` schedules native macOS/Windows Chrome tests and a Windows Edge session run when pushed or manually dispatched; these jobs have not been executed in this local session. Native Windows/Edge operation and the original live Cloudflare/Namecheap flow remain unverified. Persistent sessions cannot guarantee challenge clearance or provider login lifetime.

The sections below are historical validation records for earlier versions.

Validated on October 10, 2026 on macOS with Node 20.20.2 and Python 3. No additional real emails were sent during the version 2 upgrade.

## Automated checks

`npm test`: **34 passed** (28 Node tests, 6 Python tests).

- New installations have no fixed customer, mailbox, lead workbook, or suppression addresses.
- Sixteen template variants personalize the active profile, opt-out copy, and business details; selection respects enabled status, required lead fields, weights, and the previous selection.
- Random send gaps and longer rests obey configurable bounds.
- Mailbox-specific hourly and rolling 24-hour allowances pause processing rather than discard the queue.
- Continuous processing sends a synthetic workbook, waits after exhaustion, accepts another campaign, retains send history, and preserves both enabled and stopped states across restarts. Reconnection is required before a saved enabled queue resumes.
- Deleted templates stay deleted after restarting.
- Lost send confirmation stops the runner, records uncertainty, and blocks automatic retries after restart. Workbook repair never resends a confirmed message.
- Two independent worker servers using one local coordinator send three synthetic recipients exactly once each. Mailbox passwords never appear in the shared ledger.
- Concurrent coordinator claims permit only one owner; suppression, quotas, and minimum mailbox intervals are shared. Sending reservations never expire into eligibility. Restart converts unfinished Sending records into Uncertain.
- XLSX header aliases and explicit mappings work for import and status patching; unrelated ZIP parts, formulas, cell styles, and source files remain intact.

## Live local UI

- Migrated existing workspace shows 9,208 leads, 2,881 ready, 6,327 excluded, and both previously recorded sends. Existing suppression entries remain available.
- Confirmed 16 template options, token migration, unchanged saved settings, personalized lead preview, custom template creation and deletion, and the searchable send-history view.
- Browser console showed no application errors during these checks.
- Older version-1 attempts explicitly report that full body/template/signature details were not recorded then; no retrospective details were invented.
- Existing signature-preserving Private Email compose/send behavior was verified in version 1. Version 2 replaces fixed sender selectors with the saved active account. No additional real sends were used to exercise continuous mode.

## Distribution and limits

The archive contains only explicit source/documentation/launcher/test files. It excludes local data, originals, working workbooks, screenshots, customer history, mail sessions, node_modules, and team ledger/token files. macOS launcher execute permissions are included in the ZIP.

Windows setup/start scripts are supplied and reviewed but have not been executed on a Windows PC. macOS is the tested platform. Installation needs Node, Python, Chrome or Edge, and an npm dependency installation; this is not a standalone executable.

The tool can run continuously while the PC, server, browser, network, and mailbox session remain available. It does not install an OS background service or store mailbox passwords for reboot login. Team duplicate protection requires every PC to connect to one shared coordinator; no externally accessible coordinator was deployed. At that validation date, automatic reply/bounce reading and other providers' webmail adapters were not implemented. The October 14 update below adds optional DSN bounce monitoring; reply interpretation remains manual.


## Email tracking integration — October 14, 2026

Validated on macOS with Node 20.20.2 and Python 3 using isolated temporary workspaces. No real emails were sent and no production workspace, mailbox, or DNS records were changed during this integration.

- `FC_BROWSER_TESTS=1 npm test`: **62 passed** — 55 Node tests (including both real headless Chrome checks) and 7 Python tests. No skipped tests in this run.
- Syntax checks passed for 27 JavaScript source/test/script files; `git diff --check` passed.
- Dependency installation audit reported zero vulnerabilities.
- Actual Playwright composer adapter against synthetic local HTML: original signature and message text retained, marker/pixel inserted, edited body blocked, fresh success notice required, stale notice rejected before Send. External pixel requests were intercepted locally.
- Dashboard at 1440×1100 and 390×844: evidence rows, hard-bounce filter, message details, monitor configuration, and scrolling to the DNS form worked; no application JavaScript errors or page-width overflow. Screenshots are in ignored `outputs/tracking-desktop.png` and `outputs/tracking-mobile.png`.
- Local HTTP workflow with fake sending: pending → webmail-confirmed, independent unknown delivery/open signals, pixel-only listener rejects admin routes, repeated requests deduplicate, seed plan key reuses the same records, repeated seed sends are blocked, manual spam evidence persists, and restart preserves all evidence and duplicate protection.
- Mocked mailbox checks cover hard/soft/multipart/encoded-header DSNs, duplicate processing, unrelated senders/recipients, ambiguous identifiers, delayed Sent reconciliation, read-only UID cursors, authorized Inbox/Spam placement, credential rules, TLS and retry backoff. Mocked DNS checks distinguish missing records from lookup failures.
- Existing queue, coordinator, template, profile, suppression and surgical workbook regression tests pass.

The first restricted run could not bind local test ports. The complete successful run used local-server/browser execution permission. An initial synthetic composer fixture lacked visible recipient-chip text; the fixture was corrected before the final all-green run.

Live Namecheap Sent-header/marker retention, real DSN behavior, seed-provider credentials/OAuth, public HTTPS tracking reachability, real domain authentication/alignment, and Windows execution remain unverified. Monitoring/open tracking default to disabled. OAuth token provisioning/refresh and external hosting require operator infrastructure. See `TRACKING.md` and `.env.example` for setup, the full changed-file manifest, and the designated-recipient end-to-end checklist.

## Lucide React icons — 2026-10-30

Replaced 131 hand-authored inline SVGs and decorative emoji status/timeline icons with `lucide-react@1.65.0`, using the typed shared icon primitive. Preserved native controls, event handlers, IDs and existing sizes. The native-select arrow is generated from Lucide React at build time and served by an explicit SVG asset route; this route requires restarting already-running app processes. Isolated asset verification returned HTTP 200 with the correct SVG MIME type and Lucide markup. The running main app contained 165 Lucide SVGs and zero custom SVGs after reload. Strict TypeScript, formatting and production build passed. Full regression passed 215 Node tests and 12 Python tests. Local screenshot: `outputs/ui-qa-lucide/settings.png`.

## Bauhaus campaign-centered UI — 2026-10-30

- Implemented the selected first direction across all twelve existing routes, with persistent campaign/mailbox/file/batch/queue context, real campaign inventory and an audience-first setup journey. Native controls/IDs and sending/recovery protections remain intact.
- Added typed navigation configuration, a read-only React presentation store, modular campaign components and a shared campaign switching controller. Legacy campaigns with missing worksheet lists and file-only workbook labels are supported.
- Full regression: 215 Node tests and 12 Python tests passed, no failures/skips. Subsequent focused UI acceptance passed after final navigation refinements. Strict TypeScript, formatting, production build and diff checks passed.
- Desktop/mobile visual evidence and the source comparison are in `outputs/bauhaus-review/`; see `design-qa.md`.
- Portable package includes the local font and OFL license, sources, generated assets and DX guides, excluding runtime customer data and secrets. Normal running servers require a restart for the new font route.


## Bauhaus workspace refinement — 2026-10-30

- Completed the product-brand shell, pinned management navigation, unread-message dashboard priority, first-row connection/runner controls, separate Accounts route, grouped Settings, and shared profile/template drawers. Existing native IDs, routes and API behavior remain compatible.
- Shared action primitives now cover buttons, navigation actions, upload labels and data-selection rows. Shared metrics, status badges, surfaces, focus states and drawer footers apply across the UI. Async actions preserve their icons; errors remain readable inside open drawers.
- Fixed narrow Unibox reading space and Tracking diagnostic overflow. Added behavioral coverage for the unread shortcut/filter label, modal failures/drafts/focus, account drawer bounds, and retained async icons. The UI fixture now supplies valid profile identifiers for account-edit checks.
- Final `FC_BROWSER_TESTS=1 npm test`: **215 JavaScript tests and 12 Python tests passed**, no failures/skips. `npm run check:ui`, changed-script syntax and diff checks passed. All thirteen desktop routes and the core mobile/editor states were visually reviewed using synthetic data; final browser warning/error logs were empty.
- The only server change is an explicit local PNG brand asset route and MIME type. Already-running app processes need a restart for that asset. No sending logic, storage migration, customer data, live mailbox operation or deployment was changed. Real provider/Windows acceptance remains unverified.
- Evidence: `outputs/bauhaus-refinement/`; current design QA and developer ownership are documented in `design-qa.md` and `docs/UI-DX.md`.


## Dashboard and campaign navigation — 2026-10-30

- Rebuilt the dashboard around scoped statistics, unread messages and a compact runner/mailbox command row. Preserved native action IDs, queue guards, selected-batch controls and event/read workflows. Both primary controls and statistics are visible at the verified 858×876 and 1440×1000 desktop sizes.
- Separated the campaign library (`#campaigns`), workbook creation (`#campaign-new`) and selected workspace (`#campaign-edit`). Local tab aliases (`#campaignReview`, `#campaignSource`) retain browser history and drafts. Shared Templates/Accounts/Settings/Import Review keep distinct purposes; the cross-page campaign stepper was removed.
- Canonical typed route labels drive sidebar/breadcrumbs. The runner context shortcut opens actual runner controls. Opening the current campaign preserves batch/drafts; choosing another keeps existing cleanup. Campaign import navigation/activation refresh now belongs to the campaign controller.
- Full regression: **215 JavaScript tests and 12 Python tests passed**, no failures/skips. Strict TypeScript, formatting, production build and diff checks passed. Browser acceptance covers fifteen views, responsive bounds, long campaign names, local tab keyboard/history, retained edits, dashboard visibility and a real fixture upload that creates a separate paused, review-required campaign.
- Native visual review used isolated synthetic data; before/after evidence and audit notes are under `outputs/dashboard-navigation/`. No live message, provider connection, saved customer data or server/storage migration was used or changed.

## Workspace visibility and Build 1 header — 2026-10-30

- Added an accessible Workspace context disclosure with a compact campaign/connection/selection summary. Collapsing or disabling the component hides presentation while retaining the native campaign/mailbox/source nodes and their controller state.
- Settings → Appearance independently enables/disables the context. Browser-local typed preferences remember visibility and collapse across reloads; malformed values fall back to defaults and blocked storage keeps session controls working with a visible explanation.
- Added the Build 1 red quarter-circle, cobalt bar and yellow circle in the header, preserving the 198:82 proportions and top-right placement. Responsive scaling reserves space for breadcrumbs and mailbox status.
- `FC_BROWSER_TESTS=1 npm test`: **216 JavaScript tests and 12 Python tests passed**, no failures/skips. Strict types, formatting and production build passed. New checks cover invalid stored preferences, keyboard collapse/expand, enable/disable and reload persistence, retained selectors/drafts, blocked writes, and header bounds from 320px to 1440px.
- Visual review used the isolated synthetic preview at normal desktop, 1440px desktop and 390px mobile sizes. Evidence: `outputs/workspace-context/`. No sending/API behavior or live mailbox data changed.

## Sticky page titles and actions — 2026-10-30

- All application pages retain their title, eyebrow and primary actions while scrolling. Shared offsets track the actual visible context height: zero when hidden, the compact bar when collapsed, and the full panel when expanded. Mobile context scrolls away while the page header pins to the top. Desktop Unibox preserves its existing independent message scrollers and stationary title/tools.
- A scoped ResizeObserver updates offsets after route, preference, size, font and header-content changes and disconnects on unmount. Native controls stay in their original mounted page headers. Section links, runner shortcuts and Settings navigation clear the measured sticky stack.
- `FC_BROWSER_TESTS=1 npm test`: **216 JavaScript tests and 12 Python tests passed**, no failures/skips. Strict types, formatting, production builds and diff checks passed. Browser checks cover all fifteen routes at desktop/mobile widths in expanded, collapsed and hidden modes, responsive actions, pinned header placement, visible section targets and an unobstructed Settings Save action.
- Visual evidence: `outputs/sticky-headers/`, including scrolled Settings with context hidden, mobile Settings section navigation, and Tracking with expanded/collapsed context. Only synthetic preview data was used; no sending logic or customer data changed.

## Dashboard stat character — 2026-10-31

- Added compact brand-colored geometry through the shared Metric visual slot. Ready and excluded sectors reflect their active-campaign shares; the total mark and confirmed-send mark distinguish empty/populated states. PC-wide sends retain their separate scope without an invented campaign conversion rate.
- Kept native count IDs, typography, card surfaces and dashboard hierarchy. Shape descriptions expose audience percentages to assistive technology without extra visible labels. Geometry handles empty, partial, full, out-of-range and non-finite inputs.
- Desktop and 390px mobile visual evidence: `outputs/stat-accents/`. Changes use synthetic local preview data and do not alter sending, API or stored customer data.
- `FC_BROWSER_TESTS=1 npm test`: **217 JavaScript tests and 12 Python tests passed**, no failures/skips. Strict types, formatting, production build and diff checks passed.

## Shared stat accents — 2026-10-31

- Promoted StatMark into the design system and added StatValue for adapter-rendered metric cards. Reports & History, Email Tracking, campaign audiences, import review, mailbox summaries and the version catalog now share brand geometry, typography and value alignment with dashboard metrics.
- Valid proportions retain their original denominator and scope. Counts, versions and timing samples use presence accents; missing/zero data stays muted. Existing values, timing and tracking evidence labels, filters, exports and native controller IDs are preserved. Compact inline counters and operational status controls stay compact.
- Desktop/mobile visual evidence: `outputs/shared-stat-accents/`. Synthetic local preview data only; no live mailbox actions or customer-data migrations.
- Full regression: **217 JavaScript tests and 12 Python tests passed**, no failures/skips. Strict TypeScript, formatting, production builds and diff checks passed.

## Unibox refinement — 2026-10-31

- Reviewed the inbox, reader/reply preparation and capture setup from current screenshots, then refined the existing Bauhaus UI. Added compact shared action sizes, readable mailbox/search labels, contact initials, clearer list/reader hierarchy, queue spacing, active-filter indication and a clear-filter shortcut. Returning to the inbox clears the stale selected-row highlight and restores keyboard focus without discarding review drafts. Arrow keys/Home/End navigate the list.
- Mailbox setup has direct entry, section shortcuts, an ordered setup guide, aligned checkboxes, responsive fields and a sticky dialog heading. Section targeting waits for native dialog autofocus and scrolls the dialog itself. The configuration fieldset locks during saves; inline processing/success/error feedback remains visible in the dialog, and rejected saves retain inputs.
- Extracted setup/filter dialogs into feature modules. Native controls/IDs, read-only authorization, credential-reference handling, evidence review, opt-outs, stale-approval guards and operator-only native-mailbox sending remain compatible. See `docs/UNIBOX-UX.md`.
- Full suite: **217 JavaScript and 12 Python tests passed**, no failures/skips. Final focused React/release acceptance passed 20 tests; final dialog positioning/recovery acceptance passed 12 tests after the section-scroll refinement. Typecheck, formatting, production builds and diff checks passed.
- Accepted screenshots and numbered flow findings are under `outputs/unibox-refinement/`. Desktop/mobile review used synthetic data. Live provider connections, actual sending and full accessibility conformance were not claimed.

## Dashboard operational panels — 2026-10-31

- Refined Outreach runner, Mailbox, Carrier inbox and Selected batch around a reusable scoped panel heading, consistent surfaces/spacing, and distinct state/action hierarchy. Runner capacity displays actual rolling allowances; mailbox identity and connection actions remain explicit. Carrier counters open the original queues and conversation rows retain recipient, subject, intent, excerpt, unread state and guarded review/read actions. The batch panel names its campaign and guides an empty selection toward Leads.
- Preserved every native control ID, connection/session option, template choice, progress update, queue/batch guard and read-dismissal workflow. Existing stat visuals and unread-message priority remain intact.
- `FC_BROWSER_TESTS=1 npm test`: **217 JavaScript tests and 12 Python tests passed**, no failures/skips. Strict types, formatting, production builds and diff checks passed. Desktop/mobile visual review and evidence: `outputs/dashboard-panels/`. Synthetic data only; no messages or live provider actions were performed.

## Email Tracking workspace — 2026-10-31

- Promoted the overview above the records panel and replaced the large default evidence banner with a native disclosure. Message filters use consistent spacing, friendly status labels, an accessible search name and a filter-scope summary. Section shortcuts separate records, seed testing, domain authentication and mailbox monitoring without removing existing aliases or controls. Raw worker diagnostics remain available behind a disclosure.
- Added local updating/error feedback and aria-busy state. Refresh requests received while a load is in flight are coalesced and replay the current controls; quick-filter pressed states match the actual status/search. Returning from Seed Tests to All Records clears the seed quick filter. Zero observed bounces no longer claim a healthy sender score, and authentication copy does not promise inbox placement.
- Tightened seed setup/preview spacing, table density and mobile two-column metrics/date filters. Existing tracking IDs, UTC filters, details, placement evidence, seed reservations, monitoring and sync actions are retained.
- Full regression passed **217 JavaScript and 12 Python tests**. Final focused acceptance passed 8 tests, including delayed-refresh filter changes, quick-filter reset, local section/history navigation and responsive bounds. Strict type, formatting, production build and diff checks passed. Desktop/mobile screenshots: `outputs/tracking-workspace/`. Synthetic local data only; no live sync, DNS inspection or seed sending was exercised.

## Tracking sticky sections and Firebase recovery — 2026-10-31

- Tracking section links pin below the page header and workspace context. Anchor padding includes their measured height, including wrapped mobile links. Regression checks cover desktop/mobile and expanded, collapsed and hidden workspace context; other routes retain their existing sticky layout.
- Firebase transient reads/acknowledgements retry with bounded backoff. Cloud request/run budgets, invalid configuration/checkpoint validation, malformed timestamp isolation, configuration-change guards, checkpoint rollback and truthful completed-scan timestamps supplement existing token matching, save-before-acknowledgement and replay protection.
- Tracking exposes current sync status and Settings access. Both sync controls explicitly report failed API results; Settings shows retry counts and budget. Final focused Firebase browser acceptance passed with synthetic disabled-cloud data, preserving unsaved settings and verifying the return-to-Settings flow.
- Full regression: **225 JavaScript and 12 Python tests passed**, no failures/skips. Final focused recovery suite: **23 passed**; Firebase Settings browser acceptance: **1 passed**. Strict TypeScript, formatting, production UI build and diff checks passed.
- Desktop/mobile visual evidence: `outputs/tracking-sticky-sync/`. No live cloud acknowledgements, provider connections, sending or customer-data changes. Other PCs require updating/restarting and verifying their own diagnostics.

## Missing-open diagnosis follow-up — 2026-10-31

- Extracted a reusable read-only Firebase audit. The report separates signal buckets from newly opened messages and exposes manual polling, identity mismatches, database availability and exact recovery coverage. It never persists local state or acknowledges cloud events.
- Focused Firebase suite: **24 tests passed**, including an audit with recoverable/mismatched/unmatched evidence, multiple buckets for one message, paused polling and a failed database. Assertions verify original state and both cloud write logs remain unchanged. CLI/module syntax and diff checks passed.
- A live read-only audit and local server diagnostics were inspected. No customer configuration, local messages or cloud acknowledgements were changed; the operator requested leaving the uncertain PC identity unchanged. Live repair and installed-worker restart were not performed.

## Dashboard carrier inbox stats — 2026-10-31

- Carrier counters now use shared Metric/MetricGroup and StatMark primitives, matching the dashboard stat typography, surfaces and Bauhaus geometry. Responsive columns adapt to desktop and mobile; labeled Unibox actions retain each work filter, including follow-up eligibility.
- Follow-up-only rows are excluded on the server and filtered from legacy responses in the UI. Follow-up tasks remain available in Unibox. Strict type, formatting and production build checks passed; focused React/browser and carrier-inbox regression passed 24 tests.

## Shared confirmations and save feedback — 2026-10-31

- Replaced application-native browser confirmations with a shared typed React modal across delete, restore/activation, hard-reset, suppression removal and unsaved-text replacement flows. Profile/template/campaign editing asks before overwriting saved details; shared save/delete/reset actions expose actual pending feedback instead of timed success.
- Decisions open in the native top layer above existing drawers. Tested safe initial focus, cancel/focus restoration, Escape without closing the editor, retained draft text, duplicate-request rejection, cancellation when a parent closes, bounded desktop/mobile geometry, and pending-save Escape protection. A delayed rejected save returns errors inside the existing editor and retains its inputs. React text rendering avoids HTML injection. Navigation/disposal also cancels unanswered decisions.
- Full final regression: **226 JavaScript and 12 Python tests passed**, no failures/skips. Typecheck, formatting, production bundles and diff checks passed. Acceptance tests use product dialogs rather than automatically accepting browser-native prompts. Desktop/mobile proof: `outputs/confirmation-modals/confirmation-drawer-{1440,390}.png`.
- Synthetic local workspaces only for mutation tests; no live provider sending, customer deletions or cloud configuration changes were performed. Specialized reply approvals and server-side send/protection checks remain intact. Documentation: `docs/UI-DX.md`.

## Tracking workspace tabs — 2026-10-31

- Replaced section shortcuts with a sticky, product-styled tab bar and exclusive Messages, Seed Studio, Domain Health and Mailbox monitoring panels. All panels/IDs stay mounted so filters, native controller regions and unfinished form values survive tab changes.
- Added selected states, tab/panel ARIA relationships, roving keyboard focus, Arrow/Home/End navigation, and direct-link routing for all four sections. Tab changes restore the workspace top rather than leaving content beneath the sticky stack; reselecting Messages restores visible stats after table interaction.
- Focused final acceptance: **9 tests passed**, including all-route responsive regression, hidden-panel exclusivity, keyboard selection, retained domain input, direct links, existing message evidence/filter behavior, and desktop/mobile layout. Strict types, formatting, production build and diff checks passed. Visuals: `outputs/tracking-tabs/`. No live sending, DNS requests or Firebase writes were exercised.

## Guided import review — 2026-10-31

- Added a four-stage journey, contextual next actions, clear preview/save/activation boundaries, save-readiness explanations and operation-specific progress copy. Added exact column-mapping comparisons and saved-vs-preview parsing counts, with stale-preview messaging after edits. Mobile comparisons stack into labeled cards instead of relying on horizontal scrolling.
- Existing source evidence, advanced mapping, revision downloads/search, explicit activation, provenance, contact protections and undo remain available. Mapping controls lock during requests, including delayed preview responses. Saving/activation remain separate operations and activation retains the existing paused-campaign safeguard.
- Focused regression: **24 tests passed** across React/responsive navigation, import review/repair and release acceptance. Final production/mobile and recovery acceptance repeated **12 tests successfully** after the final refinements. Added assertions for journey stage transitions, readiness instructions, delayed-preview locks, and comparison-cell bounds at desktop/mobile sizes. Strict types, formatting, production build and diff checks passed.
- Visual review: `outputs/import-journey/import-guide-{1440,390}.png` and `import-preview-{1440,390}.png`. Synthetic workspaces only; no customer workbook, provider or Firebase changes.

## Separate import setup screens — 2026-10-31

- Replaced the long review form and passive journey with five segregated views: Source, Columns, Preview, Save copy and Activate. A sticky, navigable stepper displays the reviewed campaign, current step, prerequisites and completion evidence. Inactive views stay mounted to retain native form values and dynamic regions.
- Source inspection retains original worksheet evidence independently of proposed results. Columns gets a dedicated mapping workspace and field guide; Preview has only evaluation/comparison and navigation; Save separates provenance and confirmation; Activate separates the primary copy selection from download/edit/recovery tools and saved-record inspection. Its leads shortcut selects the reviewed campaign explicitly.
- Verified stage gating, source/column navigation, keyboard focus, retained provenance after backtracking, preview invalidation after mapping edits, delayed-preview control locks, automatic preview/save advancement, explicit activation and paused outreach. Mobile rail centers the active step, including on resize. Global status/errors remain outside hidden views.
- Final focused acceptance: **24 tests passed** across release integration, standalone experiment compatibility and React/responsive navigation. A final production-flow visual check passed after copy refinements. Strict types, formatting, production bundles and diff checks passed. Captures for all five desktop/mobile stages are under `outputs/import-setup-steps/`.
- Original workbook retention, server-issued preview/activation tokens, explicit save/activation, revision recovery/downloads and contact protections remain intact. Test mutations used synthetic local workspaces only.

## Concern-based Settings tabs — 2026-11-01

- Replaced the long Settings layout with six exclusive panels: Sending pace, Eligibility & checks, Firebase sync, Team coordination, Appearance and About. Extracted concern-specific components, rebuilt pacing into preset/timing/recovery cards, standardized surfaces/fields, and clarified independent Firebase/team roles. Appearance has an immediate workspace preview and About separates release information from technical details.
- Added selected/roving keyboard tabs, deep-link routes and resize-aware tab visibility. All fields remain mounted. Configuration saving retains its existing atomic scope; appearance saves locally and About is read-only. Save actions hide on those two tabs. Cross-tab validation now reveals the affected panel/field and preserves invalid input; team-token text only clears after a successful settings request.
- Focused checks: **19 Firebase/UI/reset tests passed on the final recheck**, plus **3 message-check tests passed**. Coverage includes six-tab exclusivity at desktop/mobile widths, retained unsaved PC ID, Home/End navigation, save visibility/scope, rejected-PC-ID recovery from another tab, persisted settings, diagnostics and protected hard reset. The preceding interrupted browser run had timeout failures; the affected tests passed after rerunning. Typecheck, formatting, production builds and diff checks passed.
- Final visual evidence: `outputs/settings-tabs/settings-settings{Sending,Checks,Connections,Team,Appearance,About}-{1440,390}.png`. Synthetic data only; no live account, Firebase identity or coordinator configuration was changed.

## Sending pace control-board redesign — 2026-11-01

- Replaced the preset-first layout with a focused timing/volume/rest control board, visible units, clear min/max relationships and static logo-derived schedule geometry. Presets and empty-queue polling use separate optional disclosures. Queue recovery has its own status/action area and retains the existing confirmation.
- Preset numbers, all nine native pacing IDs, global save scope and backend pacing behavior remain unchanged. Applying a preset requires its explicit button and only updates the draft. Validation opens collapsed settings when a rejected field must be corrected.
- **18 focused UI/reset tests passed**, including preset values and unchanged persisted settings before Save, invalid hidden polling input recovery across tabs, retained edits, responsive layouts and hard-reset safeguards. Final visual acceptance also checks distinct timing/volume/rest accents. Typecheck, formatting, production build and diff checks passed.
- Desktop/mobile evidence: `outputs/sending-pace-redesign/pace-board-{1440,390}.png`. Synthetic local workspaces only; no live outreach was started.

## Live System Activity redesign — 2026-11-01

- Reorganized current runner, mailbox and rolling allowance telemetry above a separate captured-event summary and focused event stream. Added product surfaces/semantic accents, dated event rows, mobile category scrolling, accessible auto-scroll control and log-local export/clear actions. Kept the existing stream, countdown, export endpoints and clearing confirmation behavior.
- Paused feeds now retain a snapshot that supports search, filters and visual/terminal switching while polling collects pending events. Resume reveals them. Search includes company/email metadata; category tabs support arrows and Home/End, and toggle buttons expose pressed states. Feed pause remains independent of outreach execution.
- Nine activity/React tests passed. A final activity browser recheck passed after the mobile tab spacing change. Typecheck, formatting, production build and diff checks passed. Browser coverage includes 1440/1024/768/390 widths, long literal event text and contact metadata, duplicate timestamps, polling, paused searching/switching, keyboard filters, and screen-only/server-history clearing. Synthetic local data only; no customer settings, live sending or cloud data changed.
- Visual evidence: `outputs/live-activity-redesign/live-{activity,stream}-{1440,1024,768,390}.png`.

## Centered pace guides and unified drawers — 2026-11-01

- Explicitly centered all four preset guides in the viewport with bounded height and scrolling. Consolidated lead/tracking inspectors onto the same native Drawer as template and mailbox editors; preserved native control IDs and operational handlers. Removed obsolete div-backdrop styling and global inspector Escape dismissal.
- Shared drawers now have consistent brand-accented headers, persistent tabs/actions, independently scrolling content, contained overscroll, full-width mobile sizing, safe-area footer spacing and local feedback. Inspector tabs expose tab/panel relationships and support arrows/Home/End. Inspector backdrop dismissal remains available; editor drafts stay mounted when closed.
- Typecheck, formatting, production build and diff checks passed. **Eight UI tests passed**, including all original control IDs, viewport centering of every guide at 1440/390, profile fit down to 320, lead/tracking native modality, inspector keyboard navigation, tracking focus restoration, responsive footer visibility, retained editor drafts, nested confirmation cancellation/focus and save error feedback. An initial test raced the asynchronous lead preview; explicitly waiting for the drawer to become visible resolved it.
- Visually reviewed centered guide and all four drawers at desktop/mobile widths. Evidence: `outputs/drawer-system/pace-info-{1440,390}.png`, `drawer-{template,profile,lead,tracking}-{1440,390}.png`, and nested confirmation screenshots. Synthetic local data only; no live outreach or customer configuration changed.

## Outreach Desk branding and neutral samples — 2026-11-01

- Removed hardcoded FC Logistics/Fleet Core Logistics and Mark identities from frontend examples, placeholders and preview fallbacks. Aligned the sample recipient and rendered company, replaced the fabricated webmail signature with an explicit explanation, and replaced the real sample postal address with neutral setup guidance. Activity terminal and private package metadata now use Outreach Desk naming.
- Domain-health guidance no longer invents a Mark reporting mailbox when no active sender exists. Tracking URL/domain examples use reserved example.com addresses. Existing Firebase service identifiers, customer settings, templates and sender/signature data remain unchanged.
- Eight UI tests passed, including token-based preview rendering with a consistent neutral recipient, absence of the old fabricated identity/address in that editor, and retained drawer/save/navigation workflows. Final typecheck, formatting, production build and diff checks passed; frontend source and generated bundles contain no old company/person sample strings. Visually reviewed `outputs/outreach-desk-branding/neutral-template-preview.png`.

## Activity stream priority and sticky controls — 2026-11-01

- Replaced the default multi-card telemetry block with a compact, expandable System status summary. Full diagnostics remain mounted and available on demand; event/category counts remain in the stream. Reduced the page header and toolbar footprint, including icon-based view controls with accessible labels on mobile.
- Search, category filters, Latest, view controls and log actions now live in a sticky toolbar below the measured workspace/page-header stack. Visual and terminal data use the page scroller. The shared resize observer tracks the active activity toolbar or tracking navigation. Latest scrolls the newest matching row below the sticky controls; polling alone does not reset reading position, and paused/irrelevant events do not force following.
- Log actions close after completion/export/navigation, support Escape and outside dismissal, and retain original export/clear semantics. An initial long-stream test caught the menu covering auto-scroll after clearing; closing and restoring focus after the action resolved it.
- **Nine activity/React tests passed**. Coverage includes a 19-event stream, sticky action visibility after scrolling at 1440/390, stable reading position through polling, Latest alignment, collapsed and expanded telemetry, existing filter/search/pause/clear behavior, and shared page-header/navigation regressions. Typecheck, formatting, production build and diff checks passed.
- Reviewed responsive and scrolled evidence in `outputs/activity-stream-focus/`, including `activity-{sticky,latest}-{1440,390}.png`. Synthetic local state only; no live sending, customer settings or cloud configuration changed.

## Unibox badge alignment and terminal contrast — 2026-11-01

- Normalized queue badge sizing, padding, line height and inline flex alignment so labels and counts remain centered together. Kept existing queue controls/count IDs and selection behavior. Increased activity terminal title contrast/weight and fixed dark output using a contrasting light foreground; other terminal headings retain their existing base style.
- Typecheck, formatting, production build and diff checks passed. Isolated browser geometry checks at 1440/390 verified all five badges (synthetic counts 2, 1, 777, 775, 0) fit and have zero vertical center difference from their buttons. Visually reviewed Unibox and final terminal screenshots in `outputs/chip-alignment/`. No customer data changed.

## Template library and focused editor flow — 2026-11-01

- Redesigned the library around message excerpts, availability, selection rules, search, filtering and explicit row actions. Added distinct empty-library/no-results states and filter reset. Desktop rows become stacked records on mobile. Import/export endpoints and saved template schema remain unchanged.
- Removed the template-switching dropdown from the editor. New starts an empty draft; Edit loads one item with a specific title. Composition, automatic-selection rules and sample preview are separate concerns, with a mobile Preview shortcut and persistent footer actions. The existing native template selector moved to the lead inspector's Email Preview tab, preserving preview/manual-send adapters without coupling them to editing.
- Added independent editing identity and a draft baseline. Same-item reopening retains edits; switching items/new drafts asks before replacement. Polling/option-list changes no longer refill editor fields. Saving preserves the lead-preview selection, and deleting the edited item closes its drawer. Missing records cannot silently be recreated by an edit save. Required fields/weight retain validation, opt-out insertion remains available, and personalization now works at cursor position zero. Existing backend assessments and send safeguards remain untouched.
- Typecheck, formatting, production build and diff checks passed. **Eight UI tests passed on the final run**, including actual synthetic create/update/delete, no editor selector, blank creation, discard cancellation, retained drafts, independent preview selection, option-list refresh during editing, token insertion at zero, filtering/reset, existing nested confirmations/save error handling, and keeping Email Preview selected when its template changes. No live sending or customer data changed.
- Reviewed desktop/mobile library and drawer screenshots in `outputs/template-library-redesign/`, including `template-library-rows-390.png` and `drawer-template-{1440,390}.png`.

## Guided Mailbox tools — 2026-11-01

- Replaced nested setup disclosures with separate Overview, Set up capture and Import a reply views. Added contextual next-step guidance, explicit capture-versus-sending boundaries, numbered setup concerns, credential-reference explanations, provider guidance, advanced connection/history controls, and clear import eligibility/size instructions. Status/coverage/opt-out evidence remains available; diagnostics are optional.
- Header, navigation and setup Save remain accessible around one scrolling body. Drafts persist across views; save feedback remains visible across tabs, fields disable during a request and errors retain inputs. Keyboard tabs support arrows/Home/End, with responsive checks through 320px and compact short-viewport styling.
- Auth mode changes retain inactive field values in the draft but submit only the chosen credential reference, avoiding backend rejection of dual references. Existing token-only connections infer OAuth. New mailbox IDs remain unique after removals, and saved-connection reuse respects the 20-mailbox limit. Provider access, read-only scanning, confirmation, matching, protections and backend endpoints remain unchanged.
- **20 integration/UI tests passed** before the final provider-helper/auth serialization refinement; the affected integrated browser scenario then passed again with explicit request-payload and retained-credential assertions. Typecheck, formatting, production build and diff checks passed. Coverage includes EML imports, opt-outs, actual disabled-capture configuration save, failed/in-flight saves, three-view exclusivity, keyboard navigation, persistent drafts, visible Save while scrolling and responsive layouts at 1440/768/390/320.
- Reviewed desktop/mobile evidence in `outputs/mailbox-tools-redesign/mailbox-tools-{replyCaptureTools,replyConfigPanel,mailroomImportSection}-{1440,768,390,320}.png`. Synthetic local workspaces only; no live provider connection, live capture or customer settings were changed.

## Do Not Contact redesign — 2026-11-01

- Replaced the split add-form/list layout with a full-width protection list, email/reason search, record-type filtering, visible totals and distinct no-results/empty-list recovery. Scope copy differentiates local protection and configured coordinator sharing. Long emails/reasons wrap within records; the list uses page scrolling rather than a fixed inner pane.
- Added a shared Protect a contact drawer with native form/email validation, optional bounded reason, Enter submission, in-flight field disabling and retained error drafts. Duplicate adds preserve the existing reason. Captured-opt-out reason records route to Unibox and hide removal; other entries retain a destructive confirmation. Server enforcement, coordinator requests and sending eligibility protections are unchanged.
- Eight UI checks and the genuine captured-opt-out HTTP guard scenario passed. UI coverage includes actual synthetic add/removal, casing, duplicate-reason preservation, failed-save retention, cancel/confirm removal, filtering/reset, readable hashed-reason presentation and desktop/mobile containment. The guard scenario separately confirms a captured opt-out cannot be unsuppressed. Typecheck, formatting, production build and diff checks passed, including a final label/action-affordance refinement.
- Reviewed `outputs/do-not-contact-redesign/dnc-{add,list}-{1440,390}.png`. The UI record-type fixture uses a synthetic recorded reason; the separate server test supplies real captured evidence in an isolated workspace. No customer data, live sending or remote configuration changed.

### 2026-11-03 — Version Catalog and removal of local release notes

- Removed the local note editor, local-note filter, save implementation, and note content from catalog JSON/export. The retired write endpoint returns 410. Existing persisted `releaseNotes` data is preserved; no production state/configuration was changed.
- Replaced the oversized metrics/editor layout with a compact installed-build summary, record counts, native expandable release history, filter reset/empty states, and an expandable numbered upgrade guide. Installed entry opens initially; manual disclosure choices survive refresh. Search reveals matching changes. Refresh failures retain loaded history and show retry guidance.
- `npm run check:ui` passed (types, formatting, production build). `node --test tests/history-report.test.mjs`: 6 passed. `FC_BROWSER_TESTS=1 node --test tests/send-insights-integration.test.mjs`: 2 passed, including retired endpoint, retained legacy storage, JSON export, search/type filters, no-results reset, keyboard disclosure, refresh failure/recovery, and desktop/mobile containment. `FC_BROWSER_TESTS=1 node --test tests/ui-react.test.mjs`: 8 passed.
- Visually inspected synthetic desktop/mobile catalog and history screenshots, plus the desktop guide, under `outputs/version-catalog/`. These tests use isolated temporary state, with outbound capture and tracking disabled; no live mailbox/provider behavior was exercised. Server/module syntax and `git diff --check` passed.

### 2026-11-03 — Correct internal-build history and version identity

- Product owner clarified that all work remains internal testing and no actual public releases have occurred. This supersedes earlier stable/release-candidate descriptions in historical validation notes; original test evidence, Git IDs and package labels are retained for traceability.
- Set the current application baseline to `0.1.0-alpha.1` in package.json and both root lockfile fields. Centralized stage identity in src/app-version.mjs. Server state, sidebar, catalog, asset cache versions, exports and package filenames use the same package version. Data/protocol/tracking schema versions, private state/configuration and existing tags/artifacts were not reset or rewritten.
- Reclassified all catalog/changelog history into internal build checkpoints and dated development milestones. Original labels are exposed as legacy provenance, never invented historical alpha builds. Added the current internal baseline and previously missing November workflow/catalog milestones. Public release count is explicitly zero. README, operational guides and Settings copy now reflect internal testing; docs/VERSIONING.md explains numbering, stage transitions and preparing the next test package.
- `npm run check:ui` passed. Version/history unit tests: 8 passed. Isolated HTTP/browser integration: 2 passed, checking internal label/version agreement, unchanged state schema, legacy-label search, filters, retained local-note data, exports, error recovery and responsive layouts. Shared React/navigation suite: 8 passed. Final copy-only Settings change was build checked after the browser pass.
- Visually inspected synthetic desktop catalog and mobile build history in outputs/internal-build-history/. Packaged an isolated /private/tmp/Outreach-Desk-0.1.0-alpha.1.zip and verified its package metadata, runtime identity module, cache-versioned UI and included versioning guide. This is packaging validation only; nothing was published, installed on another PC, or checked against a live provider. `git diff --check` passed.

### 2026-11-03 — Leads Workspace usefulness and action repair

- Reworked the workspace into a scoped campaign/workbook summary with compact eligibility inventory; labeled search/eligibility/worksheet/sort controls; an explicit selection bar and runner-review link; and a focused contact/eligibility table with details, direct email preview and labeled row deletion. Workbook reload/download/upload and workspace deletion are grouped under Workbook tools. Import navigation uses the existing campaign creation flow. Mobile labels are full width and table overflow is explicitly explained and keyboard scrollable.
- Added read-only lead-report projection over the unchanged candidate eligibility evaluation: location/reason search, globally ordered results, scope counts and effective 50-row pagination. Empty final-page offsets recover after deletion. Numbered application/schema versions and private configuration were not changed.
- Repaired select-all/partial-selection display and off-page selection feedback without refetching on each checkbox. Excluded rows remain unselectable. Delete confirmations capture exact IDs/campaign, explain off-page effects and retained protections; server rejects stale active-campaign deletions. Successful deletions/reload clear selection because workbook row identities can change. Prepared messages/running automation still block destructive actions.
- Prevented slower lead queries from replacing newer results; failures preserve filters, pause stale rows and provide Retry. Preview requests ignore superseded responses and route changes. Fixed a shared React reconciliation failure exposed by deleting selected leads: action loading feedback now preserves button children and uses accessible busy state plus a reduced-motion-aware primitive indicator.
- `npm run check:ui` passed (typecheck, formatting, production UI build). Lead-report tests: 2 passed. Focused synthetic browser test: 1 passed, covering multi-page/partial selection, retained filters, blocked rows, direct email preview, no-send batch navigation, legacy record protections, slow-search races, retry, cancellation, bulk/individual deletion, last-page recovery, campaign guard and reload. Shared React plus send-insights/catalog regression: 10 passed. The final loading/route guard refinement was rechecked with the focused browser test and build.
- Visually inspected desktop and mobile screenshots under outputs/leads-workspace/. Tests use a temporary synthetic 55-row workbook; deletion affects only that fixture. No production workbook, mailbox, provider capture or sending was used. Server/helper syntax and git diff --check passed.

### 2026-11-03 — Leads recovery after an application update

- Reproduced the screenshot's diagnosis using read-only local metadata: the older server on port 4317 reported 2.2.0-rc.9 and returned only `total`/`leads`, while the new UI expected campaign identity, scope counts and paging metadata. Missing campaign identity was incorrectly diagnosed as a cross-window switch.
- Validate required response metadata before comparing campaign IDs. An older server now gets explicit restart-and-Retry guidance rather than a false campaign-change diagnosis. Retry refreshes workspace state; real cross-window changes refresh/reload once with a bounded retry. Polling reloads rows after campaign changes, and state refresh clears the old campaign's selected IDs, preview and page/worksheet scope. Empty campaign identity is normalized to null by the server.
- Removed the undersized reset-button variant and normalized filter-label margins and native control heights. Desktop browser geometry confirms all five controls are 39px high and share a baseline; mobile containment remains checked.
- `npm run check:ui` passed. Focused synthetic Leads Workspace browser test passed, including old-response injection, recovery after Retry, real cross-window campaign changes, cleared selections, geometry, and the previous selection/preview/deletion checks. Shared React navigation suite: 8 passed. Desktop screenshot inspected in outputs/leads-recovery/.
- During verification the local server was independently replaced with the current 0.1.0-alpha.1 build. Read-only checks confirmed the campaign ID matches current state and 50 rows are returned with required metadata. No app process was restarted or mailbox connection interrupted by this repair. No customer record was edited or message sent.
- Separate read-only browser verification against the running app also passed: 50 rendered lead rows, no campaign error, rows interactive, all five filter controls 39px high, and no browser exceptions. This verification did not operate sending or mutation controls.

### 2026-11-03 — Settings discovery, draft review and save UX

- Added field search with concern labels and direct keyboard focus into the correct tab/disclosure. Disabled wording options lead to their enabling checkbox without toggling it. Accounts are linked as the owner of mailbox sign-in and profiles. Existing fields stay mounted and six concern tabs retain their routes and keyboard behavior.
- Added global and per-tab unsaved counts, disabled no-op saves, explicit all-tab save scope, and a shared review drawer showing originally loaded values beside edits with pacing units. Access tokens and URL credentials/query values are hidden in review. Save from the drawer uses the existing action/saving feedback; discard uses the shared confirmation above the drawer. Cancel retains edits/focus; discard retains automatic appearance preferences. Unsaved configuration is protected by the native browser leave prompt.
- Configuration save applies only dirty fields to the latest known server settings; it preserves unrelated updates already observed during polling. The endpoint still has no atomic revision lock, so this does not claim complete cross-window conflict prevention. Success clears the replacement token and captures normalized saved fields; errors retain edits and use the existing field-specific validation navigation. New edits clear obsolete success feedback.
- Separated section metadata, typed draft ownership, search/review presentation and controller persistence. Draft publication is deferred until React handles controlled input events, fixing a query-reset issue caught in keyboard testing. Settings tabs participate in shared sticky-stack measurement. Clarified workbook-based eligibility and internal build history; retained recipient, signature, quota and uncertain-send safeguards.
- `npm run check:ui` passed. Focused synthetic Settings browser scenario passed: search by PC ID/hourly limit, collapsed/disabled-field focus, cross-tab drafts, credential redaction, nested discard cancel/confirm, automatically saved appearance, save rejection/retry, unrelated external setting preservation, no-op save state, and desktop/mobile containment. Shared React/navigation suite: 8 passed. Final typed section-to-component mapping refactor was typechecked and built after the browser pass.
- Visually checked desktop and mobile Settings and the mobile review drawer in outputs/settings-ux/. All writes used isolated temporary state with external sync/capture disabled; live settings and connected mailboxes were not modified. git diff --check passed.
