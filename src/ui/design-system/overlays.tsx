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
  eyebrow = 'Workspace editor',
  eyebrowId,
  closeButtonId,
  tabs,
  bodyId,
  dismissOnBackdrop = false,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  titleId?: string;
  wide?: boolean;
  eyebrow?: string;
  eyebrowId?: string;
  closeButtonId?: string;
  tabs?: ReactNode;
  bodyId?: string;
  dismissOnBackdrop?: boolean;
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
      aria-describedby={description ? `${id}Description` : undefined}
      onClick={(event) => {
        if (!dismissOnBackdrop || event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          closeDrawer(id);
      }}
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
          <span className="ui-eyebrow" id={eyebrowId}>
            {eyebrow}
          </span>
          <h2 id={titleId ?? `${id}Title`}>{title}</h2>
          {description && <p id={`${id}Description`}>{description}</p>}
        </div>
        <Button
          type="button"
          id={closeButtonId}
          variant="ghost"
          size="icon"
          aria-label={`Close ${title}`}
          onClick={() => closeDrawer(id)}
        >
          <Icon icon={X} />
        </Button>
      </header>
      <p className="ui-drawer__feedback" data-drawer-notice role="status" hidden />
      {tabs && (
        <div
          className="ui-drawer__tabs"
          onKeyDown={(event) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            const buttons = Array.from(
              event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
            );
            const index = buttons.indexOf(event.target as HTMLButtonElement);
            if (index < 0) return;
            event.preventDefault();
            const next =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? buttons.length - 1
                  : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) %
                    buttons.length;
            buttons[next]?.focus();
            buttons[next]?.click();
          }}
        >
          {tabs}
        </div>
      )}
      <div className="ui-drawer__body drawer-body" id={bodyId}>
        {children}
      </div>
      {footer && <footer className="ui-drawer__footer drawer-footer">{footer}</footer>}
    </Dialog>
  );
}
