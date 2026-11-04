import { useSyncExternalStore } from 'react';
import type { AppState, Lead } from './types/domain';
export interface WorkspaceSnapshot {
  state: AppState | null;
  selected: number;
  leads: readonly Lead[];
}
const listeners = new Set<() => void>();
let snapshot: WorkspaceSnapshot = { state: null, selected: 0, leads: [] };
/** Read-only presentation bridge. Feature controllers remain the only mutation/API owners. */
export function publishWorkspace(state: AppState, selected: number, leads: readonly Lead[]) {
  snapshot = { state, selected, leads };
  listeners.forEach((listener) => listener());
}
export function useWorkspace() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => snapshot,
    () => snapshot,
  );
}

export function workbookLabel(state: AppState | null): string {
  const workbook =
    state?.workbook ??
    state?.campaigns.find((campaign) => campaign.id === state.activeCampaign)?.workbook;
  return workbook?.name || workbook?.file?.split(/[\\/]/).pop() || 'No workbook imported.';
}
