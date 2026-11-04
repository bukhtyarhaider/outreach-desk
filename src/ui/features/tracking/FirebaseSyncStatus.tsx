import { useWorkspace } from '../../shared/workspace-store';
import { ActionLink } from '../../design-system/primitives';

/** Read-only sync feedback; feature controllers retain ownership of sync actions. */
export function FirebaseSyncStatus() {
  const sync = useWorkspace().state?.firebaseSync;
  if (!sync) return null;
  return (
    <aside className="tracking-sync-status" aria-label="Firebase sync status">
      <div role="status">
        <strong>{sync.running ? 'Syncing opens' : `Firebase · ${sync.status}`}</strong>
        <p>{sync.message}</p>
      </div>
      <ActionLink href="#settingsConnections" variant="ghost" size="sm">
        Sync settings
      </ActionLink>
    </aside>
  );
}
