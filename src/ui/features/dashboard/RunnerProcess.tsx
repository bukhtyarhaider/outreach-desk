import { useEffect, useState } from 'react';
import { RunnerMotion } from '../../shared/RunnerMotion';
import { useWorkspace } from '../../shared/workspace-store';
import { waitClock } from '../../shared/runtime';

export function RunnerProcess() {
  const { state } = useWorkspace();
  const [now, setNow] = useState(Date.now);
  const nextAt = state?.job.nextAt;
  useEffect(() => {
    if (!nextAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [nextAt]);
  const job = state?.job;
  const remaining = nextAt ? Math.max(0, (Date.parse(nextAt) - now) / 1000) : 0;
  return (
    <section className="runner-process" aria-label="Outreach process">
      <div className="runner-process-heading">
        <span>
          {job?.enabled
            ? remaining > 0
              ? 'Pacing the queue'
              : 'Working through the queue'
            : 'Ready when you are'}
        </span>
        <small>Motion represents process activity, not delivery confirmation.</small>
      </div>
      <RunnerMotion />
      <dl className="runner-process-stats">
        <div>
          <dt>Next queue check</dt>
          <dd>{nextAt ? waitClock(remaining) : '—'}</dd>
        </div>
        <div>
          <dt>Processed this run</dt>
          <dd>{job?.current ?? 0}</dd>
        </div>
        <div>
          <dt>Ready · active campaign</dt>
          <dd>{state?.counts.ready ?? 0}</dd>
        </div>
        <div>
          <dt>Confirmed · this PC</dt>
          <dd>{state?.counts.sent ?? 0}</dd>
        </div>
      </dl>
      <p className="hint">
        Rest cycle: {job?.sincePause ?? 0}
        {job?.pauseAfter ? ` / ${job.pauseAfter}` : ''} sends since the last break.{' '}
        {job?.status || 'Idle'}.
      </p>
    </section>
  );
}
