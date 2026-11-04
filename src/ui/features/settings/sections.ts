export const settingsTabs = [
  {
    id: 'settingsSending',
    label: 'Sending pace',
    description: 'Set delivery timing, rolling limits and rest breaks.',
    hash: '#settings',
  },
  {
    id: 'settingsChecks',
    label: 'Eligibility & checks',
    description: 'Choose eligible leads and configure message checks.',
    hash: '#settingsChecks',
  },
  {
    id: 'settingsConnections',
    label: 'Firebase sync',
    description: 'Manage this PC’s open-event sync and inspect its connection health.',
    hash: '#settingsConnections',
  },
  {
    id: 'settingsTeam',
    label: 'Team coordination',
    description: 'Coordinate recipient reservations and shared mailbox pacing.',
    hash: '#settingsTeam',
  },
  {
    id: 'settingsAppearance',
    label: 'Appearance',
    description: 'Personalize this browser’s workspace. Changes save automatically.',
    hash: '#settingsAppearance',
  },
  {
    id: 'settingsAbout',
    label: 'About',
    description: 'Application information and internal build history.',
    hash: '#settingsAbout',
  },
] as const;

export type SettingsSection = (typeof settingsTabs)[number]['id'];
