import { ActionLink } from '../../design-system/primitives';
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
    <ActionLink
      variant="primary"
      href="#campaigns"
      className={className}
      aria-label="Create campaign"
      onClick={() => document.querySelector<HTMLElement>('.app-viewport')?.scrollTo(0, 0)}
    >
      <span>{children}</span>
    </ActionLink>
  );
}
