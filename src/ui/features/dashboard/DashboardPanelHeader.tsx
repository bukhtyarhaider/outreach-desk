import type { ReactNode } from 'react';
import { Icon, type LucideIcon } from '../../design-system/icons';

/** Dashboard panels share one compact hierarchy for identity, scope and current state. */
export function DashboardPanelHeader({
  icon,
  title,
  description,
  actions,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="dashboard-panel-heading">
      <span className="dashboard-panel-icon">
        <Icon icon={icon} size={17} />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {actions && <div className="dashboard-panel-heading-actions">{actions}</div>}
    </header>
  );
}
