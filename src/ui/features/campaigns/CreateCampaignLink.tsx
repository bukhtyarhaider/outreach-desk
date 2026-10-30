import type { ReactNode } from 'react';
/** Re-enter setup at its beginning without discarding the active campaign or unsaved fields. */
export function CreateCampaignLink({
  className = 'button primary',
  children = 'Create campaign',
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <a
      href="#campaigns"
      className={className}
      aria-label="Create campaign"
      onClick={() => document.querySelector<HTMLElement>('.app-viewport')?.scrollTo(0, 0)}
    >
      {children}
    </a>
  );
}
