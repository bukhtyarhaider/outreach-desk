# Frontend development guide

## Start here

`npm ci` installs locked dependencies. `npm run dev:ui` watches React/TypeScript and rebuilds the existing public assets; run the normal local server separately and reload the browser after edits. `npm run check:ui` checks strict types and formatting, then builds all three entries. `FC_BROWSER_TESTS=1 npm test` exercises actual local browser flows as well as the Node/Python suites. Browser/server checks require a runtime allowed to bind localhost and launch Chromium.

## Ownership and extension points

- `design-system/tokens.css`: canonical semantic colors, typography stack, radii, transitions and elevation. `design-system/bauhaus/{foundations,shell,surfaces}.css`: shared controls, application structure and product surface rules. Feature CSS owns feature-specific layout. Keep a product-wide style out of a page's inline styles.
- `design-system/primitives.tsx` and `icons.tsx`: native form/ref semantics and curated Lucide icons. Keep IDs on native controls so existing adapters continue to work. Label controls; decorative icons do not carry their accessible names.
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

The regression suite covers all twelve routes, retained settings/template drafts, native controls, live activity, review/recovery, conversation approval evidence and responsive layouts. New campaign checks also cover live batch context, setup navigation and legacy workbook labels. A screenshot is evidence for the shown state, not proof of all provider/customer cases or full accessibility conformance.

Manrope is bundled under `public/fonts` with its OFL license, so production needs no font CDN. The server's explicit font asset route requires restarting an already-running server after this update. Backend sending, storage formats, opt-outs, pacing and coordinator logic are unchanged.
