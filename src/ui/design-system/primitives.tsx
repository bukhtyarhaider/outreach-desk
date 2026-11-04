import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';
import { cx } from '../shared/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
export type ControlSize = 'sm' | 'md' | 'lg' | 'icon' | 'item';
function controlClass(className: string | undefined, variant?: ButtonVariant, size?: ControlSize) {
  const legacy = className?.split(/\s+/) ?? [];
  const variants: readonly ButtonVariant[] = ['primary', 'danger', 'success', 'ghost'];
  const resolved =
    variant ??
    (legacy.includes('primary-btn')
      ? 'primary'
      : variants.find((value) => legacy.includes(value))) ??
    'secondary';
  const resolvedSize =
    size ??
    (legacy.some((value) => ['copy-mini-btn', 'drawer-close'].includes(value))
      ? 'icon'
      : legacy.includes('token-chip')
        ? 'sm'
        : 'md');
  return cx(
    'ui-button',
    `ui-button--${resolved}`,
    `ui-button--${resolvedSize}`,
    resolved,
    className,
  );
}
/** All actions share variants, sizing and focus states while retaining their native semantics. */
export const Button = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<'button'> & { variant?: ButtonVariant; size?: ControlSize }
>(({ variant, size, className, ...props }, ref) => (
  <button ref={ref} className={controlClass(className, variant, size)} {...props} />
));
Button.displayName = 'Button';
export const ActionLink = forwardRef<
  HTMLAnchorElement,
  ComponentPropsWithoutRef<'a'> & { variant?: ButtonVariant; size?: ControlSize }
>(({ variant, size, className, ...props }, ref) => (
  <a ref={ref} className={controlClass(className, variant, size)} {...props} />
));
ActionLink.displayName = 'ActionLink';
export const ButtonLabel = forwardRef<
  HTMLLabelElement,
  ComponentPropsWithoutRef<'label'> & { variant?: ButtonVariant; size?: ControlSize }
>(({ variant, size, className, onKeyDown, ...props }, ref) => (
  <label
    ref={ref}
    {...props}
    role="button"
    tabIndex={0}
    className={controlClass(className, variant, size)}
    onKeyDown={(event) => {
      onKeyDown?.(event);
      if (props['aria-disabled'] === true || props['aria-disabled'] === 'true') {
        event.preventDefault();
        return;
      }
      if (!event.defaultPrevented && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        if (props.htmlFor) document.getElementById(props.htmlFor)?.click();
      }
    }}
  />
));
ButtonLabel.displayName = 'ButtonLabel';
export const Input = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<'input'>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cx('ui-input', className)} {...props} />
  ),
);
Input.displayName = 'Input';
export const Textarea = forwardRef<HTMLTextAreaElement, ComponentPropsWithoutRef<'textarea'>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cx('ui-textarea', className)} {...props} />
  ),
);
Textarea.displayName = 'Textarea';
export const Select = forwardRef<HTMLSelectElement, ComponentPropsWithoutRef<'select'>>(
  ({ className, ...props }, ref) => (
    <select ref={ref} className={cx('ui-select', className)} {...props} />
  ),
);
Select.displayName = 'Select';
export const Dialog = forwardRef<HTMLDialogElement, ComponentPropsWithoutRef<'dialog'>>(
  ({ className, ...props }, ref) => (
    <dialog ref={ref} className={cx('ui-dialog', className)} {...props} />
  ),
);
Dialog.displayName = 'Dialog';
export const Progress = forwardRef<HTMLProgressElement, ComponentPropsWithoutRef<'progress'>>(
  (props, ref) => <progress ref={ref} {...props} />,
);
Progress.displayName = 'Progress';
export function Panel({
  as: Component = 'section',
  className,
  ...props
}: ComponentPropsWithoutRef<'section'> & { as?: 'section' | 'div' }) {
  return <Component className={cx('panel', 'ui-surface', className)} {...props} />;
}
export function Badge({ className, ...props }: ComponentPropsWithoutRef<'span'>) {
  return <span className={cx('status-pill', className)} {...props} />;
}
