import { Check, Icon } from '../../design-system/icons';

export type StatKind = 'total' | 'ready' | 'excluded' | 'sent';

/** Audience shares use a campaign denominator; PC-wide sends deliberately have no progress scale. */
export function audienceShare(value: number, total: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) return 0;
  return Math.max(0, Math.min(1, value / total));
}

function sectorPath(cx: number, cy: number, radius: number, start: number, sweep: number) {
  const point = (degrees: number) => {
    const radians = (degrees * Math.PI) / 180;
    return `${cx + radius * Math.cos(radians)},${cy + radius * Math.sin(radians)}`;
  };
  return `M${cx},${cy}L${point(start)}A${radius},${radius} 0 ${sweep > 180 ? 1 : 0},1 ${point(start + sweep)}Z`;
}

export function StatMark({ kind, value, total }: { kind: StatKind; value: number; total: number }) {
  const share = audienceShare(value, total);
  const hasValue = Number.isFinite(value) && value > 0;
  const color = `var(${kind === 'ready' ? '--accent-blue' : '--brand-red'})`;
  const shape =
    kind === 'ready' ? <circle cx="22" cy="22" r="20" /> : <path d="M2 2H42V42C20 42 2 24 2 2Z" />;
  return (
    <svg
      className={`dashboard-stat-mark dashboard-stat-mark--${kind}`}
      viewBox="0 0 44 44"
      width="44"
      height="44"
      aria-hidden="true"
      focusable="false"
    >
      {kind === 'total' ? (
        <g opacity={hasValue ? 1 : 0.22}>
          <path d="M2 2H22V22C11 22 2 13 2 2Z" fill="var(--brand-red)" />
          <path d="M2 26H18V42H2Z" fill="var(--accent-blue)" />
          <circle cx="32" cy="32" r="10" fill="var(--brand-yellow)" />
        </g>
      ) : kind === 'sent' ? (
        <>
          <circle
            cx="22"
            cy="22"
            r="20"
            fill={hasValue ? 'var(--brand-yellow)' : 'var(--bg-surface-elevated)'}
          />
          {hasValue && <Icon icon={Check} x={10} y={10} size={24} color="var(--text-primary)" />}
        </>
      ) : (
        <>
          <g fill="var(--bg-surface-elevated)">{shape}</g>
          {share > 0 &&
            (share >= 1 ? (
              <g fill={color}>{shape}</g>
            ) : (
              <path
                fill={color}
                d={
                  kind === 'ready'
                    ? sectorPath(22, 22, 20, -90, 360 * share)
                    : sectorPath(42, 2, 40, 90, 90 * share)
                }
              />
            ))}
          <g fill="none" stroke="var(--border-medium)" strokeWidth="0.75">
            {shape}
          </g>
        </>
      )}
    </svg>
  );
}
