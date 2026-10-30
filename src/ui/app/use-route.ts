import { useSyncExternalStore } from 'react';
/** React views and the native router observe the same URL; browser Back keeps local tabs in sync. */
export function useRouteHash() {
  return useSyncExternalStore(
    (listener) => {
      window.addEventListener('hashchange', listener);
      return () => window.removeEventListener('hashchange', listener);
    },
    () => window.location.hash.slice(1),
    () => 'dashboard',
  );
}
