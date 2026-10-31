import { SectionHeader } from '../../design-system/layout';
import { Input, Panel } from '../../design-system/primitives';
import { updateUIPreferences, useUIPreferences } from '../../shared/ui-preferences';

export function AppearanceSettings() {
  const { preferences, persisted } = useUIPreferences();
  return (
    <section className="settings-section" id="settingsAppearance">
      <SectionHeader title="Appearance" description="Make the workspace work for you." />
      <div className="settings-grid">
        <Panel as="div">
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
          <label className="appearance-option" htmlFor="headerRunnerAnimation">
            <span>
              <strong>Header outreach animation</strong>
              <small>
                Show synchronized queue motion in the header while outreach is active.
                Reduced-motion preferences are always respected.
              </small>
            </span>
            <Input
              id="headerRunnerAnimation"
              type="checkbox"
              checked={preferences.headerRunnerAnimation}
              onChange={(event) =>
                updateUIPreferences({ headerRunnerAnimation: event.currentTarget.checked })
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
