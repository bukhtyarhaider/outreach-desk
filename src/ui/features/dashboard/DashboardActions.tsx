import { DashboardPanelHeader } from './DashboardPanelHeader';
import { Notice, StatusBadge } from '../../design-system/layout';
import { ActionLink, Button, Input, Panel, Progress } from '../../design-system/primitives';
import { Icon, Play, Square, Send, Activity, Mail, Users } from '../../design-system/icons';
import { useWorkspace } from '../../shared/workspace-store';
import { outreachStartBlocker } from './readiness';
export function OutreachRunnerPanel() {
  const { state } = useWorkspace();
  const included = state?.campaigns.filter((c) => c.enabled && !c.reviewRequired).length ?? 0;
  return (
    <Panel className="dispatch-panel" id="outreachRunner" aria-label="Outreach runner controls">
      <DashboardPanelHeader
        icon={Activity}
        title="Outreach runner"
        description={`Continuous · ${included} ${included === 1 ? 'campaign' : 'campaigns'} included`}
        actions={
          <span className="status-badge" id="jobStatus">
            Idle
          </span>
        }
      />
      <div className="dispatch-command">
        <div>
          <p id="jobMessage" className="runner-message">
            Loading queue status…
          </p>
          <span id="nextSend" className="dispatch-next" />
        </div>
        <div className="dispatch-buttons">
          <Button
            variant="primary"
            id="start"
            disabled={!!outreachStartBlocker(state)}
            aria-describedby="jobMessage"
            aria-label="Start continuous outreach"
          >
            <Icon icon={Play} size={14} />
            Start outreach
          </Button>
          <Button variant="danger" id="stop" hidden>
            <Icon icon={Square} size={14} />
            Stop outreach
          </Button>
        </div>
      </div>
      <div className="dashboard-capacity">
        <dl>
          <div>
            <dt>Rolling hour remaining</dt>
            <dd>{state?.remaining ?? '—'}</dd>
          </div>
          <div>
            <dt>Rolling 24h remaining</dt>
            <dd>{state?.dayRemaining ?? '—'}</dd>
          </div>
        </dl>
        <Progress id="progress" value={0} max={1} aria-label="Outreach queue progress" />
      </div>
      <p className="dispatch-allowance">
        <span id="quota">Loading hourly and daily allowances…</span>
      </p>
      {!included && (
        <p className="hint">
          <a href="#campaigns">Review campaigns and include one in the queue →</a>
        </p>
      )}
      {!!included && !state?.connected && (
        <p className="hint">
          Connect your mailbox below. A started queue waits for the mailbox connection before
          sending.
        </p>
      )}
      {state?.prepared && (
        <Notice tone="warning">
          A message is prepared. Complete or release it in the lead preview before starting the
          queue.
        </Notice>
      )}
      <footer className="dispatch-footer">
        <ActionLink size="sm" href="#settings">
          Sending rules
        </ActionLink>
        <a href="#live-activity">View live activity →</a>
      </footer>
    </Panel>
  );
}
export function MailboxConnectionPanel() {
  const { state } = useWorkspace();
  const profile = state?.profiles.find((p) => p.id === state.activeProfile);
  return (
    <Panel className="dashboard-mailbox" aria-label="Active mailbox connection">
      <DashboardPanelHeader
        icon={Mail}
        title="Mailbox"
        description="Active sending account"
        actions={
          <StatusBadge tone={state?.connected ? 'positive' : 'warning'}>
            {state?.connected ? 'Connected' : state?.signInOpen ? 'Sign-in open' : 'Disconnected'}
          </StatusBadge>
        }
      />
      <div className="dashboard-mailbox-identity">
        <span className="dashboard-mailbox-avatar" aria-hidden="true">
          {Array.from(profile?.name || profile?.email || '?')[0].toLocaleUpperCase()}
        </span>
        <div>
          <strong>{profile?.name || 'No mailbox profile'}</strong>
          <p>{profile?.email || 'Add a mailbox in Accounts to get started.'}</p>
        </div>
      </div>
      <div className="dashboard-mailbox-actions">
        <Button variant="primary" id="connect" disabled>
          Connect mailbox
        </Button>
        <Button id="resume" hidden>
          Continue sign-in
        </Button>
        <Button id="disconnect" variant="danger" hidden>
          Disconnect
        </Button>
      </div>
      <p className="hint" id="browserSessionStatus" role="status" aria-live="polite">
        Connect your mailbox.
      </p>
      <details className="connection-help">
        <summary>Password & session options</summary>
        <div className="form-group">
          <label htmlFor="password">Password (optional for a saved session)</label>
          <Input
            id="password"
            type="password"
            autoComplete="off"
            placeholder="Or sign in directly in the browser"
          />
        </div>
        <p className="hint">
          Passwords are passed to the local login form and are not stored. Browser sessions stay on
          this device; disconnecting keeps the saved session.
        </p>
      </details>
      <footer className="dispatch-footer">
        <a href="#accounts">Manage mailbox profiles →</a>
      </footer>
    </Panel>
  );
}
export function ManualBatchPanel() {
  const { state, selected } = useWorkspace();
  const campaign = state?.campaigns.find((item) => item.id === state.activeCampaign);
  return (
    <Panel className="dashboard-batch" aria-label="Selected lead batch">
      <DashboardPanelHeader
        icon={Users}
        title="Selected batch"
        description="Manual outreach · active campaign"
        actions={
          <StatusBadge id="selectedCount" tone={selected ? 'info' : 'neutral'}>
            0 selected
          </StatusBadge>
        }
      />
      <div className="dashboard-batch-summary">
        <strong>{selected ? 'Your selected audience' : 'Build a focused batch'}</strong>
        <p title={campaign?.name}>{campaign?.name || 'No active campaign'}</p>
      </div>
      <p className="hint">
        {selected
          ? 'Send only the leads selected in the active campaign.'
          : 'Choose specific leads when you want a manual batch instead of the continuous queue.'}
      </p>
      <label className="check">
        <Input id="randomTemplates" type="checkbox" defaultChecked />
        Randomly select enabled, matching templates
      </label>
      <label htmlFor="sendingTemplate">
        Fixed sending template (used when random selection is off)
      </label>
      <select id="sendingTemplate" defaultValue="">
        <option value="">Choose a sending template</option>
        {Object.entries(state?.templates ?? {})
          .filter(([, t]) => t.enabled !== false)
          .map(([key, t]) => (
            <option key={key} value={key}>
              {t.name}
            </option>
          ))}
      </select>
      <p className="hint">
        This policy applies to selected batches and continuous outreach. Preview wording is selected
        separately in the lead drawer.
      </p>
      <div className="form-actions dashboard-batch-actions">
        <Button id="batch">
          <Icon icon={Send} size={14} />
          Send selected leads
        </Button>
        <ActionLink variant={selected ? 'secondary' : 'primary'} href="#leads">
          {selected ? 'Review selection' : 'Select leads'}
        </ActionLink>
      </div>
    </Panel>
  );
}
