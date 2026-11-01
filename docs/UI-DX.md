# Frontend development guide

## Start here

`npm ci` installs locked dependencies. `npm run dev:ui` watches React/TypeScript and rebuilds the existing public assets; run the normal local server separately and reload the browser after edits. `npm run check:ui` checks strict types and formatting, then builds all three entries. `FC_BROWSER_TESTS=1 npm test` exercises actual local browser flows as well as the Node/Python suites. Browser/server checks require a runtime allowed to bind localhost and launch Chromium.

## Ownership and extension points

- `design-system/tokens.css`: canonical semantic colors, typography stack, radii, transitions and elevation. `design-system/primitives.css`: shared control, surface, metric and overlay appearance, loaded last so feature classes cannot silently change action variants. `design-system/bauhaus/{foundations,shell,surfaces}.css`: typography, operational context and product surface rules. Feature CSS owns feature-specific layout. Keep a product-wide style out of a page's inline styles.
- `design-system/primitives.tsx`: `Button`, `ActionLink` and keyboard-accessible `ButtonLabel` share variants and sizes. Use the action's native element: button for a mutation, anchor for navigation/download, label for an associated file input. `size="item"` supports composite data-selection rows without forcing body text into action-button weight. Do not style individual action IDs or add raw `<button>` elements outside this module.
- `design-system/layout.tsx`: page/section headings, semantic status badges, metrics/groups, compact summary strips, notices and empty states. `design-system/navigation.tsx`: in-page section navigation and controlled keyboard-accessible tabs. `design-system/overlays.tsx`: named native drawer dialogs with focus cycling, Escape, route-change close, persistent footer actions and local action feedback. Profile/template fields remain mounted while closed.
- `design-system/icons.tsx`: curated Lucide icons. Keep IDs on native controls so existing adapters continue to work. For adapter-owned actions, keep mount-time disabled/hidden props stable and let `updateControls` own subsequent guards; a presentation subscription must not independently overwrite those action states. Label controls; decorative icons do not carry their accessible names. Async actions restore their original nodes so icons and nested labels survive loading/error states.
- `app/layout/Brand.tsx`: the product logo is a bundled transparent raster asset under `public/brand`, independent of editable mailbox business/sender identity. The sidebar retains active profile/email metadata.
- `app/routes.ts`: canonical typed route labels, view resolution, campaign parent navigation and legacy section aliases. `app/use-route.ts`: the React subscription to hash/history changes. `app/layout/navigation-items.ts`: typed destination/icon grouping, using the canonical route labels. `Sidebar` renders it. `routes.ts` owns stable legacy routes and section aliases; display labels can change without changing bookmarks or APIs.
- `app/layout/WorkspaceContext.tsx`: the single global owner of campaign/mailbox selectors plus connection, filename, selection, queue and allowance presentation. Its accessible disclosure keeps all native fields mounted when collapsed or disabled; never conditionally remove controller-owned fields. Do not duplicate these IDs in feature pages.
- `shared/ui-preferences.ts`: typed browser-local appearance store, independent of server/sending settings. The versioned `outreach-desk.ui-preferences.v1` key remembers context visibility and collapse separately. Defaults preserve the expanded context; invalid values fall back safely, storage denial leaves controls working in memory with a Settings notice, and other tabs receive storage changes. `features/settings/AppearanceSettings.tsx` owns the auto-saving preference UI.
- `app/layout/HeaderPattern.tsx`: decorative code-native Build 1 geometry with brand tokens and a fixed 198:82 aspect ratio. The shell reserves space beside the breadcrumb/connection badge and scales the pattern at narrower breakpoints; it never receives focus or pointer events.
- `app/layout/use-sticky-headers.ts` and `sticky-headers.css`: shared sticky title/action stack for every page. A cleaned-up `ResizeObserver` publishes the visible sticky context height and current page-header height as CSS variables on the viewport, including route, font, content, preference and breakpoint changes. Keep headers as direct `.view-page` children; do not duplicate their native actions in a separate fixed toolbar. Scroll padding and Settings section-navigation offsets use the measured stack. Desktop Unibox retains its existing fixed title/tools above independent message scrollers; narrow Unibox uses the shared sticky rule.
- `shared/workspace-store.ts`: read-only React subscription bridge. Feature controllers publish state/selection/rows through `updateControls`; components subscribe with `useWorkspace`. It does not fetch, persist or mutate business data. `workbookLabel` supports named workbooks and legacy file-only records.
- `features/campaigns/CampaignsPage.tsx`: library composition and compact inventory counts. `CampaignOverview.tsx`: searchable/filterable inventory; clicking a campaign name opens its workspace. `CreateCampaignPage.tsx`: separate workbook-based creation. `CampaignEditorPage.tsx`: local Audience, Queue settings and Source & mapping panels. `CampaignAudience.tsx`: source/count/lead preview. `controller.ts`: existing mutations, campaign switching, import-review entry and activation refresh. The old cross-page `CampaignJourney` was removed.
- `features/dashboard/DashboardPage.tsx`: overview composition. `DashboardMetrics.tsx`: audience/PC-wide stat scopes. `DashboardActions.tsx`: runner, mailbox and selected-batch controls. `DashboardActivity.tsx`: carrier attention and recent events. Feature styles own this layout instead of adding dashboard rules to generic primitives.
- Dashboard metric accents use the shared `Metric.visual` slot and shared `design-system/StatMark.tsx`. Brand geometry stays compact; ready/excluded sectors encode a clamped active-campaign share, with an accessible percentage description. Total and confirmed-send marks indicate presence rather than an invented goal; PC-wide sends never use the campaign denominator. Existing native count IDs remain owned by refresh.
- Other features retain their existing controllers, typed API DTOs and mounted forms. `FeatureRegions` still owns dynamic legacy-compatible rendering; never insert raw HTML.

The campaign audience preview follows the current Leads worksheet/filter and is labeled accordingly. Opening a campaign clears the previous batch and reloads its rows. Uploading creates a paused campaign through the existing upload flow; review, revision activation, campaign inclusion and starting the sender remain explicit separate actions. Do not turn navigation into an implicit save, activation or send.

## Adding a feature or changing a control

Use the existing feature directory, add a typed API response when needed, and compose a small view from shared primitives. Reuse existing mutations instead of adding a second owner for the same state transition. Resource owners must dispose requests, event handlers, timers and portals on teardown. Keep uncontrolled drafts mounted across navigation/polling unless a workflow explicitly resets them.

Preserve the ID contract in `tests/fixtures/ui-contract.json` or intentionally migrate the owning controller and meaningful tests together. Update `shared/dom-elements.ts` when adding typed controller IDs. Avoid `any`, disabled type checks, HTML injection, broad type assertions and feature-specific globals.

## Visual and behavioral acceptance

Check populated, empty, loading, disconnected, protected, error and disabled states. Exercise long mailbox/file names, selection persistence, switching campaigns and sidebar links. Verify keyboard focus and modal escape/close behavior. Read the page at desktop, tablet and mobile sizes; check inner content overflow as well as the document width. Keep data-table scrolling local.

The regression suite covers all fifteen views, retained settings/template drafts, native controls, live activity, review/recovery, conversation approval evidence and responsive layouts. New campaign checks also cover live batch context, separate creation/editing entry, local tab history, first-viewport stats/actions, long campaign names, safe workbook creation and legacy workbook labels. A screenshot is evidence for the shown state, not proof of all provider/customer cases or full accessibility conformance.

Manrope is bundled under `public/fonts` with its OFL license, so production needs no font CDN. The server's explicit font and PNG brand asset routes require restarting an already-running server after this update. Backend sending, storage formats, opt-outs, pacing and coordinator logic are unchanged.

## Accounts, settings and editor boundaries

Accounts (`#accounts`) owns profile inventory and the profile drawer. Settings (`#settings`) presents sending rules, sync/coordination and app information with section navigation. The global mailbox selector changes the active profile; the dashboard connects that mailbox. These are separate actions, not duplicate profile forms. Existing settings/profile adapters and API payloads remain compatible; profile business fields are saved only by Save mailbox profile, so an unsaved profile draft cannot leak into Save sending settings.

Templates presents a searchable library. New/Edit opens the shared wide drawer with the live preview and persistent save/delete actions. Closing a drawer retains its current fields; explicitly selecting another template/profile or starting a new item follows the existing form-reset behavior. Native fields and controller IDs are not duplicated for drawer rendering. Local feedback stays inside an open modal because the background toast is inert.

Dashboard composition keeps statistics above the runner/mailbox row, followed by carrier attention, manual batch and recent activity. The library owns campaign inventory. Audience counts follow the active campaign; confirmed sends follow all campaign history recorded on this PC, matching the existing endpoint. Unread carrier alerts use the existing conversation dashboard endpoint and unread queue, and disappear through the existing read-state workflow. Secondary Unibox queue shortcuts expose their active queue label. Narrow Unibox layouts retain a minimum reading area and scroll the global context away before the inbox; width checks alone are insufficient for this layout.

## Navigation purposes

| Entry | Purpose | Mutation boundary |
| --- | --- | --- |
| `#dashboard` / `#outreachRunner` | Statistics and execution controls | Sending starts only through the explicit existing controls |
| `#campaigns` | Find/filter existing campaigns | Inventory navigation does not change a campaign |
| `#campaign-new` | Import a separate campaign | Only choosing/uploading a workbook creates a new paused, review-required record |
| `#campaign-edit` | Inspect the selected audience | Opens the active campaign; selecting a different campaign uses the shared switch helper |
| `#campaignReview` | Queue settings tab | Only Save campaign settings persists edits |
| `#campaignSource` | Read-only source/mapping tab | Mapping changes and revision activation belong to Import Review |
| `#imports` | Guided mapping, immutable revisions and repair | Existing reviewed save/activation/restore checks remain explicit |
| `#templates`, `#accounts`, `#settings` | Shared libraries and workspace configuration | Their own explicit saves; these pages are not campaign tabs |

The three editor panels remain mounted when tabs change. Browser Back/Forward and arrow/Home/End keys update the selected tab. The sidebar keeps Campaigns active for its create/edit children; breadcrumbs use the same route-label map. Opening the already-active campaign does not call the switch API or clear the selected batch/drafts. Changing to another campaign retains the existing cleanup behavior. Tests follow actual entry controls for all fifteen views and exercise creation with a synthetic workbook.

All full metric cards reuse `design-system/StatMark.tsx` and its semantic variants. Legacy history/catalog/import/mailbox regions use `StatValue.tsx`; declarative Metric groups use the visual slot. Only supply a denominator for a real share in the same scope. Timings and independent counts indicate presence without inventing a completion target. Keep compact summary strips and operational status controls compact.

Unibox composition, setup/filter modules, native controller ownership, keyboard navigation and save feedback are documented in `UNIBOX-UX.md`. All original fields remain mounted across page and dialog navigation.

Dashboard operational panels reuse `features/dashboard/DashboardPanelHeader.tsx` for icon, title, scope and current state. Runner/mailbox and carrier/batch rows share panel geometry and footer alignment. Remaining allowances come from the read-only workspace snapshot; native runner/progress/connection/batch controls retain controller ownership. Carrier highlights are composed in the conversation assistant adapter so read/review actions keep their existing request/version guards.

Email Tracking uses `features/tracking/workspace.css` for overview/record density and responsive filters. Metrics stay mounted above the message table; evidence interpretation and raw worker diagnostics use native disclosures. Existing seed/domain aliases retain their routes; Messages/monitoring shortcuts scroll within the current page. `loadTracking` coalesces refresh requests so the latest filter selection is replayed after an in-flight load, with scoped lifecycle cleanup, local status and aria-busy feedback. Quick-filter pressed states derive from actual filter values.

### Tracking sticky navigation and sync feedback

`useStickyHeaders` measures the active page header, workspace context and Tracking section navigation. The section links pin beneath the page header; the scroll container's anchor inset includes the entire measured stack, including wrapped mobile links. Other routes receive zero Tracking navigation height. Keep these elements observed when changing their responsive layout.

`FirebaseSyncStatus` is a read-only workspace-store subscriber. Native feature controllers own sync actions and API failure handling; the status component does not create another polling or mutation path. Firebase diagnostics expose optional retry/phase fields for compatibility with existing fixtures.

### Confirmation and save overlays

Use `confirmAction(message, options)` from `shared/confirmation` for destructive changes and replacing unsaved text. Always await its boolean result before mutating anything. It renders shared Button/Dialog primitives in the native top layer above the active drawer. Cancel receives initial focus; Escape cancels only the confirmation, focus returns to the opener, and a closed/removed parent, navigation or UI disposal cancels an unanswered decision. Concurrent decisions are rejected rather than queued against stale state. Messages render as React text, never HTML.

The shared `action` adapter asks before saving edited profiles, templates and campaign details, and wraps identified save/delete/reset operations with `withSaveFeedback`. The pending overlay cannot be dismissed as if a write had been canceled: it closes when the actual operation settles. Errors return through existing in-drawer feedback and retain inputs. Existing specialized mailbox/reply workflows keep their inline progress and exact approval safeguards. Do not add redundant success acknowledgements to ordinary saves or replace provider-native security prompts.

Native confirmation call sites were migrated across campaigns, leads, profiles, templates, suppression, import activation/restore, activity-log clearing, reset overrides and reply-wording replacement. Drawer fields remain mounted; overlay decisions never authorize sending emails or clear existing backend protections.

### Tracking tabs

`TrackingTabs` owns only tab presentation and hash-based selection. Messages (`#tracking`, with `#trackingMessages` as an alias), Seed Studio, Domain Health and Mailbox monitoring (`#trackingDiagnostics`) each have one accessible tab panel. Panels remain mounted and are hidden rather than recreated, retaining native controller regions, filters and unfinished input. Arrow keys, Home/End and roving tab focus are supported. Hash listeners clean up on unmount; reload and browser history resolve the active section normally.

Tracking navigation starts at the workspace top instead of scrolling to an old section anchor. Re-selecting a tab also restores the top, keeping message metrics visible rather than behind the sticky stack. The existing measured sticky tab bar and native action owners remain intact.

### Step-based import setup

Import review is five separate, mounted views: Source, Columns, Preview, Save copy and Activate. `ImportJourney` is a navigable stepper, not a passive progress illustration. The controller owns the current `ImportStep`, prerequisites and completion evidence; `data-import-step` selects the visible view without destroying native form fields or portal targets. Future views stay disabled until their data exists, while saved revisions remain available for recovery independently of a new preview.

User navigation validates prerequisites and restores focus to the live stepper button. Successful preview/save actions advance to their relevant view and focus its heading. Back/forward step buttons preserve drafts; edits to mapping invalidate Preview/Save and return to Columns. A mobile scroll rail centers the active step, including after resize, with listener cleanup through UIScope. Status/errors live outside individual views so hidden panels cannot hide feedback.

Source inspection retains its original report when a proposed mapping is previewed. `ImportPreviewSummary` alone presents proposed column and parsing changes. Source evidence, mapping decisions, preview evaluation, provenance capture, and activation each have their own screen and instructions. The activation view separates its primary selection/action from collapsible download/edit/recovery tools and saved-record inspection. Its leads shortcut uses the shared campaign-selection function so the correct campaign is opened.

All original IDs, request/validation paths, separate save/activation semantics, revision downloads, undo, original workbook retention and contact protections remain intact. Standalone experiment layouts continue using their existing flow. No server-issued preview or activation tokens are inferred by the stepper.

### Settings tabs and save scope

Settings now has six mounted concerns: Sending pace, Eligibility & checks, Firebase sync, Team coordination, Appearance and About. Each concern has a feature component; pacing presets, timing/limit fields and recovery are further separated into cards. `SettingsTabs` supports deep links, history, roving keyboard selection and a resize-aware scroll rail. Hidden panels retain uncontrolled native fields and their controller-owned guards.

The existing configuration save remains atomic across sending, eligibility/checks, Firebase and team fields. The header states that scope and keeps the action available in those four tabs. Appearance persists browser preferences immediately and About has no write action; both hide the global save button. Tab switches never save configuration automatically. Firebase diagnostics retain effective PC/source, database, credentials-source-only information, data paths, counters and warnings; team configuration stays separate from open-event sync.

`save-feedback` exposes save status outside hidden panels. Recognized validation failures reveal the relevant tab and mark the affected field while preserving edits. The coordinator token clears only after the settings request succeeds. Accounts/profile business settings remain owned by their separate editor.

### Sending pace control board

`SendingSettings` groups editable pacing into timing, rolling volume and rest-cycle cards with shared inputs/buttons and semantic brand accents. The static send/wait/repeat/rest diagram explains the schedule; it is not live activity or a delivery forecast. `PaceField` retains existing IDs and seconds-based storage, with visible units and server-aligned bounds.

Presets are optional disclosure content and apply only through their explicit buttons. Their numeric values and controller matching behavior are unchanged; application changes the draft, not saved settings. Empty-queue polling is a separate disclosure, and recovery retains the original wait status and confirmation guard. Settings validation expands any ancestor disclosures before revealing an invalid field.

### Live activity workspace

`LiveActivityPage` separates current runner/mailbox/allowance status from captured event counts and the event stream. Feature-scoped styles reuse product surfaces, shared Button/Input/Panel primitives and semantic red/blue/yellow accents. Export and clear controls sit with the log they affect; exported logs retain the existing server scope.

The controller owns the mounted controls. Pausing captures a feed snapshot while polling continues to update telemetry and collect new events. Search, category selection and visual/terminal views operate on that snapshot; resume reveals collected events. Search includes message, category, company and email metadata. Category tabs support arrows and Home/End; view and pause buttons expose pressed states. Paused viewing does not force-scroll. Clearing retains the existing screen-only/server-history confirmation behavior.
