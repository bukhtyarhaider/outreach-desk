import { useWorkspace } from './workspace-store';

/** Decorative process motion, never evidence that an email was sent. Both surfaces
 * use the same clock phase and server job state rather than independent timers. */
export function RunnerMotion({ compact = false }: { compact?: boolean }) {
  const { state } = useWorkspace();
  const job = state?.job;
  const waiting = Boolean(job?.nextAt && Date.parse(job.nextAt) > Date.now());
  const phase = !job?.enabled ? 'idle' : waiting ? 'waiting' : 'running';
  return (
    <div
      className={`runner-motion ${compact ? 'runner-motion--compact' : ''}`}
      data-phase={phase}
      aria-hidden="true"
      style={{ animationDelay: `${-(Date.now() % 3600)}ms` }}
    >
      <span className="runner-motion-track" />
      <span className="runner-piece runner-piece--red" />
      <span className="runner-piece runner-piece--blue" />
      <span className="runner-piece runner-piece--yellow" />
      <span className="runner-motion-dock">
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}
