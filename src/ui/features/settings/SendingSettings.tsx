import { Button, Input, Panel } from '../../design-system/primitives';
import { Clock, Icon, Mail, RefreshCw, Shield } from '../../design-system/icons';
import type { Pacing } from '../../shared/types/domain';
function PaceField({
  id,
  label,
  unit,
  min = 1,
  max,
}: {
  id: keyof Pacing;
  label: string;
  unit: string;
  min?: number;
  max: number;
}) {
  return (
    <label className="pace-field" htmlFor={id}>
      <span>{label}</span>
      <div>
        <Input id={id} type="number" min={min} max={max} />
        <span aria-hidden="true">{unit}</span>
      </div>
      <span className="sr-only">{unit}</span>
    </label>
  );
}
const profiles = [
  {
    key: 'warmup',
    name: 'Gradual',
    detail: '4–8 min gaps · 10/hour · 40/day',
    action: 'Apply Warmup',
  },
  {
    key: 'balanced',
    name: 'Balanced',
    detail: '2.5–5 min gaps · 18/hour · 80/day',
    action: 'Apply Balanced',
  },
  {
    key: 'established',
    name: 'Higher volume',
    detail: '1.5–3 min gaps · 25/hour · 120/day',
    action: 'Apply Higher volume',
  },
  {
    key: 'stealth',
    name: 'Background',
    detail: '5–10 min gaps · 8/hour · 50/day',
    action: 'Apply background pace',
  },
];
export function SendingSettings() {
  return (
    <div className="pace-workspace">
      <section className="pace-overview" aria-label="How the sending schedule works">
        <div>
          <p className="page-eyebrow">Runner schedule</p>
          <h2>Set the runner’s schedule</h2>
          <p>
            Set the gap between emails, limit volume, and build in rest. These controls work
            together; save changes when you’re ready.
          </p>
        </div>
        <ol className="pace-sequence">
          <li>
            <i className="pace-shape pace-shape--send" aria-hidden="true" />
            <span>Send</span>
          </li>
          <li>
            <i className="pace-shape pace-shape--wait" aria-hidden="true" />
            <span>Wait</span>
          </li>
          <li>
            <i className="pace-shape pace-shape--repeat" aria-hidden="true" />
            <span>Repeat</span>
          </li>
          <li>
            <i className="pace-shape pace-shape--rest" aria-hidden="true" />
            <span>Rest</span>
          </li>
        </ol>
      </section>
      <details className="pace-profiles">
        <summary>
          Start from a preset <span>Optional · fills the controls below</span>
        </summary>
        <div id="pacingPresetsGrid" className="pace-profile-list">
          {profiles.map((profile) => (
            <div key={profile.key} className="pacing-preset-card" data-preset={profile.key}>
              <div>
                <strong>{profile.name}</strong>
                <p>{profile.detail}</p>
              </div>
              <Button className="preset-apply-btn" size="sm">
                {profile.action}
              </Button>
            </div>
          ))}
        </div>
        <p className="hint">
          A preset changes the draft only. Application limits do not guarantee inbox placement or
          override your provider’s restrictions.
        </p>
      </details>
      <div className="pace-control-grid">
        <Panel className="pace-control-card pace-control-card--timing">
          <header>
            <span className="pace-card-icon">
              <Icon icon={Clock} size={18} />
            </span>
            <div>
              <p className="page-eyebrow">01 · Timing</p>
              <h2>Between emails</h2>
            </div>
          </header>
          <p>Vary each delay within this range. Both values are in seconds.</p>
          <div className="pace-field-pair">
            <PaceField id="minSeconds" label="Minimum gap" unit="sec" max={86400} />
            <PaceField id="maxSeconds" label="Maximum gap" unit="sec" max={86400} />
          </div>
          <div className="pace-card-note">Minimum must be no greater than maximum.</div>
        </Panel>
        <Panel className="pace-control-card pace-control-card--volume">
          <header>
            <span className="pace-card-icon">
              <Icon icon={Mail} size={18} />
            </span>
            <div>
              <p className="page-eyebrow">02 · Volume</p>
              <h2>Rolling limits</h2>
            </div>
          </header>
          <p>Cap sends in the most recent hour and 24 hours, rather than a calendar reset.</p>
          <div className="pace-field-pair">
            <PaceField id="hourlyCap" label="Per rolling hour" unit="emails" max={10000} />
            <PaceField id="dailyCap" label="Per rolling 24 hours" unit="emails" max={100000} />
          </div>
          <div className="pace-card-note">The runner waits when an allowance is exhausted.</div>
        </Panel>
        <Panel className="pace-control-card pace-control-card--rest">
          <header>
            <span className="pace-card-icon">
              <Icon icon={RefreshCw} size={18} />
            </span>
            <div>
              <p className="page-eyebrow">03 · Rest</p>
              <h2>Breaks in the schedule</h2>
            </div>
          </header>
          <p>After a range of sends, pause for a range of time before continuing.</p>
          <div className="pace-rest-fields">
            <fieldset className="pace-rest-group">
              <legend>Take a break after</legend>
              <div className="pace-field-pair">
                <PaceField id="pauseEveryMin" label="At least" unit="sends" max={10000} />
                <PaceField id="pauseEveryMax" label="At most" unit="sends" max={10000} />
              </div>
            </fieldset>
            <fieldset className="pace-rest-group">
              <legend>Stay paused for</legend>
              <div className="pace-field-pair">
                <PaceField
                  id="pauseMinSeconds"
                  label="Minimum rest"
                  unit="sec"
                  min={0}
                  max={604800}
                />
                <PaceField
                  id="pauseMaxSeconds"
                  label="Maximum rest"
                  unit="sec"
                  min={0}
                  max={604800}
                />
              </div>
            </fieldset>
          </div>
        </Panel>
      </div>
      <details className="pace-empty-queue">
        <summary>When the queue is empty</summary>
        <div>
          <p className="hint">
            How often the runner looks again when no eligible leads are available. This is separate
            from the delay between emails.
          </p>
          <PaceField id="pollSeconds" label="Check again every" unit="sec" min={5} max={3600} />
        </div>
      </details>
      <Panel className="pace-recovery">
        <div>
          <header>
            <Icon icon={Shield} size={16} />
            <h2>Current wait & recovery</h2>
          </header>
          <p id="settingsWaitStatus" role="status">
            No scheduled wait.
          </p>
          <details>
            <summary>What does a hard reset change?</summary>
            <p>
              Resets this mailbox’s app-tracked minimum interval, hourly/24-hour quotas and rest
              counter. An active queue may send immediately. A stopped queue stays stopped. Send
              history, contact protections and provider limits remain in effect.
            </p>
          </details>
        </div>
        <Button id="resetWait" type="button" variant="danger" disabled>
          Hard reset wait & quotas
        </Button>
      </Panel>
    </div>
  );
}
