import { Button } from '../../design-system/primitives';
import { SectionHeader } from '../../design-system/layout';
import { AppearanceSettings } from './AppearanceSettings';
import { SendingSettings } from './SendingSettings';
import { ChecksSettings } from './ChecksSettings';
import { FirebaseSettings } from './FirebaseSettings';
import { TeamSettings } from './TeamSettings';
import { AboutSettings } from './AboutSettings';
import { SettingsTabs, settingsTabs, useSettingsTab } from './SettingsTabs';
const content = [
  SendingSettings,
  ChecksSettings,
  FirebaseSettings,
  TeamSettings,
  AppearanceSettings,
  AboutSettings,
];
export function SettingsPage() {
  const active = useSettingsTab();
  const instant = active.id === 'settingsAppearance' || active.id === 'settingsAbout';
  return (
    <section className="view-page" id="view-settings">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Configuration</p>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">A focused place for each part of your workspace.</p>
        </div>
        <div className="header-actions" hidden={instant}>
          <Button variant="primary" id="saveSettings">
            Save changes
          </Button>
        </div>
      </div>
      <SettingsTabs active={active.id} />
      <p className="settings-save-scope">
        {active.id === 'settingsAppearance'
          ? 'Browser preference · saved automatically on this device.'
          : active.id === 'settingsAbout'
            ? 'Application details · no configuration changes here.'
            : 'Save changes applies your sending, checks, Firebase and team edits together. Switching tabs keeps unfinished edits.'}
      </p>
      <p id="settingsSaveFeedback" className="settings-save-feedback" role="status" hidden />
      {settingsTabs.map((tab, index) => {
        const Content = content[index];
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
