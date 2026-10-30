import { uiScope } from '../../shared/lifecycle';
import { element as $ } from '../../shared/dom';

export function mountMailroom() {
  (() => {
    if (!$('mailroomWorkspace')) return;
    const open = (id: string) => {
      const dialog = $<HTMLDialogElement>(id);
      if (!dialog.open) dialog.showModal();
    };
    const revealSection = (section: string) => {
      open('mailroomToolsDialog');
      const capture = $('replyCaptureTools');
      capture.open = true;
      if (section === 'setup') $('replyConfigPanel').open = true;
      const target =
        section === 'setup'
          ? $('replyConfigPanel')
          : section === 'import'
            ? document.getElementById('mailroomImportSection')
            : $('replyStatus');
      if (section === 'import' && target instanceof HTMLDetailsElement) target.open = true;
      // Let native dialog autofocus finish before moving to the requested section.
      uiScope.timeout(() => {
        if (!$<HTMLDialogElement>('mailroomToolsDialog').open) return;
        target?.querySelector<HTMLElement>('summary')?.focus({ preventScroll: true });
        const dialog = $<HTMLDialogElement>('mailroomToolsDialog');
        const heading = dialog.querySelector<HTMLElement>('.mailroom-dialog-heading');
        if (target)
          dialog.scrollTop +=
            target.getBoundingClientRect().top -
            dialog.getBoundingClientRect().top -
            (heading?.getBoundingClientRect().height ?? 64) -
            16;
      }, 0);
    };
    document.querySelectorAll<HTMLElement>('[data-mailroom-section]').forEach((button) => {
      uiScope.handler(button, 'onclick', () => revealSection(button.dataset.mailroomSection!));
    });
    document.querySelectorAll<HTMLElement>('[data-mailroom-setup]').forEach((button) => {
      uiScope.handler(button, 'onclick', () => revealSection('setup'));
    });
    const clear = document.getElementById('mailroomResetFilters');
    if (clear)
      uiScope.handler(clear, 'onclick', () => {
        $('replySearch').value = '';
        $('replyMailbox').value = '';
        $('replyCategory').value = '';
        $('replyCategory').dispatchEvent(new Event('change', { bubbles: true }));
      });
    uiScope.listen($('mailroomList'), 'keydown', (event: KeyboardEvent) => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      const rows = [...$('mailroomList').querySelectorAll<HTMLButtonElement>('[data-reply]')];
      const current = rows.findIndex((row) => row === document.activeElement);
      if (current < 0) return;
      event.preventDefault();
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? rows.length - 1
            : Math.max(
                0,
                Math.min(rows.length - 1, current + (event.key === 'ArrowDown' ? 1 : -1)),
              );
      rows[next]?.focus();
    });
    uiScope.handler($('mailroomToolsOpen'), 'onclick', () => open('mailroomToolsDialog'));
    uiScope.handler($('mailroomEmptyTools'), 'onclick', () => {
      revealSection('setup');
    });
    uiScope.handler($('mailroomFiltersOpen'), 'onclick', () => open('mailroomFiltersDialog'));
    for (const id of ['mailroomDetailsOpen', 'mailroomCarrierDetails'])
      uiScope.handler($(id), 'onclick', () => open('mailroomDetailsDialog'));
    uiScope.handler($('mailroomManageLines'), 'onclick', () => {
      open('mailroomLibraryDialog');
      document.querySelector<HTMLDetailsElement>('.reply-library')!.open = true;
    });
    uiScope.handler($('mailroomResolve'), 'onclick', () => {
      open('mailroomDetailsDialog');
      $('replyReviewNote').focus();
    });
    document.querySelectorAll<HTMLElement>('[data-close-mailroom]').forEach((b) => {
      uiScope.handler(b, 'onclick', () => $<HTMLDialogElement>(b.dataset.closeMailroom!).close());
    });
    uiScope.listen(window, 'hashchange', () => {
      if (location.hash !== '#conversations')
        document
          .querySelectorAll<HTMLDialogElement>('.mailroom-dialog[open]')
          .forEach((d) => d.close());
    });
  })();
}
