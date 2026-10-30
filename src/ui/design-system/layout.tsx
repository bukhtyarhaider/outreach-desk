import type { ReactNode, ComponentPropsWithoutRef } from 'react';
import { cx } from '../shared/utils';
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-subtitle">{description}</p>}
      </div>
      {actions && <div className="header-actions">{actions}</div>}
    </header>
  );
}
export function SectionHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="panel-head">
      <div>
        <h2 className="panel-title">{title}</h2>
        {description && <p className="hint">{description}</p>}
      </div>
      {actions}
    </header>
  );
}
export function StatusBadge({
  tone,
  children,
  ...props
}: ComponentPropsWithoutRef<'span'> & {
  tone?: 'neutral' | 'positive' | 'warning' | 'negative' | 'info';
}) {
  const state = props.className?.split(/\s+/) ?? [];
  const resolvedTone =
    tone ??
    (state.some((v) => ['good', 'ready', 'sent', 'active'].includes(v))
      ? 'positive'
      : state.some((v) => ['warn', 'pending'].includes(v))
        ? 'warning'
        : state.some((v) => ['blocked', 'error', 'failed'].includes(v))
          ? 'negative'
          : 'neutral');
  return (
    <span {...props} className={cx('ui-badge', `ui-badge--${resolvedTone}`, props.className)}>
      {children}
    </span>
  );
}
export function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
}) {
  return (
    <div className="ui-metric">
      <dt>{label}</dt>
      <dd>{value}</dd>
      {detail && <p>{detail}</p>}
    </div>
  );
}
export function MetricGroup({ children }: { children: ReactNode }) {
  return <dl className="ui-metric-group">{children}</dl>;
}
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="ui-empty-state">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
export function Notice({
  children,
  tone = 'info',
}: {
  children: ReactNode;
  tone?: 'info' | 'warning';
}) {
  return <aside className={`ui-notice ui-notice--${tone}`}>{children}</aside>;
}

/** Compact counts for working lists where the inventory, rather than analytics, is the primary task. */
export function SummaryStrip({
  label,
  items,
}: {
  label?: string;
  items: readonly { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="ui-summary-strip" aria-label={label}>
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
