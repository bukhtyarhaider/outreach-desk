import { useSyncExternalStore } from 'react';
import { uiScope } from '../../shared/lifecycle';
import { settingsTabs, type SettingsSection } from './sections';

export const settingsFields = [
  ['minSeconds', 'Minimum delay', 'settingsSending', 'seconds between sends'],
  ['maxSeconds', 'Maximum delay', 'settingsSending', 'seconds between sends'],
  ['hourlyCap', 'Hourly limit', 'settingsSending', 'messages per hour'],
  ['dailyCap', 'Daily limit', 'settingsSending', 'messages per 24 hours'],
  ['pauseEveryMin', 'Rest after at least', 'settingsSending', 'sends before a rest'],
  ['pauseEveryMax', 'Rest after at most', 'settingsSending', 'sends before a rest'],
  ['pauseMinSeconds', 'Minimum rest', 'settingsSending', 'seconds'],
  ['pauseMaxSeconds', 'Maximum rest', 'settingsSending', 'seconds'],
  ['pollSeconds', 'Empty queue check interval', 'settingsSending', 'seconds polling'],
  ['templateChecksEnabled', 'Enable template checks', 'settingsChecks', 'wording validation'],
  [
    'promotionalClaimsCheck',
    'Promotional claims check',
    'settingsChecks',
    'pricing guarantees wording',
  ],
  ['messageLengthCheck', 'Message length check', 'settingsChecks', 'long introductions'],
  ['requireActive', 'Require Active operating status', 'settingsChecks', 'eligibility'],
  ['requireNoOutOfService', 'Require no out-of-service flag', 'settingsChecks', 'eligibility'],
  ['allowHidden', 'Allow hidden worksheets', 'settingsChecks', 'eligibility'],
  ['readyStatuses', 'Ready statuses', 'settingsChecks', 'workbook status eligibility'],
  ['sentStatus', 'Status written after send', 'settingsChecks', 'workbook status'],
  ['trackingPcId', 'This PC’s tracking ID', 'settingsConnections', 'Firebase computer identity'],
  ['trackingPublicUrl', 'Public tracking URL', 'settingsConnections', 'Firebase HTTPS endpoint'],
  [
    'firebaseBackend',
    'Cloud database',
    'settingsConnections',
    'Firebase Firestore Realtime Database',
  ],
  ['firebaseSyncMode', 'Sync mode', 'settingsConnections', 'Firebase automatic manual'],
  ['teamEnabled', 'Use shared coordinator', 'settingsTeam', 'team enable'],
  ['teamUrl', 'Coordinator server URL', 'settingsTeam', 'team connection'],
  ['workerName', 'Worker display name', 'settingsTeam', 'team PC name'],
  ['teamToken', 'Coordinator access token', 'settingsTeam', 'team credentials password'],
] as const;
export type SettingsFieldId = (typeof settingsFields)[number][0];
export interface SettingChange {
  id: SettingsFieldId;
  label: string;
  section: SettingsSection;
  before: string;
  after: string;
}
const listeners = new Set<() => void>();
let baseline = new Map<string, string>();
let changes: readonly SettingChange[] = [];
function field(id: string) {
  return document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
}
function value(id: string) {
  const input = field(id);
  return input instanceof HTMLInputElement && input.type === 'checkbox'
    ? String(input.checked)
    : (input?.value ?? '');
}
function display(id: string, raw: string) {
  if (id === 'teamToken') return raw ? 'Replacement token entered' : 'Keep existing token';
  if (field(id) instanceof HTMLInputElement && (field(id) as HTMLInputElement).type === 'checkbox')
    return raw === 'true' ? 'On' : 'Off';
  if (id === 'trackingPublicUrl' || id === 'teamUrl') {
    // Do not expose URL credentials or query tokens in a review surface.
    try {
      const url = new URL(raw);
      return `${url.protocol}//${url.host}${url.pathname}${url.search ? '?…' : ''}${url.hash ? '#…' : ''}`;
    } catch {
      return raw ? 'Entered URL (review in field)' : 'Not set';
    }
  }
  const unit = [
    'minSeconds',
    'maxSeconds',
    'pauseMinSeconds',
    'pauseMaxSeconds',
    'pollSeconds',
  ].includes(id)
    ? ' sec'
    : id === 'hourlyCap'
      ? ' per hour'
      : id === 'dailyCap'
        ? ' per 24 hours'
        : ['pauseEveryMin', 'pauseEveryMax'].includes(id)
          ? ' sends'
          : '';
  if (unit && raw) return raw + unit;
  const input = field(id);
  if (input instanceof HTMLSelectElement)
    return [...input.options].find((option) => option.value === raw)?.label ?? raw;
  return raw || 'Not set';
}
export function scanSettingsDraft() {
  if (!baseline.size) return;
  changes = settingsFields
    .filter(([id]) => value(id) !== baseline.get(id))
    .map(([id, label, section]) => ({
      id,
      label,
      section,
      before: display(id, baseline.get(id) ?? ''),
      after: display(id, value(id)),
    }));
  if (changes.length) {
    const feedback = document.getElementById('settingsSaveFeedback');
    if (feedback?.getAttribute('role') !== 'alert' && feedback) feedback.hidden = true;
    const notice = document.getElementById('notice');
    if (notice?.textContent === 'Settings saved.') notice.hidden = true;
  }
  listeners.forEach((listener) => listener());
}
export function captureSettingsBaseline() {
  baseline = new Map(settingsFields.map(([id]) => [id, value(id)]));
  scanSettingsDraft();
}
export function settingsDraftCount() {
  return changes.length;
}
export function settingsFieldChanged(id: string) {
  return baseline.has(id) && value(id) !== baseline.get(id);
}
export function useSettingsChanges() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => changes,
    () => changes,
  );
}
export function focusSetting(id: string) {
  const section = settingsFields.find((item) => item[0] === id)?.[2] ?? 'settingsAppearance';
  const tab = settingsTabs.find((item) => item.id === section);
  if (!tab) return;
  const element = field(id);
  const generation = uiScope.generation;
  for (
    let parent = element?.parentElement;
    parent && parent.id !== 'view-settings';
    parent = parent.parentElement
  )
    if (parent instanceof HTMLDetailsElement) parent.open = true;
  location.hash = tab.hash;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      if (
        uiScope.isCurrent(generation) &&
        location.hash === tab.hash &&
        element?.isConnected &&
        !element.closest('[hidden]')
      ) {
        const target =
          element.matches(':disabled') && element.closest('#templateCheckOptions')
            ? field('templateChecksEnabled')
            : element;
        target?.focus({ preventScroll: true });
        target?.scrollIntoView({ block: 'center' });
      }
    }),
  );
}
export function mountSettingsDraft() {
  baseline.clear();
  changes = [];
  const root = document.getElementById('view-settings');
  if (!root) return;
  const scanAfterInput = () => {
    const generation = uiScope.generation;
    // Let React process native controlled inputs before publishing the draft snapshot.
    queueMicrotask(() => {
      if (uiScope.isCurrent(generation)) scanSettingsDraft();
    });
  };
  uiScope.listen(root, 'input', scanAfterInput);
  uiScope.listen(root, 'change', scanAfterInput);
  uiScope.listen(window, 'beforeunload', (event) => {
    if (changes.length) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
}
