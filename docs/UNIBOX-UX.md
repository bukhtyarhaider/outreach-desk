# Unibox interaction ownership

Unibox shares the Bauhaus shell, Lucide icons and Button primitives. `ConversationsPage.tsx` composes the inbox and reader; `ConversationFiltersDialog.tsx` and `MailboxToolsDialog.tsx` keep their native controller fields mounted. `refinement.css` owns mail-specific density, responsive panes and dialog layout. Use shared Button sizes rather than overriding their typography or variants.

`mailroom.ts` owns UI-only section shortcuts, clear-filter behavior and list keyboard movement. Setup/import shortcuts expand the existing native sections and wait for dialog autofocus before revealing their target. Section callbacks belong to the UI lifecycle. Arrow keys/Home/End move focus among conversation rows; Enter retains the native button action. Clear filters removes search, mailbox and category constraints while retaining the current work queue.

`controller.tsx` retains fetching, polling, grouping, selection and evidence ownership. Returning to the inbox remembers review drafts but clears the visible row selection and restores list focus. Reopening the conversation uses existing draft restoration. The filter badge counts only the fields cleared by the shortcut.

`capture.tsx` retains read-only authorization, environment-variable credential references, scan cursors and save semantics. The configuration fieldset locks during a save and unlocks in finally; inline feedback announces processing/success/errors. Closing a dialog does not submit configuration. The global notice remains compatible with existing flows.

Approval still binds the exact draft and source context. It prepares a copy/native-mailbox handoff; the operator sends in the existing mailbox. Opt-outs, uncertain matches, missing evidence, concurrent changes and stale approvals retain their existing guards. No provider connection or message sending is performed by the UI refinement.
