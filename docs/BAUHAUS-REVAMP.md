# Bauhaus SaaS revamp

Branch: `feat/bauhaus-saas-ui-revamp`, based on `f5bc8c1`.
Status: first visual direction selected and implemented with persistent operational context and modular React/TypeScript ownership.

## Product brief

Rethink Outreach Desk as a campaign-centered sales workspace. Expressive geometric typography and restrained primary-color geometry establish the brand. Dense working surfaces prioritize hierarchy, readable data, conventional controls and efficient keyboard/pointer interaction. Retain React, strict TypeScript, Lucide and existing data/API behavior. No backend or saved-data migration is part of this design work.

Campaign creation is the primary entry point: import workbook, review mapping and eligibility, select existing message templates and mailbox, review pacing/settings, and explicitly activate reviewed data and start outreach. These stages organize existing capabilities; they do not imply backend support for independent per-campaign schedules or pacing. Keep actual mailbox/global scope explicit. Import activation must remain distinct from starting the sending queue. Unsaved work and selections survive navigation and polling.

## Priority deliverables

1. Application shell: Campaigns, Leads, Unibox and Reports as primary destinations; persistent mailbox/queue health, global Create campaign action, contextual breadcrumbs. Secondary navigation retains every existing operational tool. Avoid using geometry as an ambiguous control.
2. Dashboard: campaign overview and creation entry; actionable review/recovery/needs-reply states; accurate current queue state. Never label image requests as proof of a human read, or webmail submission as inbox delivery.
3. Leads table: clear column hierarchy, fixed selection/action conventions, filters and pagination, bulk-action bar, source/protection evidence, details drawer, local horizontal scrolling and mobile inspection.
4. Campaign editor: staged source/mapping review, audience inspection, template preview, mailbox/pacing review and explicit activation/launch controls. Advanced JSON stays available without dominating the normal path.
5. Unibox: the existing carrier-wide conversation workspace, renamed for navigation. Queues, mailbox/search controls, list-reader split, reply draft, evidence/details and review/approval remain available. Do not invent a new automatic send transport.
6. Accounts: existing mailbox profiles, connection/capture consent and browser restoration.
7. Analytics: existing send history, filtering, exports and tracking signals with accurate evidence labels.
8. Settings: sending allowances, template checks, eligibility, Firebase/PC diagnostics, shared coordination and recovery.

## Feature continuity map

| Current surface | New home / retained needs |
| --- | --- |
| Dashboard | Overview; queue controls, selected batch, mailbox connection, carrier activity |
| Leads | Leads and campaign audience; import/export, reload, safe deletion, selection, pagination, preview, compose/recovery |
| Campaigns | Campaign list/editor; workbook scopes, included sheets, naming and enabled state |
| Import review | Campaign source stage and advanced recovery; guided mapping, immutable revisions, activation, Undo, provenance |
| Conversations | Unibox; carrier history, Inbox/Sent, queue filters, follow-up states, drafts, approved reply/copy workflow, capture setup and evidence |
| Templates | Campaign message stage plus shared Templates library; variants, weights, required tokens, checks, preview, import/export |
| Live activity | Operations; event categories/search, readable records, pause, visual/terminal, clearing and exports |
| Send history | Reports; outcomes, manual uncertainty review, inspectors, filters and exports |
| Tracking | Reports/Deliverability; image-request evidence, DSN diagnostics, manual placement, seed tests and DNS inspection |
| Suppression | Do Not Contact; add/remove, protected recipients and shared synchronization |
| Release catalog | Help/System; release entries and editable local notes |
| Mailbox/settings | Accounts and Settings; all current profiles, pacing, checks, eligibility, PC/Firebase diagnostics and coordinator controls |

Account management means current mailbox profiles, not new billing/subscriptions or user authentication. Unibox means current conversations, not unsupported email providers or real-time server delivery. Keep shared coordination settings without introducing a new team collaboration product. No speculative features are required.

## Visual exploration

Three independent campaign-editor concepts at 1440 × 1024 will establish the shell, typographic scale, primary action, staged workflow, data treatment and geometry. Use synthetic logistics data, anchored to 2026-10-30. Existing sample app screenshots ground capabilities, not the old dark aesthetic. Candidate directions: an editorial warm-paper workshop; a compact cobalt operations desk; a spacious graphic grid with horizontal navigation.

## Implementation and verification after selection

Build shared tokens and accessible primitives first, then the five priority surfaces, then Accounts, Reports and Settings and all mapped secondary tools. Preserve current routes or explicit aliases, native control semantics, API contracts, resource teardown, draft retention, protection/recovery rules and source evidence. Validate populated/empty/loading/error/disabled states, long labels and metadata, keyboard focus, responsive layouts and actual visual output. Use the existing full regression baseline plus meaningful checks for the redesigned interactions. No deployment or real sending is implied.

## Implementation notes

Campaign creation is available from the shell and dashboard. The editor foregrounds importing/reviewing the audience and continuing to messages; the existing campaign-scope controls remain available in its review section. The dashboard includes the real campaign inventory. The shared journey links the existing reviewed import, template, mailbox and review workflows; it does not fabricate isolated campaign-specific scheduling or saved drafts. Unibox is the current carrier conversation implementation with the new visual language and its existing evidence, review and capture controls. Send history and Email Tracking retain explicit separate navigation labels to keep both available. Accounts remain in Mailbox & Settings and the global mailbox switcher.

The user's approved extension to the concept keeps campaign/mailbox switching, connection status, selected batch, workbook, queue and allowances visible. Desktop uses a persistent context bar; narrow screens stack its fields and retain connection/file text. Customer brand/monogram remains available rather than replacing it with the exploratory mock logo. See UI-DX.md for ownership and extension rules.
