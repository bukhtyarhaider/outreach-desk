import { ActionLink, Button, Input, Select, Textarea } from '../../design-system/primitives';
function StepHeading({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <header className="import-step-heading">
      <p className="page-eyebrow">Step {number} of 5</p>
      <h2 tabIndex={-1}>{title}</h2>
      <p>{description}</p>
    </header>
  );
}
export function ImportsPage() {
  return (
    <section className="view-page" id="view-imports" data-import-step="0">
      <div className={'page-header'}>
        <div>
          <p className={'page-eyebrow'}>{'LEAD DATA'}</p>
          <h1 className={'page-title'}>{'Review & repair imports'}</h1>
          <p className={'page-subtitle'}>
            {'Check original rows, correct mappings, and activate a recoverable campaign workbook.'}
          </p>
        </div>
        <div className="header-actions">
          <ActionLink href="#campaigns">Back to campaigns</ActionLink>
        </div>
      </div>

      <div id="importJourney" />
      <div className="import-operation-feedback">
        <p id="reviewStatus" role="status" aria-live="polite">
          Loading campaigns…
        </p>
        <p id="reviewError" className="experiment-error" role="alert" hidden />
      </div>
      <section id="importStepSource" data-import-view="0" className="import-step-view">
        <StepHeading
          number={1}
          title="Start with your source workbook"
          description="Choose the campaign you want to work on. Inspect its original data before changing how it is read."
        />
        <div className="import-source-choice panel">
          <div className={'experiment-form'}>
            <label htmlFor={'reviewCampaign'}>
              {'Campaign'}
              <Select id={'reviewCampaign'}>
                <option value={''}>{'Loading campaigns…'}</option>
              </Select>
            </label>
            <Button id={'reviewLoad'} variant="primary" disabled={true}>
              {'Inspect workbook'}
            </Button>
          </div>
          <div className="import-source-explainer">
            <strong>What happens here?</strong>
            <p>
              We read the saved workbook and show its worksheets, sample rows and existing issues.
              Your source file stays untouched.
            </p>
          </div>
        </div>
        <section id="reviewResults" hidden>
          <div className={'experiment-result-heading'}>
            <h2 id={'reviewHeading'}>{'Saved mapping'}</h2>
            <span id={'reviewChange'} className={'hint'}></span>
          </div>
          <div id={'reviewMetrics'} className={'experiment-metrics'}></div>
          <p id={'reviewBasis'} className={'hint'}></p>
          <p id={'reviewIdentity'} className={'hint'}></p>
          <section className={'experiment-sheets'}>
            <h2>{'Original file · evidence'}</h2>
            <p className={'hint'}>
              {
                'Email-column candidates are syntax counts, not verified addresses. Mixed layouts may need separate source sheets. Counts alone are not a safe reason to remap a whole worksheet.'
              }
            </p>
            <div id={'reviewSheets'}></div>
          </section>

          <footer className="import-step-footer">
            <span>Source inspected? Match the fields next.</span>
            <Button variant="primary" data-import-go="1">
              Continue to columns →
            </Button>
          </footer>
        </section>
      </section>
      <section id="importStepColumns" data-import-view="1" className="import-step-view">
        <StepHeading
          number={2}
          title="Tell us which columns to use"
          description="Connect your spreadsheet columns to the fields the app needs. A preview comes next; nothing is saved here."
        />
        <div className="import-mapping-layout">
          <section className={'panel experiment-mapping'}>
            <h3>Worksheet field mapping</h3>
            <p className={'hint'}>
              {
                'Choose columns that match the original worksheet. Keep outreach Status separate from operating status. Preview before saving.'
              }
            </p>
            <div id={'reviewMappingWizard'}></div>
            <details>
              <summary>{'Advanced mapping JSON'}</summary>
              <label htmlFor={'reviewMapping'}>{'Proposed mapping (JSON)'}</label>
              <Textarea id={'reviewMapping'} rows={10} spellCheck={'false'} />
              <label htmlFor={'reviewStatusColumns'}>{'Add missing Status headers (JSON)'}</label>
              <Textarea
                id={'reviewStatusColumns'}
                rows={3}
                spellCheck={'false'}
                defaultValue={'{}'}
              />
              <p className={'hint'}>
                {
                  'Example: {"Leads":"D"}. The column must be entirely unused. Only saved copies receive new headers; existing cells are never overwritten.'
                }
              </p>
            </details>
            <div className={'experiment-buttons'}>
              <Button variant="primary" id={'reviewPreview'}>
                {'Generate preview →'}
              </Button>
              <Button id={'reviewReset'} className={'secondary'}>
                {'Restore saved mapping'}
              </Button>
            </div>
            <p className={'hint'}>
              {
                'Mapping drafts stay temporary until you explicitly save a reviewed revision. Original files stay unchanged.'
              }
            </p>
          </section>
          <aside className="panel import-field-guide">
            <p className="page-eyebrow">A quick field guide</p>
            <h3>Match meaning, not position</h3>
            <dl>
              <div>
                <dt>Email</dt>
                <dd>The column containing the carrier’s contact email address.</dd>
              </div>
              <div>
                <dt>Company</dt>
                <dd>The company or carrier name used for identification and personalization.</dd>
              </div>
              <div>
                <dt>Outreach status</dt>
                <dd>
                  Your contact progress, such as Sent. This is separate from a carrier’s operating
                  status.
                </dd>
              </div>
            </dl>
            <p className="hint">
              Missing an outreach Status column? Use the suggested unused column. Only the saved
              copy gets the new header.
            </p>
            <Button data-import-go="0">Look at the original rows</Button>
          </aside>
        </div>
        <footer className="import-step-footer">
          <Button data-import-go="0">← Source</Button>
          <span>Generate a preview when the columns look right.</span>
        </footer>
      </section>
      <section id="importStepPreview" data-import-view="2" className="import-step-view">
        <StepHeading
          number={3}
          title="Review the proposed result"
          description="Compare your proposal with the saved mapping. Check the changes and remaining issues before creating a copy."
        />
        <div id="importPreviewSummary" />
        <footer className="import-step-footer">
          <Button data-import-go="1">← Adjust columns</Button>
          <Button variant="primary" data-import-go="3">
            Continue to source details →
          </Button>
        </footer>
      </section>
      <section id="importStepSave" data-import-view="3" className="import-step-view">
        <StepHeading
          number={4}
          title="Save a copy you can come back to"
          description="Record where these leads came from, then save the reviewed preview. Saving and activation are separate decisions."
        />
        <div className="import-save-promise">
          <div>
            <strong>Saved as a new revision</strong>
            <p>The workbook copy, mapping and source details stay together.</p>
          </div>
          <div>
            <strong>Not activated yet</strong>
            <p>Your campaign keeps its current workbook until the final step.</p>
          </div>
        </div>
        <section id={'repairPanel'} className={'panel experiment-repair'} hidden={true}>
          <h3>Source & confirmation</h3>
          <p className={'hint'}>
            {
              'This saves the exact preview as a recoverable copy. The current campaign workbook will not change until you activate a revision in the next step.'
            }
          </p>
          <div className={'experiment-source-fields'}>
            <label htmlFor={'repairSource'}>
              {'Where did these leads come from?'}
              <Input
                id={'repairSource'}
                maxLength={200}
                placeholder={'Export, supplier, or existing contact list'}
              />
            </label>
            <label htmlFor={'repairAcquired'}>
              {'Source acquisition date (optional)'}
              <Input id={'repairAcquired'} type={'date'} />
            </label>
            <label htmlFor={'repairPermission'}>
              {'Contact permission stated by operator'}
              <Select id={'repairPermission'}>
                <option value={'unknown'}>{'Unknown / not established'}</option>
                <option value={'requested_contact'}>{'Carrier requested contact'}</option>
                <option value={'existing_relationship'}>{'Existing relationship'}</option>
              </Select>
            </label>
          </div>
          <label className={'check'}>
            <Input id={'repairConfirm'} type={'checkbox'} />
            {'Save this reviewed copy without starting outreach.'}
          </label>
          <Button id={'repairApply'} variant="primary" disabled={true}>
            {'Save reviewed revision'}
          </Button>
          <p id="repairReadiness" className="import-readiness" role="status" />
          <p id={'repairPreviewNote'} className={'hint'}>
            {'Preview your proposal before saving.'}
          </p>
        </section>

        <footer className="import-step-footer">
          <Button data-import-go="2">← Review preview</Button>
          <span>After saving, you’ll choose whether to activate the copy.</span>
        </footer>
      </section>
      <section id="importStepActivate" data-import-view="4" className="import-step-view">
        <StepHeading
          number={5}
          title="Choose what your campaign will use"
          description="Inspect a saved copy, then activate it when ready. Activation keeps outreach paused so you can review the campaign leads."
        />
        <section id={'workspacePanel'} className={'panel experiment-workspace'} hidden={true}>
          <div className={'experiment-result-heading'}>
            <h3>Choose a saved revision</h3>
            <Button id={'workspaceRefresh'} className={'secondary'}>
              {'Refresh revisions'}
            </Button>
          </div>
          <p id={'workspaceNote'} className={'hint'} role={'status'}></p>
          <section id="importNextSteps" className="panel" hidden>
            <h3>Workbook activated</h3>
            <p id="importNextStepsNote" className="hint" role="status" />
            <div className="experiment-buttons">
              <Button id="importIncludeCampaign" variant="primary">
                Include campaign in outreach queue
              </Button>
              <ActionLink href="#outreachRunner">Open outreach controls →</ActionLink>
            </div>
          </section>
          <div className={'experiment-form import-activation-decision'}>
            <label htmlFor={'workspaceRevision'}>
              {'Revision'}
              <Select id={'workspaceRevision'}></Select>
            </label>
            <Button id={'workspaceRestore'} variant="primary">
              {'Activate selected copy'}
            </Button>
          </div>
          <p className={'hint'}>
            {
              'Activation creates a separate campaign workbook. Previous workbooks, saved revisions, carrier IDs and contact protections are retained. Outreach stays paused until you enable the campaign.'
            }
          </p>
          <details className="import-recovery-tools">
            <summary>Download, edit or recover a copy</summary>
            <div className="experiment-buttons">
              {' '}
              <Button id={'workspaceDraft'} className={'secondary'}>
                {'Edit this copy’s mapping'}
              </Button>
              <Button id={'workspaceUndo'} className={'secondary'}>
                {'Undo last activation'}
              </Button>
            </div>{' '}
            <div id={'workspaceDownloads'} className={'experiment-buttons'} hidden={true}>
              <ActionLink id={'workspaceWorking'} className={'button secondary'}>
                {'Download workbook copy'}
              </ActionLink>
              <ActionLink id={'workspaceOriginal'} className={'button secondary'}>
                {'Download original snapshot'}
              </ActionLink>
              <ActionLink id={'workspaceMapping'} className={'button secondary'}>
                {'Download mapping & provenance'}
              </ActionLink>
            </div>
            <p className={'hint'}>
              {
                'Workbook copies retain the source field layout. The saved mapping controls how rows are read; only explicitly added Status headers change workbook cells.'
              }
            </p>
          </details>
          <h3 className="import-records-heading">Verify the saved records</h3>
          <p className="hint">
            Look up a few carriers and check their source evidence and contact protections before
            activation.
          </p>
          <div id={'workspaceIdentity'} className={'experiment-identity-summary'}></div>
          <p className={'hint'}>
            {
              'USDOT grouping is based on source data and has not been verified with FMCSA. Conflicts and layout issues stay in review. No sending eligibility is granted here.'
            }
          </p>
          <div className={'experiment-form'}>
            <label htmlFor={'workspaceSearch'}>
              {'Find a carrier, email, USDOT, or carrier ID'}
              <Input id={'workspaceSearch'} type={'search'} />
            </label>
            <Button id={'workspaceFind'} className={'secondary'}>
              {'Find records'}
            </Button>
          </div>
          <div className={'experiment-scroll'}>
            <table>
              <thead>
                <tr>
                  <th>{'Carrier / contact'}</th>
                  <th>{'Identity'}</th>
                  <th>{'Source evidence'}</th>
                  <th>{'Contact protections'}</th>
                </tr>
              </thead>
              <tbody id={'workspaceRows'}></tbody>
            </table>
          </div>
          <div className={'experiment-result-heading'}>
            <p id={'workspacePage'} className={'hint'}></p>
            <div className={'experiment-buttons'}>
              <Button id={'workspacePrev'} className={'secondary'}>
                {'Previous'}
              </Button>
              <Button id={'workspaceNext'} className={'secondary'}>
                {'Next'}
              </Button>
            </div>
          </div>
        </section>

        <footer className="import-step-footer">
          <Button data-import-go="0">Back to source</Button>
          <Button id="importInspectLeads">Inspect this campaign’s leads →</Button>
        </footer>
      </section>
    </section>
  );
}
