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
      const panels = {
        status: 'replyCaptureTools',
        setup: 'replyConfigPanel',
        import: 'mailroomImportSection',
      };
      const selected = section in panels ? (section as keyof typeof panels) : 'status';
      Object.entries(panels).forEach(([key, id]) => {
        document.getElementById(id)!.hidden = key !== selected;
      });
      document
        .querySelectorAll<HTMLButtonElement>('#mailroomToolsDialog [role="tab"]')
        .forEach((tab) => {
          const active = tab.dataset.mailroomSection === selected;
          tab.setAttribute('aria-selected', String(active));
          tab.tabIndex = active ? 0 : -1;
        });
      const footer = document.querySelector<HTMLElement>('[data-mailbox-setup-footer]');
      if (footer) footer.hidden = selected !== 'setup';
      const body = document.querySelector<HTMLElement>('.mailbox-tools-body');
      if (body) body.scrollTop = 0;
    };
    const toolTabs = document.querySelector<HTMLElement>('#mailroomToolsDialog [role="tablist"]');
    if (toolTabs)
      uiScope.listen(toolTabs, 'keydown', (event) => {
        const key = (event as KeyboardEvent).key;
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
        const tabs = Array.from(toolTabs.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
        const index = tabs.indexOf(event.target as HTMLButtonElement);
        if (index < 0) return;
        event.preventDefault();
        const next =
          key === 'Home'
            ? 0
            : key === 'End'
              ? tabs.length - 1
              : (index + (key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        tabs[next]?.click();
        tabs[next]?.focus();
      });
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
    uiScope.handler($('mailroomToolsOpen'), 'onclick', () => revealSection('status'));
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
