import { uiScope } from '../../shared/lifecycle';
import { session } from '../../shared/session';
import { navigate, revealTrackingSection } from '../navigation';
import { resolveView } from '../routes';
import { refresh } from './refresh';
import { loadLeads } from '../../features/leads/controller';
import { loadHistory } from '../../features/history/controller';
import { loadCatalog } from '../../features/catalog/controller';
import { loadTracking } from '../../features/tracking/controller';
import { notice } from '../../shared/runtime';

export async function mountBoot() {
  // Initial boot
  navigate(location.hash.replace('#', ''));
  // Background polling loop
  let polling = false;
  let needsLeads = true;
  let needsHistory = true;
  uiScope.interval(async () => {
    if (polling) return;
    polling = true;
    try {
      const previousCampaign = session.state?.activeCampaign;
      const previous = session.state?.job.current;
      const previousAttempts = session.state?.attemptCount;
      await refresh();
      if (
        needsLeads ||
        session.state.job.current !== previous ||
        session.state.activeCampaign !== previousCampaign
      ) {
        await loadLeads();
        needsLeads = false;
      }
      if (
        needsHistory ||
        session.state.attemptCount !== previousAttempts ||
        (location.hash === '#activity' && Date.now() - session.lastHistoryRefresh > 15000)
      ) {
        await loadHistory();
        needsHistory = false;
      }
    } catch (e) {
      notice('Connection interrupted. Retrying automatically…');
    } finally {
      polling = false;
    }
  }, 1500);
  await refresh();
  await loadLeads();
  needsLeads = false;
  await loadHistory();
  needsHistory = false;
  if (location.hash === '#catalog') await loadCatalog();
  if (resolveView(location.hash.slice(1)) === 'tracking') {
    await loadTracking();
    revealTrackingSection(location.hash.slice(1));
  }
}
