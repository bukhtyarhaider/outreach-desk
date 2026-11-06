import type { AppState } from '../../shared/types/api';

export function outreachStartBlocker(state: AppState | null): string | null {
  if (!state) return 'Loading workspace…';
  if (state.busy) return 'Finish the current action before starting outreach.';
  if (state.job.enabled) return 'Outreach is already running.';
  if (state.prepared) return 'Complete or release the prepared message before starting outreach.';
  if (!state.campaigns.some((c) => c.enabled && !c.reviewRequired)) {
    const campaign = state.campaigns.find((c) => c.id === state.activeCampaign);
    return !state.campaigns.length
      ? 'Create a campaign to get started.'
      : campaign?.reviewRequired
        ? 'Review, save and activate your campaign workbook, then include it in the outreach queue.'
        : 'Your campaigns are paused. Include a campaign in the outreach queue to enable Start outreach.';
  }
  return null;
}
