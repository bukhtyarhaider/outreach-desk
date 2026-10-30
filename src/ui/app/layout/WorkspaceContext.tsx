import { Select } from '../../design-system/primitives';
import { useWorkspace, workbookLabel } from '../../shared/workspace-store';
import { Icon, Mail, Folder, Users, Activity } from '../../design-system/icons';
export function WorkspaceContext() {
  const { state, selected } = useWorkspace();
  const profile = state?.profiles.find((item) => item.id === state.activeProfile);
  return (
    <section className="workspace-context" aria-label="Current workspace">
      <label className="context-field">
        <span>
          <Icon icon={Folder} size={13} /> Campaign
        </span>
        <Select id="campaignSelect" aria-label="Active campaign" />
      </label>
      <label className="context-field">
        <span>
          <Icon icon={Mail} size={13} /> Mailbox
        </span>
        <Select id="profileSelect" aria-label="Active mailbox profile" />
        <small>{profile?.email || 'Choose a mailbox'}</small>
        <small className="context-connection">
          {state?.connected ? 'Mailbox connected' : 'Mailbox disconnected'}
        </small>
      </label>
      <a href="#leads" className="context-selection">
        <Icon icon={Users} size={15} />
        <strong>{selected} selected</strong>
        <small>View batch</small>
      </a>
      <a href="#live-activity" className="context-runner">
        <span>
          <Icon icon={Activity} size={14} />
          {state?.job.status || 'Loading queue…'}
        </span>
        <small>
          {state
            ? `${state.remaining} hourly · ${state.dayRemaining} daily remaining`
            : 'Loading allowances'}
        </small>
        {state?.job.nextAt && (
          <small>Next: {new Date(state.job.nextAt).toLocaleTimeString()}</small>
        )}
      </a>
      <div className="context-source">
        <span>
          File: <strong>{workbookLabel(state)}</strong>
        </span>
        <a href="#leads">{state?.sheets.length ?? 0} worksheets · inspect source</a>
      </div>
    </section>
  );
}
