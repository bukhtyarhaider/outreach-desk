import { Panel, ActionLink } from '../../design-system/primitives';
export function AboutSettings() {
  return (
    <Panel className="settings-card settings-about-card">
      <p className="page-eyebrow">Outreach Desk</p>
      <h2>Your outreach workspace</h2>
      <p className="hint">
        Desktop campaign management, reviewed carrier conversations and mailbox-based outreach.
      </p>
      <div className="settings-about-release">
        <div>
          <strong>Internal build catalog</strong>
          <p>See internal testing checkpoints, the installed build, and what changed.</p>
        </div>
        <ActionLink href="#catalog">View build history →</ActionLink>
      </div>
      <details className="settings-technical">
        <summary>Application & technical details</summary>
        <dl className="settings-system-info">
          <div>
            <dt>Application</dt>
            <dd>Outreach Desk (Desktop Edition)</dd>
          </div>
          <div>
            <dt>Architecture</dt>
            <dd>Playwright Webmail Automation & Queue Coordinator</dd>
          </div>
          <div>
            <dt>Lead engineer / developer</dt>
            <dd>Bukhtyar Haider</dd>
          </div>
        </dl>
      </details>
    </Panel>
  );
}
