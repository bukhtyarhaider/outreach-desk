export const viewNames = [
  'dashboard',
  'leads',
  'campaigns',
  'campaign-new',
  'campaign-edit',
  'imports',
  'conversations',
  'templates',
  'live-activity',
  'activity',
  'catalog',
  'tracking',
  'suppression',
  'accounts',
  'settings',
] as const;
export type ViewName = (typeof viewNames)[number];
export const routeLabels: Record<ViewName, string> = {
  dashboard: 'Dashboard',
  leads: 'Leads',
  campaigns: 'Campaigns',
  'campaign-new': 'Create campaign',
  'campaign-edit': 'Campaign workspace',
  imports: 'Import review',
  conversations: 'Unibox',
  templates: 'Templates',
  'live-activity': 'Live System Activity',
  activity: 'Reports & history',
  catalog: 'Version Catalog',
  tracking: 'Email Tracking',
  suppression: 'Do Not Contact',
  accounts: 'Accounts',
  settings: 'Settings',
};
export const trackingSections = [
  'trackingMessages',
  'trackingSeedStudio',
  'trackingDomainHealth',
  'trackingDiagnostics',
] as const;
export type TrackingSection = (typeof trackingSections)[number];
export function isTrackingSection(value: string): value is TrackingSection {
  return trackingSections.some((section) => section === value);
}
export const settingsSections = [
  'settingsSending',
  'settingsChecks',
  'settingsConnections',
  'settingsTeam',
  'settingsAppearance',
  'settingsAbout',
] as const;
export function isSettingsSection(value: string) {
  return settingsSections.some((section) => section === value);
}
export function resolveView(value: string): ViewName {
  if (value === 'campaignReview' || value === 'campaignSource') return 'campaign-edit';
  if (value === 'outreachRunner') return 'dashboard';
  if (isTrackingSection(value)) return 'tracking';
  if (isSettingsSection(value)) return 'settings';
  return viewNames.find((view) => view === value) ?? 'dashboard';
}
/** Creation and editing belong to Campaigns, without impersonating the library route. */
export function navigationParent(view: ViewName): ViewName {
  return view === 'campaign-new' || view === 'campaign-edit' ? 'campaigns' : view;
}
