import { ActionLink } from '../../design-system/primitives';
import type { ReactNode } from 'react';
/** A distinct entry for a new import; never edits the active campaign implicitly. */
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
      href="#campaign-new"
      className={className}
      aria-label="Create campaign"
      data-view={className.includes('sidebar-create') ? 'campaign-new' : undefined}
      onClick={() => document.querySelector<HTMLElement>('.app-viewport')?.scrollTo(0, 0)}
    >
      <span>{children}</span>
    </ActionLink>
  );
}
