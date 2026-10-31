import { useSyncExternalStore } from 'react';

export interface UIPreferences {
  headerRunnerAnimation: boolean;
  workspaceContextEnabled: boolean;
  workspaceContextCollapsed: boolean;
}
export const uiPreferencesKey = 'outreach-desk.ui-preferences.v1';
const defaults: Readonly<UIPreferences> = {
  headerRunnerAnimation: true,
  workspaceContextEnabled: true,
  workspaceContextCollapsed: false,
};

/** Validate browser-owned preferences independently of operational/server settings. */
export function parseUIPreferences(value: string | null): Readonly<UIPreferences> {
  try {
    const parsed: unknown = JSON.parse(value ?? 'null');
    if (!parsed || typeof parsed !== 'object') return defaults;
    return {
      headerRunnerAnimation:
        'headerRunnerAnimation' in parsed && typeof parsed.headerRunnerAnimation === 'boolean'
          ? parsed.headerRunnerAnimation
          : defaults.headerRunnerAnimation,
      workspaceContextEnabled:
        'workspaceContextEnabled' in parsed && typeof parsed.workspaceContextEnabled === 'boolean'
          ? parsed.workspaceContextEnabled
          : defaults.workspaceContextEnabled,
      workspaceContextCollapsed:
        'workspaceContextCollapsed' in parsed &&
        typeof parsed.workspaceContextCollapsed === 'boolean'
          ? parsed.workspaceContextCollapsed
          : defaults.workspaceContextCollapsed,
    };
  } catch {
    return defaults;
  }
}

function readPreferences() {
  try {
    return typeof window === 'undefined'
      ? defaults
      : parseUIPreferences(window.localStorage.getItem(uiPreferencesKey));
  } catch {
    return defaults;
  }
}
let snapshot = readPreferences();
let saved = true;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());
function onStorage(event: StorageEvent) {
  if (event.storageArea !== window.localStorage) return;
  if (event.key !== null && event.key !== uiPreferencesKey) return;
  snapshot = parseUIPreferences(event.newValue);
  saved = true;
  notify();
}
function subscribe(listener: () => void) {
  if (!listeners.size) window.addEventListener('storage', onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener('storage', onStorage);
  };
}

export function updateUIPreferences(patch: Partial<UIPreferences>) {
  snapshot = { ...snapshot, ...patch };
  try {
    window.localStorage.setItem(uiPreferencesKey, JSON.stringify(snapshot));
    saved = true;
  } catch {
    saved = false;
  }
  notify();
}

export function useUIPreferences() {
  const preferences = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => defaults,
  );
  const persisted = useSyncExternalStore(
    subscribe,
    () => saved,
    () => true,
  );
  return { preferences, persisted };
}
