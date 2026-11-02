# Outreach Desk versioning

Outreach Desk is under internal testing. No public release has been made. The current baseline is **0.1.0-alpha.1**. This starts a clearer numbering scheme; it is not the first-ever implementation or a reset of application data.

## What to use now

Use `0.1.0-alpha.1`, then `0.1.0-alpha.2`, `0.1.0-alpha.3`, and so on for distinct packaged internal test builds. You do not need to change the number for every code edit or commit. Increase it when handing testers a new identifiable package. Record the tested Git commit in validation notes so work between packages remains traceable. Never distribute different package contents under an already distributed build number.

`0` means initial development; `0.1.0` is the base development version; `alpha.N` identifies the internal testing iteration. These are application labels, independent of database, workbook, tracking, or protocol schema versions. A lower package number than an old internal label does not mean restore old data or rerun migrations.

## Later stages

| Stage | Example | Use when |
| --- | --- | --- |
| Internal alpha | `0.1.0-alpha.2` | Features, UI and workflows are still changing during internal testing. |
| Beta | `0.1.0-beta.1` | Core scope is settled and broader, authorized acceptance testing is useful. |
| Release candidate | `1.0.0-rc.1` | You intend this exact candidate to become the first public release if final checks pass. |
| First public release | `1.0.0` | You deliberately approve and publish the supported first release. |
| Public bug fix | `1.0.1` | Backward-compatible fixes after 1.0.0. |
| Public feature update | `1.1.0` | Backward-compatible features after 1.0.0. |
| Public breaking update | `2.0.0` | Incompatible changes requiring an explicit migration plan. |

This is our project convention, using [Semantic Versioning](https://semver.org/). SemVer defines `0.y.z` as initial development and supports prerelease suffixes; the alpha/beta readiness criteria above are our own workflow. A version number does not prove safety, provider acceptance, or production readiness.

## Earlier history

Original package labels `1.0.0`, `2.0.0`, `2.1.0`, and `2.2.0-rc.1` through `2.2.0-rc.9` were used during internal development. They were previously described incorrectly as stable/public releases or release candidates. The catalog and changelog now classify them as internal checkpoints and retain the original labels only for source/backup traceability. Do not rename old ZIPs or rewrite existing Git tags to pretend these packages used alpha numbering. They are outside the new numbering sequence.

Dated milestones identify changes that did not receive their own package version. They are not new published builds. Previous validation logs and historical package filenames remain evidence of what was actually tested at the time, not claims of public release.

## Preparing the next internal package

1. Complete the intended changes and focused checks; keep the app stopped when backing up its private state.
2. Run `npm version prerelease --preid=alpha --no-git-tag-version` from an alpha build. This updates package.json and both root package-lock.json version fields without creating a tag or commit. For a new stage, explicitly set the intended version using the same `--no-git-tag-version` option.
3. Add a `kind: 'build'` entry matching that exact version in `src/release-catalog.mjs`. Keep stable entry IDs, dates, change details and evidence. For unnumbered work, add a `kind: 'milestone'` entry without inventing a version.
4. Update this guide's current baseline and README/changelog package references, rebuild with `npm run check:ui`, run relevant tests, and record results in VALIDATION.md. Check installed-build identity through `/api/state` and `/api/catalog`.
5. Run `npm run bundle`. The filename reads package.json automatically, e.g. `Outreach-Desk-0.1.0-alpha.2.zip`. This packages an internal test build; it does not publish, install, or update any other PC.
6. Commit the source and record the commit with the package/validation notes. Install each test PC separately, preserving its own `.env`, data, browser profiles and team-data if applicable. Verify the sidebar and catalog after restart/reload.

`src/app-version.mjs` reads package.json once at startup and derives the visible stage. The server, catalog, sidebar, exports, and ZIP filename share that application version. Restart the server after changing it. Keep data-schema version numbers untouched unless a separate, tested schema migration requires a change.
