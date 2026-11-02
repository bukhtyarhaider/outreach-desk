import {
  SettingsDraftActions,
  SettingsTools,
  SettingsChangeReview,
  SettingsSaveScope,
} from './SettingsTools';
import { SectionHeader } from '../../design-system/layout';
import { AppearanceSettings } from './AppearanceSettings';
import { SendingSettings } from './SendingSettings';
import { ChecksSettings } from './ChecksSettings';
import { FirebaseSettings } from './FirebaseSettings';
import { TeamSettings } from './TeamSettings';
import { AboutSettings } from './AboutSettings';
import { SettingsTabs, settingsTabs, useSettingsTab } from './SettingsTabs';
const content = {
  settingsSending: SendingSettings,
  settingsChecks: ChecksSettings,
  settingsConnections: FirebaseSettings,
  settingsTeam: TeamSettings,
  settingsAppearance: AppearanceSettings,
  settingsAbout: AboutSettings,
};
export function SettingsPage() {
  const active = useSettingsTab();
  const instant = active.id === 'settingsAppearance' || active.id === 'settingsAbout';
  return (
    <section className="view-page" id="view-settings">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Configuration</p>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">
            Configure sending and connections for this PC. Review edits before applying them.
          </p>
        </div>
        <SettingsDraftActions instant={instant} />
      </div>
      <SettingsTabs active={active.id} />
      <SettingsTools />
      <SettingsSaveScope active={active.id} />
      <p id="settingsSaveFeedback" className="settings-save-feedback" role="status" hidden />
      <SettingsChangeReview />
      {settingsTabs.map((tab) => {
        const Content = content[tab.id];
        return (
          <section
            key={tab.id}
            id={tab.id}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            hidden={active.id !== tab.id}
            className="settings-tab-panel"
          >
            <SectionHeader title={tab.label} description={tab.description} />
            <Content />
          </section>
        );
      })}
    </section>
  );
}
