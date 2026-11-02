import { useSyncExternalStore, useLayoutEffect, useRef } from 'react';
import { Button } from '../../design-system/primitives';
import { settingsTabs } from './sections';
export { settingsTabs } from './sections';
import { useSettingsChanges } from './draft';
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
  const changes = useSettingsChanges();
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
          title={tab.description}
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
          {changes.some((change) => change.section === tab.id) && (
            <span className="settings-tab-dirty" aria-hidden="true">
              {changes.filter((change) => change.section === tab.id).length}
            </span>
          )}
        </Button>
      ))}
    </nav>
  );
}
