import { useSyncExternalStore, useLayoutEffect, useRef } from 'react';
import { Button } from '../../design-system/primitives';
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
    description: 'Application information and release history.',
    hash: '#settingsAbout',
  },
] as const;
function subscribe(listener: () => void) {
  window.addEventListener('hashchange', listener);
  return () => window.removeEventListener('hashchange', listener);
}
export function useSettingsTab() {
  const hash = useSyncExternalStore(
    subscribe,
    () => location.hash,
    () => '#settings',
  );
  return settingsTabs.find((tab) => hash === tab.hash || hash === `#${tab.id}`) ?? settingsTabs[0];
}
export function SettingsTabs({ active }: { active: string }) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const nav = ref.current;
    if (!nav) return;
    const center = () => {
      const tab = nav.querySelector<HTMLElement>('[aria-selected="true"]');
      if (tab && nav.clientWidth)
        nav.scrollLeft +=
          tab.getBoundingClientRect().left -
          nav.getBoundingClientRect().left -
          (nav.clientWidth - tab.clientWidth) / 2;
    };
    const observer = new ResizeObserver(center);
    observer.observe(nav);
    center();
    return () => observer.disconnect();
  }, [active]);
  return (
    <nav ref={ref} className="settings-tab-bar" aria-label="Settings sections" role="tablist">
      {settingsTabs.map((tab, index) => (
        <Button
          key={tab.id}
          id={`tab-${tab.id}`}
          variant="ghost"
          role="tab"
          aria-controls={tab.id}
          aria-selected={tab.id === active}
          tabIndex={tab.id === active ? 0 : -1}
          onClick={() => {
            location.hash = tab.hash;
            document.querySelector<HTMLElement>('.app-viewport')?.scrollTo(0, 0);
          }}
          onKeyDown={(event) => {
            const next =
              event.key === 'ArrowRight'
                ? (index + 1) % settingsTabs.length
                : event.key === 'ArrowLeft'
                  ? (index + settingsTabs.length - 1) % settingsTabs.length
                  : event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? settingsTabs.length - 1
                      : -1;
            if (next < 0) return;
            event.preventDefault();
            document.getElementById(`tab-${settingsTabs[next].id}`)?.focus();
            location.hash = settingsTabs[next].hash;
          }}
        >
          {tab.label}
        </Button>
      ))}
    </nav>
  );
}
