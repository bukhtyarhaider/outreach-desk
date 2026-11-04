import { useSyncExternalStore } from 'react';
import { Button } from '../../design-system/primitives';
import { Icon, Mail, Star, Shield, Monitor } from '../../design-system/icons';

const tabs = [
  { id: 'trackingMessages', label: 'Messages', icon: Mail, hash: '#tracking' },
  { id: 'trackingSeedStudio', label: 'Seed Studio', icon: Star, hash: '#trackingSeedStudio' },
  {
    id: 'trackingDomainHealth',
    label: 'Domain Health',
    icon: Shield,
    hash: '#trackingDomainHealth',
  },
  {
    id: 'trackingDiagnostics',
    label: 'Mailbox monitoring',
    icon: Monitor,
    hash: '#trackingDiagnostics',
  },
] as const;
export type TrackingTabId = (typeof tabs)[number]['id'];
function subscribe(listener: () => void) {
  window.addEventListener('hashchange', listener);
  return () => window.removeEventListener('hashchange', listener);
}
export function useTrackingTab() {
  const hash = useSyncExternalStore(
    subscribe,
    () => location.hash,
    () => '#tracking',
  );
  return tabs.find((tab) => tab.hash === hash || `#${tab.id}` === hash)?.id ?? 'trackingMessages';
}
export function TrackingTabs({ active }: { active: TrackingTabId }) {
  return (
    <nav className="tracking-section-nav" role="tablist" aria-label="Tracking sections">
      {tabs.map((tab, index) => (
        <Button
          key={tab.id}
          id={`tab-${tab.id}`}
          role="tab"
          variant="ghost"
          size="sm"
          aria-selected={active === tab.id}
          aria-controls={tab.id === 'trackingMessages' ? 'trackingMessagePanel' : tab.id}
          tabIndex={active === tab.id ? 0 : -1}
          onClick={() => {
            location.hash = tab.hash;
            document.querySelector<HTMLElement>('.app-viewport')?.scrollTo(0, 0);
          }}
          onKeyDown={(event) => {
            const next =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? tabs.length - 1
                  : event.key === 'ArrowRight'
                    ? (index + 1) % tabs.length
                    : event.key === 'ArrowLeft'
                      ? (index + tabs.length - 1) % tabs.length
                      : -1;
            if (next < 0) return;
            event.preventDefault();
            document.getElementById(`tab-${tabs[next].id}`)?.focus();
            location.hash = tabs[next].hash;
          }}
        >
          <Icon icon={tab.icon} size={14} />
          {tab.label}
        </Button>
      ))}
    </nav>
  );
}
