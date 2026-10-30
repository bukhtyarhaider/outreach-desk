import { useSyncExternalStore } from 'react';
export const campaignSteps = [
  { name: 'Audience', detail: 'Import & review leads', href: '#imports' },
  { name: 'Messages', detail: 'Personalize templates', href: '#templates' },
  { name: 'Mailbox', detail: 'Connection & allowances', href: '#settings' },
  { name: 'Review', detail: 'Confirm campaign scope', href: '#campaignReview' },
] as const;
export function CampaignJourney({ active = 0 }: { active?: number }) {
  const hash = useSyncExternalStore(
    (listener) => {
      window.addEventListener('hashchange', listener);
      return () => window.removeEventListener('hashchange', listener);
    },
    () => location.hash,
    () => '',
  );
  const selected = hash === '#campaignReview' ? 3 : active;
  return (
    <nav className="campaign-journey" aria-label="Campaign setup steps">
      {campaignSteps.map((step, index) => (
        <a key={step.name} href={step.href} aria-current={selected === index ? 'step' : undefined}>
          <b>{index + 1}</b>
          <span>
            <strong>{step.name}</strong>
            <small>{step.detail}</small>
          </span>
        </a>
      ))}
    </nav>
  );
}
