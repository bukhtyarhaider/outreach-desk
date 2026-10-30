# Frontend development guide

## Start here

`npm ci` installs locked dependencies. `npm run dev:ui` watches React/TypeScript and rebuilds the existing public assets; run the normal local server separately and reload the browser after edits. `npm run check:ui` checks strict types and formatting, then builds all three entries. `FC_BROWSER_TESTS=1 npm test` exercises actual local browser flows as well as the Node/Python suites. Browser/server checks require a runtime allowed to bind localhost and launch Chromium.

## Ownership and extension points

- `design-system/tokens.css`: canonical semantic colors, typography stack, radii, transitions and elevation. `design-system/primitives.css`: shared control, surface, metric and overlay appearance, loaded last so feature classes cannot silently change action variants. `design-system/bauhaus/{foundations,shell,surfaces}.css`: typography, operational context and product surface rules. Feature CSS owns feature-specific layout. Keep a product-wide style out of a page's inline styles.
- `design-system/primitives.tsx`: `Button`, `ActionLink` and keyboard-accessible `ButtonLabel` share variants and sizes. Use the action's native element: button for a mutation, anchor for navigation/download, label for an associated file input. `size="item"` supports composite data-selection rows without forcing body text into action-button weight. Do not style individual action IDs or add raw `<button>` elements outside this module.
- `design-system/layout.tsx`: page/section headings, semantic status badges, metrics/groups, notices and empty states. `design-system/navigation.tsx`: in-page section navigation. `design-system/overlays.tsx`: named native drawer dialogs with focus cycling, Escape, route-change close, persistent footer actions and local action feedback. Profile/template fields remain mounted while closed.
- `design-system/icons.tsx`: curated Lucide icons. Keep IDs on native controls so existing adapters continue to work. Label controls; decorative icons do not carry their accessible names. Async actions restore their original nodes so icons and nested labels survive loading/error states.
- `app/layout/Brand.tsx`: the product logo is a bundled transparent raster asset under `public/brand`, independent of editable mailbox business/sender identity. The sidebar retains active profile/email metadata.
- `app/layout/navigation-items.ts`: typed route/icon/label configuration. `Sidebar` renders it. `routes.ts` owns stable legacy routes and section aliases; display labels can change without changing bookmarks or APIs.
- `app/layout/WorkspaceContext.tsx`: the single global owner of campaign/mailbox selectors plus connection, filename, selection, queue and allowance presentation. Do not duplicate these IDs in feature pages.
- `shared/workspace-store.ts`: read-only React subscription bridge. Feature controllers publish state/selection/rows through `updateControls`; components subscribe with `useWorkspace`. It does not fetch, persist or mutate business data. `workbookLabel` supports named workbooks and legacy file-only records.
- `features/campaigns/CampaignOverview.tsx`: dashboard campaign inventory. `CampaignAudience.tsx`: source, count and read-only lead preview. `CampaignJourney.tsx`: shared setup navigation, including review deep link. `CampaignsPage.tsx`: editor composition and existing native campaign fields. `controller.ts`: existing APIs and the shared campaign-switching mutation/cleanup/refresh sequence.
- Other features retain their existing controllers, typed API DTOs and mounted forms. `FeatureRegions` still owns dynamic legacy-compatible rendering; never insert raw HTML.

The campaign audience preview follows the current Leads worksheet/filter and is labeled accordingly. Opening a campaign clears the previous batch and reloads its rows. Uploading creates a paused campaign through the existing upload flow; review, revision activation, campaign inclusion and starting the sender remain explicit separate actions. Do not turn navigation into an implicit save, activation or send.

## Adding a feature or changing a control

Use the existing feature directory, add a typed API response when needed, and compose a small view from shared primitives. Reuse existing mutations instead of adding a second owner for the same state transition. Resource owners must dispose requests, event handlers, timers and portals on teardown. Keep uncontrolled drafts mounted across navigation/polling unless a workflow explicitly resets them.

Preserve the ID contract in `tests/fixtures/ui-contract.json` or intentionally migrate the owning controller and meaningful tests together. Update `shared/dom-elements.ts` when adding typed controller IDs. Avoid `any`, disabled type checks, HTML injection, broad type assertions and feature-specific globals.

## Visual and behavioral acceptance

Check populated, empty, loading, disconnected, protected, error and disabled states. Exercise long mailbox/file names, selection persistence, switching campaigns and sidebar links. Verify keyboard focus and modal escape/close behavior. Read the page at desktop, tablet and mobile sizes; check inner content overflow as well as the document width. Keep data-table scrolling local.

The regression suite covers all thirteen routes, retained settings/template drafts, native controls, live activity, review/recovery, conversation approval evidence and responsive layouts. New campaign checks also cover live batch context, setup navigation and legacy workbook labels. A screenshot is evidence for the shown state, not proof of all provider/customer cases or full accessibility conformance.

Manrope is bundled under `public/fonts` with its OFL license, so production needs no font CDN. The server's explicit font and PNG brand asset routes require restarting an already-running server after this update. Backend sending, storage formats, opt-outs, pacing and coordinator logic are unchanged.

## Accounts, settings and editor boundaries

Accounts (`#accounts`) owns profile inventory and the profile drawer. Settings (`#settings`) presents sending rules, sync/coordination and app information with section navigation. The global mailbox selector changes the active profile; the dashboard connects that mailbox. These are separate actions, not duplicate profile forms. Existing settings/profile adapters and API payloads remain compatible; profile business fields are saved only by Save mailbox profile, so an unsaved profile draft cannot leak into Save sending settings.

Templates presents a searchable library. New/Edit opens the shared wide drawer with the live preview and persistent save/delete actions. Closing a drawer retains its current fields; explicitly selecting another template/profile or starting a new item follows the existing form-reset behavior. Native fields and controller IDs are not duplicated for drawer rendering. Local feedback stays inside an open modal because the background toast is inert.

Dashboard composition separates mailbox connection, outreach runner, carrier attention, campaign metrics/inventory, manual batch and recent activity. Unread carrier alerts use the existing conversation dashboard endpoint and unread queue, and disappear through the existing read-state workflow. Secondary Unibox queue shortcuts expose their active queue label. Narrow Unibox layouts retain a minimum reading area and scroll the global context away before the inbox; width checks alone are insufficient for this layout.
