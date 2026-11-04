import { resolveView, isTrackingSection, isSettingsSection, navigationParent } from './routes';
import { uiScope } from '../shared/lifecycle';
import { errorMessage } from '../shared/utils';
import { session } from '../shared/session';
import { loadCatalog } from '../features/catalog/controller';
import { notice } from '../shared/runtime';
import { loadHistory } from '../features/history/controller';
import { loadTracking } from '../features/tracking/controller';
import { renderLiveActivityView } from '../features/live-activity/controller';
/** Tracking tab hashes remain workspace routes; reveal the selected mounted panel. */
export function revealTrackingSection(value: string) {
  if ((value === 'tracking' || isTrackingSection(value)) && location.hash === `#${value}`) {
    document.querySelector<HTMLElement>('.app-viewport')?.scrollTo(0, 0);
  }
}

// Navigation View Routing
export function navigate(viewName: string) {
  const target = resolveView(viewName);
  if (isSettingsSection(viewName) || viewName === 'settings')
    document.querySelector<HTMLElement>('.app-viewport')?.scrollTo(0, 0);
  if (document.querySelector('.view-page.active')?.id !== `view-${target}`) {
    document.querySelector<HTMLElement>('.app-viewport')?.scrollTo(0, 0);
  }

  document.body.classList.toggle('mailroom-active', target === 'conversations');
  document.querySelectorAll<HTMLElement>('.view-page').forEach((el) => {
    el.classList.toggle('active', el.id === `view-${target}`);
  });
  document.querySelectorAll<HTMLElement>('.nav-link').forEach((link) => {
    const active = link.dataset.view === navigationParent(target);
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if (target === 'imports' && session.state)
    window.dispatchEvent(
      new CustomEvent('fc-import-view', { detail: session.state.activeCampaign }),
    );
  if (target === 'conversations' && session.state)
    window.dispatchEvent(new Event('fc-conversation-view'));
  if (target === 'catalog' && session.state)
    void loadCatalog().catch((e) => notice(errorMessage(e)));
  if (target === 'activity' && session.state)
    void loadHistory().catch((e) => notice(errorMessage(e)));
  if (target === 'tracking' && session.state)
    void loadTracking()
      .then(() => revealTrackingSection(viewName))
      .catch((e) => notice(errorMessage(e)));
  if (viewName === 'outreachRunner')
    document.getElementById('outreachRunner')?.scrollIntoView({ block: 'start' });
  revealTrackingSection(viewName);
  if (target === 'live-activity') {
    renderLiveActivityView();
  }
}

export function mountNavigation() {
  uiScope.listen(window, 'hashchange', () => {
    navigate(location.hash.replace('#', ''));
  });
  // Ensure mouse click removes focus ring
  document.querySelectorAll<HTMLElement>('.nav-link').forEach((link) => {
    if (!link.getAttribute('aria-label')) link.setAttribute('aria-label', link.textContent.trim());
    link.title = link.getAttribute('aria-label') || '';
    uiScope.listen(link, 'click', (event) => {
      if (event.detail > 0) link.blur();
    });
  });
}
