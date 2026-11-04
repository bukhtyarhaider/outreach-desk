import { Button, Dialog, Input, Select } from '../../design-system/primitives';
import { Icon, Shield, X } from '../../design-system/icons';
const sections = [
  ['status', 'Overview'],
  ['setup', 'Set up capture'],
  ['import', 'Import a reply'],
];
export function MailboxToolsDialog() {
  return (
    <Dialog
      id="mailroomToolsDialog"
      className="mailroom-dialog mailroom-wide"
      aria-labelledby="mailboxToolsTitle"
      aria-describedby="mailboxToolsDescription"
    >
      <div className="mailroom-dialog-heading">
        <div>
          <p className="page-eyebrow">Unibox connections</p>
          <h2 id="mailboxToolsTitle">Mailbox tools</h2>
          <p id="mailboxToolsDescription">
            Bring replies into Unibox. Sending outreach and reading replies use separate
            connections.
          </p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Close mailbox tools"
          data-close-mailroom="mailroomToolsDialog"
        >
          <Icon icon={X} size={18} />
        </Button>
      </div>
      <nav className="mailroom-settings-nav" role="tablist" aria-label="Mailbox tool sections">
        {sections.map(([key, label]) => (
          <Button
            key={key}
            id={`mailbox-tools-tab-${key}`}
            size="sm"
            role="tab"
            aria-selected={key === 'status'}
            aria-controls={
              key === 'setup'
                ? 'replyConfigPanel'
                : key === 'import'
                  ? 'mailroomImportSection'
                  : 'replyCaptureTools'
            }
            tabIndex={key === 'status' ? 0 : -1}
            data-mailroom-section={key}
          >
            {label}
          </Button>
        ))}
      </nav>
      <p id="replyStatus" className="mailbox-tools-status" role="status" aria-live="polite">
        Loading mailbox status…
      </p>
      <p
        id="mailroomConfigFeedback"
        className="mailbox-tools-feedback"
        role="status"
        aria-live="polite"
      />
      <div className="mailbox-tools-body">
        <section
          id="replyCaptureTools"
          className="mailbox-tools-panel"
          role="tabpanel"
          aria-labelledby="mailbox-tools-tab-status"
        >
          <div className="mailbox-tools-next">
            <div>
              <p className="page-eyebrow">Your next step</p>
              <h3 id="mailroomNextStepTitle">Connect a mailbox to capture replies</h3>
              <p id="mailroomNextStepText">
                Set up read-only Inbox access, or import an exported reply without connecting a
                provider.
              </p>
            </div>
            <Button variant="primary" data-mailroom-section="setup">
              Set up capture
            </Button>
          </div>
          <section className="mailbox-tools-card">
            <h3 id="replyCaptureSummary">Capture connection</h3>
            <p id="replyCaptureNote" className="hint" />
            <div id="replyMonitor" />
          </section>
          <section className="mailbox-tools-card">
            <h3>How much history is covered?</h3>
            <p id="replyCoverage" className="hint" />
            <p className="hint">
              After setup, close these tools and choose <strong>Scan previous replies</strong> in
              Unibox to check available history. Browser sign-in alone does not enable capture.
            </p>
            <Button id="replyHistory" size="sm">
              Refresh local sent history
            </Button>
            <p className="hint">
              Updates conversation starting points from this PC’s saved sends. It does not fetch
              messages from a provider.
            </p>
            <Button id="replyDemo" hidden>
              Load sample inbox
            </Button>
          </section>
          <p id="replyProtection" className="reply-protection" role="status" hidden />
          <p id="replyProtectionDelivery" className="hint" role="status" />
          <details className="mailbox-tools-diagnostics">
            <summary>Captured evidence & diagnostics</summary>
            <div id="replyMetrics" className="experiment-metrics" />
            <p id="replyMetricNote" className="hint" />
          </details>
        </section>
        <section
          id="replyConfigPanel"
          className="mailbox-tools-panel"
          role="tabpanel"
          aria-labelledby="mailbox-tools-tab-setup"
          hidden
        >
          <fieldset id="mailroomConfigFields">
            <section className="mailbox-tools-card">
              <div className="mailbox-tools-step">
                <span>1</span>
                <div>
                  <h3>Choose a mailbox</h3>
                  <p>
                    Reuse a saved read-only connection, or add the mailbox details manually. Adding
                    a mailbox here changes a draft until you save.
                  </p>
                </div>
              </div>
              <div className="reply-config-reuse">
                <label>
                  Saved connection
                  <Select id="replyExistingMailbox">
                    <option value="">Choose a saved mailbox setup…</option>
                  </Select>
                </label>
                <Button id="replyUseExistingMailbox" type="button" size="sm">
                  Add saved connection
                </Button>
                <p id="replyExistingMailboxNote" className="hint">
                  Reuses credential references; you still need to authorize capture below.
                </p>
              </div>
              <div id="replyConfigMailboxes" />
              <Button id="replyConfigAdd" size="sm">
                Add mailbox manually
              </Button>
            </section>
            <section className="mailbox-tools-card">
              <div className="mailbox-tools-step">
                <span>2</span>
                <div>
                  <h3>Choose what to capture</h3>
                  <p>
                    Replies are matched to emails already sent through this tool. Settings apply to
                    all capture mailboxes on this PC.
                  </p>
                </div>
              </div>
              <label className="mailbox-tools-choice">
                <Input id="replyConfigEnabled" type="checkbox" />
                <span>
                  <strong>Enable reply capture</strong>
                  <small>
                    Allow read-only checks of the configured mailboxes. Turning this off retains
                    captured conversations.
                  </small>
                </span>
              </label>
              <label className="mailbox-tools-choice">
                <Input id="replyConfigAuto" type="checkbox" />
                <span>
                  <strong>Check automatically while the app runs</strong>
                  <small>Requires capture to be enabled. Turn off to use manual scans only.</small>
                </span>
              </label>
              <label className="mailbox-tools-choice">
                <Input id="replyConfigAll" type="checkbox" />
                <span>
                  <strong>Include all available history</strong>
                  <small>Turn off to choose a starting date for automatic checks.</small>
                </span>
              </label>
              <div className="reply-config-grid">
                <label>
                  Start automatic checks from
                  <Input id="replyConfigSince" type="date" />
                  <small className="hint">Ignored when all available history is selected.</small>
                </label>
              </div>
              <label className="mailbox-tools-choice">
                <Input id="replyConfigAllFolders" type="checkbox" />
                <span>
                  <strong>Include archive and other available folders</strong>
                  <small>Expands beyond Inbox and Sent; Drafts are excluded.</small>
                </span>
              </label>
              <details className="mailbox-tools-advanced">
                <summary>Advanced check limits</summary>
                <p className="hint">
                  Smaller pages reduce work per check. Larger limits process more history per
                  automatic check; they do not change sending limits.
                </p>
                <div className="reply-config-grid">
                  <label>
                    Pages per folder per automatic check
                    <Input id="replyConfigPages" type="number" min="1" max="10" defaultValue="5" />
                  </label>
                  <label>
                    Messages per page
                    <Input
                      id="replyConfigBatch"
                      type="number"
                      min="1"
                      max="100"
                      defaultValue="50"
                    />
                  </label>
                </div>
              </details>
            </section>
            <section className="mailbox-tools-card">
              <div className="mailbox-tools-step">
                <span>3</span>
                <div>
                  <h3>Review & authorize</h3>
                  <p>
                    Check the mailbox details above, authorize read-only access, then save. Saving
                    settings does not prove that the provider connection succeeds; check Overview
                    afterwards.
                  </p>
                </div>
              </div>
              <p className="mailbox-tools-boundary">
                <Icon icon={Shield} size={16} />
                Capture reads messages without sending emails or marking messages as read at the
                provider.
              </p>
              <label className="mailbox-tools-choice">
                <Input id="replyConfigConfirm" type="checkbox" />
                <span>
                  <strong>I authorize read-only access to these mailboxes</strong>
                  <small>Required to save an enabled capture configuration.</small>
                </span>
              </label>
            </section>
            <details className="mailbox-tools-advanced">
              <summary>Recovery: restart folder cursors</summary>
              <p className="hint">
                Use if existing history needs another pass. Captured messages, reviews and opt-out
                protections are retained; only folder cursors restart.
              </p>
              <Button id="replyBackfill" size="sm">
                Restart reply backfill
              </Button>
            </details>
          </fieldset>
        </section>
        <section
          id="mailroomImportSection"
          className="mailbox-tools-panel"
          role="tabpanel"
          aria-labelledby="mailbox-tools-tab-import"
          hidden
        >
          <div className="mailbox-tools-import-heading">
            <p className="page-eyebrow">One message, no provider connection</p>
            <h3>Import an exported reply</h3>
            <p>
              Use a .eml file exported from a mailbox you are authorized to read. This imports one
              message; it does not connect or enable ongoing capture.
            </p>
          </div>
          <ol className="mailbox-tools-import-steps">
            <li>Choose the mailbox that received the reply.</li>
            <li>Select an exported .eml message, up to 2 MB.</li>
            <li>Import it, then review the matching conversation in Unibox.</li>
          </ol>
          <div className="reply-import-form">
            <label htmlFor="replyImportAccount">
              Mailbox that received the reply
              <Select id="replyImportAccount" />
            </label>
            <label htmlFor="replyEml">
              Exported message (.eml)
              <Input id="replyEml" type="file" accept=".eml,message/rfc822" />
            </label>
            <Button id="replyImport" variant="primary">
              Import reply
            </Button>
          </div>
          <p className="mailbox-tools-import-note">
            The mailbox needs a confirmed tool-sent email to match against. Imported contacts alone
            are not enough. Unknown contacts or references are not retained; accepted imports follow
            the same matching and review rules as captured replies.
          </p>
        </section>
      </div>
      <footer className="mailbox-tools-footer" data-mailbox-setup-footer hidden>
        <div>
          <p id="replyConfigNote" className="hint" />
        </div>
        <Button variant="primary" id="replyConfigSave">
          Save capture settings
        </Button>
      </footer>
    </Dialog>
  );
}
