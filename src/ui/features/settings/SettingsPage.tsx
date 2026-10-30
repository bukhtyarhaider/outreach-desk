import { SectionHeader, StatusBadge } from '../../design-system/layout';
import { SectionNavigation } from '../../design-system/navigation';
import {
  Clock,
  CodeXml,
  Icon,
  Info,
  RefreshCw,
  Shield,
  SquareCheckBig,
  Users,
} from '../../design-system/icons';
import { Button, Input, Panel, Select } from '../../design-system/primitives';
export function SettingsPage() {
  return (
    <>
      <section className={'view-page'} id={'view-settings'}>
        <div className={'page-header'}>
          <div>
            <p className={'page-eyebrow'}>{'CONFIGURATION'}</p>
            <h1 className={'page-title'}>{'Settings'}</h1>
            <p className={'page-subtitle'}>
              {
                'Configure sending rules, template checks, eligibility, sync and system diagnostics.'
              }
            </p>
          </div>
          <div className={'header-actions'}>
            <Button variant="primary" id={'saveSettings'}>
              {'Save sending settings'}
            </Button>
          </div>
        </div>
        <div className="settings-layout">
          <SectionNavigation
            label="Settings sections"
            items={[
              { id: 'settingsSending', label: 'Sending rules' },
              { id: 'settingsConnections', label: 'Sync & coordination' },
              { id: 'settingsAbout', label: 'About' },
            ]}
          />
          <div className="settings-content">
            <section className="settings-section" id="settingsSending">
              <SectionHeader
                title="Sending rules"
                description="Pacing, eligibility and message checks."
              />
              <div className="settings-grid">
                <Panel as="div" className={'panel'}>
                  <div className={'panel-head'}>
                    <h2 className={'panel-title'}>
                      <Icon icon={Clock} size={16} />
                      {'\n                      Sending Pace & Quotas\n                    '}
                    </h2>
                  </div>

                  <div className={'pacing-presets-section'}>
                    <div className={'pacing-presets-header'}>
                      <div className={'pacing-presets-title'}>
                        <Icon icon={Shield} size={14} />
                        {
                          '\n                        Recommended Anti-Spam Deliverability Presets\n                      '
                        }
                      </div>
                      <span className={'pacing-presets-subtext'}>
                        {'Click any preset to apply safe human thresholds'}
                      </span>
                    </div>
                    <div className={'pacing-presets-grid'} id={'pacingPresetsGrid'}>
                      <div className={'pacing-preset-card'} data-preset={'warmup'}>
                        <div className={'preset-card-top'}>
                          <span className={'preset-badge warmup'}>{'Safe Warmup'}</span>
                          <span className={'preset-stat'}>{'40 / day'}</span>
                        </div>
                        <div className={'preset-card-name'}>{'New Mailbox Warmup'}</div>
                        <p className={'preset-card-desc'}>
                          {
                            'High delays (4–8 min) & small batches with long rests. Protects new domains against early reputation burn.'
                          }
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
                          <span className={'preset-badge recommended'}>{'Recommended'}</span>
                          <span className={'preset-stat'}>{'80 / day'}</span>
                        </div>
                        <div className={'preset-card-name'}>{'Balanced Human Pace'}</div>
                        <p className={'preset-card-desc'}>
                          {
                            'Realistic sales rep pacing (2.5–5 min) with irregular intervals & 10–20 min rests. Standard for daily outreach.'
                          }
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
                          <span className={'preset-badge established'}>{'High Volume'}</span>
                          <span className={'preset-stat'}>{'120 / day'}</span>
                        </div>
                        <div className={'preset-card-name'}>{'Aged / Established Domain'}</div>
                        <p className={'preset-card-desc'}>
                          {
                            'Faster pace (1.5–3 min) for warmed mailboxes with strong SPF/DKIM/DMARC and seasoned sender score.'
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
                          {'Apply High Volume'}
                        </Button>
                      </div>

                      <div className={'pacing-preset-card'} data-preset={'stealth'}>
                        <div className={'preset-card-top'}>
                          <span className={'preset-badge stealth'}>{'All-Day Trickle'}</span>
                          <span className={'preset-stat'}>{'50 / day'}</span>
                        </div>
                        <div className={'preset-card-name'}>{'Stealth Background'}</div>
                        <p className={'preset-card-desc'}>
                          {
                            'Ultra-gentle trickle (5–10 min) running quietly across an 8–10 hour workday without triggering rate spikes.'
                          }
                        </p>
                        <div className={'preset-specs'}>
                          <span>{'5–10m gaps'}</span>
                          {' • '}
                          <span>{'8/hr'}</span>
                          {' • '}
                          <span>{'15–25m rest'}</span>
                        </div>
                        <Button type={'button'} className={'preset-apply-btn'}>
                          {'Apply Stealth'}
                        </Button>
                      </div>
                    </div>

                    <div className={'pacing-info-banner'}>
                      <Icon icon={Info} size={15} />
                      <div>
                        <strong>{'Spam & Rate-Limit Protections:'}</strong>
                        {
                          ' Randomized gaps prevent ESP bot-fingerprinting. Rolling hourly & daily caps protect domain reputation from blacklists. Periodic rest pauses simulate natural human breaks.\n                      '
                        }
                      </div>
                    </div>
                  </div>
                  <div className={'form-grid-2'}>
                    <div className={'form-group'}>
                      <label htmlFor={'minSeconds'}>{'Gap Minimum (seconds)'}</label>
                      <Input id={'minSeconds'} type={'number'} min={'1'} />
                    </div>
                    <div className={'form-group'}>
                      <label htmlFor={'maxSeconds'}>{'Gap Maximum (seconds)'}</label>
                      <Input id={'maxSeconds'} type={'number'} min={'1'} />
                    </div>
                  </div>
                  <div className={'form-grid-2'}>
                    <div className={'form-group'}>
                      <label htmlFor={'hourlyCap'}>{'Rolling Hourly Cap'}</label>
                      <Input id={'hourlyCap'} type={'number'} min={'1'} />
                    </div>
                    <div className={'form-group'}>
                      <label htmlFor={'dailyCap'}>{'Rolling 24-Hour Cap'}</label>
                      <Input id={'dailyCap'} type={'number'} min={'1'} />
                    </div>
                  </div>
                  <div className={'form-grid-2'}>
                    <div className={'form-group'}>
                      <label htmlFor={'pauseEveryMin'}>{'Rest After At Least N Sends'}</label>
                      <Input id={'pauseEveryMin'} type={'number'} min={'1'} />
                    </div>
                    <div className={'form-group'}>
                      <label htmlFor={'pauseEveryMax'}>{'Rest After At Most N Sends'}</label>
                      <Input id={'pauseEveryMax'} type={'number'} min={'1'} />
                    </div>
                  </div>
                  <div className={'form-grid-2'}>
                    <div className={'form-group'}>
                      <label htmlFor={'pauseMinSeconds'}>{'Rest Minimum (seconds)'}</label>
                      <Input id={'pauseMinSeconds'} type={'number'} min={'0'} />
                    </div>
                    <div className={'form-group'}>
                      <label htmlFor={'pauseMaxSeconds'}>{'Rest Maximum (seconds)'}</label>
                      <Input id={'pauseMaxSeconds'} type={'number'} min={'0'} />
                    </div>
                  </div>
                  <div className={'form-group'}>
                    <label htmlFor={'pollSeconds'}>{'Empty Queue Check Interval (seconds)'}</label>
                    <Input id={'pollSeconds'} type={'number'} min={'5'} />
                  </div>
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
                    <Button
                      id={'resetWait'}
                      type={'button'}
                      className={'secondary'}
                      disabled={true}
                    >
                      {'Hard reset wait & quotas'}
                    </Button>
                  </div>
                </Panel>
                <Panel as="div" className={'panel'}>
                  <div className={'panel-head'}>
                    <h2 className={'panel-title'}>{'Template checks'}</h2>
                    <StatusBadge className={'status-pill ready'}>
                      {'Advisory by default'}
                    </StatusBadge>
                  </div>
                  <p className={'hint'}>
                    {
                      'Choose how wording checks behave for all templates in previews, manual sends, selected batches, and continuous outreach. Warn only adds a review note and lets outreach continue.'
                    }
                  </p>
                  <div className={'form-group'}>
                    <label className={'check'}>
                      <Input id={'templateChecksEnabled'} type={'checkbox'} defaultChecked={true} />
                      {'\n                      Enable template checks\n                    '}
                    </label>
                  </div>
                  <fieldset id={'templateCheckOptions'} className={'template-check-options'}>
                    <div className={'form-group'}>
                      <label htmlFor={'promotionalClaimsCheck'}>
                        {'Pricing, guarantees & promotional claims'}
                      </label>
                      <Select id={'promotionalClaimsCheck'}>
                        <option value={'warn'}>{'Warn only — continue outreach'}</option>
                        <option value={'block'}>{'Stop before sending'}</option>
                        <option value={'off'}>{'Off'}</option>
                      </Select>
                      <p className={'hint'}>
                        {
                          'Flags wording such as guarantees, prices, percentages, and urgency for review.'
                        }
                      </p>
                    </div>
                    <div className={'form-group'}>
                      <label htmlFor={'messageLengthCheck'}>{'Introduction over 180 words'}</label>
                      <Select id={'messageLengthCheck'}>
                        <option value={'warn'}>{'Warn only — continue outreach'}</option>
                        <option value={'block'}>{'Stop before sending'}</option>
                        <option value={'off'}>{'Off'}</option>
                      </Select>
                    </div>
                  </fieldset>
                  <p className={'hint'}>
                    {
                      'Turning template checks off keeps your individual choices for when you enable them again. Save sending settings to apply changes. A stopped queue must be started again.'
                    }
                  </p>
                  <p className={'hint'}>
                    {
                      'Lead eligibility checks are below. Recipient validity, duplicate and opt-out protection, mailbox identity, signature verification, send confirmation, and sending allowances stay active.'
                    }
                  </p>
                </Panel>
                <Panel as="div" className={'panel'}>
                  <div className={'panel-head'}>
                    <h2 className={'panel-title'}>
                      <Icon icon={SquareCheckBig} size={16} />
                      {'\n                      Lead Eligibility Rules\n                    '}
                    </h2>
                  </div>
                  <div className={'form-group'}>
                    <label className={'check'}>
                      <Input id={'requireActive'} type={'checkbox'} />
                      {
                        '\n                      Require Active operating status (FMCSA)\n                    '
                      }
                    </label>
                    <label className={'check'}>
                      <Input id={'requireNoOutOfService'} type={'checkbox'} />
                      {
                        '\n                      Require No out-of-service flag\n                    '
                      }
                    </label>
                    <label className={'check'}>
                      <Input id={'allowHidden'} type={'checkbox'} />
                      {
                        '\n                      Allow reading from hidden worksheets\n                    '
                      }
                    </label>
                  </div>
                  <div className={'form-group'}>
                    <label htmlFor={'readyStatuses'}>
                      {'Ready Statuses (comma separated; use blank for empty cells)'}
                    </label>
                    <Input id={'readyStatuses'} />
                  </div>
                  <div className={'form-group'}>
                    <label htmlFor={'sentStatus'}>{'Status Written After Send'}</label>
                    <Input id={'sentStatus'} placeholder={'e.g. Proposal Sent'} />
                  </div>
                </Panel>
              </div>
            </section>
            <section className="settings-section" id="settingsConnections">
              <SectionHeader
                title="Sync & coordination"
                description="Shared-team state, device identity and Firebase health."
              />
              <div className="settings-grid">
                <Panel as="div" className={'panel'}>
                  <div className={'panel-head'}>
                    <div className={'settings-panel-heading'}>
                      <h2 className={'panel-title'}>
                        <Icon icon={RefreshCw} size={16} />
                        {
                          '\n                        Firebase Open Telemetry Sync\n                      '
                        }
                      </h2>
                      <StatusBadge className={'status-pill'} id={'settingsFirebaseStatusBadge'}>
                        {'Not checked'}
                      </StatusBadge>
                    </div>
                  </div>
                  <p className={'hint'}>
                    {
                      'Give each PC its own ID and keep its original data folder. Cloud opens are matched to the tracking tokens saved on that PC.'
                    }
                  </p>
                  <div
                    id={'firebaseWarnings'}
                    className={'firebase-warnings'}
                    role={'status'}
                    aria-live={'polite'}
                  ></div>
                  <div className={'form-group'}>
                    <label htmlFor={'trackingPcId'}>{"This PC's tracking ID"}</label>
                    <Input
                      id={'trackingPcId'}
                      maxLength={64}
                      placeholder={'e.g. 1, 2, 3 or 4'}
                      autoComplete={'off'}
                    />
                    <p className={'hint'} id={'trackingPcIdHint'}>
                      {
                        'Save a unique ID for each PC. Blank uses FC_TRACKING_PC_ID, then the legacy default 1.'
                      }
                    </p>
                  </div>
                  <div className={'form-group'}>
                    <label htmlFor={'trackingPublicUrl'}>{'Public tracking URL'}</label>
                    <Input
                      id={'trackingPublicUrl'}
                      type={'url'}
                      placeholder={'https://www.fclogistics.us/t/1'}
                    />
                    <p className={'hint'}>
                      {
                        'Use the cloud endpoint for this PC (for example /t/2 for PC 2). Blank uses FC_TRACKING_PUBLIC_URL. Changes apply to future emails; old emails keep their original URL.'
                      }
                    </p>
                  </div>
                  <div className={'form-group'}>
                    <label htmlFor={'firebaseBackend'}>{'Cloud database to sync'}</label>
                    <Select id={'firebaseBackend'}>
                      <option value={'both'}>{'Realtime Database + Firestore'}</option>
                      <option value={'rtdb'}>{'Realtime Database only'}</option>
                      <option value={'firestore'}>{'Cloud Firestore only'}</option>
                    </Select>
                    <p className={'hint'}>
                      {
                        'Select the database your cloud endpoint writes to. Errors from any selected database are shown below.'
                      }
                    </p>
                  </div>
                  <div className={'form-group'}>
                    <label htmlFor={'firebaseSyncMode'}>{'Sync Mode'}</label>
                    <Select id={'firebaseSyncMode'}>
                      <option value={'auto'}>
                        {'Automatic (Background polling every 15s + startup sync)'}
                      </option>
                      <option value={'manual'}>
                        {'Manual (Sync only on demand / button click)'}
                      </option>
                    </Select>
                    <p className={'hint'} id={'firebaseSyncModeHint'}>
                      {
                        'In automatic mode, open signals from recipients are fetched seamlessly in the background while the app is running.'
                      }
                    </p>
                  </div>
                  <div className={'settings-sync-actions'}>
                    <small
                      id={'settingsFirebaseDiag'}
                      className={'hint'}
                      role={'status'}
                      aria-live={'polite'}
                    >
                      {'Checking sync configuration…'}
                    </small>
                    <Button
                      id={'settingsFirebaseSyncBtn'}
                      type={'button'}
                      className={'secondary'}
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                    >
                      {'Sync opens now'}
                    </Button>
                  </div>
                </Panel>
                <Panel as="div" className={'panel firebase-diagnostics-panel'}>
                  <div className={'panel-head'}>
                    <h2 className={'panel-title'}>{'PC & Firebase diagnostics'}</h2>
                  </div>
                  <p className={'hint'}>
                    {
                      'Live values from this running app. Credential keys are hidden. Environment and credential file changes require a restart.'
                    }
                  </p>
                  <dl id={'firebaseDiagnostics'} className={'firebase-diagnostics'}></dl>
                  <div
                    id={'firebaseBackendDiagnostics'}
                    className={'firebase-backend-diagnostics'}
                    aria-live={'polite'}
                  ></div>
                  <p className={'hint'}>
                    {
                      'Open signals are image requests; they do not prove a person read the email. Team coordination uses a separate worker ID and does not synchronize open history.'
                    }
                  </p>
                </Panel>
                <Panel as="div" className={'panel'}>
                  <div className={'panel-head'}>
                    <h2 className={'panel-title'}>
                      <Icon icon={Users} size={16} />
                      {'\n                      Shared Team Coordination\n                    '}
                    </h2>
                  </div>
                  <div className={'form-group'}>
                    <label className={'check'}>
                      <Input id={'teamEnabled'} type={'checkbox'} />
                      {
                        '\n                      Enable shared team coordination server\n                    '
                      }
                    </label>
                  </div>
                  <div className={'form-group'}>
                    <label htmlFor={'teamUrl'}>{'Coordinator Server URL'}</label>
                    <Input id={'teamUrl'} type={'url'} placeholder={'http://192.168.1.50:4318'} />
                  </div>
                  <div className={'form-grid-2'}>
                    <div className={'form-group'}>
                      <label htmlFor={'workerName'}>{'Local PC Identifier'}</label>
                      <Input id={'workerName'} placeholder={'PC-01'} />
                    </div>
                    <div className={'form-group'}>
                      <label htmlFor={'teamToken'}>{'Access Token'}</label>
                      <Input
                        id={'teamToken'}
                        type={'password'}
                        autoComplete={'off'}
                        placeholder={'Coordinator token'}
                      />
                    </div>
                  </div>
                  <p id={'teamStatus'} className={'hint'}></p>
                </Panel>
              </div>
            </section>
            <section className="settings-section" id="settingsAbout">
              <SectionHeader
                title="About this app"
                description="Release details and application information."
              />
              <div className="settings-grid">
                <Panel as="div" className={'panel'}>
                  <div className={'panel-head'}>
                    <h2 className={'panel-title'}>
                      <Icon icon={CodeXml} size={16} />
                      {'\n                      Developer & System Info\n                    '}
                    </h2>
                    <a href="#catalog">Release catalog →</a>
                  </div>
                  <div className={'settings-system-info'}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {'Lead Engineer / Developer'}
                      </span>
                      <strong style={{ color: '#181816' }}>{'Bukhtyar Haider'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{'Application'}</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {'Outreach Desk (Desktop Edition)'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{'Architecture'}</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {'Playwright Webmail Automation & Queue Coordinator'}
                      </span>
                    </div>
                  </div>
                </Panel>
              </div>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
