import { Input, Panel } from '../../design-system/primitives';
import { updateUIPreferences, useUIPreferences } from '../../shared/ui-preferences';

export function AppearanceSettings() {
  const { preferences, persisted } = useUIPreferences();
  return (
    <section className="settings-appearance-content">
      <div className="settings-grid">
        <Panel as="div" className="settings-card">
          <p className="page-eyebrow">Workspace visibility</p>
          <h2>Your context, when you need it</h2>
          <div
            className="settings-context-preview"
            aria-hidden="true"
            data-visible={preferences.workspaceContextEnabled}
          >
            <span className="settings-preview-brand" />
            <div className="settings-preview-context">
              <i />
              <i />
              <i />
            </div>
            <div className="settings-preview-content">
              <i />
              <i />
            </div>
          </div>
          <label className="appearance-option" htmlFor="showWorkspaceContext">
            <span>
              <strong id="workspaceContextPreferenceLabel">Show workspace context</strong>
              <small id="workspaceContextPreferenceDescription">
                Keep the campaign, mailbox, selected leads and source file above each page. Collapse
                it whenever you need more room.
              </small>
            </span>
            <Input
              id="showWorkspaceContext"
              type="checkbox"
              aria-labelledby="workspaceContextPreferenceLabel"
              aria-describedby="workspaceContextPreferenceDescription"
              checked={preferences.workspaceContextEnabled}
              onChange={(event) =>
                updateUIPreferences({ workspaceContextEnabled: event.currentTarget.checked })
              }
            />
          </label>
          <p className="hint" role="status">
            {persisted
              ? 'Saved automatically in this browser. Applies to every page.'
              : 'Applied for this session. Browser storage is unavailable, so this preference may reset when you reload.'}
          </p>
        </Panel>
      </div>
    </section>
  );
}
