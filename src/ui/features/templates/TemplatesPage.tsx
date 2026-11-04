import { StatusBadge } from '../../design-system/layout';
import { Drawer } from '../../design-system/overlays';
import { Download, Eye, Icon, Plus, Search, Shield, Upload } from '../../design-system/icons';
import {
  Button,
  ButtonLabel,
  Input,
  Panel,
  Select,
  Textarea,
} from '../../design-system/primitives';
const tokens = [
  'firstName',
  'company',
  'city',
  'state',
  'locationPhrase',
  'senderName',
  'businessName',
  'services',
  'legalName',
  'address',
];
export function TemplatesPage() {
  return (
    <>
      <section className="view-page" id="view-templates">
        <div className="page-header">
          <div>
            <p className="page-eyebrow">Message library</p>
            <h1 className="page-title">Template library</h1>
            <p className="page-subtitle">
              Write reusable messages, preview personalization, and control when each template can
              be selected.
            </p>
          </div>
          <div className="header-actions">
            <Button variant="primary" id="newTemplate">
              <Icon icon={Plus} size={14} />
              New template
            </Button>
            <Button id="exportTemplatesBtn" title="Export all templates as JSON">
              <Icon icon={Download} size={14} />
              Export library
            </Button>
            <ButtonLabel htmlFor="importTemplatesFile" title="Import templates from JSON">
              <Icon icon={Upload} size={14} />
              Import templates
            </ButtonLabel>
            <Input id="importTemplatesFile" type="file" accept=".json" hidden />
          </div>
        </div>
        <Panel className="template-library-panel">
          <div className="template-library-toolbar">
            <div>
              <h2>
                Your templates <StatusBadge id="templateCountBadge">0 templates</StatusBadge>
              </h2>
              <p id="templateLibrarySummary" role="status">
                Choose a template to edit its message and selection rules.
              </p>
            </div>
            <div className="template-library-filters">
              <label className="template-library-search">
                <span>Search templates</span>
                <div className="toolbar-search">
                  <Icon icon={Search} />
                  <Input
                    id="templateSearch"
                    type="search"
                    placeholder="Name, subject, message or required field…"
                  />
                </div>
              </label>
              <label>
                <span>Availability</span>
                <Select id="templateStatusFilter">
                  <option value="all">All templates</option>
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </Select>
              </label>
            </div>
          </div>
          <div className="template-library-note">
            <span className="template-note-mark" aria-hidden="true" />
            Enabled templates participate in automatic selection. Required fields and weight
            determine which eligible message is chosen.
          </div>
          <div className="table-wrap template-library-table">
            <table>
              <thead>
                <tr>
                  <th>Message</th>
                  <th>Selection rules</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="templatesTableBody" />
            </table>
          </div>
        </Panel>
      </section>
      <Drawer
        id="templateEditor"
        title="Email template"
        wide
        eyebrow="Message editor"
        description="Write and preview a reusable message. Changes apply only when you save."
        footer={
          <div className="ui-editor-actions">
            <Button id="deleteTemplate" variant="danger" hidden disabled>
              Delete template
            </Button>
            <Button
              className="template-preview-jump"
              onClick={() =>
                document
                  .querySelector('#templateEditor .template-preview-panel')
                  ?.scrollIntoView({ block: 'start', behavior: 'auto' })
              }
            >
              <Icon icon={Eye} size={14} />
              Preview
            </Button>
            <Button variant="primary" id="saveTemplate">
              Save template
            </Button>
          </div>
        }
      >
        <div className="template-editor-grid">
          <div className="template-editor-fields">
            <Panel className="template-compose-panel">
              <div className="template-section-heading">
                <p className="page-eyebrow">01 · Message</p>
                <h3>Compose your template</h3>
                <p>
                  Use a descriptive name to find it later. Personalization is filled in for each
                  lead.
                </p>
              </div>
              <div className="form-group">
                <label htmlFor="templateName">Template name</label>
                <Input
                  id="templateName"
                  placeholder="e.g. First introduction"
                  maxLength={100}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <Input id="subject" placeholder="e.g. A quick question for {{company}}" required />
              </div>
              <details className="template-personalization">
                <summary>
                  Personalization fields <span>Insert into the subject or message</span>
                </summary>
                <div className="token-bar">
                  {tokens.map((token) => (
                    <Button
                      key={token}
                      type="button"
                      size="sm"
                      className="token-chip"
                      data-token={`{{${token}}}`}
                    >{`{{${token}}}`}</Button>
                  ))}
                </div>
              </details>
              <div className="form-group">
                <div className="template-message-label">
                  <label htmlFor="body">Message</label>
                  <Button
                    type="button"
                    id="insertOptOutChip"
                    size="sm"
                    title="Add opt-out wording to the message"
                  >
                    <Icon icon={Shield} size={12} />
                    Add opt-out line
                  </Button>
                </div>
                <Textarea
                  id="body"
                  rows={12}
                  placeholder="Write your message. Use personalization fields to adapt it to each lead."
                  required
                />
                <p className="hint">
                  Your existing mailbox signature is added in webmail. Review the message and
                  opt-out wording before sending.
                </p>
              </div>
            </Panel>
            <Panel className="template-selection-panel">
              <div className="template-section-heading">
                <p className="page-eyebrow">02 · Selection rules</p>
                <h3>When this template is used</h3>
                <p>These rules affect automatic template selection, not the sample preview.</p>
              </div>
              <label className="template-enabled-field">
                <Input id="templateEnabled" type="checkbox" defaultChecked />
                <span>
                  <strong>Enable automatic selection</strong>
                  <small>
                    Turn off to keep the template in your library without including it in automatic
                    selection.
                  </small>
                </span>
              </label>
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="templateWeight">Selection weight</label>
                  <Input
                    id="templateWeight"
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    defaultValue="1"
                    required
                  />
                  <p className="hint">
                    A weight of 2 is twice as likely as 1 among otherwise eligible templates.
                  </p>
                </div>
                <div className="form-group">
                  <label htmlFor="requiredFields">Required lead fields</label>
                  <Input id="requiredFields" placeholder="e.g. city, state" />
                  <p className="hint">
                    Separate field names with commas. Leads missing these fields skip this template.
                  </p>
                </div>
              </div>
            </Panel>
          </div>
          <Panel className="template-preview-panel">
            <div className="panel-head">
              <h2 className="panel-title">
                <Icon icon={Eye} size={16} />
                Live preview
              </h2>
              <StatusBadge id="templateComplianceStatus">Draft</StatusBadge>
            </div>
            <p className="template-preview-recipient">
              <span className="page-eyebrow">Sample recipient</span>
              <strong>Alex Example</strong>
              <span>
                contact@example.com · Example Carrier LLC
                <br />
                Dallas, TX
              </span>
            </p>
            <div className="message-preview-box" id="templateLivePreview">
              Write a subject and message to see the sample preview.
            </div>
            <div className="signature-box">
              <strong>Mailbox signature</strong>
              <br />
              <span>
                Your mailbox’s existing signature is added in webmail. It is not included in this
                sample preview.
              </span>
            </div>
            <p className="hint">
              Sample data helps you check wording and layout. Actual messages use the selected lead
              and mailbox profile; saving does not send a message.
            </p>
          </Panel>
        </div>
      </Drawer>
    </>
  );
}
