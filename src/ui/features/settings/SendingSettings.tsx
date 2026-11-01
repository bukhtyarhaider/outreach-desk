import { Button, Input, Panel } from '../../design-system/primitives';
import { Icon, Info, Shield } from '../../design-system/icons';
export function SendingSettings() {
  return (
    <>
      <div className="settings-stacked">
        <Panel className="settings-card">
          <div className={'pacing-presets-section'}>
            <div className={'pacing-presets-header'}>
              <div className={'pacing-presets-title'}>
                <Icon icon={Shield} size={14} />
                {'\n                        Choose a starting pace\n                      '}
              </div>
              <span className={'pacing-presets-subtext'}>
                {'Applying a preset fills the fields. Save changes when ready.'}
              </span>
            </div>
            <div className={'pacing-presets-grid'} id={'pacingPresetsGrid'}>
              <div className={'pacing-preset-card'} data-preset={'warmup'}>
                <div className={'preset-card-top'}>
                  <span className={'preset-badge warmup'}>{'Lower volume'}</span>
                  <span className={'preset-stat'}>{'40 / day'}</span>
                </div>
                <div className={'preset-card-name'}>{'New Mailbox Warmup'}</div>
                <p className={'preset-card-desc'}>
                  {'Longer gaps and smaller batches for a more gradual sending pace.'}
                </p>
                <div className={'preset-specs'}>
                  <span>{'4–8m gaps'}</span>
                  {' • '}
                  <span>{'10/hr'}</span>
                  {' • '}
                  <span>{'15–30m rest'}</span>
                </div>
                <Button type={'button'} className={'preset-apply-btn'}>
                  {'Apply Warmup'}
                </Button>
              </div>

              <div className={'pacing-preset-card'} data-preset={'balanced'}>
                <div className={'preset-card-top'}>
                  <span className={'preset-badge recommended'}>{'Everyday pace'}</span>
                  <span className={'preset-stat'}>{'80 / day'}</span>
                </div>
                <div className={'preset-card-name'}>{'Balanced Human Pace'}</div>
                <p className={'preset-card-desc'}>
                  {'Moderate gaps, daily limits and periodic rest breaks.'}
                </p>
                <div className={'preset-specs'}>
                  <span>{'2.5–5m gaps'}</span>
                  {' • '}
                  <span>{'18/hr'}</span>
                  {' • '}
                  <span>{'10–20m rest'}</span>
                </div>
                <Button type={'button'} className={'preset-apply-btn'}>
                  {'Apply Balanced'}
                </Button>
              </div>

              <div className={'pacing-preset-card'} data-preset={'established'}>
                <div className={'preset-card-top'}>
                  <span className={'preset-badge established'}>{'Higher volume'}</span>
                  <span className={'preset-stat'}>{'120 / day'}</span>
                </div>
                <div className={'preset-card-name'}>{'Aged / Established Domain'}</div>
                <p className={'preset-card-desc'}>
                  {
                    'Shorter gaps and higher limits. Review your mailbox provider’s limits before choosing this profile.'
                  }
                </p>
                <div className={'preset-specs'}>
                  <span>{'1.5–3m gaps'}</span>
                  {' • '}
                  <span>{'25/hr'}</span>
                  {' • '}
                  <span>{'8–15m rest'}</span>
                </div>
                <Button type={'button'} className={'preset-apply-btn'}>
                  {'Apply Higher volume'}
                </Button>
              </div>

              <div className={'pacing-preset-card'} data-preset={'stealth'}>
                <div className={'preset-card-top'}>
                  <span className={'preset-badge stealth'}>{'All-Day Trickle'}</span>
                  <span className={'preset-stat'}>{'50 / day'}</span>
                </div>
                <div className={'preset-card-name'}>{'Steady background pace'}</div>
                <p className={'preset-card-desc'}>
                  {'Longer gaps with a lower hourly cap for a gradual sending schedule.'}
                </p>
                <div className={'preset-specs'}>
                  <span>{'5–10m gaps'}</span>
                  {' • '}
                  <span>{'8/hr'}</span>
                  {' • '}
                  <span>{'15–25m rest'}</span>
                </div>
                <Button type={'button'} className={'preset-apply-btn'}>
                  {'Apply background pace'}
                </Button>
              </div>
            </div>

            <div className={'pacing-info-banner'}>
              <Icon icon={Info} size={15} />
              <div>
                <strong>{'How these limits work:'}</strong>
                {
                  ' These presets set application pacing limits. They do not guarantee delivery or inbox placement; mailbox provider limits still apply.\n                      '
                }
              </div>
            </div>
          </div>
        </Panel>
        <Panel className="settings-card">
          <h2>Timing, limits & rest</h2>
          <div className="settings-pacing-fields">
            {[
              {
                title: 'Time between emails',
                description:
                  'Choose a range in seconds. The runner varies the delay within these bounds.',
                fields: [
                  ['minSeconds', 'Minimum delay', 1],
                  ['maxSeconds', 'Maximum delay', 1],
                ],
              },
              {
                title: 'Rolling sending limits',
                description: 'Maximum app-tracked sends in the most recent hour and 24 hours.',
                fields: [
                  ['hourlyCap', 'Per hour', 1],
                  ['dailyCap', 'Per 24 hours', 1],
                ],
              },
              {
                title: 'When to take a rest',
                description: 'Choose the send-count range between rest breaks.',
                fields: [
                  ['pauseEveryMin', 'At least this many sends', 1],
                  ['pauseEveryMax', 'At most this many sends', 1],
                ],
              },
              {
                title: 'Rest duration',
                description: 'Choose the minimum and maximum rest in seconds.',
                fields: [
                  ['pauseMinSeconds', 'Minimum rest', 0],
                  ['pauseMaxSeconds', 'Maximum rest', 0],
                ],
              },
            ].map((group) => (
              <fieldset key={group.title} className="settings-field-group">
                <legend>{group.title}</legend>
                <p>{group.description}</p>
                <div className="form-grid-2">
                  {group.fields.map(([id, label, min]) => (
                    <label key={String(id)} htmlFor={String(id)}>
                      {label}
                      <Input id={String(id)} type="number" min={min} />
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <label className="settings-poll-field" htmlFor="pollSeconds">
              Check an empty queue every (seconds)
              <Input id="pollSeconds" type="number" min="5" />
              <small>
                The runner checks again at this interval when no eligible leads are available.
              </small>
            </label>
          </div>
        </Panel>
        <Panel className="settings-card settings-recovery">
          <h2>Queue recovery</h2>
          <p className="hint">
            Review the current wait before overriding the app’s pacing counters.
          </p>
          <div className={'form-group'}>
            <label>{'Current queue wait'}</label>
            <p id={'settingsWaitStatus'} className={'hint'} role={'status'}>
              {'No scheduled wait.'}
            </p>
            <p className={'hint'}>
              {
                'Override the current wait and restart this mailbox’s app-tracked minimum interval, hourly/24-hour quota counters, and rest counter. The queue can send immediately after confirmation. New sends count toward the configured limits again. A stopped queue stays stopped.'
              }
            </p>
            <Button id={'resetWait'} type={'button'} className={'secondary'} disabled={true}>
              {'Hard reset wait & quotas'}
            </Button>
          </div>
        </Panel>
      </div>
    </>
  );
}
