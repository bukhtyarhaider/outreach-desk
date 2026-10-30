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
