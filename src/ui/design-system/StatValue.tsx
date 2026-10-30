import type { ReactNode } from 'react';
import { StatMark, type StatKind } from './StatMark';

/** Legacy metric regions share brand accents without changing their values or scope. */
export function StatValue({
  children,
  kind = 'signal',
  value,
  total = 0,
}: {
  children: ReactNode;
  kind?: StatKind;
  value: number;
  total?: number;
}) {
  return (
    <div className="stat-value-row">
      <strong>{children}</strong>
      <StatMark kind={kind} value={value} total={total} />
    </div>
  );
}
