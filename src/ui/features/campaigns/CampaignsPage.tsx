import { api, notice } from '../../shared/runtime';
import { refresh } from '../../app/runtime/refresh';
import { PageHeader, SummaryStrip } from '../../design-system/layout';
import { useWorkspace } from '../../shared/workspace-store';
import { CreateCampaignLink } from './CreateCampaignLink';
import { CampaignOverview } from './CampaignOverview';
export function CampaignsPage() {
  const { state } = useWorkspace();
  const campaigns = state?.campaigns ?? [];
  return (
    <section className="view-page" id="view-campaigns">
      <PageHeader
        eyebrow="WORKSPACE / CAMPAIGNS"
        title="Campaigns"
        description="Find an existing campaign, review its status or start a separate campaign."
        actions={<CreateCampaignLink />}
      />
      <SummaryStrip
        label="Campaign inventory summary"
        items={[
          { label: 'Campaigns', value: campaigns.length },
          {
            label: 'Included in queue',
            value: campaigns.filter((c) => c.enabled && !c.reviewRequired).length,
          },
          { label: 'Needs import review', value: campaigns.filter((c) => c.reviewRequired).length },
          {
            label: 'Paused',
            value: campaigns.filter((c) => !c.enabled && !c.reviewRequired).length,
          },
        ]}
      />
      <CampaignOverview />
      {!!state?.deletedCampaigns?.length && (
        <section aria-label="Retained campaign Trash">
          <h2>Retained campaign Trash</h2>
          <p>Working files and contact protections are retained. Restored campaigns stay paused.</p>
          {state.deletedCampaigns.map((c) => (
            <p key={c.id}>
              {c.name}{' '}
              <button
                disabled={state.busy || state.job.enabled}
                onClick={async () => {
                  try {
                    await api('/api/restore-campaign', { id: c.id });
                    await refresh();
                    notice('Campaign restored and paused.');
                  } catch (error) {
                    notice(error instanceof Error ? error.message : 'Restore failed.');
                  }
                }}
              >
                Restore
              </button>
            </p>
          ))}
        </section>
      )}
    </section>
  );
}
