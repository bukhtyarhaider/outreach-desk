import { Button, Select } from '../../design-system/primitives';
import { useWorkspace, workbookLabel } from '../../shared/workspace-store';
import { updateUIPreferences, useUIPreferences } from '../../shared/ui-preferences';
import { Icon, Mail, Folder, Users, Activity, ChevronDown } from '../../design-system/icons';
export function WorkspaceContext() {
  const { state, selected } = useWorkspace();
  const { preferences } = useUIPreferences();
  const collapsed = preferences.workspaceContextCollapsed;
  const profile = state?.profiles.find((item) => item.id === state.activeProfile);
  const campaign = state?.campaigns.find((item) => item.id === state.activeCampaign);
  return (
    <section
      className="workspace-context-shell"
      aria-label="Current workspace"
      hidden={!preferences.workspaceContextEnabled}
    >
      <div className="context-toolbar">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="context-toggle"
          aria-label={`${collapsed ? 'Expand' : 'Collapse'} workspace context`}
          aria-expanded={!collapsed}
          aria-controls="workspaceContextContent"
          onClick={() => updateUIPreferences({ workspaceContextCollapsed: !collapsed })}
        >
          <Icon icon={ChevronDown} size={14} />
          Workspace context
        </Button>
        {collapsed && (
          <div className="context-summary">
            <span title={campaign?.name}>{campaign?.name || 'No campaign selected'}</span>
            <span title={profile?.email}>
              {state?.connected ? 'Connected' : 'Disconnected'} · {selected} selected
            </span>
          </div>
        )}
      </div>
      {/* Keep controller-owned fields mounted so hiding context never resets a selection. */}
      <div className="workspace-context" id="workspaceContextContent" hidden={collapsed}>
        <label className="context-field">
          <span>
            <Icon icon={Folder} size={13} /> Campaign
          </span>
          <Select id="campaignSelect" aria-label="Active campaign" title={campaign?.name} />
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
        <a href="#outreachRunner" className="context-runner" title="Open outreach controls">
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
            File: <span id="workbookName">{workbookLabel(state)}</span>
          </span>
          <a href="#leads">{state?.sheets.length ?? 0} worksheets · inspect source</a>
        </div>
      </div>
    </section>
  );
}
