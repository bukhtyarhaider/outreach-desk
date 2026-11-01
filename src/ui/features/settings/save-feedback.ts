import { uiScope } from '../../shared/lifecycle';
export function clearSettingsFeedback() {
  const feedback = document.getElementById('settingsSaveFeedback');
  if (feedback) feedback.hidden = true;
  document.querySelectorAll('#view-settings [aria-invalid="true"]').forEach((field) => {
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-errormessage');
  });
}
export function settingsSaveFeedback(message: string, error = false) {
  const feedback = document.getElementById('settingsSaveFeedback');
  if (!feedback) return;
  feedback.textContent = message;
  feedback.hidden = false;
  feedback.className = `settings-save-feedback${error ? ' settings-save-feedback--error' : ''}`;
  feedback.setAttribute('role', error ? 'alert' : 'status');
}
export function revealSettingsError(message: string, pacingFields: readonly string[]) {
  settingsSaveFeedback(
    `${message} Your edits are retained. Correct the settings and save again.`,
    true,
  );
  const pacing = pacingFields.find((field) => message.includes(field));
  const matches: Array<[RegExp, string, string]> = [
    [/PC ID|pcId/i, '#settingsConnections', 'trackingPcId'],
    [/public HTTPS tracking URL/i, '#settingsConnections', 'trackingPublicUrl'],
    [/syncMode/i, '#settingsConnections', 'firebaseSyncMode'],
    [/Realtime Database|Firebase backend/i, '#settingsConnections', 'firebaseBackend'],
    [/team.*URL|shared.*server URL|coordinator.*URL/i, '#settingsTeam', 'teamUrl'],
    [/ready status/i, '#settingsChecks', 'readyStatuses'],
    [/sent status/i, '#settingsChecks', 'sentStatus'],
    [/promotionalClaims/i, '#settingsChecks', 'promotionalClaimsCheck'],
    [/messageLength/i, '#settingsChecks', 'messageLengthCheck'],
    [/Template checks enabled/i, '#settingsChecks', 'templateChecksEnabled'],
  ];
  const match = pacing
    ? ['#settings', pacing]
    : matches.find(([pattern]) => pattern.test(message))?.slice(1);
  if (!match) return;
  const [hash, id] = match as [string, string];
  const field = document.getElementById(id);
  for (
    let parent = field?.parentElement;
    parent && parent.id !== 'view-settings';
    parent = parent.parentElement
  ) {
    if (parent instanceof HTMLDetailsElement) parent.open = true;
  }
  field?.setAttribute('aria-invalid', 'true');
  field?.setAttribute('aria-errormessage', 'settingsSaveFeedback');
  location.hash = hash;
  const generation = uiScope.generation;
  requestAnimationFrame(() => {
    if (
      !uiScope.isCurrent(generation) ||
      location.hash !== hash ||
      !field?.isConnected ||
      !field.getBoundingClientRect().width
    )
      return;
    field.focus({ preventScroll: true });
    field.scrollIntoView({ block: 'center' });
  });
}
