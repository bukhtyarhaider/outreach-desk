import { Button, Input, Panel } from '../../design-system/primitives';
import { Clock, Icon, Info, Mail, RefreshCw, Shield, X } from '../../design-system/icons';
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
    when: 'Choose this for a small initial workload or when you want to resume with more time between sends. It does not warm up a mailbox automatically.',
    why: 'Longer gaps and a lower daily cap spread the workload out. Resting for 15–30 minutes after 5–8 sends adds recovery time.',
    rest: 'Rest 15–30 min after 5–8 sends · empty queue checked every 60 sec',
  },
  {
    key: 'balanced',
    name: 'Balanced',
    detail: '2.5–5 min gaps · 18/hour · 80/day',
    action: 'Apply Balanced',
    when: 'Choose this for a regular, moderate workload when your mailbox’s permitted limits and recent sending results support these volumes.',
    why: 'Moderate gaps balance progress with pauses. Resting for 10–20 minutes after 8–14 sends breaks the work into smaller batches.',
    rest: 'Rest 10–20 min after 8–14 sends · empty queue checked every 60 sec',
  },
  {
    key: 'established',
    name: 'Higher volume',
    detail: '1.5–3 min gaps · 25/hour · 120/day',
    action: 'Apply Higher volume',
    when: 'Choose this only when you need more throughput and your provider limits and observed mailbox performance support it. Mailbox age alone is not enough.',
    why: 'Shorter gaps and larger caps allow more work before a limit pauses the runner. Resting for 8–15 minutes after 12–20 sends still interrupts continuous sending.',
    rest: 'Rest 8–15 min after 12–20 sends · empty queue checked every 45 sec',
  },
  {
    key: 'stealth',
    name: 'Background',
    detail: '5–10 min gaps · 8/hour · 50/day',
    action: 'Apply background pace',
    when: 'Choose this when completion speed is less important and you prefer a slow background workload. It does not hide automation from a provider.',
    why: 'The longest gaps and lowest hourly cap keep activity spread out. Resting for 15–25 minutes after 6–10 sends adds longer breaks.',
    rest: 'Rest 15–25 min after 6–10 sends · empty queue checked every 60 sec',
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
                <div className="pace-profile-heading">
                  <strong>{profile.name}</strong>
                  <Button
                    size="sm"
                    className="pace-info-button"
                    popoverTarget={`pace-info-${profile.key}`}
                    aria-label={`About ${profile.name} preset`}
                    aria-haspopup="dialog"
                  >
                    <Icon icon={Info} size={16} />
                  </Button>
                </div>
                <div
                  id={`pace-info-${profile.key}`}
                  popover="auto"
                  role="dialog"
                  aria-labelledby={`pace-info-title-${profile.key}`}
                  className="pace-info-popover"
                >
                  <header>
                    <div>
                      <p className="page-eyebrow">Pace guide</p>
                      <h2 id={`pace-info-title-${profile.key}`}>{profile.name}</h2>
                    </div>
                    <Button
                      size="sm"
                      popoverTarget={`pace-info-${profile.key}`}
                      popoverTargetAction="hide"
                      aria-label="Close preset guide"
                    >
                      <Icon icon={X} size={16} />
                    </Button>
                  </header>
                  <h3>When to choose it</h3>
                  <p>{profile.when}</p>
                  <h3>How it helps</h3>
                  <p>{profile.why}</p>
                  <div className="pace-info-values">
                    <strong>{profile.detail}</strong>
                    <p>{profile.rest}</p>
                  </div>
                  <p className="pace-info-note">
                    These are application limits, not a delivery guarantee. Actual speed can be
                    lower because of rests, eligibility and provider restrictions. Check sending
                    results and adjust as needed. Apply fills the draft; Save changes activates it.
                  </p>
                </div>
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
