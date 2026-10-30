import { PageHeader } from '../../design-system/layout';
import { useWorkspace } from '../../shared/workspace-store';
import { CreateCampaignLink } from '../campaigns/CreateCampaignLink';
import { DashboardMetrics } from './DashboardMetrics';
import { OutreachRunnerPanel, MailboxConnectionPanel, ManualBatchPanel } from './DashboardActions';
import { CarrierAttentionPanel, RecentActivityPanel } from './DashboardActivity';
export function DashboardPage() {
  const { state } = useWorkspace();
  const campaign = state?.campaigns.find((c) => c.id === state.activeCampaign);
  return (
    <section className="view-page active dashboard-page" id="view-dashboard">
      <PageHeader
        title="Dashboard"
        description={
          <>
            Audience:{' '}
            <a href="#campaign-edit" title={campaign?.name}>
              {campaign?.name || 'No active campaign'}
            </a>{' '}
            · Queue and mailbox controls are shared across campaigns.
          </>
        }
        actions={
          <>
            <CreateCampaignLink />
          </>
        }
      />
      <div id="carrierPriorityAlert" className="dashboard-message-alert" hidden role="status" />
      <DashboardMetrics />
      <div className="dashboard-command-grid">
        <OutreachRunnerPanel />
        <MailboxConnectionPanel />
      </div>
      <div className="dashboard-work-grid">
        <CarrierAttentionPanel />
        <ManualBatchPanel />
      </div>
      <RecentActivityPanel />
    </section>
  );
}
