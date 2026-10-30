import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Button, Dialog } from './primitives';
import { Icon, X } from './icons';
/** Native modal semantics provide focus containment, Escape and focus restoration. Draft fields remain mounted. */
export function openDrawer(id: string) {
  const dialog = document.getElementById(id);
  if (dialog instanceof HTMLDialogElement && !dialog.open) {
    const feedback = dialog.querySelector<HTMLElement>('[data-drawer-notice]');
    if (feedback) feedback.hidden = true;
    dialog.showModal();
  }
}
export function closeDrawer(id: string) {
  const dialog = document.getElementById(id);
  if (dialog instanceof HTMLDialogElement && dialog.open) dialog.close();
}
export function Drawer({
  id,
  title,
  description,
  children,
  footer,
  titleId,
  wide = false,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  titleId?: string;
  wide?: boolean;
}) {
  useEffect(() => {
    const closeOnNavigation = () => closeDrawer(id);
    window.addEventListener('hashchange', closeOnNavigation);
    return () => window.removeEventListener('hashchange', closeOnNavigation);
  }, [id]);
  return (
    <Dialog
      id={id}
      className={`ui-drawer${wide ? ' ui-drawer--wide' : ''}`}
      aria-labelledby={titleId ?? `${id}Title`}
      onKeyDown={(event) => {
        if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey) return;
        const controls = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
          ),
        ].filter((control) => control.getBoundingClientRect().width > 0);
        const first = controls[0],
          last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first && last) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last && first) {
          event.preventDefault();
          first.focus();
        }
      }}
    >
      <header className="ui-drawer__header">
        <div>
          <p className="ui-eyebrow">Workspace editor</p>
          <h2 id={titleId ?? `${id}Title`}>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Close ${title}`}
          onClick={() => closeDrawer(id)}
        >
          <Icon icon={X} />
        </Button>
      </header>
      <p className="ui-drawer__feedback" data-drawer-notice role="status" hidden />
      <div className="ui-drawer__body">{children}</div>
      {footer && <footer className="ui-drawer__footer">{footer}</footer>}
    </Dialog>
  );
}
