import { Button, Dialog, Input, Select } from '../../design-system/primitives';
export function MailboxToolsDialog() {
  return (
    <Dialog
      id={'mailroomToolsDialog'}
      className={'mailroom-dialog mailroom-wide'}
      aria-label={'Mailbox tools'}
    >
      <div className={'mailroom-dialog-heading'}>
        <h2>{'Mailbox tools'}</h2>
        <Button size="sm" className={'secondary'} data-close-mailroom={'mailroomToolsDialog'}>
          {'Close mailbox tools'}
        </Button>
      </div>
      <p className="mailroom-settings-intro">
        Manage conversation capture for this PC. Reading replies and sending outreach use separate
        connections.
      </p>
      <nav className="mailroom-settings-nav" aria-label="Mailbox tool sections">
        <Button type="button" variant="ghost" data-mailroom-section="status">
          Connection & sync
        </Button>
        <Button type="button" variant="ghost" data-mailroom-section="setup">
          Mailbox setup
        </Button>
        <Button type="button" variant="ghost" data-mailroom-section="import">
          Import a message
        </Button>
      </nav>
      <p id={'replyStatus'} className={'hint'} role={'status'} aria-live={'polite'}>
        {'Loading…'}
      </p>{' '}
      <details id={'replyCaptureTools'} className={'panel reply-tools'}>
        <summary id={'replyCaptureSummary'}>{'Capture & mailbox setup'}</summary>
        <div className={'experiment-result-heading'}>
          <h2>{'Capture replies'}</h2>
          <div className={'experiment-buttons'}>
            <Button id={'replyHistory'} className={'secondary'}>
              {'Load local sent history'}
            </Button>
            <Button hidden={true} id={'replyDemo'} className={'secondary'}>
              {'Load sample inbox'}
            </Button>
          </div>
        </div>
        <p id={'replyCaptureNote'} className={'hint'}></p>
        <p id={'replyCoverage'} className={'hint'}></p>
        <div id={'replyMonitor'}></div>
        <details id={'replyConfigPanel'}>
          <summary>{'Read-only mailbox capture settings'}</summary>
          <fieldset id="mailroomConfigFields">
            <ol className="mailroom-setup-steps">
              <li>Choose or add an authorized mailbox</li>
              <li>Set the history and sync options</li>
              <li>Authorize access, then save</li>
            </ol>
            <p className={'hint'}>
              {
                'Choose mailboxes you are authorized to read. Passwords/tokens stay in this PC’s .env file; enter their environment-variable names here. TLS is required. Captured coverage and errors remain visible below.'
              }
            </p>
            <div className={'reply-config-grid'}>
              <label className="check">
                <Input id={'replyConfigEnabled'} type={'checkbox'} /> Capture enabled
              </label>
              <label className="check">
                <Input id={'replyConfigAuto'} type={'checkbox'} /> Check automatically
              </label>
              <label className={'check'}>
                <Input id={'replyConfigAll'} type={'checkbox'} />
                {'Read all available history'}
              </label>
              <label className={'check'}>
                <Input id={'replyConfigAllFolders'} type={'checkbox'} />
                {'Include archive and other available folders (excluding Drafts)'}
              </label>
              <label>
                {'Automatic pages per folder/check'}
                <Input
                  id={'replyConfigPages'}
                  type={'number'}
                  min={'1'}
                  max={'10'}
                  defaultValue={'5'}
                />
              </label>
              <label>
                {'Automatic sync from'}
                <Input id={'replyConfigSince'} type={'date'} />
              </label>
              <label>
                {'Messages per page'}
                <Input
                  id={'replyConfigBatch'}
                  type={'number'}
                  min={'1'}
                  max={'100'}
                  defaultValue={'50'}
                />
              </label>
            </div>
            <div className={'reply-config-reuse'}>
              <label>
                {'Existing mailbox credentials'}
                <Select id={'replyExistingMailbox'}>
                  <option value={''}>{'Choose a saved mailbox setup…'}</option>
                </Select>
              </label>
              <Button id={'replyUseExistingMailbox'} className={'secondary'} type={'button'}>
                {'Use existing mailbox setup'}
              </Button>
              <p id={'replyExistingMailboxNote'} className={'hint'}>
                {
                  'Reuses environment-variable references only. Save and authorize read-only capture separately.'
                }
              </p>
            </div>
            <div id={'replyConfigMailboxes'}></div>
            <Button id={'replyConfigAdd'} className={'secondary'}>
              {'Add mailbox'}
            </Button>
            <label className={'check'}>
              <Input id={'replyConfigConfirm'} type={'checkbox'} />
              {'I authorize read-only access to these configured mailboxes.'}
            </label>
            <Button variant="primary" id={'replyConfigSave'}>
              {'Save capture settings'}
            </Button>
            <p id={'replyConfigNote'} className={'hint'}></p>
            <p id="mailroomConfigFeedback" className="hint" role="status" aria-live="polite" />
            <Button id={'replyBackfill'} className={'secondary'}>
              {'Restart reply backfill'}
            </Button>
            <p className={'hint'}>
              {
                'Retains captured messages, reviews and opt-out protections. Folder cursors are restarted only.'
              }
            </p>
          </fieldset>
        </details>
        <details id="mailroomImportSection">
          <summary>{'Import one exported reply (.eml)'}</summary>
          <div className={'reply-import-form'}>
            <label htmlFor={'replyImportAccount'}>
              {'Receiving/sending mailbox'}
              <Select id={'replyImportAccount'}></Select>
            </label>
            <label htmlFor={'replyEml'}>
              {'Exported message'}
              <Input id={'replyEml'} type={'file'} accept={'.eml,message/rfc822'} />
            </label>
            <Button id={'replyImport'} className={'secondary'}>
              {'Import EML'}
            </Button>
          </div>
          <p className={'hint'}>
            {
              'Use an authorized exported message, up to 2 MB. The mailbox needs a confirmed tool-sent email; imported contacts alone are excluded. Unknown contacts/references are not retained. Imported messages receive the same matching and review rules as IMAP capture.'
            }
          </p>
        </details>
      </details>
      <p id={'replyProtection'} className={'reply-protection'} role={'status'} hidden={true}></p>
      <p id={'replyProtectionDelivery'} className={'hint'} role={'status'}></p>
      <div id={'replyMetrics'} className={'experiment-metrics'}></div>
      <p id={'replyMetricNote'} className={'hint'}></p>
    </Dialog>
  );
}
