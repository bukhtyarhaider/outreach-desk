import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Button, Dialog } from '../design-system/primitives';
import { uiScope } from './lifecycle';

export interface ConfirmationOptions {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}
let active = false;

/** Native top-layer dialog works above an existing modal drawer without closing it.
 * Never queue decisions: a second request may refer to stale operational state. */
export function confirmAction(
  message: string,
  options: ConfirmationOptions = {},
): Promise<boolean> {
  if (active || uiScope.signal.aborted) return Promise.resolve(false);
  active = true;
  const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const parent =
    opener?.closest('dialog[open]') ??
    [...document.querySelectorAll<HTMLDialogElement>('dialog[open]')]
      .filter((node) => node.matches(':modal'))
      .at(-1);
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const destructive =
    options.destructive ?? /delete|permanently|remove .*Do Not Contact|hard reset/i.test(message);
  const title =
    options.title ||
    (/hard reset/i.test(message)
      ? 'Reset mailbox counters?'
      : /Do Not Contact/i.test(message)
        ? 'Remove contact protection?'
        : /delete/i.test(message)
          ? /template/i.test(message)
            ? 'Delete template?'
            : /mailbox profile/i.test(message)
              ? 'Delete mailbox profile?'
              : /workspace/i.test(message)
                ? 'Delete workspace?'
                : 'Delete selected leads?'
          : 'Continue with this change?');
  return new Promise((resolve) => {
    let finished = false;
    let dialog: HTMLDialogElement | null = null;
    const signal = uiScope.signal;
    const observer = new MutationObserver(() => {
      if (parent && (!parent.isConnected || !parent.hasAttribute('open'))) finish(false);
    });
    const finish = (accepted: boolean) => {
      if (finished) return;
      finished = true;
      observer.disconnect();
      signal.removeEventListener('abort', abort);
      window.removeEventListener('hashchange', abort);
      dialog?.close();
      root.unmount();
      container.remove();
      active = false;
      if (
        opener?.isConnected &&
        !opener.closest('[hidden]') &&
        (!parent || parent.hasAttribute('open'))
      )
        opener.focus();
      resolve(accepted);
    };
    const abort = () => finish(false);
    signal.addEventListener('abort', abort, { once: true });
    window.addEventListener('hashchange', abort, { once: true });
    if (parent) {
      observer.observe(parent, { attributes: true, attributeFilter: ['open'] });
      observer.observe(document.body, { childList: true, subtree: true });
    }
    flushSync(() =>
      root.render(
        <Dialog
          ref={(node) => {
            dialog = node;
          }}
          className="ui-confirmation"
          aria-labelledby="confirmationTitle"
          aria-describedby="confirmationDescription"
          onCancel={(event) => {
            event.preventDefault();
            event.stopPropagation();
            finish(false);
          }}
          onClose={() => finish(false)}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <p className="page-eyebrow">{destructive ? 'Review this action' : 'Confirm changes'}</p>
          <h2 id="confirmationTitle">{title}</h2>
          <p id="confirmationDescription">{message}</p>
          <footer className="ui-confirmation-actions">
            <Button autoFocus onClick={() => finish(false)}>
              {options.cancelLabel || 'Cancel'}
            </Button>
            <Button variant={destructive ? 'danger' : 'primary'} onClick={() => finish(true)}>
              {options.confirmLabel ||
                (destructive
                  ? /delete/i.test(message)
                    ? 'Confirm deletion'
                    : 'Confirm action'
                  : 'Confirm changes')}
            </Button>
          </footer>
        </Dialog>,
      ),
    );
    try {
      dialog!.showModal();
    } catch {
      finish(false);
    }
  });
}

/** Blocking feedback for writes. No timer ever claims a save succeeded. */
export async function withSaveFeedback<T>(
  task: () => T | Promise<T>,
  title = 'Saving changes',
): Promise<T> {
  if (active) return await task();
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  let dialog: HTMLDialogElement | null = null;
  flushSync(() =>
    root.render(
      <Dialog
        ref={(node) => {
          dialog = node;
        }}
        className="ui-confirmation ui-save-feedback"
        aria-label={title}
        aria-busy="true"
        onCancel={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <div className="ui-save-mark" aria-hidden="true" />
        <h2>{title}</h2>
        <p role="status">Please wait while this action completes. Keep this window open.</p>
      </Dialog>,
    ),
  );
  try {
    dialog!.showModal();
    return await task();
  } finally {
    container.querySelector('dialog')?.close();
    root.unmount();
    container.remove();
  }
}
